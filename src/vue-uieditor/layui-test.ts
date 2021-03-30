import _ from 'lodash';
import './layui-import';

const form = layui.form
  , layer = layui.layer
  , tree = layui.tree
  , layedit = layui.layedit
  , colorpicker = layui.colorpicker
  , slider = layui.slider
  , selectInput = layui.selectInput;

declare const layui: any;
let $: JQueryStatic;

interface UEDragEvent {
  fromEl: HTMLElement;
  toEl?: HTMLElement;
  ev?: MouseEvent;
  pos?: {
    top: number;
    left: number;
    width: number;
    height: number;
    type: 'top' | 'bottom' | 'left' | 'right' | 'in';
    type2: 'before' | 'after' | 'in';
  };
}

interface UEDragOptions {
  select?(e: UEDragEvent): boolean | void;
  dragstart?(e: UEDragEvent): boolean | void;
  dragover?(e: UEDragEvent): boolean | void;
  drop?(e: UEDragEvent): boolean | void;
  control?(e: UEDragEvent): {
    title?: {
      show?: boolean;
      text?: string;
      isCollapse?: boolean;
      collapse?(e: MouseEvent): void;
    };
    toolbars?: {
      text?: string;
      icon?: string;
      color?: string;
      show?: boolean;
      click?(item: any, e: MouseEvent): void;
      [key: string]: any;
    }[];
  };
}

export function Layuidestroy($el) {
  layui.$($el).remove();
  // layui.$($el).html('');
  // const $ = layui.$;
  // layui.$('*', $el).add([$el]).each(function () {
  //   layui.$.event.remove(this);
  //   // console.log('aaaaa')
  //   layui.$.removeData(this);
  //   if (this._vue_uieditor_linkdom) {
  //     $.each(this._vue_uieditor_linkdom, function (idx, item) {
  //       item && item();
  //     });
  //     this._vue_uieditor_linkdom = null;
  //   }
  // });
}

let isJqueryInit = false;
function jqueryInit() {
  if (isJqueryInit) return;
  isJqueryInit = true;

  $ = layui.$;

  const _cleanData = $.cleanData;
  $.cleanData = function (elems) {
    for (var i = 0, elem; (elem = elems[i]) != null; i++) {
      try {
        $(elem).triggerHandler('vue_uieditor_linkdom');
      } catch (e) { }
    }
    _cleanData.apply($, arguments);
  };
};

//dom销毁时处理内容
function linkDom(dom, callback) {
  if (!dom) return;
  const jo: any = dom instanceof $ ? dom : $(dom);
  jo.one('vue_uieditor_linkdom', callback);
}


/**
 * 获取element的rect
 * @param target 
 */
