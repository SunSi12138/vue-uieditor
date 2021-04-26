import _ from 'lodash';
import { UEIsCollapseProps, UEIsLockProps, UEOption, UETemplate, UETransfer, UETransferEditor, UETransferEditorAttrs, UETransferEditorAttrsItem, UETransferExtend } from './ue-base';
import { UEHelper } from './ue-helper';
import { UERenderItem } from './ue-render-item';


/**
 * 公共模板
 */
let _globalTemplates = [];


/** 公共 transfer */
const _globalTransfer = {};
/** 公共 editor */
const _globalEditor = {};
const _globalInitedKey = '__ue_g_inited_210329';

const _initedKey = '__ue_inited_210329';
function _isInited(p) {
  return p && p['inited'];
}
function _inited(p) {
  p.inited = true;
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
    async extraLib() {
      let optExtraLib;
      if (options?.extraLib)
        optExtraLib = await options.extraLib();
      let { ExtraLib } = await import('./extraLib');
      return `${ExtraLib};${optExtraLib || ''}`;
    },
    transferBefore(render, extend) {
      render = defaultOptions.transferBefore(render, extend);
      if (transferBefore)
        render = transferBefore.call(options, render, extend);
      return render;
    },
    transferAfter(render, extend) {
      render = defaultOptions.transferAfter(render, extend);
      if (transferAfter)
        render = transferAfter.call(options, render, extend);
      return render;
    }
  } as UEOption);
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
        render.type = 'uieditor-vue-def';
        render.props = { ':content': render.children[0] };
        render.children = [];
      } else if (render.type == 'style') {
        render.type = 'uieditor-style';
      }

      const resetRender = function () {
        if (!render) return false;
        isStr = _.isString(render);
        if (!isStr)
          render.parent = parent;
        else if (render.isRender === false)
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
   * 添加公共模板，传入参数会被亏染
   * @param options 
   * @param transfer 
   */
  static AddGlobalTemplates(templates: UETemplate[]) {
    _globalTemplates = _globalTemplates.concat(templates);
  }

  /**
   * 添加公共 transfer，传入参数会被亏染
   * @param options 
   * @param transfer 
   */
  static AddGlobalTransfer(...transfers: UETransfer[]) {
    _.forEach(transfers, function (transfer) {
      transfer = UERender.DefineTransfer(transfer);
      let editor = _getTransferEditor(transfer);
      _.assign(_globalEditor, editor);
      _.assign(_globalTransfer, transfer);
    });
  }

  /** 将公共内容放到option */
  static GlobalToOptions(options: UEOption): UEOption {
    if (options[_globalInitedKey]) return options;
    options[_globalInitedKey] = true;
    if (_.size(_globalTemplates) > 0)
      options.templates = _globalTemplates.concat(options.templates || []);
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
    if (_isInited(options)) return options;
    _inited(options);

    console.warn('options', options);
    options = _mergeDefaultOption(options);
    return UERender.AddTransfer(options, options.transfer);
  }

  /**
   * 定义 transfer，传入参数会被亏染
   * @param transfer 
   */
  static DefineTransfer(transfer: UETransfer): UETransfer {
    if (_isInited(transfer)) return transfer;
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
    if (_isInited(editor)) return editor;
    _inited(editor);
    if (editor.container) {
      _.has(editor, 'base') || (editor.base = false);
      _.has(editor, 'containerBorder') || (editor.containerBorder = true);
      _.has(editor, 'controlLeft') || (editor.controlLeft = true);
    }

    let emptyEditor = !editor.empty ? null : _emptyEditor(type, editor.empty);
    editor = UEHelper.assignDepth({}, _defaultEditor(type), editor, emptyEditor);
    if (!editor.text) editor.text = type;
    if (editor.placeholderAttr) editor.attrs = UEHelper.assignDepth({}, _defaultplaceholderAttr, editor.attrs);
    if (editor.disabledAttr) editor.attrs = UEHelper.assignDepth({}, _defaultDisabledAttr, editor.attrs);
    const attrs = editor.attrs;
    const newAttrs = {};
    //支持 'text:aaa,id':{}
    _.forEach(attrs, function (attr, key) {
      if (key.indexOf(',') >= 0) {
        let order = attr.order || 1;
        _.forEach(key.split(','), function (newKey) {
          let [key1, value1] = newKey.split(':');
          let newAttr = _.assign({}, _.cloneDeep(attr), { order: order++ });
          if (value1) newAttr.value = _.trim(value1);
          newAttrs[_.trim(key1)] = newAttr;
        });
      } else {
        newAttrs[key] = attr;
      }
    });

    _.forEach(newAttrs, function (attr, name) {
      newAttrs[name] = UERender.DefineTransferEditorAttr(name, attr, editor);
    });
    editor.attrs = newAttrs;
    if (!editor.placeholder) editor.placeholder = _.isFunction(editor.text) ? editor.text({ editor, attrs: newAttrs }) : editor.text;

    return editor;
  };

  /**
   * 定义 transfer.editor.attr，传入参数会被亏染
   * @param name 
   * @param attr 
   * @param editor 
   */
  static DefineTransferEditorAttr(name: string, attr: UETransferEditorAttrsItem, editor: UETransferEditor): UETransferEditorAttrsItem {
    if (_isInited(attr)) return attr;
    _inited(attr);

    if (attr.editorBind && !_.has(attr, 'effect')) attr.effect = true;

    let hideAttrs = editor.hideAttrs;
    let hideAttrGroups = editor.hideAttrGroups;
    attr = _.assign({}, _defaultEditorAttrItem(name), attr);
    name = attr.name;
    if (!attr.text) attr.text = name;
    if (_.isString(attr.editValue)) attr.editValue = UERender.newEditValue(attr.editValue);

    switch (attr.type) {
      case 'select-only':
      case 'slider':
        attr.enabledBind = false;
        attr.codeBtn = false;
        break;
      case 'boolean':
        attr.type = 'select';
        attr.enabledBind = false;
        attr.bind = true;
        attr.datas = ['true', 'false'];
        attr.editorBind = true;
        break;
      case 'boolean-only':
        attr.enabledBind = false;
        attr.bind = false;
        attr.codeBtn = false;
        attr.value = attr.value === true || attr.value === 'true';
        break;
      case 'number':
        attr.enabledBind = false;
        attr.bind = true;
        attr.editorBind = true;
        break;
    }
    // if (!attr.placeholder) attr.placeholder = attr.text;
    if (attr.event) {
      attr.group = '组件事件';
      attr.effect = false;
      attr.enabledBind = false;
      attr.row = attr.row !== false;
    }
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
      row: true,
      group: _defaultAttrGroup,
      groupOrder: _defaultAttrGroupOrder,
    } as UETransferEditorAttrsItem, attr), editor);
  }

  static newEditValue(fnName: string): { get(): any; set(val: any): void; } {
    const regex = new RegExp(`^[\\s\\r\\n]*${fnName}\\s*\\(\\s*`, 'i');
    return {
      get() { return `${fnName}(${this.value || '{}'})`; },
      set(value) { this.value = value.replace(regex, '').replace(/\)[\s\r\n]*$/i, ''); }
    }
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
    transferAttr({ render, attrs, editing }) {
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
      text: { effect: true, group: '组件属性', row: true, groupOrder: 1, editorOlny: true, enabledBind: false, codeBtn: false, order: -1, value: defaultText },
      class: { effect: false },
      style: { effect: false }
    }
  } as UETransferEditor;
  return editor;
}

