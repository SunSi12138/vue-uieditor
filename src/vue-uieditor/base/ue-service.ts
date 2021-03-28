import { UEVue } from "./vue-extends";
import { UERenderItem } from './ue-render-item';
import _ from 'lodash';
import { UEHelper } from './ue-helper';
import { UEOption, UETransferEditor, UETransferEditorAttrs } from './ue-base';
import { UERender } from './ue-render';


const _editorType = 'uieditor-div';

function _makeEditorDiv(json?: UERenderItem) {
  return {
    "type": _editorType,
    "children": json ? [json] : []
  }
}

function _getId() {
  return UEHelper.makeAutoId();
}

export class UEService {

  constructor(public readonly $uieditor: UEVue, public readonly options: UEOption) {
  }

  $emit(event: string, ...arg: any[]) {
    this.$uieditor?.$emit(event, ...arg);
  }

  $on(event: string, callback: Function) {
    this.$uieditor?.$on(event, callback)
  }

  /** 当前处理内容 */
  current = {
    /** 当前选中Id */
    id: '',
    /** 当前选中parentId */
    parentId: '',
    /** 根Id */
    rootId: '',
    /** 用于显示的vue mixin */
    mixin: null,
    /** 计算后用于显示的JSON */
    json: null,
  };

  /** 编辑中的JSON */
  editJson:UERenderItem;

  rootRender:UERenderItem;

  setJson(json: UERenderItem): Promise<any> {
    return new Promise((resolve) => {
      json = _.cloneDeep(json);
      if (json.type != _editorType)
        json = _makeEditorDiv(json);


      _initRenderEditor([json], null, this.options?.editor, this);
      this.current.rootId = json.editorId;
      this.editJson = _.cloneDeep(json);

      let rootRender = this.rootRender = _getEditorRender(json);

      let editorid = rootRender.editorId;
      rootRender.props || (rootRender.props = {});
      rootRender.props["id"] = editorid;
      // rootRender.props["drag-root"] = true;
      rootRender.props["tabindex"] = '-1';
      const emptyCls = !rootRender.children || rootRender.children as any == 0 ? ' uieditor-drag-empty' : '';
      const className = `uieditor-drag-content uieditor-drag-root${emptyCls}`;
      rootRender.props["class"] = className;

      // if (emptyCls) json.props['drag-empty'] = true;

      let _this = this;
      this.current.json = rootRender;
      this.current.mixin = {
        vueDef: {
          data: function () {
            return {
              current: _this && _this.current || {}
            };
          },
          mounted() {
            if (_this) {
              _this && _this.$emit('on-set-meta', { service: _this });
              resolve(false);
            } else {
              resolve(false);
            }
          },
          computed: {
            '$uieditor'() {
              return _this;
            },
            service() { return _this; }
          },
          beforeDestroy() {
            this.current = _this = null;
            rootRender = json = null;
          },
        },
        // render: rootRender
      };
    });
  }

}


/**
 * 初始化编辑render
 * @param renderList 
 * @param parent 
 * @param editorOpt 
 */
function _initRenderEditor(renderList: UERenderItem[], parent: UERenderItem, editorOpt: { [type: string]: UETransferEditor; }, service: UEService) {
  _.forEach(renderList, function (item) {
    if (_.isString(item)) return;
    const isInit = _initRenderAttrs(item, editorOpt, service);
    if (!item.editorId) {
      (item as any).editorId = _getId();
    }
    if (parent) (item as any).editorPId = parent.editorId;
    if (item.children) _initRenderEditor(item.children as any, item, editorOpt, service);
  });
}

/**
 * 初始化render attr，返回true表示已经初始化过
 * @param render 
 * @param editorOpt 
 */
function _initRenderAttrs(render: UERenderItem, editorOpt: { [type: string]: UETransferEditor; }, service: UEService): boolean {
  if (render) {
    let type = render.type;
    if (render.attrs) {
      _setRenderAttrs(render, render.editor, true, service);
      return true;
    }
    let editor = editorOpt[type];
    if (editor && editor.attrs) {
      editor = _.cloneDeep(editor);
      (render as any).attrs = editor.attrs;
      (render as any).editor = editor;
      _initAttrsFromRender(render);
      _setRenderAttrs(render, editor, true, service);
    }
  }
  return false;
}


/**
 * 从 render 初始 attrs.value，清空 render.props
 * @param render 
 */
function _initAttrsFromRender(render: UERenderItem) {
  const editor: UETransferEditor = render.editor;
  let attrs = render.attrs;
  let props = render.props || {};
  let attrBaks = render['editor-attrs'] || {};

  let propName;
  _.forEach(attrs, function (item, name) {

    let has = false;
    item['_initValue__'] = item.value;
    switch (name) {
      case '_meta_type':
        item.value = render.type;
        item['_initValue__'] = item.value;
        has = true;
        delete props[name];
        break;
      default:
        propName = `:${name}`;
        let eventName = `@${name}`;
        if (has = (name in props)) {
          item.value = props[name];
          delete props[name];
          item.bind = false;
        } else if (has = (propName in props)) {
          item.value = props[propName];
          delete props[propName];
          item.bind = true;
        } else if (has = (eventName in props)) {
          item.value = props[eventName];
          delete props[eventName];
        }
        break;
    }
    if (!has) {
      //attrBaks 备份属性，不会被起作用
      propName = `:${name}`;
      if (name in attrBaks) {
        item.value = attrBaks[name];
        item.bind = false;
      } else if (propName in attrBaks) {
        item.value = attrBaks[propName];
        item.bind = true;
      }
    }
  });//end each attrs

  //自定义 props
  _.forEach(props, function (value, key) {
    const { name, isEvent, isBind } = UERender.getVueBindNameEx(key);
    if (!attrs[name]) {
      attrs[name] = UERender.NewCustAttr(name, {
        bind: isBind,
        event: isEvent
      }, editor);
    }
  });
  render.props && (render.props = {});
}


