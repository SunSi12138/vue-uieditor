import _ from 'lodash';
import querystring from 'querystring';

let stringEmpty = "",
  slice = Array.prototype.slice;

function _assign(obj1, obj2) {
  if (!_.isObject(obj1) || !_.isObject(obj2)) return _.isObject(obj2) && !_.isFunction(obj2) ? _.cloneDeep(obj2) : obj2;

  _.forEach(obj2, function (item, key) {
    obj1[key] = _assign(obj1[key], item);
  });

  return obj1;
}

export class UEHelper {
  static stringEmpty = stringEmpty;

  static noop() { }

  static error(...args:any[]){
    console?.error && console.error(...args);
  }

  /** 深 assign */
  static assignDepth(...objs: any[]) {
    let first = objs[0];
    if (objs.length <= 1) return first;
    _.forEach(objs.slice(1), function (item) {
      if (item) first = _assign(first, item)
    });
    return first;
  }

  static isWindow(obj: any) { return !!(obj && obj == obj.window); }

  /**
   * 比较两个对像是否相等，但不比较function类型
   * @param p1 
   * @param p2 
   */
  static isEqualNotFn(p1, p2): boolean {
    return _.isEqualWith(p1, p2, function (item1, item2) {
      if (_.isFunction(item1) && _.isFunction(item2))
        return true;// item1.toString() == item2.toString();
    });
  }

  static toArray(p: any, start: number = 0, count: number = Number.MAX_VALUE): Array<any> {
    return p ? slice.apply(p, [start, count]) : p;
  }

  static makeAutoId() {
    var t = new Date().valueOf();
    if ((++_tick) > 100000) _tick = 0;
    return [t, _tick].join('_');
  }

  /**
   * 是否属于类或基类
   * @param p 参数
   * @param cls 类
   */
  static isClass(p, cls) {
    return p ? (p == cls || (p.prototype && p.prototype instanceof cls)) : false;
  }


  static offset(element: HTMLElement, offset?: { top: number; left: number; }): { top: number; left: number; } {
    if (offset) {
      let curOffset = UEHelper.offset(element);
      return {
        top: offset.top - curOffset.top,
        left: offset.left - curOffset.left
      }
    } else {
      let box;
      if (element.getBoundingClientRect)
        box = element.getBoundingClientRect();
      let win = window, docElem = document.documentElement;
      return {
        top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
        left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
      }
    }
  }

  /**
   * setQuerystring
   * @param url 
   * @param p 
   * @param json 如果为true , 属性内容 Array 或 Object 转为JSON, 默认为 false
   * @param useToHttp 是否用于http，encode会不一样 , 默认为 false
   */
  static setQuerystring(url: string, p: object, json?: boolean, useToHttp?: boolean): string {
    if (!p) return url;
    let [hash, href, queryStr] = _querystring(url || '');
    let query = UEHelper.queryParse(queryStr);
    _.forEach(p, function (item:any, name) {
      item || (item = '');
      query[name] = json === true && (_.isArray(item) || _.isObject(item)) ? JSON.stringify(item) : item
    });
    let queryStringify = UEHelper.queryStringify(query, useToHttp);
    let toUrl = !queryStringify ? href : [href, queryStringify].join('?');
    if (hash) toUrl = [toUrl, hash].join('#');
    return toUrl;
  }

  /**
   * 获取url query, 如果name为空返回query部分
   * @param url 
   * @param name 
   */
  static getQuerystring(url: string, name?: string): string {
    if (!url) return '';
    let [hash, href, queryStr] = _querystring(url);
    if (!name) return queryStr || '';
    let query: object = UEHelper.queryParse(queryStr);
    return query[name] || '';
  }

  static queryParse(query: string): object {
    return (query && querystring.parse(query)) || {};
  }

  /**
   * 
   * @param query 
   * @param useToHttp 是否用于http，encode会不一样 , 默认为 false
   */
  static queryStringify(query: any, useToHttp?: boolean): string {
    let str = (query && querystring.stringify(query)) || '';
    return useToHttp === true ? str.replace(/\%2B|\%20/g, '+').replace(/\%2C/g, ',') : str;
  }

  /**
   * setHashQuerystring
   * @param url 
   * @param p 
   * @param json 如果为true , 属性内容 Array 或 Object 转为JSON, 默认为 false
   */
  static setHashQuerystring(url: string, p: object, json?: boolean): string {
    if (!p) return url;
    let [hash, href, queryStr] = _querystring(url || '');
    hash = UEHelper.setQuerystring(hash, p, json);
    let toUrl = !queryStr ? href : [href, queryStr].join('?');
    if (hash) toUrl = [toUrl, hash].join('#');
    return toUrl;
  }

  /**
   * 获取url hash query, 如果name为空返回query部分
   * @param url 
   * @param name 
   */
  static getHashQuerystring(url: string, name?: string): string {
    if (!url) return '';
    url = UEHelper.getUrlHash(url);
    let [hash, href, queryStr] = _querystring(url);
    if (!name) return queryStr || '';
    let query: object = UEHelper.queryParse(queryStr);
    return query[name] || '';
  }

  /**
   * 获取 url hash部分
   * @param url 
   */
  static getUrlHash(url: string) {
    let [hash, href, queryStr] = _querystring(url);
    return _.trim(hash);
  }

  /**
   * 获取url路径部分
   * @param url 
   */
  static getUrlPart(url: string) {
    let [hash, href, queryStr] = _querystring(url);
    return _.trim(href);
  }

  /**
   * url 是否绝对路径
   * @param url 
   */
  static isAbsolutelyUrl(url: string) {
    return /^[^\/]+\:\/\/|^\//.test(url);
  }

  /**
   * 发送一个事件
   * @param element HTML Element
   * @param eventName 事件名称
   * @param type 事件类型，默认 MouseEvents
   * @param bubbles 是否可以取消，默认 true
   * @param cancelable 是否可以取消，默认 true
   */
  static dispatchEvent(element: Element | EventTarget, eventName: string, type: "UIEvents" | "MouseEvents" | "MutationEvents" | "HTMLEvents" = 'MouseEvents', bubbles: boolean = true, cancelable: boolean = true) {
    var event = document.createEvent(type);
    event.initEvent(eventName, bubbles, cancelable);
    element.dispatchEvent(event);
  }

  /**
   * 统一 await 返回值: [err, data]
   * @param promise 
   */
  static awaitWrap<T = any, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
    return promise
      .then<[null, T]>((data: T) => [null, data])
      .catch<[U, null]>(err => [err, null])
  }

  /**
   * 暂停
   * @param time 微秒
   */
  static async pause(time){
    return new Promise(function(r){
      setTimeout(r, time || 1);
    });
  }

}

let _tick = 0;

function _querystring(url: string): string[] {
  let [newUrl, ...hash] = url ? url.split('#') : ['', ''];
  return [hash.join('#'), ...newUrl.split('?')];
}

