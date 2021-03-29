
import _ from 'lodash';
import { UEOption, UETransferExtend } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UEHelper } from './base/ue-helper';
import { UERender } from './base/ue-render';
import { UERenderItem } from './base/ue-render-item';
import { UEService } from './base/ue-service';
import { UEMergeMixin, UEVue, UEVueComponent, UEVueInject, UEVueLife, UEVueMixin, UEVueProp, UEVueWatch } from './base/vue-extends';
import './transfer';

const _defaultGlobalExtend = {
  UEHelper,
  UECompiler
};

function _defaultOptions() {
  return {
    transfer: {},
    transferBefore(render) {
      return render;
    },
    transferAfter(render) {
      return render;
    }
  };
}

@UEVueComponent({})
export default class VueUieditorRender extends UEVue {
  @UEVueProp()
  private json!: string;

  @UEVueProp()
  private mixin!: string;

  @UEVueProp()
  private query!: string;

  @UEVueProp()
  private params!: string;

  @UEVueProp(Boolean)
  private editing!: boolean;

  @UEVueProp(Boolean)
  private preview!: boolean;

  @UEVueProp()
  private options!: UEOption;
  get optionEx() {
    const options = this.options;
    return UERender.GlobalTransferToOptions(options);
  }

  @UEVueInject('service')
  service: UEService;

  get $params(): any {
    return this.params || {};
  }

  get $query(): any {
    const route = this.$route;
    return _.assign({}, route.query, this.query);
  }

  @UEVueWatch('json')
  @UEVueWatch('options')
  /** 刷新 */
  refresh() {
    this._makeVueRender();
  }

  @UEVueLife('created')
  private async _created1() {
    const options = this.optionEx || {};
    await UECompiler.init({ bable: options.babel !== false });
    this._makeVueRender();
  }


  get isErrorCaptured() {
    return this.preview || _.has(this.$query, '_uedebug');
  }

  errorCaptured(err: Error, vm: UEVue, info: string) {
    if (!this.isErrorCaptured) return;
    this.logError(err, vm, info);
  }

  private _compiledRender;
  logError(err, vm, info) {
    // this.$Notice.error({
    //   name: 'uieditor-errInfo',
    //   title: '错误信息',
    //   duration: 15,
    //   desc: `Error in ${info}:<br /> "${err.toString()}"`
    // });
    if (window.console) {
      console.error && console.error(err);
      console.warn && console.warn('render', this._compiledRender);
    }
  }

  vueRender = null;// { render() { } };
  private async _makeVueRender() {
    const vueDef: any = { mixins: [] };

    const json: UERenderItem = _.isString(this.json) ? JSON.parse(this.json) : this.json;
    const editing = this.editing === true;
    const preview = this.preview === true;
    const options = _.assign(_defaultOptions(), this.optionEx);

    if (options?.mixins) vueDef.mixins = vueDef.mixins.concat(options.mixins);
    if (this.mixin) vueDef.mixins = vueDef.mixins.concat([this.mixin]);

    const data = {};
    let mixinExBefore = {};
    let mixinEx = {};
    let previewOpt = null;

    let render;

    if (json) {
      const globalOpt = _.assign({}, _defaultGlobalExtend, options?.global);

      previewOpt = preview && (function () {
        let opt = null;
        const previewItem = UERender.findRender([json], { type: 'preview-opt' });
        if (previewItem) opt = _.first(previewItem.children);
        if (opt) {
          const babelContent = UECompiler.babelTransform(`function __ue_vue_def_ctx(){ return ${opt}; }`);
          opt = (new Function('__ue_vue_def_', `with(__ue_vue_def_) { return (function() { ${babelContent.code}; return _.assign(__ue_vue_def_ctx(),{$init_0326_:function($this){__ue_vue_def_.$this= $this;}});})(); }`))({ $this: {}, ...globalOpt });
        }

        return opt;
      })();

      const service = editing ? this.service : null;
      let transferExt: any = {};
      _.assign(transferExt, {
        data,
        editing,
        service,
        global: globalOpt,
        extendMixin(newMixin: UEVueMixin, before?: boolean) {
          if (before)
            mixinExBefore = UEMergeMixin(mixinExBefore, newMixin);
          else
            mixinEx = UEMergeMixin(mixinEx, newMixin);
        },
        get options() { return options; },
        getProp: _getProp.bind(transferExt),
        setProp: _setProp.bind(transferExt),
        getPropValue: _getVuePropValue.bind(transferExt),
        setPropValue: _setProp.bind(transferExt),
        getPropText: _getVuePropText.bind(transferExt),
        removeProp: _removeProp.bind(transferExt),
        closest(find) { return _closest.call(transferExt, transferExt.render, find); },
      } as UETransferExtend);



      let renderList;
      try {
        renderList = UERender.JsonToVueRender([json], transferExt);
      } catch (e) {
        // this.$Message.error({
        //   content: ['Meta处理错误：', (e && e.message)].join(''),
        //   duration: 5
        // });
        throw e;
      }
      if (renderList.length > 1)
        render = { type: 'div', children: renderList };
      else
        render = renderList[0];

      const newMixinEx = UEMergeMixin(mixinExBefore, mixinEx);
      if (!_.isEmpty(newMixinEx)) {
        vueDef.mixins.push(editing ? _makeEditMixin(newMixinEx) : newMixinEx);
      }

    }

    const isErrorCaptured = this.isErrorCaptured;
    let debugInfo: any = isErrorCaptured || editing ? {} : null;
    let compiled = await UECompiler.compile(render, debugInfo, editing);
    this.$extendVueDef(vueDef, { previewOpt });

    if (isErrorCaptured) {
      _.assign(debugInfo, {
        render,
        vueDef,
        compiled,
        $editorRender: this
      });
      console.log('debugInfo     ====> ', debugInfo);
      vueDef.mixins.push({
        created() {
          console.log('this     ====> ', this);
        }
      });
    }

    this._compiledRender = null;
    if (debugInfo) {

      this._compiledRender = (compiled as any).renderOrg;
      if (!this._compiledRender) {
        const compiledRender = compiled.render;
        this._compiledRender = compiledRender;
        (compiled as any).renderOrg = compiledRender;
        compiled.render = function () {
          try {
            return compiledRender.apply(this, arguments);
          } catch (e) {
            const template = `<div class="compiler-error">${e.message}</div>`;
            const ret = UECompiler.vueCompile(template);
            if (window.console) {
              console.error && console.error(e.message);
              console.warn && console.warn('render', compiledRender);
            }
            return ret.render.apply(this, arguments);
          }
        }
      }
    }

    vueDef.render = compiled.render;
    vueDef.staticRenderFns = compiled.staticRenderFns;
    this.vueRender = vueDef;
  }

