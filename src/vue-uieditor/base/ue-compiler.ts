import _ from "lodash";
import Vue from "vue";
import { UEHelper } from "./ue-helper";
import { UEJsonToHtml, UEJsonToHtmlConfig } from './ue-json-to-html';
import { UERenderItem } from "./ue-render-item";

// function _escape(str: string, addTry?: boolean) {

//   return str && _.escape(str).replace(/\/\/[^\n].*\n/g, '');
// }

//处理 html 的 " 和 & 字符
function _escapeS(str: string) {
  return UEJsonToHtml.escape(str);
}
function _unEscapeS(str: string) {
  return UEJsonToHtml.unEscape(str);
}


//处理 字串 的 ` $ 和 % 字符
const _es2 = '%60';
const _es2Reg = new RegExp(_.escapeRegExp(_es2), 'g');
const _es21 = '%24';
const _es21Reg = new RegExp(_.escapeRegExp(_es21), 'g');
const _es22 = '%25';
const _es22Reg = new RegExp(_.escapeRegExp(_es22), 'g');
function _escapeES(str: string) {
  return (_.isString(str) && str.replace(/\%/g, _es22).replace(/\$/g, _es21).replace(/\`/g, _es2)) || str;
}
function _unEscapeES(str: string) {
  return (_.isString(str) && str.replace(_es2Reg, '`').replace(_es21Reg, '$').replace(_es22Reg, '%')) || str;
}

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
    // let templates: string[] = [];
    // _.forEach(items, function (item) {
    //   if (_.isString(item)) item = { type: "", content: item };
    //   let props = item.props;
    //   let propList: string[];
    //   if (props) {
    //     let evals, evalfn
    //     propList = _.map(_.keys(props), function (key) {
    //       let item = { name: key, value: props[key] };
    //       let value = item.value === true ? true : (_.isNil(item.value) ? '' : item.value.toString());
    //       let pItem = value === true ? item.name : [item.name, '"' + _escape(value, editing && key.indexOf(':') == 0) + '"'].join('=');
    //       switch (key) {
    //         case ':_ue_eval':
    //           evals = pItem;
    //           return '';
    //         case ':_ue_eval_fn':
    //           evalfn = pItem;
    //           return '';
    //         default:
    //           return pItem;
    //       }
    //     });
    //     if (evals || evalfn) {
    //       propList = propList.filter(function (item) { return !!item; });
    //       evals && propList.unshift(evals);
    //       evalfn && propList.unshift(evalfn);
    //     }
    //   }
    //   let children = item.children;
    //   let childrenHtml: string = children && children.length > 0 ? UECompiler.toTemplate(children, editing) : (item.content || '');
    //   let attrHtml: string = propList && propList.length > 0 ? (' ' + propList.join(' ')) : '';
    //   let tagHtml: string = item.type ? (!childrenHtml ? `<${item.type}${attrHtml} />` : `<${item.type}${attrHtml}>${childrenHtml}</${item.type}>`) : item.content;
    //   templates.push(tagHtml);
    // });
    // return templates.join('');
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
        return new Function(`${output.code}; return _renderFns;`)();
      }));
    }
    if (output) compileEx.render = output.code;
    return !output ? UECompiler.vueCompile(template) : {
      render: new Function(`${output.code}; return _render;`)(),
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
    console.warn('json', _.cloneDeep(render))

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
    await initHtmlBind();
    const json = UECompiler.htmlToJson(html);
    return json;
  }

  /**
   * Html 转成 Json，注意先使用 UECompiler 初始化
   * @param html 
   */
  static htmlToJson(html: string) {
    const htmlBind = _htmlBind;
    htmlBind || console.warn(htmlBind);//这句防止优化掉htmlBind，无它用
    html = _escapeES(html);
    let json = eval("eval(\`htmlBind\\\`\$\{html\}\\\`\`)");
    json = JSON.parse(_unEscapeES(JSON.stringify(json)));
    checkJson([json]);
    return json;
  }

  /**
   * Json 转成 Html
   * @param html 
   */
  static async jsonToHtmlAsync(json: any, config?: UEJsonToHtmlConfig) {
    // await initJsonToXml();
    let html: string = UECompiler.jsonToHtml(json, config);
    return html;
  }

  /**
   * Json 转成 Html，注意先使用 UECompiler 初始化
   * @param html 
   */
  static jsonToHtml(json: any, config?: UEJsonToHtmlConfig) {
    json = _.cloneDeep(json);
    // const newJson = {
    //   root20200806: toJson([json])
    // }
    // const html: string = _.trim(_jsonxml(newJson).replace(/<\/?root20200806>/g, ""));
    const html: string = _.trim(UEJsonToHtml([json], config));
    return html;
  }

  /**
   * 初始babel环境
   */
  static async init(p?: { bable?: boolean }) {
    const { bable } = p || {};
    const list = [initHtmlBind(), initJsonToXml()];
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
function checkJson(jsons: any[]) {
  _.forEach(jsons, function (item) {
    if (!item) return;
    const props = item.props;
    _.forEach(props, function (p, n) {
      props[n] = _unEscapeS(p);
    });
    if (item.children) checkJson(item.children);
  });
}

function htmlHandle(type, props, ...children) {
  let item: any = { type };
  props && (item.props = props);
  children && children.length > 0 && (item.children = children);
  return item;
}

let _htmlBind;
async function initHtmlBind() {
  if (_htmlBind) return _htmlBind;
  let htmFn: any = await import(/* webpackChunkName: "ui-editor-other-tool" */ 'htm');
  htmFn = checkDefault(htmFn);
  _htmlBind = htmFn.bind(htmlHandle);
  return _htmlBind;
}

// let _jsonxml;
async function initJsonToXml() {
  // if (_jsonxml) return _jsonxml;
  // _jsonxml = await import(/* webpackChunkName: "ui-editor-other-tool" */ 'jsontoxml');
  // _jsonxml = checkDefault(_jsonxml);
  // return _jsonxml;
}

function toJson(renders: any[]) {
  return _.map(renders, function (item) {
    if (!item || _.isString(item)) return item || '';
    const attrs = {};
    _.forEach(item.props, function (p, n) {
      attrs[n] = _escapeS(p);
    });
    const newItem = {
      name: item.type,
      attrs
    };
    let children = item.children;
    if (children && children.length > 0)
      newItem['children'] = toJson(children);
    return newItem;
  });
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
    // props = newItem.props;
    _.forEach(item, function (p, n) {
      if (n == 'parent' || n == 'children') return;
      if (!_.includes(_jsonBaseProps, n))
        props[n] = JSON.stringify(p);
      // props[`#${n}`] = _.includes(_renderObjProps, n) ? JSON.stringify(p) : p;
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
      // if (n.indexOf('#') == 0) {
      //   const newN = n.substr(1);
      //   newItem[newN] = _.includes(_renderObjProps, newN) ? JSON.parse(p) : p;
      // } else
      //   newProps[n] = p;
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