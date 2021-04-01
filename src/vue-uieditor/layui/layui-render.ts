import _ from 'lodash';
import './layui-import';
import { LayuiHelper } from './layui-helper';

const form = layui.form
  , layer = layui.layer
  , tree = layui.tree
  , layedit = layui.layedit
  , colorpicker = layui.colorpicker
  , slider = layui.slider
  , selectInput = layui.selectInput;

let $: JQueryStatic = layui.$;


const _cleanData = $.cleanData;
$.cleanData = function (elems) {
  for (var i = 0, elem; (elem = elems[i]) != null; i++) {
    try {
      $(elem).triggerHandler('vue_uieditor_linkdom');
    } catch (e) { }
  }
  _cleanData.apply($, arguments);
};

function _checkInited(jo: JQuery) {
  if (jo.data('_layui_render_initd')) return true;
  jo.data('_layui_render_initd', true);
  return false;
}

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

  static renderTree(p: { elem: any, data: any }) {

    tree.render(_.assign({
      elem: null
      , data: []
      , showCheckbox: false  //是否显示复选框
      , accordion: false  //是否开启手风琴模式
      , onlyIconControl: false //是否仅允许节点左侧图标控制展开收缩
      , isJump: false  //点击文案跳转地址
      , edit: false  //操作节点图标
    }, p));

  }

}