  $extendVueDef(vueDef, { previewOpt }) {

    let $uieditorRender = this;

    let options = this.optionEx;
    vueDef.mixins = (vueDef.mixins || []).concat([{
      data() {
        if (previewOpt && previewOpt.$init_0326_) {
          previewOpt.$init_0326_(this);
        }
        return {};
      },
      computed: {
        $value: {
          get() { return $uieditorRender.$value; },
          set(val) { $uieditorRender.$value = val; }
        },
        $params() {
          return previewOpt ?
            _.assign({}, $uieditorRender.$params, previewOpt.param)
            : $uieditorRender.params;
        },
        $uieditorRender() { return $uieditorRender; },
        $this() { return this; },
        $uieditorOptions() { return options; },
        $query() {
          return previewOpt ?
            _.assign({}, $uieditorRender.$query, previewOpt.query)
            : $uieditorRender.$query;
        },
        $isEditing() { return $uieditorRender.editing; },
      },
      methods: {
        $babelTransform(script, opt) {
          return UECompiler.babelTransform(script, opt);
        }
      },
      updated() {
        $uieditorRender.$emit('on-render-updated', this);
      },
      created() {
        $uieditorRender.$emit('on-render-created', this);
      },
      mounted() {
        $uieditorRender.$emit('on-render-mounted', this);
      },
      destroyed() {
        $uieditorRender.$emit('on-render-destroy', this);
        $uieditorRender = null;
      }
    } as UEVueMixin]);

    if (_.size(previewOpt?.vueDef) > 0)
      vueDef.mixins.push(previewOpt.vueDef);
  }


}


function _makeEditMixin(mixin) {
  let newMixin = {};
  _.forEach(mixin, function (value, key) {
    switch (key) {
      case 'data':
      case 'methods':
      case 'computed':
      case 'mixins':
        if (key == 'mixins') {
          newMixin[key] = _.map(mixin[key], function (mixin) {
            return _makeEditMixin(mixin);
          });
        } else
          newMixin[key] = value;
        break;
    }
  });
  return newMixin;
}



function _removeVueProp(render, prop: string) {
  let props = render.props;
  if (prop in props)
    delete props[prop];
  else {
    let bind = `:${prop}`;
    if (bind in props) delete props[bind];
  }
}

function _getVueProp(render, prop: string, remove?: boolean): any {
  let props = render.props || {};
  let bindName = `:${prop}`;
  let eventName = `@${prop}`;
  let bind = (bindName in props);
  let event = (eventName in props);
  let name = bind ? bindName : prop;
  let has = bind || (prop in props);
  let obj = {
    bind,
    event,
    has,
    name,
    value: props[name]
  };
  if (remove) _removeVueProp(render, prop);
  return obj;
}

function _removeProp(name) {
  const render = this.render;
  if (_.isString(render)) return;
  _removeVueProp(render, name);
}

function _getProp(name, remove) {
  const render = this.render;
  if (_.isString(render)) return;
  return _getVueProp(render, name, remove);
}

function _setProp(name, ex) {
  const render = this.render;
  if (_.isString(render)) return;
  if (ex.bind) name = `:${name}`;
  if (ex.event) name = `@${name}`;
  if (!render.props) render.props = {};
  return render.props[name] = ex.value;
}

function _getVuePropValue(prop: string, remove?: boolean) {
  const render = this.render;
  if (_.isString(render) || !render.props) return;
  let props = render.props;
  let value = props[prop] || props[`:${prop}`] || props[`@${prop}`];
  if (remove) _removeVueProp(render, prop);
  return value;
}

function _getVuePropText(prop: string, defaultValue?: any, remove = true) {
  let vueProp = this.getProp(prop, remove);
  if (!vueProp) return '';
  let text = vueProp.value || defaultValue;
  if (text && vueProp.bind) {
    text = `{{${this.compatibleExpression(text)}}}`
  }
  return text || '';
}


function _closest(render, find) {
  if (!render) return;
  if (find(render)) {
    return render;
  } else {
    const parent = render.parent();
    if (!parent) return;
    return _closest.call(this, parent, find);
  }
}
