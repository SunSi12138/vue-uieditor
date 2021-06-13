import _ from "lodash";
import Vue from "vue";
import { UEHelper } from "./ue-helper";
import { UEJsonToHtml, UEJsonToHtmlConfig } from './ue-json-to-html';
import { UERenderItem } from "./ue-render-item";

const _bKey = /^\s*(?:\:|v\-)/, _bEvent = /^\s*\@/;

let _babelTransformList = [], _max = 35;
function _getBabelTransformList(script, opt) {
  if (script) script = _.trim(script);
  const res = _.find(_babelTransformList, function (item) {
    return item.script == script && _.isEqual(item.opt, opt);
  });
  if (res) {
    _.remove(_babelTransformList, function (item) { return item == res; });
    _babelTransformList.push(res);
  }
  return res?.res;
}
function _pushBabelTransformList(script, opt, res) {
  if (script) script = _.trim(script);
  if (_babelTransformList.length >= _max)
    _babelTransformList = _babelTransformList.slice(10);
  _babelTransformList.push({ script, opt, res });
}


export class UECompiler {

  static toTemplate(items: (UERenderItem | string)[], editing?: boolean): string {
    return UECompiler.jsonToHtml(items, { wrap: false, clearPrivate: true });
  }

  static vueCompile(template: string) {
    return Vue.compile(template);

  }

  static async vueTemplateCompiler(template: string) {
    const compiler = await import(/* webpackChunkName: "ue_compiler" */ 'vue-template-compiler');
    const compileEx = compiler.compile(template);
    return compileEx;
  }

  static async compile(template: string | UERenderItem, debugInfo?: any, editing?: boolean) {
    if (!template) template = '<div></div>';
    if (!_.isString(template)) template = UECompiler.toTemplate([template], editing);
    const compileEx = await UECompiler.vueTemplateCompiler(template);
    let isErr = false;
    if (debugInfo) {
      _.assign(debugInfo, {
        template,
        compileEx
      });
      let cpxErrors = (compileEx && compileEx.errors) || [];
      const errLen = cpxErrors.length;
      if (isErr = (errLen > 0)) {
        if (errLen > 1) {
          cpxErrors = _.filter(cpxErrors, function (item) { return item && item.indexOf('?.') <= 0; });
        }
        template = cpxErrors.join('<br />').replace(/[\r\n]+/g, '<br />');
        template = `<div class="compiler-error">${template}</div>`
      }
    }
    const output = await UECompiler.babelTransformAsync(`function _render() { ${compileEx.render} }`).catch(function (e) {
      if (!isErr && debugInfo) {
        template = `<div class="compiler-error">${e.message}</div>`
      }
      UEHelper.error(e);
      return null;
    });
    let staticRenderFns = [];
    if (!_.isEmpty(compileEx.staticRenderFns)) {
      staticRenderFns = await Promise.all(_.map(compileEx.staticRenderFns, async function (item) {
        const output = await UECompiler.babelTransformAsync(`function _renderFns() { ${item} }`).catch(function (e) {
          if (!isErr && debugInfo) {
            template = `${template}<div class="compiler-error">${e.message}</div>`
          }
          UEHelper.error(e);
          return null;
        });
        return new Function('regeneratorRuntime', `${output.code}; return _renderFns;`)(window['regeneratorRuntime']);
      }));
    }
    if (output) compileEx.render = output.code;
    return !output ? UECompiler.vueCompile(template) : {
      render: new Function('regeneratorRuntime', `${output.code}; return _render;`)(window['regeneratorRuntime']),
      staticRenderFns: staticRenderFns
    };

  }

  static isEqual(p1, p2): boolean {
    return _.isEqualWith(p1, p2, function (item1, item2) {
      if (_.isFunction(item1) && _.isFunction(item2))
        return true;
    });
  }