function _defaultEditor(name: string): UETransferEditor {
  return {
    group: "公用组件库/基础组件",
    name,
    icon: "layui-icon layui-icon-file",
    textFormat(editor, attrs) {
      let text = editor.text;
      if (_.isFunction(text)) text = text({ editor, attrs });
      if (text && text.indexOf('%') >= 0) {
        text = text.replace(/%([^%]+)%/g, function (find, code) {
          code = _.trim(code);
          const attr = code && attrs[code];
          return (attr && attr.value) || '';
        });
      }
      if (!text) text = editor.defaultText || '';
      let list = [];
      let temp = attrs['v-model'].value;
      if (temp) list.push(`model: ${temp}`);
      temp = attrs.ref.value;
      if (temp) list.push(`ref: ${temp}`);
      temp = attrs.slot?.value;
      if (temp) list.push(`slot: ${temp}`);
      return list.length > 0 ? `${text} [ ${list.join(', ')} ]` : text;
    },
    order: 99,
    draggable: true,
    select: true,
    base: true,
    placeholderAttr: false,
    disabledAttr: false,
    attrs: {
      '_meta_type': { group: 'Vue', editorOlny: true, show: false, text: 'type', effect: true, groupOrder: -50, order: -50, desc: '更改类型，注意：只保留v-model与ref内容' },
      'v-for': { group: 'Vue', vue: true, row: true, enabledBind: false, order: 101, groupOrder: -50 },
      'v-show': { group: 'Vue', vue: true, row: true, enabledBind: false, order: 102 },
      'v-if': { group: 'Vue', vue: true, row: true, enabledBind: false, order: 103 },
      'v-else': { group: 'Vue', vue: true, type: 'boolean-only', value: false, order: 104 },
      'v-else-if': { group: 'Vue', vue: true, enabledBind: false, order: 105 },
      'v-model': { group: 'Vue', vue: true, enabledBind: false, order: 106 },
      'v-once': { group: 'Vue', vue: true, type: 'boolean-only', order: 107 },
      'ref': { group: 'Vue', vue: true, effect: true, codeBtn: false, enabledBind: false, order: 108 },
      'key': { group: 'Vue', vue: true, order: 109 },
      'slot': { group: 'Vue', vue: true, order: 110, enabledBind: false },
      'slot-scope': { group: 'Vue', effect: true, vue: true, order: 111, enabledBind: false, bind: false },
      'class': {
        group: 'Vue', vue: true, effect: true, order: 112, enabledBind: true
      },
      'style': { group: 'Vue', vue: true, effect: true, order: 113, enabledBind: true, language: 'css' },
      [`${UEIsLockProps},${UEIsCollapseProps}`]: { show: false, effect: true, value: false, type: 'boolean-only' },
    }
  }
};

const _defaultAttrGroup = '组件属性';
const _defaultAttrGroupOrder = 99;

function _defaultEditorAttrItem(name: string): UETransferEditorAttrsItem {
  return {
    name,
    key: name,
    value: '',
    group: _defaultAttrGroup,
    groupOrder: _defaultAttrGroupOrder,
    show: true,
    enabledBind: true,
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
    },
    transferBefore(render: UERenderItem, extend?: UETransferExtend): UERenderItem {
      let newRender: UERenderItem;
      newRender = render;

      if (!_.isString(render)) {
        newRender.props || (newRender.props = {});
        const { editing, getPropText } = extend;
        if (editing) {
          const scope = _.trim(getPropText('slot-scope', '', true));
          if (scope) {
            _.assign(extend.data, {
              [scope]: {}
            });
          }
        }
      }

      return newRender;
    },
    transferAfter(render: UERenderItem, extend?: UETransferExtend): UERenderItem {
      return render;
    }
  };
}

const _defaultplaceholderAttr: UETransferEditorAttrs = {
  'placeholder': { order: -1 }
};

const _defaultDisabledAttr: UETransferEditorAttrs = {
  'disabled': { order: -2, bind: true, type: 'boolean' }
};
