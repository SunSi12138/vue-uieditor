import _ from 'lodash';
import Vue from 'vue';
import { LayuiHelper } from '../layui/layui-helper';
import { LayuiRender } from '../layui/layui-render';
import { UECanNotCopyProps, UECanNotMoveProps, UECanNotRemoveProps, UECanNotSelectProps, UEDragType2, UEMode, UEOption, UETemplate, UETransferEditor, UETransferEditorAttrsItem } from './ue-base';
import { UECompiler } from './ue-compiler';
import { UEHelper } from './ue-helper';
import { UERender } from './ue-render';
import { UERenderItem } from './ue-render-item';
import { UEVue, UEVueMixin } from "./vue-extends";

type MonacoEditorContext = {
  content?: string;
  extraLib?: string;
  formatAuto?: boolean;
  show?: boolean;
  language?: "javascript" | 'json' | 'html' | 'css';
  save?(content?: string): Promise<void> | void;
  close?(): Promise<void> | void;
}

type UEAddComponent = {
  id?: string;
  $isTmpl?: boolean;
  uedrag?: boolean;
  icon?: string;
  title?: string;
  type?: string;
  item: any;
}


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
      _this.$uieditor = this._lastcp =
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
    addCur: () => {
      this.history.add(this._editJson);
    },
    next: async () => {
      let history = this.history;
      if (!history.canNext) return;
      let list = history.list;
      let pos = ++history.pos;
      history._cacle();
      this._resetCurrent();
      await this._setJson(_.cloneDeep(list[pos]));
      const id = history.curList[pos];
      id && this.setCurrent(id);
    },
    pre: async () => {
      let history = this.history;
      if (!history.canPre) return;
      let pos = history.pos;
      let list = history.list;
      history.pos = --pos;
      history._cacle();
      this._resetCurrent();
      await this._setJson(_.cloneDeep(list[pos]));
      const id = history.curList[pos];
      id && this.setCurrent(id);
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
    /** 模式：design, json, script, tmpl, preview */
    mode: 'design' as UEMode,
    monacoEditor: null as MonacoEditorContext,
    monacoEditorOther: {} as MonacoEditorContext
  };

  private _clearMonacoEditor() {
    _.assign(this.current, {
      monacoEditor: null,
      monacoEditorOther: {}
    });

  }

  setModeUI(mode: UEMode) {
    const $: JQueryStatic = layui.$;
    $(this.$uieditor.$el).find('.layui-tab-title').children(`[${mode}]`).trigger('click');
  }

  async setMode(mode: UEMode) {
    if (!mode) mode = 'design';

    const jTitle = layui.$(this.$uieditor.$el).find('.layui-tab-title');
    if (mode == 'other') {
      jTitle.children().hide();
      return;
    } else {
      jTitle.children().show();
      jTitle.children('[other]').hide();
    }

    const oldMode = this.current.mode;
    if (oldMode == mode) return;

    const current = this.current;
    switch (mode) {
      case 'design':
        this._clearMonacoEditor();
        break;
      case 'preview':
        this._clearMonacoEditor();
        current.monacoEditor = { content: this.getJson() }
        break;
      case 'script':
        const extraLib = await this.options.extraLib();
        const thisExtraLib = _makeThisDTS(this._lastcp);

        const scrtiptContent = await this.getScript();
        this._clearMonacoEditor();
        current.monacoEditor = {
          content: `UEEditorVueDef(${scrtiptContent})`,
          extraLib: `${extraLib}; ${thisExtraLib}`,
          formatAuto: true,
          language: "javascript",
          save: async () => {
            let content = current.monacoEditor.content;
            content = content.replace(/^[\s\r\n]*UEEditorVueDef\s*\(\s*/i, '').replace(/\)[\s\r\n]*$/i, '');
            await this.setScript(content);
            this.setModeUI('design');
          }
        };
        break;
      case 'json':
        const json = JSON.stringify(this.getJson(), null, 2)
        this._clearMonacoEditor();
        current.monacoEditor = {
          content: json,
          extraLib: '',
          formatAuto: false,
          language: "json",
          save: async () => {
            const json = JSON.parse(current.monacoEditor.content);
            await this.setJson(json);
            await this.$uieditor.$nextTick();
            this.setModeUI('design');
          }
        };
        break;
      case 'tmpl':
        const html = await this.getTmpl();
        current.monacoEditor = {
          content: html,
          extraLib: '',
          formatAuto: true,
          language: "html",
          save: async () => {
            const tmpl = current.monacoEditor.content || '<div></div>';
            await this.setTmpl(tmpl);
            this.setModeUI('design');
          }
        };
        break;
    }
    this.current.mode = mode;
    this.$emit('on-change-mode', { service: this, mode, oldMode })
  }

  /**
   * 打开代码编辑
   * @param option 
   */
  async showMonacoEditorOther(option: MonacoEditorContext) {
    const current = this.current;
    const oldMode = current.mode;
    let extraLibAll = '';
    if (!option.language || option.language == 'javascript') {
      const extraLib = await this.options.extraLib();
      const thisExtraLib = _makeThisDTS(this._lastcp, true);
      extraLibAll = `${extraLib}; ${thisExtraLib}`;
    }
    current.monacoEditorOther = _.assign({
      formatAuto: false,
      language: 'javascript'
    } as MonacoEditorContext, option, {
      extraLib: extraLibAll,
      show: true,
      save: async () => {
        if (option.save) {
          await option.save(current.monacoEditorOther.content);
        }
        current.monacoEditorOther = {};
        this.setModeUI(oldMode);
      },
      close: async () => {
        if (option.close) {
          await option.close();
        }
        current.monacoEditorOther = {};
        this.setModeUI(oldMode);
      }
    });
    this.setModeUI('other');
    // this.setModeUI('other');
  }

  async getTmpl() {
    const jsonTmpl = this.getJson();
    const html = await UECompiler.renderToHtmlAsync(jsonTmpl, { wrap: true, indent: 2 });
    return html;
  }

  async setTmpl(html) {
    const json: any = await UECompiler.htmlToRenderAsync(html);
    await this.setJson(json);
  }

  async getScript(): Promise<string> {
    const render = this.getRenderByType('script');
    return render ? render.children[0] as string : "{\n  data() {\n    return {};\n  },\n  computed: {\n\n  },\n  watch: {},\n  methods: {},\n  created() {\n    \n  }\n}";
  }

  async setScript(script: string) {
    const render = this.getRenderByType('script');
    if (render) {
      render.children = [script || '{}'];
    } else {
      this._editJson.children = [{
        type: 'script',
        children: [script || '{}'],
      }].concat(this._editJson.children as any || []);
    }
    const json = this.getJson();
    await this.setJson(json);
  }


  /** 获取预览参数 */
  getPreviewOpt() {
    const render = this.getRenderByType('preview-opt');
    return render ? render.children[0] as string : "{\n  query: {},\n  param: {},\n  vueDef: {\n    created() {\n\n    }\n  }\n}";
  }
  async setPreviewOpt(content: string) {
    const render = this.getRenderByType('preview-opt');
    if (render) {
      render.children = [content || '{}'];
    } else {
      this._editJson.children = [{
        type: 'preview-opt',
        children: [content || '{}'],
        // "editor-attrs": {
        //   "editor_design_hide": "true"
        // }
      }].concat(this._editJson.children as any || []);
    }
    const json = this.getJson();
    await this.setJson(json);
    this.current.monacoEditor = { content: this.getJson() };
  }
  showPreviewOpt() {
    const content = `UEPreviewOptionDef(${this.getPreviewOpt()})`;
    this.showMonacoEditorOther({
      content,
      save: async (content) => {
        content = content.replace(/^[\s\r\n]*UEPreviewOptionDef\s*\(\s*/i, '').replace(/\)[\s\r\n]*$/i, '');
        await this.setPreviewOpt(content);
      }
    });
  }



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


  /** 编辑中的 root JSON，注意：不是完整JSON内容，如：collapse 后，子节点给删除了。 */
  get rootRender(): UERenderItem {
    return this.current.json;
  }

  setJson(json: UERenderItem): Promise<any> {
    this._resetCurrent();
    this.history.add(_.cloneDeep(json));
    return this._setJson(json);
  }

  _lastcp: Vue;
  private _setJson(json: UERenderItem): Promise<any> {
    return new Promise((resolve) => {
      const jsonOrg = json;
      json = _.cloneDeep(json);
      if (json.type != _editorType) {
        json = _makeWrapRootDiv(json);
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
      rootRender.props["tabindex"] = '-1';
      const className = `uieditor-drag-content uieditor-drag-root`;
      rootRender.props["class"] = className;

      // if (emptyCls) json.props['drag-empty'] = true;

      let _this = this;
      this.current.json = rootRender;
      this.current.mixin = {
        // data: function () {
        //   return {
        //     current: _this && _this.current || {}
        //   };
        // },
        mounted() {
          if (_this) {
            _this._lastcp = this;
            _this && _this.$emit('on-set-json', { service: _this, json: jsonOrg });
            resolve(true);
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
        // beforeDestroy() {
        //   _this = null;
        //   rootRender = json = null;
        // },
        destroyed() {
          LayuiRender.destroy(this.$el);
        }
      } as UEVueMixin;
      if (this.current.mode != 'design')
        resolve(true);
    });
  }

  getRenderItem(id: string, context?: UERenderItem): UERenderItem {
    context || (context = this._editJson);
    return !context ? null : UERender.findRender([context], { editorId: id });
  }

  /**
 * 根据 type 获取 render
 * @param type 
 * @param render 如果不为空，从些render开始查找
 */
  getRenderByType(type: string, context?: UERenderItem): UERenderItem {
    context || (context = this._editJson);
    return !type ? null : UERender.findRender([context], { type });
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
   * @param all 是否所有内容，否则根据select设置查找父节点，默认为：true 
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
        if (editor && !editor.select)
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

  async empty(cnf?: boolean) {
    if (cnf == false) {
      this.setJson({ type: 'uieditor-div' });
    } else {
      const ok = await LayuiHelper.confirm('确定要新建吗？');
      if (!ok) return;
      this.setJson({ type: 'uieditor-div' });
    }
    await this.refresh();
  }


  /**
   * 获取 render 的临时内容，使用内容传送
   * @param id 
   * @param key 
   */
  getRenderTemp(id: string, key: string): any
  /**
   * 获取 render 的临时内容，使用内容传送
   * @param render 
   * @param key 
   */
  getRenderTemp(render: UERenderItem, key: string): any
  getRenderTemp(p, key) {
    if (_.isString(p)) p = this.getRenderItem(p);
    if (!p) return;
    const temp = p.temp;
    return temp && temp[key];
  }

  /**
   * 设置 render 的临时内容(不会生成meta)，使用内容传送
   * @param id 
   * @param key 
   * @param value 
   */
  setRenderTemp(id: string, key: string, value: any): any
  /**
   * 设置 render 的临时内容(不会生成meta)，使用内容传送
   * @param render 
   * @param key 
   * @param value 
   */
  setRenderTemp(render: UERenderItem, key: string, value: any): any
  setRenderTemp(p, key, value) {
    if (_.isString(p)) p = this.getRenderItem(p);
    if (!p) return;
    const temp = p.temp || (p.temp = {});
    _.assign(temp, {
      [key]: value
    });
  }


  /**
   * 刷新导向栏
   * @param render 
   */
  refresBreadcrumbs(render?: UERenderItem) {
    if (!render) render = this.getCurRender();
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
    if (editor && editor.select) {
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
    this.delCur(false, true);

    this.current.refreshAttr = true;
    this.refresh().then(() => {
      this.setCurrent(id);
      this.$emit('on-change-type', { service: this, parent: pRender, render: newRender, oldRender: render });
    });
  }


  /**
   * 
   * @param cnf 是否要确认
   * @param norefresh 是否刷新
   */
  async delCur(cnf?: boolean, norefresh?: boolean) {
    const current = this.current;
    const id = current.id;
    if (!id) return;
    const parentId = current.parentId;
    if (cnf == false) {
      this.deleteWidget(parentId, id, norefresh);
      return;
    }
    const ok = await LayuiHelper.confirm('确定要删除吗？');
    if (!ok) return;
    this.deleteWidget(parentId, id, norefresh);
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
          this.history.addCur();
          if (!norefresh) {
            this.current.refreshAttr = true;
            this.refresh().then(() => { curId && this.setCurrent(curId); });
          }
          this.$emit('on-delete', { service: this, parent: pRender, render });
        }
      }
    }
  }

  getAttr(id: string, key: string): UETransferEditorAttrsItem {
    const render = this.getRenderItem(id);
    return render && render.attrs && render.attrs[key];
  }

  /**
   * 根据id， 设置render属性
   * @param id 
   * @param attr 
   */
  setAttr(id: string, attr: UETransferEditorAttrsItem, refresh = true) {
    const render = this.getRenderItem(id);

    let key = attr.key;
    if (!render || !key) return;
    if (key == '_meta_type') {
      this.changeRenderType(render, attr.value);
      return;
    }
    const oldText = render.editor.textFormat(render.editor, render.attrs);
    let attrs = render.attrs
    if (attrs[key])
      _.assign(attrs[key], attr);
    const newText = render.editor.textFormat(render.editor, render.attrs);
    if (newText != oldText) this.$uieditor['_drager'].select(id, true);
    if (!refresh || !attr.effect || !!attr.demoValue) return;
    _setRenderAttrs(render, render.editor, true, this);
    this.history.addCur();
    this.refresh().then(() => {
      this.refresBreadcrumbs(render);
    });
  }

  /**
   * 添加属性
   * @param id 
   * @param attrName 
   */
  addAttr(id: string, attrName: string): UETransferEditorAttrsItem {
    const render = this.getRenderItem(id);
    const attrs = render?.attrs;
    if (!attrs) return;
    const { name, isEvent, isBind } = UERender.getVueBindNameEx(attrName);
    if (_.has(attrs, name)) return;
    return attrs[name] = UERender.NewCustAttr(name, {
      bind: isBind,
      event: isEvent
    }, render.editor);
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
    await this._setJson(this._editJson);
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
    if (id == this.rootRender?.editorId) id = '';

    // if (!id) return;
    const current = this.current;
    const render = this.getRenderItem(id);

    const change = current.id !== id;
    // const editor = render.editor;
    const parentId = render?.editorPId;
    const pRender = this.getParentRenderItem(render);
    // const pEditor = pRender?.editor
    current.parentId = parentId;
    current.id = id;
    this.refeshSelectBox();

    if (change) {
      const $uieditor = this.$uieditor;
      if (this._currentTimeId) clearTimeout(this._currentTimeId);
      current.refreshAttr = true;
      this._currentTimeId = this.$uieditor.$nextTick(async () => {
        current.refreshAttr = true;

        if (render) {
          current.attrs = render.attrs;
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
      });
    }

    this.refresBreadcrumbs(render);
  }

  refeshSelectBox() {
    setTimeout(() => this.$emit('on-refesh-select-box', { service: this, id: this.current.id }), 10);
  }


  private _components: UEAddComponent[];
  private _components_tree: any[]
  /** 组件栏数据 */
  get components(): { list: any[]; tree: any[] } {
    if (this._components) return { list: this._components, tree: this._components_tree };
    let components = [];
    let tree = [];

    //添加 cp editor
    const editor = this.options.editor;
    if (_.size(editor) > 0) {
      _.forEach(editor, function (item, type) {
        const newItem = { id: UEHelper.makeAutoId(), $isTmpl: false, uedrag: true, icon: item.icon, title: item.defaultText || item.text, type, item };
        if (item.show !== false && item.showInTree !== false) {
          const group = _getCpTreeGroup(tree, (item.group || '').split('/'));
          group?.children.push(newItem);
        }
        components.push(newItem);
      });
    }
    //排序
    tree = _makeOrderCpTree(tree);
    components = _.orderBy(components, 'order', 'asc');

    //模板是数组，不用排序
    const tmpls = this.options.templates;
    if (_.size(tmpls) > 0) {
      _.forEach(tmpls, function (item, type) {
        const newItem = { id: UEHelper.makeAutoId(), $isTmpl: true, uedrag: true, icon: item.icon, title: item.title, type, item };
        const group = _getCpTreeGroup(tree, (item.group || '').split('/'));
        group?.children.push(newItem);
        components.push(newItem);
      });
    }

    this._components = components;
    this._components_tree = tree;
    return { list: this._components, tree: this._components_tree };
  }

  /**
   * 通过拖动添加
   * @param cpId 
   * @param renderId 
   * @param type2 
   */
  async addByDrag(cpId: string, renderId: string, type2: UEDragType2) {

    let component = _.find(this._components, { id: cpId });
    if (!component) return;

    await this.addByComponent(component, renderId, type2);
  }


  canAddByDrag(cpId: string, renderId: string, type2: UEDragType2) {
    let component = _.find(this._components, { id: cpId });
    if (!component) return false;
    const isTmpl = component.$isTmpl;
    const tmpl: UETemplate = isTmpl ? component.item : null;
    const cpType = isTmpl ? _makeTempalte(tmpl).type : component.type;
    if (!cpType) return false;

    const fromRender = null;
    const fromParent = null;
    const toRender = renderId && this.getRenderItem(renderId);
    const toParent = type2 == 'in' ? toRender : this.getParentRenderItem(toRender, true);
    const fromEditor = this.options.editor[cpType];

    let ok = true;
    if (tmpl && tmpl.moving) {
      ok = tmpl.moving({ toParent, toRender, toEditor: toRender?.editor, fromEditor, type2, service: this });
    }
    if (ok === false) return false;
    return _canMoving({ fromParent, toParent, fromRender, toRender, fromEditor, service: this, type2 });
  }


  /**
   * 通过类型添加
   * @param type 
   * @param renderId 
   * @param type2 
   */
  async addByType(type: string, renderId: string, type2: UEDragType2) {

    let component = _.find(this._components, { type });
    if (!component) return;

    await this.addByComponent(component, renderId, type2);
  }

  /**
   * 通过JSON添加
   * @param json 
   * @param renderId 
   * @param type2 
   */
  async addByJson(json: any, renderId: string, type2: UEDragType2) {

    await this.addByComponent({
      $isTmpl: true,
      item: {
        json
      },
    }, renderId, type2);
  }

  /**
   * 通过模板添加
   * @param json 
   * @param renderId 
   * @param type2 
   */
  async addByTmpl(template: string, renderId: string, type2: UEDragType2) {

    await this.addByComponent({
      $isTmpl: true,
      item: {
        template
      },
    }, renderId, type2);
  }

  /**
   * 添加组件 或 模板
   * @param component 
   * @param renderId 
   * @param type2 
   */
  async addByComponent(component: UEAddComponent, renderId: string, type2: UEDragType2) {

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

    let newRender
    if (component.$isTmpl) {
      const cpItem = component.item;
      const json = _makeTempalte(cpItem);
      newRender = json;
      if (newRender && newRender.type) {
        const type = newRender.type;
        if (type && this.options.editor[type]) {
          _.assign(newRender, {
            editorId: _getId(),
            editorPId: parentId
          } as UERenderItem);
        }
      }
    } else {
      newRender = this.createRender(component.type, parentId);
    }
    if (!newRender) return;
    let id = newRender.editorId || '';
    children.splice(newIndex, 0, newRender);
    this.history.addCur();
    this.current.refreshAttr = true;
    this.foucs();
    this.$emit('on-add-component', { service: this, dragContent: pRender, render: newRender })
    return this.refresh().then(() => this.setCurrent(id));
  }

  canRemove(id: string) {
    const render = this.getRenderItem(id);
    if (!render) return false;
    if (render.props && render.props[UECanNotRemoveProps]) return false;
    const attrs = render.attrs;
    if (attrs && attrs[UECanNotRemoveProps]) return false;
    return true;
  }

  canCopy(id: string) {
    const render = this.getRenderItem(id);
    if (!render) return false;
    if (render.props && render.props[UECanNotCopyProps]) return false;
    const attrs = render.attrs;
    if (attrs && attrs[UECanNotCopyProps]) return false;
    return true;
  }

  canMove(fromId: string, toId: string, type2: UEDragType2) {

    const fromRender = fromId && this.getRenderItem(fromId);
    const fromParent = this.getParentRenderItem(fromRender, true);
    const toRender = toId && this.getRenderItem(toId);
    const toParent = type2 == 'in' ? toRender : this.getParentRenderItem(toRender, true);

    return _canMoving({ fromParent, toParent, fromRender, toRender, service: this, type2 });
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
    this.history.addCur();

    return this.refresh().then(() => this.refresBreadcrumbs());
  }


  /**
   * 折叠内容
   * @param id 
   */
  async collapse(id) {
    let render = this.getRenderItem(id);
    if (!render) return;
    let attrs = render.attrs
    let collapse = UERender.isCollapse(attrs);
    UERender.setCollapse(attrs, collapse ? 'false' : 'true');
    this.history.addCur();
    await this.refresh();
  }


  private _copyId;
  private _copyParentId;
  private _isCut: boolean;
  copyCur() {
    let id = this.current.id;
    let parentId = this.current.parentId;
    this._copyId = id;
    this._copyParentId = parentId;
    this._isCut = false;
  }

  copyCurToNext() {
    this._copyId = this.current.id;
    this._copyParentId = this.current.parentId;
    this._isCut = false;
    this.pasteCur('after', true, this._copyId, true);
  }

  /** 剪切 */
  cutCur() {
    this.copyCur();
    this._isCut = true;
  }

  get canPaste() { return !!this._copyId; }

  pasteCur(pos?: 'before' | 'after' | 'child', keepCur?: boolean, currentId?: string, focus?: boolean) {

    currentId || (currentId = this.current.id || this.rootRender.editorId);
    let render = this.getRenderItem(currentId);
    let editor = render.editor

    let notPos = !pos || pos == 'child';

    let pRender = editor.container && notPos ? render : (this.getParentRenderItem(render, true) || this.rootRender);
    if (!pRender.children) pRender.children = [];


    let children: any[] = pRender.children;

    let copyRender: UERenderItem = _.cloneDeep(this.getJson(false, this._copyId));
    const id = _getId();
    _.assign(copyRender, {
      editorId: id,
      editorPId: pRender.editorId
    } as UERenderItem);
    const copyRenderOrg = this.getRenderItem(this._copyId);
    const copyEditor = copyRenderOrg.editor;
    if (copyEditor && copyEditor.coping) {
      if (copyEditor.coping({ render: copyRender, parent: pRender, service: this }) === false) return;
    }

    if (focus !== true && !_canMoving({
      toParent: pRender, toRender: render, fromRender: copyRenderOrg,
      fromParent: this.getParentRenderItem(copyRenderOrg), service: this, type2: pos as any
    })) return;

    if (this._isCut) {
      this.deleteWidget(this._copyParentId, this._copyId, true);
      this._copyId = null;
    }
    let index = children.indexOf(render);
    if (index < 0) {
      children.push(copyRender);
    } else {
      switch (pos) {
        case 'before':
          children.splice(index, 0, copyRender);
          break;
        default:
          children.splice(index + 1, 0, copyRender);
          break;
      }
    }
    !keepCur && (this.current.refreshAttr = true);
    this.refresh().then(() => !keepCur && this.setCurrent(id));
  }



  private selectById(curId: string) {
    if (!curId) return;
    const jo = layui.$(`#${curId}`);
    jo.trigger('mousedown');
    jo.trigger('mouseup');
  }

  selectNext() {
    const render = this.getCurRender();
    const pRender = this.getParentRenderItem(render, false);
    if (!pRender) return;
    let selRender: UERenderItem;
    const children = pRender.children;
    let curId;
    if (children.length > 1) {
      let index = children.indexOf(render);
      let max = children.length - 1;
      selRender = children[index == max ? 0 : index + 1] as any;
    }
    if (selRender && selRender != render) {
      this.current.refreshAttr = true;
      curId = selRender.editorId
      curId && this.selectById(curId);

      // this.refresh().then(() => { curId && this.setCurrent(curId); });
    }
  }

  selectPre() {
    const render = this.getCurRender();
    const pRender = this.getParentRenderItem(render, false);
    if (!pRender) return;
    let selRender;
    const children = pRender.children;
    let curId;
    if (children.length > 1) {
      let index = children.indexOf(render);
      selRender = children[index == 0 ? children.length - 1 : index - 1];
    }
    if (selRender && selRender != render) {
      this.current.refreshAttr = true;
      curId = selRender.editorId;
      curId && this.selectById(curId);
      // this.refresh().then(() => { curId && this.setCurrent(curId); });
    }
  }

  selectParent() {
    const render = this.getCurRender();
    const pRender = this.getParentRenderItem(render, false);
    if (pRender) {
      this.current.refreshAttr = true;
      let curId = pRender.editorId;
      curId && this.selectById(curId);
      // this.refresh().then(() => { curId && this.setCurrent(curId); });
    }
  }

  selectChild() {
    const render = this.getCurRender();
    if (!render || !render.children) return;
    let selRender: any = render.children[0];
    if (selRender) {
      this.current.refreshAttr = true;
      let curId = selRender.editorId;
      curId && this.selectById(curId);
      // this.refresh().then(() => { curId && this.setCurrent(curId); });
    }
  }

  foucs() {
    this.$uieditor?.$refs.jsonFoucs['focus']();
  }


} //end UEService

function _getCpTreeGroup(list: any[], groupList: string[]) {
  const group = _.first(groupList);
  groupList = groupList.slice(1);
  let item = _.find(list, { group });
  if (!item) {
    item = { id: UEHelper.makeAutoId(), title: group, group, type: 'group', item: null, children: [] };
    list.push(item);
  }
  item.item = null;
  if (!item.children) item.children = [];
  if (_.size(groupList) > 0) {
    return _getCpTreeGroup(item.children, groupList);
  } else {
    return item;
  }
}

function _makeOrderCpTree(list: any[], isRoot?: boolean) {

  _.forEach(list, function (item) {
    let children = item.children;
    if (_.size(children) > 0) {
      children = _makeOrderCpTree(children, false);
      item.children = _.orderBy(children, 'order', 'asc');
      const first: any = _.first(item.children);
      if (!first.item) {
        item.order = first.order;
      } else {
        item.order = !_.has(first.item, 'groupOrder') ? 999 : (first.item.groupOrder || 0);
      }
    }
  });
  return isRoot !== false ? _.orderBy(list, 'order', 'asc') : list;
}


/**
 * 初始化编辑render，初始化Id, attrs等
 * @param renderList 
 * @param parent 
 * @param editorOpt 
 */
function _initRender(renderList: UERenderItem[], parent: UERenderItem, editorOpt: { [type: string]: UETransferEditor; }, service: UEService) {
  _.forEach(renderList, function (item) {
    if (_.isString(item)) return;
    const tempRD: any = item;
    if (!tempRD.editorId) {
      tempRD.editorId = _getId();
    }
    if (!tempRD.temp) {
      tempRD.temp = {};
    }
    if (parent) tempRD.editorPId = parent.editorId;
    const isInit = _initRenderAttrs(item, editorOpt, service);
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
    name = item.name;

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
        if (item.event) {
          let eventName = `@${name}`;
          if (has = (eventName in props)) {
            // item.value = props[eventName];
            _setAttrValue(item, props[eventName]);
            delete props[eventName];
          }
        } else {
          propName = `:${name}`;
          if (has = (name in props)) {
            _setAttrValue(item, props[name]);
            delete props[name];
            item.bind = false;
          } else if (has = (propName in props)) {
            _setAttrValue(item, props[propName]);
            delete props[propName];
            item.bind = true;
          }
        }

        break;
    }
    if (!has) {
      //attrBaks 备份属性，不会被起作用
      propName = `:${name}`;
      if (name in attrBaks) {
        // item.value = attrBaks[name];
        _setAttrValue(item, attrBaks[name]);
        item.bind = false;
      } else if (propName in attrBaks) {
        // item.value = attrBaks[propName];
        _setAttrValue(item, attrBaks[propName]);
        item.bind = true;
      }
    }
  });//end each attrs

  //自定义 props
  _.forEach(props, function (value, key) {
    const { name, isEvent, isBind } = UERender.getVueBindNameEx(key);
    if (!attrs[name]) {
      const isB = _.isBoolean(value);
      const isBOnly = name == UECanNotSelectProps || name == UECanNotMoveProps ||
        name == UECanNotCopyProps || name == UECanNotRemoveProps;
      attrs[name] = UERender.NewCustAttr(name, {
        bind: isBind,
        event: isEvent,
        value: isB ? (isBOnly ? value : value.toString()) : (value || ''),
        type: isB ? (isBOnly ? 'boolean-only' : 'boolean') : 'text'
      }, editor);
    }
  });
  render.props && (render.props = {});
}

function _setAttrValue(attr: UETransferEditorAttrsItem, value: any) {
  if (!attr.event && attr.type == 'boolean-only') {
    attr.value = value === true || value === 'true';;
  } else {
    attr.value = value;
  }
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
        name = item.name;

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
                props[newName] = item.type == 'boolean-only' ? value === true : value;
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
      collapse = UERender.isCollapse(attrs);
    }

    const select = true;
    let className;
    let id;
    if (collapse || editor.base) {
      let collapseCalss = collapse ? ' uieditor-drag-collapse' : '';
      // if (select) {
      //   render.props['tabindex'] = '-1';
      // }
      className = `uieditor-drag-item${collapseCalss}`;
      id = renderId;
    } else {
      id = renderId;// _makeEditorContentId(renderId);
      let emptyCls = !render.children || render.children as any == 0 ? ' uieditor-drag-empty' : '';
      // if (select) {
      //   render.props['tabindex'] = '-1';
      // }
      const overCls = '';// !operation.selectChild ? ' over' : '';
      className = `uieditor-drag-content${emptyCls}${overCls}`;
    }
    if (className && (!editor.select || render.props[UECanNotSelectProps] || attrs[UECanNotSelectProps])) {
      className = className.replace('uieditor-drag-item', '')
        .replace('uieditor-drag-content', '');
    }

    if (!collapse && editor.controlLeft) className = `${className} control-left`;
    if (editor.inline) className = `${className} inline`;
    if (editor.containerBorder) className = `${className} drawing-item-border`;

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

    if (collapse) {
      const text = editor.textFormat(editor, attrs);
      render.type = 'div';
      render.children = [{
        type: 'div',
        props: { 'class': 'collapse-info' },
        children: [_.escape(text)]
      }];
    }

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
    delete dItem.temp;

    if (item.children) _makeResultJson(item.children as any, editing, service);
  });
}

