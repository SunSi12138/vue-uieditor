import _ from 'lodash';
import { UEOption, UETransfer, UETransferEditor, UETransferEditorAttrsItem, UETransferExtend } from './ue-base';
import { UERenderItem } from './ue-render-item';

/** 公共 transfer */
const _globalTransfer = {};
/** 公共 editor */
const _globalEditor = {};
const _globalInitedKey = '__ue_g_inited_210329';

const _initedKey = '__ue_inited_210329';
function _isInited(p) {
  return p && p[_initedKey];
}
function _inited(p) {
  Object.defineProperty(p, _initedKey, {
    enumerable: false,
    configurable: false,
    get() { return true; }
  });
}

function _findRender(renders: UERenderItem[], isFn: any) {
  let findItem;
  _.forEach(renders, function (item) {
    if (isFn(item)) {
      findItem = item;
      return false;
    }
    if (item.children) {
      findItem = _findRender(item.children as any, isFn);
      if (findItem) return false;
    }
  });

  return findItem;
}


function _getTransferEditor(transfer: UETransfer) {
  let editor = {};
  _.forEach(transfer, function (item, type) {
    if (item.editor) {
      editor[type] = item.editor;
      delete item.editor;
    }
  });
  return editor;
}


/**
 * 合并参数
 * @param options 
 */
function _mergeDefaultOption(options: UEOption): UEOption {
  const defaultOptions = _defautlOption();
  const transferBefore = options.transferBefore;
  const transferAfter = options.transferAfter;
  return _.assign({}, options, {
    mixins: (defaultOptions.mixins || []).concat(options.mixins || []),
    transfer: _.assign({}, defaultOptions.transfer, options.transfer),
    transferBefore(render, extend) {
      render = defaultOptions.transferBefore(render, extend);
      render = transferBefore.call(options, render, extend);
      return render;
    },
    transferAfter(render, extend) {
      render = defaultOptions.transferAfter(render, extend);
      render = transferAfter.call(options, render, extend);
      return render;
    }
  });
}


export class UERender {
  /**
   * 将元数据转为vue 元数据
   * @param renders 
   * @param extend 
   */
  static JsonToVueRender(renders: UERenderItem[], extend: UETransferExtend, parentRender?: UERenderItem): UERenderItem[] {

    const transfer: UETransfer = extend.options.transfer;
    const extend2: any = extend;

    let rList = [];
    let options = extend.options;
    _.forEach(renders, function (render) {
      extend2.render = null;

      if (render.type == 'preview-opt') {
        return;
      }

      let isStr = _.isString(render);
      let parent: any = function () { return parentRender; };
      isStr || (render.parent = parent);

      extend2.render = render;
      extend2.editor = render['editor'];
      if (extend.editing) {
        if (extend.editor && extend.editor.show === false) return;
        //编辑时，让非必要绑定失效
        if (isStr && !/\$_item_/.test(render as any)) {
          render = (render as any).replace(/\{\{|\}\}/g, function (find) {
            return find == '{{' ? `{{unescape("${escape('{{')}")}}` : `{{unescape("${escape('}}')}")}}`;
          });
        }
        if (!extend.editor) {
          //编辑时，让没有配置属性绑定失效
          _.forEach(render?.props, function (value, key) {
            const subS = /\$_item_/.test(value) ? -1 : (/^[:@]/.test(key) ? 1 : (/^v-/.test(key) ? 2 : -1));
            if (subS > 0) {
              render.props[key.substr(subS)] = value;
              delete render.props[key];
            }
          });
        }
      }

      if (render.type == 'script') {
        render.type = 'ue-vue-def';
        render.props = { ':content': render.children[0] };
        render.children = [];
      } else if (render.type == 'style') {
        render.type = 'ue-style';
      }

      const resetRender = function () {
        isStr = _.isString(render);
        if (!isStr)
          render.parent = parent;
        else if (!render || render.isRender === false)
          return false;
        extend2.render = render;
      };

      render = options.transferBefore(render, extend);
      if (resetRender() === false) return;

      // let type = render.type;
      let trans = transfer[render.type];
      if (trans) {
        if (trans.props)
          render.props = _.assign({}, trans.props, render.props);
        if (trans.type) render.type = trans.type;
        if (trans.transfer) {
          render = trans.transfer(render, extend);
          if (resetRender() === false) return;
        }
      }

      render = options.transferAfter(render, extend);
      if (resetRender() === false) return;

      rList.push(render);

      if (_.size(render.children) > 0) {
        let children = render.children;
        render.children = [];
        children = UERender.JsonToVueRender(children as any[], extend, render);
        render.children = render.children.concat(children);
      }

    });
    extend2.render = null;
    return rList;
  }

