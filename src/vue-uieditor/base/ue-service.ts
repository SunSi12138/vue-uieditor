import _ from 'lodash';
import { LayuiHelper } from '../layui/layui-helper';
import { UEOption, UETransferEditor, UETransferEditorAttrs, UETransferEditorAttrsItem } from './ue-base';
import { UEHelper } from './ue-helper';
import { UERender } from './ue-render';
import { UERenderItem } from './ue-render-item';
import { UEVue, UEVueMixin } from "./vue-extends";
import { LayuiRender } from '../layui/layui-render';


const _editorType = 'uieditor-div';

function _makeWrapRootDiv(json?: UERenderItem) {
  return {
    "type": _editorType,
    "children": json ? [json] : []
  }
}

function _getId() {
  return `uieditor_${UEHelper.makeAutoId()}`;
}

export class UEService {

  constructor(public readonly $uieditor: UEVue, options: UEOption) {
    this.options = options;
  }

  private _options: UEOption;
  get options(): UEOption {
    return this._options;
  }
  set options(options) {
    this._options = options;
  }

  _destroy() {
    const _this: any = this;
    _this.current = _this.history =
      _this.options =
      _this.$uieditor =
      _this._editJson = null;
  }

  $emit(event: string, ...arg: any[]) {
    this.$uieditor?.$emit(event, ...arg);
  }

  $on(event: string, callback: Function) {
    this.$uieditor?.$on(event, callback)
  }

  /** 历史记录 */
  history = {
    list: [],
    curList: [],
    pos: -1,
    max: 0,
    canNext: false,
    canPre: false,
    _cacle: () => {
      let history = this.history;
      history.canNext = history.pos < history.max;
      history.canPre = history.pos > 0;
    },
    add: (item) => {
      let history = this.history;
      let pos = ++history.pos;
      history.max = pos;
      history.list[pos] = _.cloneDeep(item);
      history.curList[pos] = this.current.id;
      history._cacle();
    },
    next: async () => {
      let history = this.history;
      if (!history.canNext) return;
      let list = history.list;
      let pos = ++history.pos;
      this._editJson = _.cloneDeep(list[pos]);
      history._cacle();
      await this.refresh();
      // this.setCurrent('');
    },
    pre: async () => {
      let history = this.history;
      if (!history.canPre) return;
      let pos = history.pos;
      let list = history.list;
      history.pos = --pos;
      history._cacle();
      this._editJson = _.cloneDeep(list[pos]);
      await this.refresh();
      // this.setCurrent('');
    }
  };


  /** 当前处理内容 */
  current = {
    /** 当前选中Id */
    id: '',
    /** 当前选中parentId */
    parentId: '',
    /** 根Id */
    rootId: '',
    /** 面包屑 */
    breadcrumbs: [],
    /** 是否属性栏 */
    refreshAttr: false,
    /** 编辑中的属性栏 */
    attrs: null,
    /** 编辑中的editor内容 */
    editor: null,
    /** 用于显示的vue mixin */
    mixin: null,
    /** 计算后用于显示的JSON */
    json: null,
  };

  private _resetCurrent() {
    if (!this.current.json) return;
    _.assign(this.current, {
      id: '',
      parentId: '',
      rootId: '',
      breadcrumbs: [],
      refreshAttr: false,
      attrs: null,
      editor: null,
      mixin: null,
      json: null
    });
  }

  /** 编辑中的JSON */
  private _editJson: UERenderItem;


  /** 编辑中的 root JSON */
  get rootRender(): UERenderItem {
    return this.current.json;
  }

  setJson(json: UERenderItem): Promise<any> {
    this._resetCurrent();
    return this._setJson(json, false);
  }