function getOffsetRect(body, target: any) {

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

/**
 * 根据事件，获取当前鼠标位置
 * @param e 
 */
function getMousePos(body, el, e) {
  const bodyRect = body.getBoundingClientRect();
  const doc = el.ownerDocument;
  const docElem = doc.documentElement;
  const win = doc.defaultView;
  const offsetTop = win.pageYOffset - docElem.clientTop;
  const offsetLeft = win.pageXOffset - docElem.clientLeft;

  const bodyTop = bodyRect.top + offsetTop - body.scrollTop;
  const bodyLeft = bodyRect.left + offsetLeft - body.scrollLeft;

  return { x: e.pageX - bodyLeft, y: e.pageY - bodyTop };
}


/** 位置线（上下左右）决定边距 */
const _posLineAbs = 20;
/** 位置线厚度 */
const _posLineThick = 0;
/** 位置线 显示距离 */
const _posLineDistance = 2;
/** 计算 位置线 */
function getPosLine(body, el: HTMLElement, ev: MouseEvent) {
  const mousePos = getMousePos(body, el, ev);
  const rect = getOffsetRect(body, el);
  const yAbs = Math.min(_posLineAbs, rect.height / 3);
  const xAbs = Math.min(_posLineAbs, rect.width / 3);
  let top = 0, left = 0, width = 0, height = 0, type, type2;
  const tmPos = _posLineThick + _posLineDistance;
  // if (el.classList.contains('uieditor-drag-content')) {
  //   //内容
  //   type = 'in';
  //   type2 = 'in';
  //   width = rect.width - _posLineThick * 2;
  //   top = rect.top + Math.min(20, rect.height / 2);
  //   left = rect.left + _posLineThick;
  //   height = _posLineThick;
  // } else
  if (mousePos.y < rect.top + yAbs) {
    //上
    type = 'top';
    type2 = 'before';
    width = rect.width;
    top = rect.top - tmPos;
    left = rect.left;
    height = _posLineThick;
  } else if (mousePos.y > rect.bottom - yAbs) {
    //下
    type = 'bottom';
    type2 = 'after';
    width = rect.width;
    top = rect.bottom + tmPos;
    left = rect.left;
    height = _posLineThick;
  } else if (mousePos.x < rect.left + xAbs) {
    //左
    type = 'left';
    type2 = 'before';
    width = _posLineThick;
    top = rect.top;
    left = rect.left - tmPos;
    height = rect.height;
  } else if (mousePos.x > rect.right - xAbs) {
    //左
    type = 'right';
    type2 = 'after';
    width = _posLineThick;
    top = rect.top;
    left = rect.right + tmPos;
    height = rect.height;
  } else if (el.classList.contains('uieditor-drag-content')) {
    //内容
    type = 'in';
    type2 = 'in';
    // width = rect.width - _posLineThick * 2;
    // top = rect.top + Math.min(20, rect.height / 2);
    // left = rect.left + _posLineThick;
    // height = _posLineThick;
    width = rect.width;
    top = rect.top;
    left = rect.left;
    height = rect.height;
  } else {
    return null;
  }
  return { top, left, width, height, type, type2 };
}

export function DragStart($el, options: UEDragOptions) {
  const jUieditor = $($el);

  const stopEvent = function (e: any) {
    e.stopPropagation();
    e.preventDefault();
  };

  const hideCls = 'uieditor-drag-hide';
  const jEditorJsonContent = jUieditor.find('.editor-json-content').first();
  const jSelectBox = $('<div class="uieditor-drag-sel-box ' + hideCls + '" />').appendTo(jEditorJsonContent);
  const jOverBox = $('<div class="uieditor-drag-over-box ' + hideCls + '" />').appendTo(jEditorJsonContent);
  const jPosline = $('<div class="uieditor-drag-pos-line ' + hideCls + '" />').appendTo(jEditorJsonContent);
  const body = jEditorJsonContent[0];

  linkDom(jEditorJsonContent, function () {
    console.log('clear jEditorJsonContent');
  });

  //#region select

  var _selectElement: any = null;
  var _selectTimeId;
  const _data_toolbarsKey = 'ue_drag_toolbars';
  const isSelect = function (element: any) {
    return element == _selectElement;
  };
  const unSelect = function () {
    if (_selectTimeId) clearInterval(_selectTimeId);
    _selectElement = _selectTimeId = null;
    jSelectBox.removeData(_data_toolbarsKey);
    jSelectBox.addClass(hideCls);
  };
  const select = function (element) {
    if (isSelect(element)) return;
    _selectElement = element;
    unOverBox();

    const control = options?.control(_makeEvent({ fromEl: element })) || {};
    const title = control?.title || {};
    const toolbars = control.toolbars || [];
    const collapse = title.collapse;

    const toolbarHtmlList = [];
    let right = 0;
    if (toolbars && toolbars.length > 0) {
      _.forEach(toolbars, function (item, index) {
        if (item.show === false) return;
        toolbarHtmlList.push(`<a href="javascript:void(0);" title="${item.text}" class="select-toolbar ${item.icon}"
      tIndex="${index}" style="right:${right}px" />`);
        right += 20;
      });
    }

    if (title.show === false) {
      jSelectBox.html(toolbarHtmlList.join(''));
    } else {
      const collapseHtml = !collapse ? '' :
        `<i class="container-extand-icon layui-icon ${title.isCollapse ? 'layui-icon-down' : 'layui-icon-right'}"></i>`
      const html = `<div class="title">
      ${collapseHtml}
      ${title.text}
    </div>${toolbarHtmlList.join('')}`;
      jSelectBox.html(html);
    }
    jSelectBox.data(_data_toolbarsKey, toolbars);

    function fn() {
      const rect = getOffsetRect(body, element);
      jSelectBox.css({
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    };
    // if (_selectTimeId) clearInterval(_selectTimeId);
    fn();
    jSelectBox.removeClass(hideCls);
    // _selectTimeId = setInterval(fn, 200);
  };

  // select menu click
  jSelectBox.on('click', '>a', function (e) {
    stopEvent(e);
    var jo = $(e.target);
    var index = ~~jo.attr('tIndex');
    if (index >= 0) {
      const toolbars = jSelectBox.data(_data_toolbarsKey);
      const item = toolbars[index];
      item?.click(item, e);
    }
    return false;
  });

  const isDragElement = function (element) {
    return element &&
      (element.classList.contains('uieditor-drag-item') || element.classList.contains('uieditor-drag-content'))
  };
  const findDragElement = function (element): HTMLElement {
    if (isDragElement(element)) {
      return element
    }
    return isDragElement(element) ? element : $(element).closest('.uieditor-drag-item,.uieditor-drag-content')[0];
  };

  //select
  jEditorJsonContent.on('mousedown', '.uieditor-drag-item,.uieditor-drag-content', function (e) {
    const element = findDragElement(e.currentTarget);
    if (element) {
      const isRoot = element.classList.contains('uieditor-drag-root');
      if (isRoot) return;

      stopEvent(e);
      select(element);
      element.focus();
      return false;
    }
  });

  //#endregion select

  //#region overBox

  let _overBoxElement;
  const isOverBox = function (element: any) {
    return element == _overBoxElement;
  };
  const unOverBox = function () {
    _overBoxElement = null;
    jOverBox.addClass(hideCls);
  };
  const overBox = function (element) {
    if (isOverBox(element)) return;
    if (isSelect(element)) {
      unOverBox();
      return;
    }
    _overBoxElement = element;

    // const jTarget = $(target);
    const control = options?.control(_makeEvent({ fromEl: element })) || {};
    const title = control?.title || {};
    if (title.show === false) {
      jOverBox.html('');
    } else {
      const collapse = title.collapse;

      const collapseHtml = !collapse ? '' :
        `<i class="container-extand-icon layui-icon ${title.isCollapse ? 'layui-icon-down' : 'layui-icon-right'}"></i>`
      const html = `<div class="title">
      ${collapseHtml}
      ${title.text}
    </div>`;
      jOverBox.html(html);
    }

    const rect = getOffsetRect(body, element);
    jOverBox.css({
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    jOverBox.removeClass(hideCls);
  };

  //overBox
  jEditorJsonContent.on('mouseover', '.uieditor-drag-item,.uieditor-drag-content', function (e) {
    const element = findDragElement(e.currentTarget);
    if (element) {
      stopEvent(e);
      overBox(element);
      return false;
    }
  });
  jEditorJsonContent.on('mouseleave', function (e) {
    unOverBox();
  });

  //#endregion overBox

  //#region posLine


  let _dragPosLine, _dragPosLineEl;
  const posLine = function (el, ev, rect) {
    if (!el) return;
    rect || (rect = getPosLine(body, el, ev));
    if (!rect) return;
    // BgLogger.debug('posLine', el, rect);
    // _option.setContext(el, '_dragPosLine_pre', _option.getContext(el, '_dragPosLine'));
    _dragPosLine = rect;
    _dragPosLineEl = el;
    const box = jPosline[0];
    const classList = box.classList;
    if (!classList.contains('uieditor-drag-pos-line')) {
      classList.add('uieditor-drag-pos-line')
    }

    // const top = rect.top;
    // const padding = 34;
    // if (top > 0 && top < body.scrollTop) {
    //   body.scrollTop = top - padding;
    // } else {
    //   const clientHeight = body.clientHeight;
    //   let maxY = body.scrollTop + clientHeight;
    //   if (top > maxY) {
    //     body.scrollTop = rect.top + padding + 10 - clientHeight;
    //   }
    // }
    const jBox = $(box);
    jBox.css({
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    if ((rect.type == 'in'))
      jBox.addClass('pos-line-box');
    else
      jBox.removeClass('pos-line-box');
    classList.remove(hideCls);
    return box;
  }
  const unPosLine = function () {
    // BgLogger.debug('unPosLine', el);
    _dragPosLine = _dragPosLineEl = null;
    draging = false;
    const box = jPosline[0];
    box.classList.add(hideCls);
  };

  //#endregion posLine



  //#region posLine

  let draging = false;
  let dragPos = null;
  let dragEl = null;
  function _checkDragStart(el, ev) {
    if (!dragEl || dragEl != el || !dragPos) return false;
    if (draging) return true;
    const pos = getMousePos(body, el, ev);
    const start = _checkDragPos(pos, dragPos);
    if (start) {
      draging = true;
      dragPos = null;
    }
    return start;
  }
  //移位xx位置后开始拖动
  const _dragAbs = 5;
  function _checkDragPos(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) >= _dragAbs
      || Math.abs(pos1.y - pos2.y) >= _dragAbs;
  }


  function _makeEvent(p: UEDragEvent) {
    p.pos || (p.pos = _dragPosLine);
    return p;
  }

  const jWIn = $(window);

  jUieditor.on('selectstart', '.editor-json-content,.layui-tree', function (e) {
    stopEvent(e);
    return false;
  });


  function dragEventFn(e) {
    const target = e.currentTarget;
    const isTreeNode = target.classList.contains('layui-tree-main');
    const el = isTreeNode ? target : findDragElement(target);
    if (!el) return;

    const isRoot = el.classList.contains('uieditor-drag-root');
    if (isRoot) return;

    if (options.select &&
      options.select(_makeEvent({ fromEl: el, ev: e as any })) === false) {
      return;
    }

    dragPos = getMousePos(body, el, e);
    dragEl = el;

    let _dragPosLine_pre = null;
    let _dragOverEl_pre = null;

    const mousemove = function (e) {
      // console.warn('mousemove', el);

      stopEvent(e);
      if (_checkDragStart(el, e)) {
        try {
          if (options.dragstart) {
            if (options.dragstart(_makeEvent({ fromEl: el, ev: e })) === false) {
              draging = false;
              return;
            };
          }
          if (!isTreeNode) el.classList.add(hideCls);
          unSelect();
        } finally {
          return false;
        }
      }
      if (draging) {
        const mPos = getMousePos(body, el, e);

        if (mPos.y < body.scrollTop) {
          body.scrollTop -= 5;
        } else {
          const bodyRect = getOffsetRect(body, body);
          if (mPos.y > bodyRect.height) {
            body.scrollTop += 5;
          }
        }


        const dragOverEl = _overBoxElement;
        if (dragOverEl) {
          const dragOverEl_pre = _dragOverEl_pre;
          let change = dragOverEl_pre != dragOverEl;

          const rectNew = getPosLine(body, dragOverEl, e);
          if (!change) {
            const rectPre = _dragPosLine_pre;
            change = !rectNew || !rectPre || rectPre.type2 != rectNew.type2;
          }

          if (change) {
            _dragOverEl_pre = dragOverEl;
            _dragPosLine_pre = rectNew;
            // posLine(dragOverEl, e, rectNew);
            if (options.dragover) {
              if (options.dragover(_makeEvent({
                fromEl: el,
                pos: rectNew,
                toEl: dragOverEl, ev: e
              })) !== false) {
                posLine(dragOverEl, e, rectNew);
              }
            } else
              posLine(dragOverEl, e, rectNew);
          }
        } else {
          // unPosLine();
        }
      }

      return false;
    };

    const mouseup = function (e) {
      jWIn.off('mousemove', mousemove);
      jWIn.off('mouseup', mouseup);

      if (draging) {
        const dropOk = options.drop ? options.drop(_makeEvent({
          fromEl: dragEl, toEl: _dragPosLineEl,
          pos: _dragPosLine,
          ev: e
        })) : false;

        unPosLine();
        el.classList.remove(hideCls);
        select(el);
      }
    };
    jWIn.on('mousemove', mousemove);
    jWIn.on('mouseup', mouseup);

  };

  jUieditor.on('mousedown', '.uieditor-cp-tree .layui-tree-main', dragEventFn);
  jEditorJsonContent.on('mousedown', '.uieditor-drag-item,.uieditor-drag-content', dragEventFn);

  //#endregion drag


}

export function LayuiTree(p: { el: any, data: any }) {

  let index = 0;
  tree.render({
    elem: p.el
    , data: p.data || []
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

}


export function LayuiInit($el) {

  jqueryInit();

  layui.use(['tree', 'form', 'layedit', 'element', 'colorpicker', 'slider', 'selectInput'], function () {


    $('div[colorpicker]').each(function (idx, el) {
      var jParent = $(el);
      var jColor = jParent.children('div');
      console.warn("jParent", el, jParent.children(), jColor)
      //表单赋值
      colorpicker.render({
        elem: jColor[0]
        , color: '#1c97f5'
        , done: function (color) {
          console.warn("jParent.find('input')'", jParent, jParent.find('input'))
          jParent.find('input').first().val(color);
        }
      });
    });

    //表单赋值
    slider.render({
      elem: '[slider]'
      , range: false
      , step: 1
      , min: 1
      , max: 24
      , change: function (value) {
        console.warn('slider', value)
      }
    });

    DragStart($el, {
      dragstart(e) {
        console.warn('dragstart', e);
        return true;
      },
      dragover(e) {
        console.warn('dragover', e);
        return true;
      },
      drop(e) {
        console.warn('drop', e);
        return true;
      },
      control: (ev) => {

        // const fromEl = ev.fromEl;
        // const renderId = _getIdByContent(fromEl);
        // let render = this.getRenderItem(renderId);
        // let editor = _getRenderEditor(render);
        // if (!editor) return;
        // const operation = editor.operation;
        // const pRender = this.getParentRenderItem(render);
        // const parentId = _getRenderId(pRender);
        // // let pContainerBox = false;
        // const pEditor = _getRenderEditor(pRender);
        // if (!pEditor) return;
        // const pOperation = pEditor.operation;
        // if (editor.containerBox) editor = pEditor;
        // let containerBox = editor.containerBox;
        // // if (containerBox) pContainerBox = true;
        // const title = containerBox ? '' : editor.textFormat(editor, _getRenderAttrs(render));
        // let collapse = false;
        // let collapseFn;
        // let attrs = _getRenderAttrs(render);
        // if (!editor.base || editor.collapse) {
        //   collapse = _getCollapse(attrs) == 'true';
        //   collapseFn = (e) => {
        //     this.collapse(renderId)
        //     // BgLogger.debug('collapse', e);
        //   };
        // }

        // BgLogger.debug('fromEl', fromEl)
        const control = {
          title: {
            // text: title,
            // show: !containerBox,
            // isCollapse: collapse,
            // collapse: collapseFn
            text: 'aaa',
            show: true,
            isCollapse: true,
            collapse(e) {
              // this.collapse(renderId)
              // BgLogger.debug('collapse', e);
            }
          },
          toolbars: [{
            text: '删除',
            icon: 'layui-icon layui-icon-close',
            show: true,
            click: (item, e) => {
              console.warn('删除', item, e);
              // this.deleteWidget(parentId, renderId);
            }
          }, {
            text: '复制',
            icon: 'layui-icon layui-icon-file-b',
            show: true,
            click: (item, e) => {
              console.warn('复制', item, e);
              // this.copyCurToNext(parentId, renderId, true);
            }
          }]
        };
        return control;
      }
    });

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

    jUieditor.on('click', '.layui-bg-blue,.layui-bg-blue-active', function (e) {
      var jo = $(e.target);
      if (jo.hasClass('layui-bg-blue-active')) {
        jo.addClass('layui-bg-blue');
        jo.removeClass('layui-bg-blue-active');
      } else {
        jo.addClass('layui-bg-blue-active');
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