  /** render to code(script) */
  static renderToScriptJson(render: UERenderItem): string {
    let json = JSON.stringify(render, function (key, value) {
      if (_.trim(value) && _bKey.test(key)) {
        //escape将\n \r \b之类转义正常内容
        return `|ue-render-bing|-- ${escape(value)} --|ue-render-bing|`
      } else if (_bEvent.test(key)) {
        return `|ue-render-event|-- ${escape(value)} --|ue-render-event|`
      } else {
        return value;
      }
    }, 2);

    json = json.replace(/\"\|ue\-render\-bing\|\-\-(.*?)\-\-\|ue\-render\-bing\|\"/g, function (find, content) {
      content = unescape(content);
      const isKH = /^(?:.|\n|\r)*\{/.test(content);
      if (isKH) {
        return `$(($) => ( ${content} ))($)`;
      } else {
        return `$(() => ${content})($)`;
      }
    });
    json = json.replace(/\"\|ue\-render\-event\|\-\-(.*?)\-\-\|ue\-render\-event\|\"/g, function (find, content) {
      return `$(($event)=> { ${unescape(content)} })($)`;
    });

    return json;
  }

  /** code(script) render */
  static scriptJsonToRender(obj: string): UERenderItem {
    if (!obj) obj = '{}';
    let json = obj.replace(/\$\(\(([^\)]*?)\)(?:.|\n|\r)*?\=\>((?:.|\n|\r)*?)\)\(\$\)/g, function (find, event, content) {
      event = _.trim(event);
      let newContent = content;
      if (/\$event/.test(event)) {
        newContent = content.replace(/^\s*\{((?:.|\n|\r)*?)\}\s*$/, '$1');
      } else if (/\$/.test(event)) {
        newContent = content.replace(/^\s*\(((?:.|\n|\r)*?)\)\s*$/, '$1');
      }
      //JSON.stringify 会转义成 \n \r \b 等
      return JSON.stringify(_.trim(newContent));
    });

    return new Function(`return ${json}`)();// JSON.parse(json);
  }
  /**
   * Html 转成 Render
   * @param html 
   */
  static async htmlToRenderAsync(html: string): Promise<string | UERenderItem> {
    let json: any = await UECompiler.htmlToJsonAsync(`<root>${html}</root>`);
    return UECompiler._htmlToRender(json);
  }

  /**
   * Html 转成 Render
   * @param html 
   */
  static htmlToRender(html: string): Promise<string | UERenderItem> {
    if (!/^[\s\r\n]*\<template\>/i.test(html)) html = `<template>${html || '<uieditor-dev />'}</template>`;
    let json: any = UECompiler.htmlToJson(`<root>${html}</root>`);
    return UECompiler._htmlToRender(json);
  }

  private static _htmlToRender(json: any): Promise<string | UERenderItem> {
    json = jsonToRender([json]);
    const root = json[0];
    const template: any = _.find(root.children, { type: 'template' });
    const scriptTag = _.find(root.children, { type: 'script' });
    if (scriptTag) {
      scriptTag.children = [UECompiler.jsonToHtml(scriptTag.children, { wrap: false, clearPrivate: true })];
    }
    const styleTag = _.find(root.children, { type: 'style' });
    if (styleTag) {
      styleTag.children = [UECompiler.jsonToHtml(styleTag.children, { wrap: false, clearPrivate: true })];
    }
    let children = template && template.children;
    if (_.isEmpty(children) || children.length > 1) {
      children = [{ type: 'uieditor-div', children: children || [] }];
    }
    const [render] = children;
    if (render) {
      if (styleTag) {
        render.children = (render.children || []).concat([styleTag]);
      }
      if (scriptTag) {
        render.children = (render.children || []).concat([scriptTag]);
      }
    }
    // console.warn('json', _.cloneDeep(render))

    return render;
  }

  /**
   * Render 转成 Html
   * @param html 
   */
  static renderToHtml(render: UERenderItem, config?: UEJsonToHtmlConfig): string {
    render = _.cloneDeep(render);
    render = {
      type: 'temp_20200807_',
      children: [{
        type: 'template',
        children: [render]
      }]
    };
    const scripts = [], styles = [];
    const json = renderToJson([render], scripts, styles);
    json[0].children = json[0].children.concat(styles).concat(scripts);
    let html: any = UECompiler.jsonToHtml(json[0], config);
    return html.replace(/<\/?temp_20200807_>/g, "");
  }

  /**
   * Html 转成 Json
   * @param html 
   */
  static async htmlToJsonAsync(html: string) {
    await initParserHtml();
    // await initHtmlBind();
    const json = UECompiler.htmlToJson(html);
    return json;
  }

  /**
   * Html 转成 Json，注意先使用 UECompiler 初始化
   * @param html 
   */
  static htmlToJson(html: string) {
    const jsons = _ParserHtmlToJson(html);
    return _.first(jsons);
  }

  /**
   * Json 转成 Html
   * @param html 
   */
  static async jsonToHtmlAsync(json: any, config?: UEJsonToHtmlConfig) {
    let html: string = UECompiler.jsonToHtml(json, config);
    return html;
  }

  /**
   * Json 转成 Html，注意先使用 UECompiler 初始化
   * @param html 
   */
  static jsonToHtml(json: any, config?: UEJsonToHtmlConfig) {
    json = _.cloneDeep(json);
    const html: string = _.trim(UEJsonToHtml([json], config));
    return html;
  }

  /**
   * 初始babel环境
   */
  static async init(p?: { bable?: boolean }) {
    const { bable } = p || {};
    const list = [initParserHtml()];
    if (bable !== false)
      list.push(initBabel());
    return Promise.all(list);
  }

  /**
   * 使用 babel 编译，注意先使用 UECompiler 初始化
   * @param script 脚本内容
   * @param opt babel 参数
   */
  static babelTransform(script: string, opt?: any): { code: string; ast: any;[key: string]: any; } {
    const babel = Babel;
    if (!babel) return;
    const res = _getBabelTransformList(script, opt);
    if (res) return res;
    // if (script) script = script.replace(/\s*\/\/.*[\n\r]*$/gm, '');
    if (script) script = `
${script}
`;
    const output = babel.transform(script, !opt ? babelOpt : _.assign({}, babelOpt, opt));
    _pushBabelTransformList(script, opt, output);
    return output;
  }

  /**
   * 使用 babel 编译，返回一个fun name与code，注意先使用 UECompiler 初始化
   * @param script 脚本内容
   * @param hasRet 是否有返回值
   * @param opt babel 参数
   */
  static babelTransformToFun(script: string, hasRet?: boolean, opt?: any) {
    const sRet = hasRet ? 'return' : '';
    const fnName = `__ue_cpl_def_ctx_${UEHelper.makeAutoId()}`;
    script = `function ${fnName}(){
  ${sRet} ${script};
}`;
    const cpl = UECompiler.babelTransform(script, opt);
    return {
      fnName,
      ...cpl
    };
  }

  /**
   * 使用 babel 编译，返回一个fun name与code，注意先使用 UECompiler 初始化
   * @param args 新方法的参数名称，如：['name', 'id']
   * @param script 脚本内容
   * @param withThis with(this)
   * @param opt babel 参数
   * @example babelTransformToFunEx(['name', 'id'], 'return {name, id}')()
   */
  static babelTransformToFunEx(args: string[], script: string, withThis?: boolean, opt?: any): Function {
    const cp = UECompiler.babelTransformToFun(script, false, opt);
    args || (args = []);
    if (withThis)
      return new Function(...args, `with(this) { ${cp.code}; return ${cp.fnName}(); }`);
    else
      return new Function(...args, `${cp.code}; return ${cp.fnName}();`);
  }

  /**
   * 使用 babel 编译，不用 UECompiler 初始化，直接可以使用
   * @param strcipt 脚本内容
   * @param opt babel 参数
   */
  static async babelTransformAsync(script: string, opt?: any) {
    await initBabel();
    return UECompiler.babelTransform(script, opt);
  }

}

