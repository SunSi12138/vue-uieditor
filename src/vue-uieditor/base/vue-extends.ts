import _ from "lodash";
import Vue, { ComponentOptions, PropOptions, WatchOptions } from "vue";
import Component from "vue-class-component";
import { VueClass } from 'vue-class-component/lib/declarations';
import { Constructor } from "vue-property-decorator";

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // for vue-router 2.2+
]);

export type UEVueMixin<V extends Vue = Vue> = ComponentOptions<Vue> | typeof Vue;
export interface UEVueComponentOptions<V extends Vue> extends ComponentOptions<V> {
}

export function UEVueComponent<V extends Vue>(options: UEVueComponentOptions<V> & ThisType<V>): <VC extends VueClass<V>>(target: VC) => VC {
  return function (target: Function) {
    const prototype = target.prototype;
    const mixin = prototype[_getMinxinKey(false)];
    const mixin_afters = prototype[_getMinxinKey(true)];
    let mixins = [];
    if (options.mixins) mixins = mixins.concat(options.mixins);
    if (mixin) mixins.push(mixin);
    if (mixin_afters) mixins.push(mixin_afters);

    if (mixins.length > 0)
      options.mixins = mixins;
    let componentFactory: any = Component(options);
    return componentFactory(target);
  };
}

function _getMinxinKey(after?: boolean) {
  return ['_ue_mixins', after === true ? '1' : '0'].join('_');
}

// function _getMixin<V extends Vue>(target: any, after?: boolean): UEMixin<V>[] {
//   let key = _getMinxinKey(after);
//   return target[key] || {};
// }

function _setMixin<V extends Vue>(target: any, mixin: UEVueMixin<V>, after?: boolean): UEVueMixin<V>[] {
  const key = _getMinxinKey(after);
  const newMixin = target[key] = Vue['util'].mergeOptions(target[key] || {}, mixin);
  return newMixin;
}

/**
 * UEProp(String)
 * @param options 
 * @returns 
 */
export function UEVueProp(options?: (PropOptions | Constructor[] | Constructor)): PropertyDecorator {
  return function (target: any, propKey: string) {
    _setMixin(target, {
      props: {
        [propKey]: !options ? { type: null } : options
      }
    });
  };
}

/**
  * 定义 Inject
  * @param provide 
  * @example
  *  UEVueProvide('ppName')
  *  private _tstPo() {
  *      return this.name + 'asdfasf';
  *  }
  *
  */
export function UEVueProvide(provide?: string): PropertyDecorator {
  return function (target: any, propKey: string) {
    _setMixin(target, {
      provide() {
        return {
          [provide || propKey]: target[propKey].call(this)
        }
      }
    });
  };
}


/**
 * 注入 Provide
 * @param provide 
 * @param defaultValue 
 * @example
 *  UEVueInject('ppName')
    private _ppName:any;
 */
export function UEVueInject(provide?: string, defaultValue?: any): PropertyDecorator {
  return function (target: any, propKey: string) {
    _setMixin(target, {
      inject: {
        [propKey]: { from: provide || propKey, default: defaultValue }
      }
    });
  };
}


/**
 * vue data
 * @example
 *   UEVueData()
 *   private _initData1() {
 *       this.name1 = '11111';
 *       this.name2 = '2222';
 *      return {name3: '3333'};
 *   }
 */
export function UEVueData(): PropertyDecorator {
  return function (target: any, propKey: string) {
    _setMixin(target, {
      data() {
        const data = target[propKey].call(this);
        return data && { ...data } || {};
      }
    });
  };
}

const fnType = typeof (function () { });

function _getWatchPath(target: any, propKey: string, path: any): string {
  if (typeof path === fnType) {
    let key = ['_ue_watch_computed', propKey].join('_');
    _setMixin(target, {
      computed: {
        [key]() {
          return path.apply(this, arguments);
        }
      }
    })
    return key;
  } else {
    return path;
  }
}

/**
 * 
 * @param path 
 * @param options 
 * @param change 
 * @returns 
 * @example
 * UEVueWatch('name')
 * private _wName(val){}
 */
export function UEVueWatch<T = UEVue>(path: string | ((this: T) => any), options?: WatchOptions, change?: boolean): MethodDecorator {
  const { deep = false, immediate = false } = options || {};
  return function (target: any, propKey: string) {
    const wProp = _getWatchPath(target, propKey, path);
    _setMixin(target, {
      watch: {
        [wProp]: {
          handler: function (value, old) {
            target[propKey].apply(this, arguments);
          }, deep, immediate
        }
      }
    });
  };
}

function _each(list: any[], fn) {
  if (!list) return;
  for (var len = list.length, i = 0; i < len; i++) {
    const item = list[i];
    const res = fn(item, i, list);
    if (res === false) break;
  }
}

export type UEVueLifeName = 'beforeCreate' | 'created' | 'beforeMount' | 'mounted' |
  'beforeDestroy' | 'destroyed' | 'beforeUpdate' | 'updated' |
  'activated' | 'deactivated' | 'beforeRouteEnter' | 'beforeRouteUpdate' | 'beforeRouteLeave';

function _setLife(target: any, lifeName: UEVueLifeName, fn: any, after?: boolean) {
  _setMixin(target, {
    [lifeName]: fn
  }, after);
}

