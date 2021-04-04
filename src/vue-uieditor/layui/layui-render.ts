import './layui-import';

// const form = layui.form
//   , layer = layui.layer
//   , tree = layui.tree
//   , layedit = layui.layedit
//   , colorpicker = layui.colorpicker
//   , slider = layui.slider
//   , selectInput = layui.selectInput;

const $: JQueryStatic = layui.$;


const _cleanData = $.cleanData;
$.cleanData = function (elems) {
  for (var i = 0, elem; (elem = elems[i]) != null; i++) {
    try {
      $(elem).triggerHandler('vue_uieditor_linkdom');
    } catch (e) { }
  }
  _cleanData.apply($, arguments);
};

// function _checkInited(jo: JQuery) {
//   if (jo.data('_layui_render_initd')) return true;
//   jo.data('_layui_render_initd', true);
//   return false;
// }

// export function Layuidestroy($el) {
//   layui.$($el).remove();
//   // layui.$($el).html('');
//   // const $ = layui.$;
//   // layui.$('*', $el).add([$el]).each(function () {
//   //   layui.$.event.remove(this);
//   //   // console.log('aaaaa')
//   //   layui.$.removeData(this);
//   //   if (this._vue_uieditor_linkdom) {
//   //     $.each(this._vue_uieditor_linkdom, function (idx, item) {
//   //       item && item();
//   //     });
//   //     this._vue_uieditor_linkdom = null;
//   //   }
//   // });
// }

export class LayuiRender {

  static destroy(el) {
    $(el).remove();
  }

  //dom销毁时处理内容
  static linkDom(dom, callback) {
    if (!dom) return;
    const jo: any = dom instanceof $ ? dom : $(dom);
    jo.one('vue_uieditor_linkdom', callback);
  }

  static unLinkDom(dom, callback?: any) {
    if (!dom) return;
    const jo: any = dom instanceof $ ? dom : $(dom);
    if (callback)
      jo.off('vue_uieditor_linkdom', callback);
    else
      jo.off('vue_uieditor_linkdom');
  }

}