  /**
   * 添加公共 transfer，传入参数会被亏染
   * @param options 
   * @param transfer 
   */
  static AddGlobalTransfer(transfer: UETransfer) {
    transfer = UERender.DefineTransfer(transfer);
    let editor = _getTransferEditor(transfer);
    _.assign(_globalEditor, editor);
    _.assign(_globalTransfer, transfer);
  }

  /** 将公共 transfer，放到option */
  static GlobalTransferToOptions(options: UEOption): UEOption {
    if (options[_globalInitedKey]) return options;
    options[_globalInitedKey] = true;
    (options as any).editor = _.assign({}, _globalEditor, options.editor);
    (options as any).transfer = _.assign({}, _globalTransfer, options.transfer);
    return options;
  }

  /**
   * 添加新的 transfer 到 options，传入参数会被亏染
   * @param options 
   * @param transfer 
   */
  static AddTransfer(options: UEOption, transfer: UETransfer): UEOption {
    transfer = UERender.DefineTransfer(transfer);
    let editor = _getTransferEditor(transfer);
    (options as any).editor = _.assign({}, options.editor, editor);
    (options as any).transfer = _.assign({}, options.transfer, transfer);

    return options;
  }

  /**
   * 定义 options，传入参数会被亏染
   * @param options 
   */
  static DefineOption(options: UEOption): UEOption {
    if (_isInited) return options;
    _inited(options);

    options = _mergeDefaultOption(options);
    return UERender.AddTransfer(options, options.transfer);
  }

  /**
   * 定义 transfer，传入参数会被亏染
   * @param transfer 
   */
  static DefineTransfer(transfer: UETransfer): UETransfer {
    if (_isInited) return transfer;
    _inited(transfer);

    _.forEach(transfer, function (transferItem, type) {
      if (transferItem.editor) {
        transferItem.editor = UERender.DefineTransferEditor(type, transferItem.editor);
      }
    });
    return transfer;
  }

  /**
   * 定义 transfer.editor，传入参数会被亏染
   * @param type 
   * @param editor 
   */
  static DefineTransferEditor(type: string, editor: UETransferEditor): UETransferEditor {
    if (_isInited) return editor;
    _inited(editor);

    let emptyEditor = !editor.empty ? null : _emptyEditor(type, editor.empty);
    editor = _.assign({}, _defaultEditor(type), emptyEditor, editor);
    if (!editor.text) editor.text = type;
    if (!editor.placeholder) editor.placeholder = editor.text;

    let attrs = editor.attrs;
    _.forEach(attrs, function (attr, name) {
      attrs[name] = UERender.DefineTransferEditorAttr(name, attr, editor);
    });

    return editor;
  };

  /**
   * 定义 transfer.editor.attr，传入参数会被亏染
   * @param name 
   * @param attr 
   * @param editor 
   */
  static DefineTransferEditorAttr(name: string, attr: UETransferEditorAttrsItem, editor: UETransferEditor): UETransferEditorAttrsItem {
    if (_isInited) return attr;
    _inited(attr);

    let hideAttrs = editor.hideAttrs;
    let hideAttrGroups = editor.hideAttrGroups;
    attr = _.assign({}, _defaultEditorAttrItem(name), attr);
    if (!attr.text) attr.text = name;
    if (!attr.placeholder) attr.placeholder = attr.text;
    if ((hideAttrs && hideAttrs.indexOf(name) >= 0)
      || hideAttrGroups && hideAttrGroups.indexOf(attr.group) >= 0) {
      attr.show = false;
    }
    return attr;
  };

  /**
   * 新建一个自定义attr
   * @param name 
   * @param attr 
   * @param editor 
   */
  static NewCustAttr(name: string, attr: UETransferEditorAttrsItem, editor: UETransferEditor): UETransferEditorAttrsItem {
    return UERender.DefineTransferEditorAttr(name, _.assign({
      order: 990,
      enabledBind: true,
      cust: true,
      group: _defaultAttrGroup,
      groupOrder: _defaultAttrGroupOrder,
    } as UETransferEditorAttrsItem), editor);
  }