function _setLifeEx(target: any, lifeNames: UEVueLifeName[], fn: Function, after?: boolean) {
  const fnList = [];
  _setLife(target, 'created', function () {
    const fnDefList = [];
    _.forEach(lifeNames, function (life, idx) {
      if (!life) return;
      const fnDef = function (fnItem) {
        fnList[idx] = fnItem;
      };
      fnDefList[idx] = fnDef;
    });
    fn.apply(this, fnDefList);
  });
  _.forEach(lifeNames, function (life, idx) {
    if (!life) return;
    _setLife(target, life, function () {
      fnList[idx]?.apply(this, arguments);
    }, after);
  });
}



/**
 * vue data
 * @example
 *   UEVueLife('created')
 *   private _created1() {
 *   }
 */
export function UEVueLife(lifeName: UEVueLifeName, after?: boolean): PropertyDecorator {
  return function (target: any, propKey: string) {
    _setLife(target, lifeName, target[propKey], after);
  };
}


/**
 * 
 * @param event 事件名称
 * @param once 是否只触发一次
 * @param el 是否绑定到el
 */
export function UEVueEvent<T = UEVue>(event: string, once?: boolean, el?: ((this: T, el: HTMLElement) => HTMLElement | Document | Window) | boolean): PropertyDecorator;
/**
 * 
 * @param event 事件名称
 * @param p 选项
 * @param el 是否绑定到el
 */
export function UEVueEvent<T = UEVue>(event: string, p?: {
  /** 是否只触发一次，默认为false */
  once?: boolean;
  /** 是否路由activated才触发, 如果有el参数默认为true 否则为 false */
  activated?: boolean;
}, el?: ((this: T, el: HTMLElement) => HTMLElement | Document | Window) | boolean): PropertyDecorator;
export function UEVueEvent<T = UEVue>(event: string, p: boolean | {
  /** 是否只触发一次，默认为false */
  once?: boolean;
  /** 是否路由activated才触发, 如果有el参数默认为true 否则为 false */
  activated?: boolean;
} = false, el: ((this: T, el: HTMLElement) => HTMLElement | Document | Window) | boolean = false): PropertyDecorator {
  const isPObj = typeof p === 'object';
  const once = isPObj ? p['once'] === true : p === true;
  const activated = isPObj ? p['activated'] === true : !!el;
  return function (target: any, propKey: string) {
    const lifeObj: any = {};
    if (activated) {
      lifeObj.activated = function () {
        this._ue_event_activated = true;
      };
      lifeObj.deactivated = function () {
        this._ue_event_activated = false;
      };
    }
    if (!el) {
      lifeObj.created = function () {
        this._ue_event_activated = true;
        let fn = function () {
          if (activated && !this._ue_event_activated) return;
          target[propKey].apply(this, arguments);
        }.bind(this);
        this[once ? '$once' : '$on'](event, fn);
      };

    } else {
      _setLifeEx(target, ['created', 'updated', 'mounted', 'destroyed'], function (created, updated, mouated, destroyed) {
        let isEnd = false;
        let lastEl;
        const targetFn = target[propKey];
        let $this = this;
        created(function () {
          $this._ue_event_activated = true;
          $this = this;
        });
        let fn = function () {
          if (isEnd) return;
          if (once) isEnd = true;
          if (activated && !$this._ue_event_activated) return;
          if (isdestroyed) return;
          targetFn.apply($this, arguments);
        };
        const upFn = function () {
          if (isdestroyed) return;
          let $el = $this.$el;
          if (typeof el === fnType)
            $el = el['call']($this, $el);
          if (lastEl && lastEl != $el) {
            lastEl.removeEventListener(event, fn);
          }
          lastEl = $el;
          if (!$el) return;
          $el.addEventListener(event, fn);
        };
        var timeId;
        updated(function () {
          if (timeId) return;
          timeId = setTimeout(function () {
            timeId = null;
            upFn();
          }, 50);
        });
        mouated(upFn);
        var isdestroyed = false;
        destroyed(() => {
          isdestroyed = true;
          if (lastEl) {
            lastEl.removeEventListener(event, fn)
            lastEl = null;
          }
        });
      });
    }
    _setMixin(target, lifeObj);
  };
}


export class UEVue extends Vue {

  static getVueName(vnode) {
    return vnode && vnode.componentOptions ? vnode.componentOptions.Ctor.options.name : '';
  }

  get $vueName(): string {
    return UEVue.getVueName(this.$vnode);
  }

  readonly props: void;
  readonly store: void;

  readonly beforeCreate: void;
  readonly created: void;
  readonly beforeMount: void;
  readonly mounted: void;
  readonly beforeDestroy: void;
  readonly destroyed: void;
  readonly beforeUpdate: void;
  readonly updated: void;
  readonly activated: void;
  readonly deactivated: void;
  readonly computed: void;

  readonly beforeRouteEnter: void;
  readonly beforeRouteUpdate: void;
  readonly beforeRouteLeave: void;

  get $isDestroyed(): boolean {
    return this._isDestroyed;
  }

  get $isBeingDestroyed(): boolean {
    return this._isBeingDestroyed;
  }

  get $isMounted(): boolean {
    return this._isMounted;
  }

  get $isRouteActived(): boolean {
    return this._inactive !== true;
  }

  [key: string]: any;

}