function _makeTypeDts(obj, keys, lv = 1) {

  const types = _.map(keys, function (key) {
    const item = obj[key];
    let typeName = _.isNil(item) ? 'any' : typeof item;
    if (typeName == 'function') {
      let fnDts = /^[\s\r\n]*function[^\(]*(\([^\)]*\))/i.exec(item.valueOf().toString());
      typeName = fnDts ? `${fnDts[1]}=>any` : '()=>any';
    }
    if (_.isArray(item)) {
      typeName = 'any[]';
    } else if (typeName == 'object') {
      const oKeys = Object.keys(item);
      if (oKeys && oKeys.length > 0 && lv == 1) {
        if (key == '$refs') {
          typeName = `{${_.map(oKeys, (item) => `${item}:Vue`).join(';')};}`;

        } else {
          typeName = `{${_makeTypeDts(item, oKeys, 2).join(';')};}`;
        }
      } else {
        typeName = 'any';
      }
    }

    return `${key}: ${typeName}`
  });
  return types;
}

const privateVar = /^_/;
function _makeThisDTS(cp: any, withThis?: boolean) {
  if (!cp || cp._isDestroyed) return '';

  const cpKeys = _.keysIn(cp);
  const vueKeys = _.keysIn(new Vue());
  const excludes = ["$uieditor", "$service", "$el"];
  const keys = _.filter(cpKeys, function (key) {
    return !_.includes(vueKeys, key) && !_.includes(excludes, key) && !privateVar.test(key);
  }).concat(['$refs']);

  const types = _makeTypeDts(cp, keys);

  const withThisDts = !withThis ? '' : `
const {
  ${_.filter(cpKeys, function (key) { return !privateVar.test(key); })}
 }  = $this;
`;

  const dts = `

class UIEditorThis extends Vue {
 ${types.join(';')};
}

const $this = new UIEditorThis();
${withThisDts}
`;

  return dts;

}



