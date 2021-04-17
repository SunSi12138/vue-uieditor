import _ from 'lodash';
import { LayuiHelper } from './layui/layui-helper';
import './layui/layui-import';

const $: JQueryStatic = layui.$;

interface UEDragEvent {
  isTreeNode?: boolean;
  fromEl: HTMLElement;
  toEl?: HTMLElement;
  ev?: MouseEvent;
  $?: JQueryStatic;
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
  canMove?(e: UEDragEvent): boolean | void;
  canSelect?(e: UEDragEvent): boolean | void;
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
      title?: string;
      icon?: string;
      color?: string;
      show?: boolean;
      click?(item: any, e: MouseEvent): void;
      [key: string]: any;
    }[];
  };
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


function _dragStart($el, options: UEDragOptions) {
  const jUieditor = $($el);

  const stopEvent = function (e: any) {
    e.stopPropagation();
    e.preventDefault();
  };

  const hideCls = 'uieditor-drag-hide';
  const jEditorJsonContent = jUieditor.find('.editor-json-content').first();
  const jSelectBox = $('<div class="uieditor-drag-sel-box layui-uieditor ' + hideCls + '" />').appendTo(jEditorJsonContent);
  const jOverBox = $('<div class="uieditor-drag-over-box layui-uieditor ' + hideCls + '" />').appendTo(jEditorJsonContent);
  const jPosline = $('<div class="uieditor-drag-pos-line ' + hideCls + '" />').appendTo(jEditorJsonContent);
  const body = jEditorJsonContent[0];

  //#region select

  var _selectElement: any = null;
  var _selectRect;
  const _data_toolbarsKey = 'ue_drag_toolbars';
  const isSelect = function (element: any) {
    return element == _selectElement;
  };
  const unSelect = function () {
    _selectElement = _selectRect = null;
    jSelectBox.removeData(_data_toolbarsKey);
    jSelectBox.addClass(hideCls);
  };
  const select = function (element, focus?: boolean) {
    if (!focus && (isSelect(element) || !element)) return;
    _selectElement = element;
    unOverBox();

    const control = options?.control(_makeEvent({ fromEl: element })) || {};
    const title = control?.title || {};
    const toolbars = control.toolbars || [];

    const toolbarHtmlList = [];
    let right = -20;
    if (toolbars && toolbars.length > 0) {
      _.forEach(toolbars, function (item, index) {
        if (item.show === false) return;
        toolbarHtmlList.push(`<a href="javascript:void(0);" layui-tip="${item.title}" class="select-toolbar ${item.icon}"
      tIndex="${index}" style="right:${right}px" />`);
        right -= 18;
      });
    }

    if (title.show === false) {
      jSelectBox.html(toolbarHtmlList.join(''));
    } else {
      const collapse = title.collapse;
      const collapseHtml = !collapse ? '' :
        `<i class="container-extand-icon layui-icon ${title.isCollapse ? 'layui-icon-down' : 'layui-icon-right'}"></i>`
      const html = `<div class="title">
      ${collapseHtml}
      ${title.text}
      ${toolbarHtmlList.join('')}
    </div>`;
      jSelectBox.html(html);
      jSelectBox.data('ue-collapse-fn', collapse);
    }
    jSelectBox.data(_data_toolbarsKey, toolbars);

    function fn() {
      if (!_selectElement || _selectElement != element) {
        return false;
      };
      const rect = getOffsetRect(body, element);
      if (!_.isEqual(_selectRect, rect)) {
        _selectRect = rect;
        jSelectBox.css({
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        });
      }
    };

    _selectRect = null;
    LayuiHelper.requestAnimationFrame(fn, 200);

    jSelectBox.removeClass(hideCls);
  };

  // select menu click
  jSelectBox.on('mousedown', function (e) {
    stopEvent(e);
    return false;
  });
  jSelectBox.on('mousedown', 'a', function (e) {
    var jo = $(e.target);
    var index = ~~jo.attr('tIndex');
    if (index >= 0) {
      const toolbars = jSelectBox.data(_data_toolbarsKey);
      const item = toolbars[index];
      item?.click(item, e);
    }
  });
  jSelectBox.on('mousedown', '.container-extand-icon', function (e) {
    const collapse = jSelectBox.data('ue-collapse-fn');
    if (collapse) collapse(e);
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
  jEditorJsonContent.on('mousedown', function (e) {
    unSelect();
    // if (options.select &&
    //   options.select(_makeEvent({ fromEl: e.currentTarget, ev: e as any })) === false) {
    //   return;
    // }

  });


  function closestSelect(el: HTMLElement, e) {
    el = findDragElement(el);
    if (el) {
      const isRoot = el.classList.contains('uieditor-drag-root');
      if (isRoot) return;

      if (options.canSelect && options.canSelect(_makeEvent({ fromEl: el, ev: e })) === false) {
        const parentElement = el.parentElement;
        //向上查找可以选择父节点
        return closestSelect(parentElement, e);
      }
    }
    return el;
  }

  //select
  jEditorJsonContent.on('mousedown', '.uieditor-drag-item,.uieditor-drag-content', function (e) {
    const element = closestSelect(e.currentTarget, e);
    if (element) {

      if (options.select &&
        options.select(_makeEvent({ fromEl: element, ev: e as any })) === false) {
        return;
      }

      stopEvent(e);
      select(element);
      element.focus();
      jUieditor.trigger('mousedown');
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
    const isRoot = element.classList.contains('uieditor-drag-root');

    const control = isRoot ? null : options?.control(_makeEvent({ fromEl: element })) || {};
    const title = control?.title || {};
    if (isRoot || title.show === false) {
      jOverBox.html('');
    } else {
      const collapse = title.collapse;

      const collapseHtml = !collapse ? '' :
        `<i class="container-extand-icon layui-icon ${title.isCollapse ? 'layui-icon-down' : 'layui-icon-right'}"></i>`
      // const html = `<div class="title"${title.isCollapse ? ' style="top:-1px !important;"' : ''}>
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
    p.$ = $;
    return p;
  }

  const jWIn = $(window);

  jUieditor.on('selectstart', '.editor-json-content,.layui-tree', function (e) {
    stopEvent(e);
    return false;
  });

  function closestDrag(el: HTMLElement, e, isTreeNode) {
    el = findDragElement(el);
    if (el && options.canMove && options.canMove(_makeEvent({ fromEl: el, ev: e, isTreeNode })) === false) {
      const parentElement = el.parentElement;
      //向上查找可以拖动父节点
      return closestDrag(parentElement, e, isTreeNode);
    }
    return el;
  }


  function dragEventFn(e) {

    const target = e.currentTarget;
    const isTreeNode = target.classList.contains('layui-tree-entry');
    let el = isTreeNode ? target : closestDrag(target, e, isTreeNode);
    if (!el) return;

    const isRoot = el.classList.contains('uieditor-drag-root');
    if (isRoot) return;

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
            if (options.dragstart(_makeEvent({ fromEl: el, ev: e, isTreeNode })) === false) {
              draging = false;
              return;
            };
          }
          el.classList.add(isTreeNode ? 'uieditor-drag-tree-active' : hideCls);
          if (!isTreeNode)
            el.style.setProperty('display', 'none', 'important');
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

          const isRoot = dragOverEl?.classList.contains('uieditor-drag-root');
          const rectNew = getPosLine(body, dragOverEl, e);
          if (isRoot && rectNew.type2 != 'in') return;

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
                toEl: dragOverEl, ev: e,
                isTreeNode
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
        const dropOk = options.drop && _dragPosLineEl ? options.drop(_makeEvent({
          fromEl: dragEl, toEl: _dragPosLineEl,
          pos: _dragPosLine,
          ev: e,
          isTreeNode
        })) : false;

        // if (!dropOk) {
        //   unSelect();
        // }
        unPosLine();
        el.classList.remove(isTreeNode ? 'uieditor-drag-tree-active' : hideCls);
        if (!isTreeNode)
          el.style.removeProperty('display');

        // select(el);
      }
    };
    jWIn.on('mousemove', mousemove);
    jWIn.on('mouseup', mouseup);

  };

  jUieditor.on('mousedown', '.uieditor-cp-tree [data-uedrag]', dragEventFn);
  jEditorJsonContent.on('mousedown', '.uieditor-drag-item,.uieditor-drag-content', dragEventFn);

  //#endregion drag

  return {
    select(id: string, focus?: boolean) {
      id && select(jEditorJsonContent.find(`#${id}`)[0], focus);
    },
    unSelect() {
      unSelect();
    },
    // unPosLine() {
    //   unPosLine();
    // },
    // unOverBox() {
    //   unOverBox();
    // },
    destroy() {
      unSelect();
      unPosLine();
      unOverBox();
    }
  }

} // end _dragStart();


export class UEDrag {
  static dragStart($el, options: UEDragOptions) {
    return _dragStart($el, options);
  }
}