  private _setJson(json: UERenderItem, formHistory: boolean): Promise<any> {
    return new Promise((resolve) => {
      json = _.cloneDeep(json);
      if (json.type != _editorType) {
        json = _makeWrapRootDiv(json);
      }

      if (!formHistory) {
        this.history.add(json);
      }

      //初始化render，初始化Id, attrs等
      _initRender([json], null, this.options?.editor, this);

      //创建修改结果用json，包涵 id, editor等信息
      this._editJson = _.cloneDeep(json);

      //返回可编辑的render， 添加只有编辑时用的信息内容，class、拖动、编辑事件等
      //这份数据只用于编辑的内存数据，不能用于保存
      let rootRender = _getEditorRender(json);

      this.current.rootId = rootRender.editorId;

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
        data: function () {
          return {
            current: _this && _this.current || {}
          };
        },
        mounted() {
          if (_this) {
            _this && _this.$emit('on-set-json', { service: _this });
            resolve(false);
          } else {
            resolve(false);
          }
        },
        computed: {
          $uieditor() {
            return _this.$uieditor;
          },
          $service() {
            return _this;
          }
        },
        beforeDestroy() {
          _this = null;
          rootRender = json = null;
        },
        destroyed() {
          LayuiRender.destroy(this.$el);
        }
      } as UEVueMixin;
    });
  }

  getRenderItem(id: string, context?: UERenderItem): UERenderItem {
    context || (context = this._editJson);
    return !context ? null : UERender.findRender([context], { editorId: id });
  }

  /**
   * 获取当前render
   */
  getCurRender() {
    return this.getRenderItem(this.current.id)
  }

  /**
   * 获取父节点
   * @param render 
   * @param all 是否所有内容，否则根据draggable设置查找父节点，默认为：true 
   */
  getParentRenderItem(render: UERenderItem, all = true): UERenderItem {
    if (!render) return null;
    let id = render.editorId;
    if (id) {
      let pId = render.editorPId;
      if (!pId) return null;
      let pRender = this.getRenderItem(pId)
      if (all) {
        return pRender;
      } else {
        let editor = render.editor;
        if (editor && !editor.draggable)
          return this.getParentRenderItem(pRender, all);
        else
          return pRender;
      }
    }
    return null;
  }

  getParentRenderByType(render: UERenderItem, type: string) {
    return this.closest(render, function (render) {
      return render.type == type;
    });
  }

  closest(render: UERenderItem, fn: (render: UERenderItem) => boolean) {
    if (!render) return null;
    let id = render.editorId
    if (id) {
      if (fn(render)) return render;
      let pId = render.editorPId
      let pRender = this.getRenderItem(pId);
      return this.closest(pRender, fn);
    }
    return null;
  }

  /**
   * 刷新导向栏
   * @param render 
   */
  refresBreadcrumbs(render: UERenderItem) {
    let breadcrumbs = [];
    this._makeBreadcrumbs(render, breadcrumbs);
    if (breadcrumbs.length > 0) {
      let first = _.first(breadcrumbs);
      first.canOpt = false;
      first.text = "Root";
      const last = _.last(breadcrumbs);
      last.canOpt = false;
      last.isLast = true;
    }
    this.current.breadcrumbs = breadcrumbs;
  }

  private _makeBreadcrumbs(render: UERenderItem, outList: any[]) {
    if (!render) return;
    let editor = render.editor
    let pId = render.editorPId
    const pRender = this.getRenderItem(pId);
    if (editor && editor.draggable) {
      // const pEditor = pRender.editor
      outList.unshift({
        text: (editor.textFormat && editor.textFormat(editor, render.attrs)) || editor.text,
        id: render.editorId,
        pId,
        canOpt: true,
      });
    }
    if (pRender)
      this._makeBreadcrumbs(pRender, outList);
  }

  /**
   * 根据component创建render
   * @param type 
   * @param parentId 
   */
  private createRender(type, parentId): UERenderItem {
    let render = {
      type,
      editorId: _getId(),
      editorPId: parentId
    } as UERenderItem;
    // let editor = this.options.editor[type];
    return render;
  }


  /**
   * 修改 render type(类型)
   * @param render 
   * @param type 
   */
  changeRenderType(render: UERenderItem, type: string) {
    let current = this.current;
    let parentId = current.parentId || render.editorPId || current.rootId;
    let pRender = this.getRenderItem(parentId);
    if (!pRender) return;
    let children = pRender.children;
    if (!children) children = (pRender.children = []);
    let index = children.indexOf(render);
    let newRender: UERenderItem = this.createRender(type, parentId);
    let id = newRender.editorId;
    const attrs = render.attrs;
    newRender.props = _.assign({}, newRender.props, {
      'v-model': attrs['v-model'].value,
      'ref': attrs['ref'].value
    });
    children.splice(index, 0, newRender);
    this.$emit('on-change-type', { service: this, parent: pRender, render: newRender, oldRender: render });
    this.delCur(false, true);

    this.current.refreshAttr = true;
    this.refresh().then(() => {
      this.setCurrent(id);
    });
  }


  /**
   * 
   * @param cnf 是否要确认
   * @param norefresh 是否刷新
   */
  async delCur(cnf?: boolean, norefresh?: boolean) {
    if (cnf == false) {
      this.deleteWidget(this.current.parentId, this.current.id, norefresh);
      return;
    }
    const ok = await LayuiHelper.confirm('确定要删除吗？');
    if (!ok) return;
    this.deleteWidget(this.current.parentId, this.current.id, norefresh);
  }

  /** norefresh 是否刷新 */
  deleteWidget(parentId: string, id: string, norefresh?: boolean) {
    let pRender = this.getRenderItem(parentId);
    if (!pRender) return;
    let children = pRender.children;
    if (!children) children = (pRender.children = []);
    if (id) {
      let render = this.getRenderItem(id);
      if (render) {
        let index = children.indexOf(render);
        if (index >= 0) {
          let curId;
          if (children.length > 1) {
            let max = children.length - 1;
            let selRender = children[(index == max) ? index - 1 : index + 1] as UERenderItem;
            curId = selRender && selRender.editorId || '';
          } else
            curId = pRender.editorId
          children.splice(index, 1);
          if (!norefresh) {
            this.current.refreshAttr = true;
            this.refresh().then(() => { curId && this.setCurrent(curId); });
          }
          this.$emit('on-delete', { service: this, parent: pRender, render });
        }
      }
    }
  }


  /**
   * 获取 当前render的属性配置
   * @param render 如果空，为当前render
   */
  getCurAttrs(render?: UERenderItem): UETransferEditorAttrs {
    if (!render)
      render = this.getRenderItem(this.current.id);
    return render?.attrs
  }

  /**
   * 设置 当前render的属性配置(属性栏)
   * @param render 如果空，为当前render
   */
  setCurAttrs(render?: UERenderItem) {
    if (!render) render = this.getRenderItem(this.current.id);
    if (render) {
      _setRenderAttrs(render, render.editor, true, this);
      this.refresh();
      this.refresBreadcrumbs(render);
    }
  }

  /**
   * 根据id， 设置render属性
   * @param id 
   * @param attr 
   */
  setAttr(id: string, attr: UETransferEditorAttrsItem) {
    let render = this.getRenderItem(id);
    const editor = render.editor

    let name = attr.name;
    if (!render || !name) return;
    if (name == '_meta_type') {
      this.changeRenderType(render, attr.value);
      return;
    }
    let attrs = render.attrs
    if (attrs[name])
      _.assign(attrs[name], attr);
    if (!attr.effect || !!attr.demoValue) return;
    _setRenderAttrs(render, render.editor, true, this);
    this.refresh();
    this.refresBreadcrumbs(render);
  }

  /**
   * 返回编辑最终render，保存时用
   * @param editing 是否编辑中的render， 默认：false
   * @param id 返回指定render内容
   */
  getJson(editing?: boolean, id?: string);
  /**
   * 返回编辑最终render，保存时用
   * @param editing 是否编辑中的render， 默认：false
   * @param render 返回指定render内容
   */
  getJson(editing?: boolean, render?: UERenderItem);
  getJson(editing, p?: any) {
    if (!this._editJson) return {};
    let render;
    if (!p)
      render = this._editJson;
    else
      render = _.isString(p) ? this.getRenderItem(p) : p;
    render = _.cloneDeep(render);
    _makeResultJson([render], editing, this);
    if (render.type == _editorType && render.children.length == 1)
      render = render.children[0] as any;
    return render;
  }


  private _isRrefreshing;
  /**
   * 刷新编辑内容
   * @param formHistory 
   */
  async refresh(): Promise<any> {
    if (this._isRrefreshing) return
    this._isRrefreshing = true;
    await this._setJson(this._editJson, true);
    this._isRrefreshing = false;
  }


  _currentTimeId;
  /**
   * 设置（选择）当前render
   * @param render 
   */
  setCurrent(render: UERenderItem)
  /**
   * 根据id，设置（选择）当前render
   * @param id 
   */
  setCurrent(id: string)
  setCurrent(id: any) {
    if (!id)
      id = '';
    else if (!_.isString(id)) {
      id = (id as UERenderItem).editorId || '';
    }
    // if (!id) return;
    const current = this.current;
    const render = this.getRenderItem(id);

    const change = current.id !== id;
    // const editor = render.editor;
    const parentId = render.editorPId;
    const pRender = this.getParentRenderItem(render);
    // const pEditor = pRender?.editor
    current.parentId = parentId;
    current.id = id;
    this.refeshSelectBox();

    if (change) {
      const $uieditor = this.$uieditor;
      if (this._currentTimeId) clearTimeout(this._currentTimeId);
      current.refreshAttr = true;
      this._currentTimeId = setTimeout(async () => {
        current.refreshAttr = true;

        if (render) {
          current.attrs = this.getCurAttrs(render);
          current.editor = render.editor;
        } else {
          current.attrs = {};
          current.editor = {};
        }
        this._currentTimeId = null;
        $uieditor.$nextTick(async () => {
          current.refreshAttr = false;
          await $uieditor.$nextTick();
          this.$emit('on-select', { service: this, render, parent: pRender, editor: current.attrs, attrs: current.attrs });
        });
      }, 50);
    }

    this.refresBreadcrumbs(render);
    // this.$logger.debug('setCurrent', current.id)
  }

  refeshSelectBox() {
    setTimeout(() => this.$emit('on-refesh-select-box', this.current.id), 10);
  }



  private _components: any[];
  private _components_tree: any[]
  /** 组件栏数据 */
  get components(): { list: any[]; tree: any[] } {
    if (this._components) return { list: this._components, tree: this._components_tree };
    const components = [];
    const tree = [];
    const getTreeGroup = function (list: any[], groupList: string[]) {
      const group = _.first(groupList);
      groupList = groupList.slice(1);
      let item = _.find(list, { group });
      if (!item) {
        item = { id: UEHelper.makeAutoId(), title: group, group, type: 'group', item: null, children: [] };
        list.push(item);
      }
      if (!item.children) item.children = [];
      if (_.size(groupList) > 0) {
        return getTreeGroup(item.children, groupList);
      } else {
        return item;
      }
    }
    let editor = this.options.editor;
    if (_.size(editor) > 0) {
      _.forEach(editor, function (item, type) {
        const newItem = { id: UEHelper.makeAutoId(), uedrag: true, icon: item.icon, title: item.text, type, item };
        if (item.show !== false) {
          const group = getTreeGroup(tree, (item.group || '').split('/'));
          group?.children.push(newItem);
        }
        components.push(newItem);
      });
      // components = BgPipeSync(
      //   components,
      //   bg_group('group'),
      //   bg_each(function (group) {
      //     group.items = BgPipeSync(group.items, bg_order('order', 'asc'));
      //     let groupOrderItem = _.find(group.items, function (item) { return !_.isNil(item.groupOrder); });
      //     group['order'] = groupOrderItem ? groupOrderItem.groupOrder : 99;
      //   }),
      //   bg_order('order', 'asc')
      // );
    }
    this._components = components;
    this._components_tree = tree;
    return { list: this._components, tree: this._components_tree };
  }

  addComponent(cpId: string, renderId: string, type2: string) {

    let component = _.find(this._components, { id: cpId });
    if (!component) return;

    const toRender = this.getRenderItem(renderId);
    if (!toRender) return;
    const isIn = type2 == 'in';
    let pRender: UERenderItem = null;
    let newIndex = 0;
    if (isIn) {
      pRender = toRender;
      newIndex = _.size(pRender.children);
    } else {
      pRender = this.getParentRenderItem(toRender);
      const index = _.indexOf(pRender.children, toRender);
      newIndex = type2 == 'after' ? index + 1 : index;
      newIndex = Math.max(0, newIndex)
    }
    if (!pRender) return;

    const parentId = pRender.editorId;
    const children = (pRender.children || (pRender.children = []));

    let newRender = this.createRender(component.type, parentId);
    let id = newRender.editorId;
    this.$emit('on-add-component', { service: this, dragContent: pRender, render: newRender })
    children.splice(newIndex, 0, newRender);
    this.current.refreshAttr = true;
    // this.setCurrent(id);
    return this.refresh().then(() => this.setCurrent(id));
  }

  move(fromId: string, toId: string, type2: string): Promise<any> {

    const fromRender = fromId && this.getRenderItem(fromId);
    const fromParent = this.getParentRenderItem(fromRender);
    _.remove(fromParent.children, (item) => fromRender == item);

    let toRender = this.getRenderItem(toId);
    let toEditor = toRender?.editor;
    if (!toEditor) return;
    const isIn = type2 == 'in';
    let pRender: UERenderItem = null;
    let newIndex = 0;
    if (isIn) {
      pRender = toRender;
      newIndex = _.size(pRender.children);
    } else {
      pRender = this.getParentRenderItem(toRender);
      const index = _.indexOf(pRender.children, toRender);
      newIndex = type2 == 'after' ? index + 1 : index;
      newIndex = Math.max(0, newIndex)
    }

    if (pRender) {
      if (!pRender.children) pRender.children = [];
      pRender.children.splice(newIndex, 0, fromRender);
    }

    return this.refresh();
  }


} //end UEService