  static findRender(renders: UERenderItem[], p: any): UERenderItem {
    return _findRender(renders, _.iteratee(p));
  }

  static getVueBindName(name: string): string {
    return name ? name.replace(_bindAttr, '') : '';
  };

  static getVueBindNameEx(name: string) {
    let isBind = _bindAttrEx.test(name);
    if (isBind) name = RegExp.$1;
    let isEvent = _eventAttrEx.test(name);
    if (isEvent) name = RegExp.$1;
    return {
      isBind, isEvent,
      name: name
    };
  };

  static makeExportDefault(content: string) {
    return 'export default ' + content;
  }

  static removeExportDefault(content: string) {
    return content && content.replace(/^[\s\r\n]*export default\s*/, '');
  }

}

const _bindAttr = /^\s*[\:\@]/;
const _bindAttrEx = /^\s*\:(.*)/;
const _eventAttrEx = /^\s*\@(.*)/;


function _emptyEditor(component: string, defaultText: string) {
  let editor = {
    transfer({ render, attrs, editing }) {
      if (!editing) {
        render.type = component;
        delete render.children;
      } else {
        render.type = 'div';
        render.props.class = "empty-component";
        render.children = [attrs.text.value || defaultText];
      }
      return render;
    },
    attrs: {
      text: { effect: true, group: '组件', groupOrder: 1, editorOlny: true, order: 1, value: defaultText },
      'class,style': { effect: false }
    }
  } as UETransferEditor;
  return editor;
}


function _defaultEditor(name: string): UETransferEditor {
  return {
    group: "公用组件库/基础组件",
    name,
    icon: "md-school",
    textFormat(editor, attrs) {
      let text = editor.text;
      if (text && text.indexOf('%') >= 0) {
        text = text.replace(/%([^%]+)%/g, function (find, code) {
          code = _.trim(code);
          const attr = code && attrs[code];
          return (attr && attr.value) || '';
        });
      }
      let list = [];
      let temp = attrs['v-model'].value;
      if (temp) list.push(`model: ${temp}`);
      temp = attrs.ref.value;
      if (temp) list.push(`ref: ${temp}`);
      temp = attrs.slot.value;
      if (temp) list.push(`slot: ${temp}`);
      return list.length > 0 ? `${text} [ ${list.join(', ')} ]` : text;
    },
    order: 99,
    draggable: true,
    base: true,
    attrs: {
      '_meta_type': { group: 'Vue', editorOlny: true, show: false, text: 'type', effect: true, groupOrder: -50, order: -50, desc: '更改类型，注意：只保留v-model与ref内容' },
      '_editor_collapse': { group: 'Vue', order: 999, show: false, value: 'false', editorOlny: true, desc: "editor内部使用" },
      'v-show': { group: 'Vue', order: 102 },
      'v-if': { group: 'Vue', order: 103 },
      'v-for': { group: 'Vue', order: 104 },
      'v-model': { group: 'Vue', order: 105 },
      'ref': { group: 'Vue', order: 106 },
      'class': {
        group: 'Vue', effect: true, order: 107, enabledBind: true
      },
      'style': { group: 'Vue', effect: true, order: 108, enabledBind: true, language: 'css' },
      'slot': { group: 'Vue', order: 109 },
      'slot-scope': { group: 'Vue', order: 110 },
    }
  }
};

const _defaultAttrGroup = '组件属性';
const _defaultAttrGroupOrder = 0;

function _defaultEditorAttrItem(name: string): UETransferEditorAttrsItem {
  return {
    name,
    value: '',
    group: _defaultAttrGroup,
    groupOrder: _defaultAttrGroupOrder,
    show: true,
    enabledBind: false,
    order: 99,
    effect: false,
    codeEditor: true,
    type: 'text',
    datas: null
  };
}

function _defautlOption(): UEOption {
  return {
    transfer: {
      'uieditor-editor-div': {
        type: 'div',
        "editor": {
          base: false,
          show: false,
          container: true
        }
      }
    },
    transferBefore(render: UERenderItem, extend?: UETransferExtend): UERenderItem {
      let newRender: UERenderItem;
      newRender = render;

      if (!_.isString(render)) {
        newRender.props || (newRender.props = {});
      }

      return newRender;
    },
    transferAfter(render: UERenderItem, extend?: UETransferExtend): UERenderItem {
      return render;
    }
  };
}