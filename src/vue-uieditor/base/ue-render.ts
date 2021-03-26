import { UERenderItem } from './ue-render-item';
import { UETransferExtend, UETransfer, UEOption, UETransferEditor, UETransferEditorAttrsItem } from './ue-base';
import _ from 'lodash';
import { UEMergeMixin } from './vue-extends';


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
  const newOptions = _defautlOption();
  options = _.cloneDeep(options);
  let keys = _.keys(options);
  _.forEach(keys, function (key) {
    switch (key) {
      case 'mixins':
        newOptions.mixins = (newOptions.mixins || []).concat(options.mixins || [])
        break;
      case 'transfer':
        newOptions.transfer = _.assign({}, newOptions.transfer, options.transfer);
        break;
      case 'transferBefore':
      case 'transferAfter':
        let transferEvent = newOptions[key];
        newOptions[key] = function (render, extend) {
          render = transferEvent ? transferEvent(render, extend) : render;
          render = options[key](render, extend);
          return render;
        };
        break;
      default:
        newOptions[key] = options[key];
        break;
    }
  });
  return newOptions;
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

  static AddTransfer(options: UEOption, transfer: UETransfer): UEOption {
    let editor = _getTransferEditor(transfer);
    (options as any).editor = _.assign({}, editor, options.editor);

    return options;
  }

  static NewOption(options: UEOption): UEOption {
    options = _mergeDefaultOption(options);
    return UERender.AddTransfer(options, options.transfer);
  }

  static NewTransfer(transfer: UETransfer): UETransfer {
    transfer = _.cloneDeep(transfer);
    _.forEach(transfer, function (transferItem, type) {
      if (transferItem.editor) {
        const item = transferItem.editor;
        let emptyEditor = !item.empty ? null : _emptyEditor(type, item.empty);
        let editor: UETransferEditor = _.assign({}, _defaultEditor(type), emptyEditor, item);

        if (!editor.text) editor.text = type;
        if (!editor.placeholder) editor.placeholder = editor.text;
        let attrs = editor.attrs;
        let hideAttrs = editor.hideAttrs;
        let hideAttrGroups = editor.hideAttrGroups;
        _.forEach(attrs, function (attr, name) {
          attr = attrs[name] = _.assign({}, _defaultEditorAttrItem(name), attr);
          if (!attr.text) attr.text = name;
          if (!attr.placeholder) attr.placeholder = attr.text;
          if ((hideAttrs && hideAttrs.indexOf(name) >= 0)
            || hideAttrGroups && hideAttrGroups.indexOf(attr.group) >= 0) {
            attr.show = false;
          }
        });

        transferItem.editor = editor;
      }

    });
    return transfer;
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
      'v-show': { group: 'Vue', groupOrder: 102, order: 102 },
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


function _defaultEditorAttrItem(name: string): UETransferEditorAttrsItem {
  return {
    name,
    value: '',
    group: '其他',
    groupOrder: 99,
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