function _canMoving(p: {
  fromParent: UERenderItem;
  toParent: UERenderItem;
  fromRender: UERenderItem;
  fromEditor?: UETransferEditor;
  toRender: UERenderItem;
  toEditor?: UETransferEditor;
  type2?: UEDragType2;
  service: UEService;
}) {
  const { fromParent, toParent, fromRender, toRender, type2, service } = p;

  let { fromEditor, toEditor } = p;
  if (!fromEditor) fromEditor = fromRender?.editor;
  if (!toEditor) toEditor = toRender?.editor;

  if (fromRender?.props[UECanNotMoveProps] || (fromRender?.attrs && fromRender?.attrs[UECanNotMoveProps])) {
    return false;
  }

  if (fromEditor) {
    if (fromEditor.draggable === false) return false;
    if (fromEditor.moving && !fromEditor.moving({ fromParent, toParent, fromRender, fromEditor, toRender, toEditor, type2, service })) {
      return false;
    }
  }

  if (fromParent?.editor) {
    const pEditor = fromParent?.editor;
    if (pEditor.movingChild && !pEditor.movingChild({ fromParent, toParent, fromRender, fromEditor, toRender, toEditor, service })) {
      return false;
    }
  }

  if (toParent?.editor) {
    const pEditor = toParent?.editor;
    if (pEditor.contenting && !pEditor.contenting({ fromParent, toParent, fromRender, fromEditor, toRender, toEditor, service })) {
      return false;
    }
  }
  return true;
}

/**
 * 生成并获取模板内容
 * @param tmpl 
 */
function _makeTempalte(tmpl: UETemplate): UERenderItem {
  let json: any = tmpl.json;
  if (json) {
    if (_.isString(json)) {
      json = tmpl.json = JSON.parse(json);
    }
  } else if (tmpl.template) {
    json = tmpl.json = UECompiler.htmlToRender(tmpl.template);
  }
  if (_.isArray(json)) {
    json = tmpl.json = _.first(json);
  }
  return _.cloneDeep(json) || {};
}