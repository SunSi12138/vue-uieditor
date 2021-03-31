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

  static render(el) {
    const jo = $(el);


    if (!_checkInited(jo)) {
      jo.on('click', '.layui-bg-blue,.layui-bg-blue-active', function (e) {
        var jo = $(e.target);
        if (jo.hasClass('layui-bg-blue-active')) {
          jo.addClass('layui-bg-blue');
          jo.removeClass('layui-bg-blue-active');
        } else {
          jo.addClass('layui-bg-blue-active');
          jo.removeClass('layui-bg-blue');
        }
      });
      jo.on('selectstart', '.layui-bg-blue,.layui-bg-gray', function (e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      });

      jo.on('click', '.layui-icon-about', function (e) {
        LayuiHelper.msg('aaaa')
      });
    }

    // jo.find('div[colorpicker]').each(function (idx, el) {
    //   var jParent = $(el);
    //   var jColor = jParent.children('div');
    //   console.warn("jParent", el, jParent.children(), jColor)
    //   //表单赋值
    //   colorpicker.render({
    //     elem: jColor[0]
    //     , color: '#1c97f5'
    //     , done: function (color) {
    //       console.warn("jParent.find('input')'", jParent, jParent.find('input'))
    //       jParent.find('input').first().val(color);
    //     }
    //   });
    // });

    //表单赋值
    slider.render({
      elem: jo.find('[slider]')
      , range: false
      , step: 1
      , min: 1
      , max: 24
      , change: function (value) {
        console.warn('slider', value)
      }
    });

    selectInput.render({
      elem: jo.find('[selectInput]'),
      data: [
        { value: 1111, name: 1111 },
        { value: 2222, name: 2222 },
        { value: 3333, name: 3333 },
        { value: 6666, name: 6666 },
      ],
      placeholder: '请输入名称',
      name: 'list_common',
      remoteSearch: false
    });

    // //自定义验证规则
    // form.verify({
    //   title: function (value) {
    //     if (value.length < 5) {
    //       return '标题也太短了吧';
    //     }
    //   }
    //   , pass: [/(.+){6,12}$/, '密码必须6到12位']
    //   , money: [
    //     /^\d+\.\b\d{2}\b$/
    //     , '金额必须为小数保留两位'
    //   ]
    // });

    // //初始赋值
    // var thisValue = form.val('first', {
    //   'vModel': 'model.name'
    //   , 'v-if': 'false'
    //   , 'ref': 'refName'
    //   , 'disabled': 'false'
    //   , 'name': ''
    //   //,'quiz': 2
    //   , 'interest': 3
    //   , 'like[write]': true
    //   //,'open': false
    //   , 'sex': '男'
    //   , 'desc': 'form 是我们非常看重的一块'
    //   , xxxxxxxxx: 123
    // });


    form.render();

    //事件监听
    form.on('select', function (data) {
      console.log('select: ', this, data);
    });

    form.on('select(quiz)', function (data) {
      console.log('select.quiz：', this, data);
    });

    form.on('select(interest)', function (data) {
      console.log('select.interest: ', this, data);
    });



    form.on('checkbox', function (data) {
      console.log(this.checked, data.elem.checked);
    });

    form.on('switch', function (data) {
      console.log(data);
    });

    form.on('radio', function (data) {
      console.log(data);
    });

    //监听提交
    form.on('submit(*)', function (data) {
      console.log(data)
      alert(JSON.stringify(data.field));
      return false;
    });


  }
}