function _parseToProps(attr) {
  const props = {};
  _.forEach(attr, function (value, key) {
    props[key] = !value ? true : UEJsonToHtml.unEscape(value);
  });
  return props;
}
function _parseDomToJson(list: any[], outList) {
  _.forEach(list, function ({ type, name, attribs, data, children, endIndex, startIndex }) {
    let jsonItem;
    switch (type) {
      case 'comment':
        if (data) jsonItem = `<!--${data}-->`;
        break;
      // case 'text':
      // case 'tag':
      // case 'script':
      // case 'style':
      default:
        if (name) {
          if (endIndex > startIndex) {
            jsonItem = {
              type: name
            };
            if (_.size(attribs) > 0) jsonItem.props = _parseToProps(attribs);
            if (_.size(children) > 0) {
              _parseDomToJson(children, jsonItem.children = []);
            }
          }
        } else {
          if (data) {
            if (_.isString(data)) data = _.trim(data);
            if (data)
              jsonItem = data;
          }
        }
        break;
    }
    if (jsonItem) outList.push(jsonItem);

  });
}
let _ParserHtmlToJson: (html: string) => any[];
async function initParserHtml() {
  if (_ParserHtmlToJson) return _ParserHtmlToJson;
  let def;
  def = await import(/* webpackChunkName: "ui-editor-other-tool" */ 'htmlparser2');
  def = checkDefault(def);
  const Parser = def.Parser;
  def = await import(/* webpackChunkName: "ui-editor-other-tool" */ 'domhandler');
  def = checkDefault(def);
  const DomHandler = def;

  _ParserHtmlToJson = function (html: string) {
    const jsons = [];
    const handler = new DomHandler((error, dom) => {
      if (error) {
        // Handle error
      } else {
        // console.warn('dom', html, dom)
        _parseDomToJson(dom, jsons);
      }
    }, { normalizeWhitespace: false, withStartIndices: true, withEndIndices: true });
    const parser = new Parser(handler, { lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode:false, recognizeSelfClosing:true });
    parser.write(html);
    parser.end();
    return jsons;
  };

  return _ParserHtmlToJson;
}

