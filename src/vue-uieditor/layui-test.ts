

declare const layui:any;

export function LayuiInit() {

  function dragStart($:any, jUieditor:any) {
    var stopEvent = function (e:any) {
      e.stopPropagation();
      e.preventDefault();
    };

    var opt = {
      title: 'test',
      menus: [{
        text: '复制',
        icon: 'layui-icon-file-b',
        click() {
          console.warn('复制');
        }
      }, {
        text: '删除',
        icon: 'layui-icon-close',
        click() {
          console.warn('删除');
        }
      }]
    };


    var hideCls = 'uieditor-drag-hide';
    var jEditorJsonContent = jUieditor.find('.editor-json-content').first();
    var jSelectBox = $('<div class="uieditor-drag-sel-box ' + hideCls + '" />').appendTo(jEditorJsonContent);
    var jOverBox = $('<div class="uieditor-drag-over-box ' + hideCls + '" />').appendTo(jEditorJsonContent);
    var jPosline = $('<div class="uieditor-drag-pos-line ' + hideCls + '" />').appendTo(jEditorJsonContent);

    /**
     * 获取element的rect
     * @param target 
     */
    var _getOffsetRect = function (target:any) {

      const body = jEditorJsonContent[0];


      const doc = target.ownerDocument;
      const docElem = doc.documentElement;
      const win = doc.defaultView;
      const offsetTop = win.pageYOffset - docElem.clientTop;
      const offsetLeft = win.pageXOffset - docElem.clientLeft;

      const bodyRect = body.getBoundingClientRect();
      const bodyTop = bodyRect.top + offsetTop - body.scrollTop;
      const bodyLeft = bodyRect.left + offsetLeft - body.scrollLeft;

      const rect = target.getBoundingClientRect();
      const top = rect.top + offsetTop - bodyTop;
      const bottom = rect.bottom + offsetTop - bodyTop;
      const left = rect.left + offsetLeft - bodyLeft;
      const right = rect.right + offsetLeft - bodyLeft;
      const width = right - left;
      const height = bottom - top;

      return {
        top, bottom, left, right,
        width, height
      };

    }

    var _selectTarget:any = null;
    var isSelect = function (target:any) {
      return target == _selectTarget;
    };

    var unSelect = function(){
      _selectTarget = null;
      jSelectBox.addClass(hideCls);
    };
    var select = function (target) {
      if (isSelect(target)) return;
      _selectTarget = target;

      var jTarget = $(target);
      var title = opt.title;
      var menus = opt.menus;
      var toolbarHtmlList = [];
      var right = 0;
      menus.forEach(function (item, index) {
        toolbarHtmlList.push(`<a href="javascript:void(0);" title="${item.text}" class="select-toolbar layui-icon ${item.icon}"
        tIndex="${index}" style="right:${right}px" />`);
        right += 20;
      });
      var html = `<div class="title">
        <i id="collapse" class="container-extand-icon layui-icon layui-icon-right"></i>
        ${title}
      </div>${toolbarHtmlList.join('')}`;
      jSelectBox.html(html);

      var rect = _getOffsetRect(target);
      jSelectBox.css({
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      jSelectBox.removeClass(hideCls);

    };

    jSelectBox.on('click', '>a', function (e) {
      stopEvent(e);
      var jo = $(e);
      var index = ~~jo.attr('tIndex');
      if (index >= 0) {
        opt.menus[index].click();
      }
      return false;
    });


    jEditorJsonContent.on('mousedown', '.uieditor-drag-item,.uieditor-drag-content', function (e) {
      stopEvent(e);
      select(e.target);
      return false;
    });

  }

  layui.config({ base: '../src/lay/modules/' }).use(['tree', 'form', 'layedit', 'element', 'colorpicker', 'slider', 'selectInput'], function () {
    var form = layui.form
      , layer = layui.layer
      , $ = layui.$
      , tree = layui.tree
      , layedit = layui.layedit
      , colorpicker = layui.colorpicker
      , slider = layui.slider
      , selectInput = layui.selectInput;

    $('div[colorpicker]').each(function(idx, el){
      var jParent = $(el);
      var jColor = jParent.children('div');
          console.warn("jParent", el, jParent.children(), jColor)
             //表单赋值
      colorpicker.render({
        elem: jColor[0]
        ,color: '#1c97f5'
        ,done: function(color){
          console.warn("jParent.find('input')'", jParent, jParent.find('input'))
          jParent.find('input').first().val(color);
        }
      });
    });

        //表单赋值
slider.render({
  elem: '[slider]'
  , range: false
  , step:1
  , min:1
  , max:24
  ,change: function(value){
    console.warn('slider', value)
  }
});

    dragStart($, $('.layui-uieditor').first());
    console.warn('element', layui.element);
    selectInput.render({
      elem: '#selectInput1',
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

    var jUieditor = $('.layui-uieditor');

    jUieditor.on('click', '.layui-bg-blue,.layui-bg-gray', function (e) {
      var jo = $(e.target);
      if (jo.hasClass('layui-bg-gray')) {
        jo.addClass('layui-bg-blue');
        jo.removeClass('layui-bg-gray');
      } else {
        jo.addClass('layui-bg-gray');
        jo.removeClass('layui-bg-blue');
      }
    });
    jUieditor.on('selectstart', '.layui-bg-blue,.layui-bg-gray', function (e) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    });

    // jUieditor.on('mousedown', function (e) {
    //   layer.closeAll('tips');
    // });

    jUieditor.on('click', '.layui-icon-about', function (e) {
      // layer.tips('desc', e.target, {
      //   tips: [1, '#3595CC'],
      //   time: 5000
      // });
      layer.msg('descdddddddddddd ddddddddddddddddddd dfdfsdf',
        {
          time: 0, //20s后自动关闭
          btn: ['明白了']
        });
    });



    // $('.layui-bg-blue').on('click', function(e){
    //   var jo = $(e.target);
    //   if (jo.hasClass('layui-bg-gray')){
    //     jo.addClass('layui-bg-blue');
    //     jo.removeClass('layui-bg-gray');
    //   } else {
    //     jo.addClass('layui-bg-gray');
    //     jo.removeClass('layui-bg-blue');
    //   }
    // });

    //数据源
    var data1 = [{
      title: '一级1'
      , id: 1
      , children: [{
        title: '二级1-1'
        , id: 3
        , href: 'https://www.layui.com/doc/'
        , children: [{
          title: '三级1-1-3'
          , id: 23
          , children: [{
            title: '四级1-1-3-1'
            , id: 24
            , children: [{
              title: '五级1-1-3-1-1'
              , id: 30
            }, {
              title: '五级1-1-3-1-2'
              , id: 31
            }]
          }]
        }, {
          title: '三级1-1-1'
          , id: 7
          , checked: true
          , children: [{
            title: '四级1-1-1-1'
            , id: 15
            //,checked: true
            , href: 'https://www.layui.com/doc/base/infrastructure.html'
          }]
        }, {
          title: '三级1-1-2'
          , id: 8
          , children: [{
            title: '四级1-1-2-1'
            , id: 32
          }]
        }]
      }, {
        title: '二级1-2'
        , id: 4
        , spread: true
        , children: [{
          title: '三级1-2-1'
          , id: 9
          , checked: true
          , disabled: true
        }, {
          title: '三级1-2-2'
          , id: 10
        }]
      }, {
        title: '二级1-3'
        , id: 20
        , children: [{
          title: '三级1-3-1'
          , id: 21
        }, {
          title: '三级1-3-2'
          , id: 22
        }]
      }]
    }, {
      title: '一级2'
      , id: 2
      , spread: true
      , children: [{
        title: '二级2-1'
        , id: 5
        , spread: true
        , children: [{
          title: '三级2-1-1'
          , id: 11
        }, {
          title: '三级2-1-2'
          , id: 12
        }]
      }, {
        title: '二级2-2'
        , id: 6
        , checked: true
        , children: [{
          title: '三级2-2-1'
          , id: 13
        }, {
          title: '三级2-2-2'
          , id: 14
          , disabled: true
        }]
      }]
    }, {
      title: '一级3'
      , id: 16
      , children: [{
        title: '二级3-1'
        , id: 17
        , fixed: true
        , children: [{
          title: '三级3-1-1'
          , id: 18
        }, {
          title: '三级3-1-2'
          , id: 19
        }]
      }, {
        title: '二级3-2'
        , id: 27
        , children: [{
          title: '三级3-2-1'
          , id: 28
        }, {
          title: '三级3-2-2'
          , id: 29
        }]
      }]
    }];

    let index =0;
    tree.render({
      elem: '#tree1'
      , data: data1
      , id: 'demoId1'
      , click: function (obj) {
        layer.msg(JSON.stringify(obj.data));
        console.log(obj);
      }
      , oncheck: function (obj) {
        //console.log(obj);
      }
      , operate: function (obj) {
        var type = obj.type;
        if (type == 'add') {
          //ajax操作，返回key值
          return index++;
        } else if (type == 'update') {
          console.log(obj.elem.find('.layui-tree-txt').html());
        } else if (type == 'del') {
          console.log(obj);
        };
      }
      // ,showCheckbox: true  //是否显示复选框
      , accordion: false  //是否开启手风琴模式

      , onlyIconControl: true //是否仅允许节点左侧图标控制展开收缩
      , isJump: false  //点击文案跳转地址
      , edit: false  //操作节点图标
    });

    //自定义验证规则
    form.verify({
      title: function (value) {
        if (value.length < 5) {
          return '标题也太短了吧';
        }
      }
      , pass: [/(.+){6,12}$/, '密码必须6到12位']
      , money: [
        /^\d+\.\b\d{2}\b$/
        , '金额必须为小数保留两位'
      ]
    });

    //初始赋值
    var thisValue = form.val('first', {
      'vModel': 'model.name'
      , 'v-if': 'false'
      , 'ref': 'refName'
      , 'disabled': 'false'
      , 'name': ''
      //,'quiz': 2
      , 'interest': 3
      , 'like[write]': true
      //,'open': false
      , 'sex': '男'
      , 'desc': 'form 是我们非常看重的一块'
      , xxxxxxxxx: 123
    });
    console.log(thisValue);


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

  });


}