/**
 * 将attr.value 处理到 render.props
 * @param render 
 * @param editor 
 * @param editing 是否编辑中
 */
function _setRenderAttrs(render: UERenderItem, editor: UETransferEditor, editing: boolean, service: UEService) {
  if (render) {
    let attrs = render.attrs;
    if (attrs) {
      const generate = !editing; //不是编辑中，则为生成最终结果
      let props = render.props || (render.props = {});
      editor.transferAttr && editor.transferAttr({ render, attrs, editor, editing, service });

      let bakAttrs;

      _.forEach(attrs, function (item, name) {

        if (editing) {
          if (!item.effect) return;
        }
        let value = editing ? (item.demoValue || item.value) : item.value;
        let isRemoveAttr = (_.isNil(value) || value == "" || (generate && item.editorOlny));
        let isBind = (generate || item.editorBind) && item.bind;

        let bindName = `:${name}`;
        const eventName = `@${name}`;

        //生成时，将备份attr.value
        //attrBaks 备份属性，不会被起作用
        if (generate && isRemoveAttr) {
          if (!bakAttrs) bakAttrs = {};
          let attrName = isBind ? bindName : name;
          if (item['_initValue__'] != value)
            bakAttrs[attrName] = value;
          else
            delete bakAttrs[attrName];
        }
        switch (name) {
          default:
            if (item.event)
              delete props[eventName];
            else {
              delete props[bindName];
              delete props[name];
            }
            if (!isRemoveAttr) {
              //editing 时 不处理事件
              if (generate || !item.event) {
                const newName = item.event ? eventName : (isBind ? bindName : name);
                props[newName] = value;
              }
            }
        }
      });
      if (generate) {
        if (bakAttrs && !_.isEmpty(bakAttrs)) {
          render['editor-attrs'] = bakAttrs;
        } else
          delete render['editor-attrs'];
        if (_.isEmpty(render.props)) {
          delete render.props;
        }
      }
    }
  }

}

/**
 * 返回可编辑的render， 可以拖动等
 * @param render 
 */
 function _getEditorRender(render: UERenderItem): UERenderItem {
  if (_.isObject(render)) {
    let editor = render.editor;
    if (editor && editor.container) {
      render.children = _getDroprender(render.children as any || [], render);
    } else {
      render.children = _.map(render.children, function (item: UERenderItem) {
        return _getEditorRender(item);
      });
    }
  }
  return render;
}

const _collapseKey = '_editor_collapse';

function _getCollapse(attrs: UETransferEditorAttrs): 'false' | 'true' {
  return attrs[_collapseKey].value;
}

function _setCollapse(attrs: UETransferEditorAttrs, value: 'false' | 'true') {
  attrs[_collapseKey].value = value;
}

/**
 * 返回可拖动的render
 * @param renderList 
 * @param parentRender 
 */
 function _getDroprender(renderList: UERenderItem[], parentRender?: UERenderItem): UERenderItem[] {

  const pEditor = parentRender.editor;
  let dragChildren = _.map(renderList, function (item) {
    let render = _getEditorRender(item);
    let editor = render.editor;
    if (!editor) return render;
    let renderId = render.editorId
    let collapse = false;
    let attrs = render.attrs
    if (!editor.base || editor.collapse) {
      collapse = _getCollapse(attrs) == 'true';
    }

    const select = true;
    let className;
    let id
    if (collapse || editor.base) {
      let collapseCalss = collapse ? ' uieditor-drag-collapse' : '';
      if (select) {
        render.props['tabindex'] = '-1';
      }
      className = `uieditor-drag-item${collapseCalss}`;
      id = renderId;
    } else {
      id = _makeEditorContentId(renderId);
        let emptyCls = !render.children || render.children as any == 0 ? ' uieditor-drag-empty' : '';
      if (select) {
        render.props['tabindex'] = '-1';
      }
      const overCls = '';// !operation.selectChild ? ' over' : '';
      className = `uieditor-drag-content${emptyCls}${overCls}`;
    }

    if (editor.inline) className = `${className} inline`;

    if (editor.className) {
      let eClassName = editor.className;
      if (_.isFunction(eClassName)) {
        eClassName = eClassName({ render, editor, attrs });
      }
      className = `${className} ${eClassName}`;
    }

    const rClassName = render.props['class'];
    if (rClassName) {
      className = `${rClassName} ${className}`
    }

    let rClassNameB = render.props[':class'];
    if (rClassNameB) {
      //如果class 为 { active: true } object， 不认（空白）
      if (rClassNameB.indexOf('{') >= 0)
        rClassNameB = '';
      else
        className = `${rClassName} + ' ${className}'`
    }
    render.props[rClassNameB ? ':class' : 'class'] = className;
    render.props['id'] = id;

    return render;

  });
  return dragChildren

}

function _makeEditorContentId(id: string) {
  return [id, 'content'].join('-');
}