const _jsonBaseProps = ['type', 'props', 'children'];
const _renderObjProps = ['editor-attrs'];
function renderToJson(renders: any[], outScript: any[], outStyle: any[]) {
  return _.map(renders, function (item) {
    if (!item || _.isString(item)) return item || '';
    const type = item.type;
    if (type == 'style') {
      outStyle.push(item);
      return '';
    }
    const props = _.clone(item.props) || {};
    const isScript = type == 'script';
    if (type == 'script') {
      item.children[0] = `export default ${item.children[0]}`
    }
    const newItem = {
      type: type,
      props: props
    };
    if (isScript) outScript.push(newItem);
    _.forEach(item, function (p, n) {
      if (n == 'parent' || n == 'children') return;
      if (!_.includes(_jsonBaseProps, n))
        props[n] = JSON.stringify(p);
    });
    let children = item.children;
    if (children && children.length > 0) {
      newItem['children'] = renderToJson(children, outScript, outStyle);
    }
    return isScript ? '' : newItem;
  });
}

function jsonToRender(json: any[]) {
  return _.map(json, function (item) {
    if (!item || _.isString(item)) return item || '';
    const props = item.props || {};
    const type = item.type;
    const isScript = type == 'script';
    if (isScript && item.children) {
      let content = item.children[0] || '';//export default 
      content = content.replace(/^[\s\r\n]*export\s+default\s+/i, '').replace(/\;[\s\r\n]*$/i, '');
      item.children[0] = content;
    }
    const newItem: any = {
      type: type
    };
    const newProps = {};
    _.forEach(props, function (p, n) {
      if (_.includes(_renderObjProps, n)) {
        newItem[n] = JSON.parse(p);
      } else
        newProps[n] = p;
    });
    let newChildren;
    const children = item.children;
    if (children && children.length > 0)
      newChildren = jsonToRender(children);
    if (!_.isEmpty(newProps)) newItem.props = newProps;
    if (!_.isEmpty(newChildren)) newItem['children'] = newChildren;
    return newItem;
  });
}

/** 默认 babel 参数 */
const babelOpt = {
  "babelrc": false,
  "ast": false,
  "filename": "babel",
  "sourceMap": false,
  "minified": false,
  "presets": [
    ["env",
      {
        "targets": {
          "browsers": ["ie >= 11"]
        },
        "forceAllTransforms": false,
        "shippedProposals": false,
        "useBuiltIns": false,
        "corejs": "3.6",
        "spec": false,
        "loose": false,
        "bugfixes": true
      }
    ], "es2015"],
  "plugins": [],
  "sourceType": 'script'
};

/** babel 实例 */
let Babel;

function checkDefault(p) {
  if ("function" == typeof p.default) p = p.default;
  return p;
}


/** 初始化 babel */
async function initBabel() {
  if (Babel) return Babel;
  Babel = await import(/* webpackChunkName: "ui-editor-babel-standalone" */ '@babel/standalone/babel.min.js');
  Babel = checkDefault(Babel);
  Babel.disableScriptTags();

  return Babel;
}

window['UECompiler'] = UECompiler;