/**
 * 初始化编辑render，初始化Id, attrs等
 * @param renderList 
 * @param parent 
 * @param editorOpt 
 */
function _initRender(renderList: UERenderItem[], parent: UERenderItem, editorOpt: { [type: string]: UETransferEditor; }, service: UEService) {
  _.forEach(renderList, function (item) {
    if (_.isString(item)) return;
    const isInit = _initRenderAttrs(item, editorOpt, service);
    if (!item.editorId) {
      (item as any).editorId = _getId();
    }
    if (parent) (item as any).editorPId = parent.editorId;
    if (item.children) _initRender(item.children as any, item, editorOpt, service);
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
 * 返回可编辑的render， 添加只有编辑时用的信息内容，class、拖动、编辑事件等
 * 这份数据只用于编辑的内存数据，不能用于保存
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
    let id;
    if (collapse || editor.base) {
      let collapseCalss = collapse ? ' uieditor-drag-collapse' : '';
      if (select) {
        render.props['tabindex'] = '-1';
      }
      className = `uieditor-drag-item${collapseCalss}`;
      id = renderId;
    } else {
      id = renderId;// _makeEditorContentId(renderId);
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


/**
 * 生成编辑后最终render结果，清除编辑器所需的内容
 * @param renderList 
 */
function _makeResultJson(renderList: UERenderItem[], editing?: boolean, service?: UEService) {
  _.forEach(renderList, function (item) {
    if (_.isString(item)) return;
    _setRenderAttrs(item, item.editor, editing, service);

    const dItem: any = item;
    delete dItem.editorId;
    delete dItem.editorPId;
    delete dItem.attrs;
    delete dItem.editor;

    if (item.children) _makeResultJson(item.children as any, editing, service);
  });
}
