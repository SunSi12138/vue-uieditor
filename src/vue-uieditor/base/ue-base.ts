import _ from "lodash";
import Vue from 'vue';
import { UEContextmenuItem } from "./ue-contextmenu-item";
import { UEHelper } from "./ue-helper";
import { UERenderItem } from "./ue-render-item";
import { UEService } from "./ue-service";
import { UEVueMixin } from "./vue-extends";

export type UEObject = { [key: string]: any };

export interface UEOption {
  /** vue 组合，扩展 meta 内容，如果组件、指令等 */
  mixins?: UEVueMixin[];
  /** render 转换器 */
  transfer?: UETransfer;
  /** 编辑器设置 */
  editor?: { [type: string]: UETransferEditor };
  /** render 转换 之前 */
  transferBefore?: (render: UERenderItem, extend?: UETransferExtend, isEditing?: boolean) => UERenderItem;
  /** render 转换 之后 */
  transferAfter?: (render: UERenderItem, extend?: UETransferExtend, isEditing?: boolean) => UERenderItem;
  theme?: any;
  /** 扩展代码编辑器代码声明 */
  extraLib?(): Promise<string>;
  /** 选中组件的添加快捷菜单 */
  contextmenus?(p: { render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[];
  /** 添加全局变量，object对象 */
  global?: any;
}

export type UETransferExtend = {
  /** 初始化vue data 数据 */
  data?: UEObject;
  /** 编辑中 */
  editing?: boolean;
  editor?: UETransferEditor;
  /** 当前 render */
  readonly render?: UERenderItem;
  global?: any;
  readonly option?: UEOption;
  /**
   * 添加 mixin
   * @param mixin 
   * @param before 
   */
  addMixin(mixin: UEVueMixin, before?: boolean);
  /**
   * 设置prop内容
   * @param name 
   * @param content 
   */
  setProp(name: string, content: RenderProp): RenderProp;
  /**
   * 获取prop内容
   * @param name 
   * @param remove 获取后是否删除
   */
  getProp(name: string, remove?: boolean): RenderProp;
  /**
   * 删除属性
   * @param name 
   */
  removeProp(name: string): void;
  /**
   * 获取prop值
   * @param name 
   * @param remove  获取后是否删除
   */
  getPropValue(name: string, remove?: boolean): any;
  setPropValue(name: string, content: RenderProp): any;
  /**
   * 获取prop text内容，如果bind返回 {{text}}
   * @param name 
   * @param remove  获取后是否删除
   */
  getPropText(name: string, defaultValue?: any, remove?: boolean): any;
  /**
   * 向上查找节点，包括自己
   * @param find 查找条件，默认上一级节点 
   */
  closest(find: (render: UERenderItem) => boolean): UERenderItem;
  /**
   * 在当前render环境，执行内容，返回方法名称(调用: $this['方法名称']())
   * @param content 脚本内容
   * @param once 只执行一次
   * @param isEval 是否马上执行
   * @param owner 将方法定义到owner, 默认 $this
   */
  makeEval(content: string, once?: boolean, isEval?: boolean, owner?: string): string;
}

type RenderProp = {
  bind?: boolean;
  has?: boolean;
  event?: boolean;
  name: string;
  value?: any;
};


export interface UETransferEditorAttrsItem {
  /** 名称 */
  name?: string;
  /** 显示名称 */
  text?: string;
  /** 默认值 */
  value?: any;
  /** transferAttr 时用, 编辑时代替value，但产出时不使用此内容，保证组件基本效果和防止使用value时出错*/
  transferValue?: any;
  /** value 的高级编辑时使用，如果没有读取 value 内容 */
  editValue?: string | { get(): any; set(val: any): void; };
  placeholder?: string;
  /** 描述 */
  desc?: string;
  /** 声明 */
  declare?: string;
  /** 代码编辑器语言，javascript, typescript, ts, css */
  language?: string;
  /** 分组 */
  group?: string;
  /** 分组顺序，同组第一个为准 */
  groupOrder?: number;
  /** 顺序 */
  order?: number;
  /** 是否显示属性，默认：false */
  hide?: boolean;
  /** 是否事件，默认：false */
  event?: boolean;
  /** 是否在编辑时生效，默认：false */
  effect?: boolean;
  /** 只使用于 editor */
  editorOlny?: boolean;
  /** 显示类型，默认：text，custom为自定义（弹出对话框） */
  type?: 'text' | 'slider' | 'textarea' | 'select' | 'radiogroup' | 'select-only' | 'boolean' | 'icon' | 'custom' | 'meta_paths' | 'meta_modules';
  /** 数据源, string[] | {text:string;value:string;} */
  datas?: any[] | ((p: { attr: UETransferEditorAttrsItem; attrs: UETransferEditorAttrs; service: UEService }) => any[]);
  /** 验证器名称 */
  validator?: string;
  /** 当前值项 */
  current?: string;
  /** 是否为bind属性 */
  bind?: boolean;
  /** 编辑是否使用bind，默认: false */
  editorBind?: boolean;
  /** 是否支持 codeEditor, 不是全部属性支持，默认为: true */
  codeEditor?: boolean;
  /** 是否允许编辑bind属性, 默认 false */
  enabledBind?: boolean;
  /** 内容是不增加 export default */
  exportDefault?: boolean;
  /** 是否默认vue-def 内容，只在vue-def使用, 默认：false */
  isVueDef?: boolean;
  /** 点击时处理，返回false中断，type为custom时生效 */
  click?(attr: UETransferEditorAttrsItem, service: UEService): Promise<boolean> | boolean;
  /** 改变时处理，返回false中断 */
  change?(attr: UETransferEditorAttrsItem, service: UEService): Promise<boolean> | boolean;
}

export interface UETransferEditorAttrs {
  [key: string]: UETransferEditorAttrsItem
}


export interface UETransferEditor {
  /** 显示名称, 支持环境变量, 如:%label% */
  text?: string;
  textFormat?(editor: UETransferEditor, attrs: UETransferEditorAttrs, hasKey?: boolean): string;
  /** 名称 */
  name?: string;
  placeholder?: string;
  icon?: string;
  /** 分组 */
  group?: string;
  /** 分组顺序 */
  groupOrder?: number;
  /** 是否容器组件，默认为 false */
  container?: boolean;
  /** 是否基础组件，编辑时作为独立组件，内容不能拖动，默认：true */
  base?: boolean;
  /** 空组件（显示），编辑使用div代替显示 */
  empty?: string;
  /** 是否可以收起 */
  collapse?: boolean;
  /** 设计时v-model生效 */
  editUseModel?: boolean;
  /** 选择框添加样式 */
  className?: string | ((p: { render: UERenderItem, editor: UETransferEditor, attrs: UETransferEditorAttrs }) => string);
  /** 是否可以拖动或选中（编辑），默认：true */
  draggable?: boolean;
  hide?: boolean;
  /** 排序，默认：99 */
  order?: number;
  /** 编辑时render内容 */
  render?: UERenderItem;
  /** 复制 */
  coping?: (p: { render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }) => boolean;
  /** 处理是否可以插入组件到内容 */
  contenting?: (p: { dragContent: UERenderItem; dragEditor: UETransferEditor; service: UEService; }) => boolean;
  /** 拖动时处理，返回true|false，决定是否可以拖动到目标 */
  moving?: (p: {
    /** 容器render(父层) */
    dragContent: UERenderItem;
    /** 本render的editort */
    dragEditor: UETransferEditor;
    service: UEService;
  }) => boolean;
  movingChild?: (p: {
    /** 容器render(父层) */
    dragContent: UERenderItem;
    /** 本render的editort */
    dragEditor: UETransferEditor; service: UEService;
  }) => boolean;
  transferAttr?: (p: { render: UERenderItem; attrs: UETransferEditorAttrs; editor: UETransferEditor; editing: boolean; service: UEService; }) => void;
  contextmenu?: (render: UERenderItem, attrs: UETransferEditorAttrs, editor: UETransferEditor, service: UEService) => any[];
  /** 是否有placeholder属性， 默认为:false */
  placeholderAttr?: boolean;
  /** 是否有 disabled 属性， 默认为:false */
  disabledAttr?: boolean;
  /** 是否有 inline 属性， 默认为:true */
  inlineAttr?: boolean;
  /** 隐藏attr，如: ['class'] */
  hideAttrs?: string[];
  /** 隐藏attr group，如: ['vue'] */
  hideAttrGroups?: string[];
  /** 属性栏 */
  attrs?: UETransferEditorAttrs;
}


export interface UETransferItem {
  props?: UEObject;
  editor?: UETransferEditor;
  type?: string;
  /**
   * 渲染时转换 render, 如果返回空不渲染
   */
  transfer?: (render: UERenderItem, extend?: UETransferExtend, isEditing?: boolean) => UERenderItem;
}

export interface UETransfer {
  [key: string]: UETransferItem;
}

/**
 * 将元数据转为vue 元数据
 * @param renders 
 * @param extend 
 */
export function UEJsonToVueRender(renders: UERenderItem[], extend: UETransferExtend, hide?: boolean, isEditing?: boolean, parentRender?: UERenderItem): UERenderItem[] {

  const transfer: UETransfer = extend.option.transfer;

  let rList = [];
  let option = extend.option;
  _.forEach(renders, function (render) {
    if (render.type == 'preview-opt') {
      return;
    }

    const isStr = _.isString(render);
    let parent: any = function () { return parentRender; };
    isStr || (render.parent = parent);

    (extend as any).render = render;
    extend.editor = render['editor'];
    if (extend.editing) {
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

    render = option.transferBefore(render, extend, isEditing);
    if (!render || render.isComponent === false) return;
    isStr || (render.parent = parent);
    (extend as any).render = render;
    if (hide === true) {
      let editHide = _.get(render, 'editor-attrs.editor_cp_hide') == 'true';
      if (editHide) return;
    }

    // let type = render.type;
    let trans = transfer[render.type];
    if (trans) {
      if (trans.props)
        render.props = _.assign({}, trans.props, render.props);
      if (trans.type) render.type = trans.type;
      if (trans.transfer) {
        render = trans.transfer(render, extend, isEditing);
        if (!render || render.isComponent === false) return;
        isStr || (render.parent = parent);
        (extend as any).render = render;
      }
    }

    (extend as any).render = render;
    render = option.transferAfter(render, extend, isEditing);
    if (!render || render.isComponent === false) return;
    isStr || (render.parent = parent);
    (extend as any).render = render;

    if (!extend.editing || _.get(render, 'editor-attrs.editor_design_hide') !== 'true')
      rList.push(render);

    if (render.children && render.children.length > 0) {
      let children = render.children;
      render.children = [];
      children = UEJsonToVueRender(children as any[], extend, hide, isEditing, render);
      render.children = render.children.concat(children);
    }
    (extend as any).render = null;

  });
  (extend as any).render = null;
  return rList;

}


const _bindAttr = /^\s*[\:\@]/;
export function UEGetVueBindName(name: string): string {
  return name ? name.replace(_bindAttr, '') : '';
};
const _bindAttrEx = /^\s*\:(.*)/;
const _eventAttrEx = /^\s*\@(.*)/;
export function UEGetVueBindNameEx(name: string) {
  let isBind = _bindAttrEx.test(name);
  if (isBind) name = RegExp.$1;
  let isEvent = _eventAttrEx.test(name);
  if (isEvent) name = RegExp.$1;
  return {
    isBind, isEvent,
    name: name
  };
};

export function UEMakeExportDefault(content: string) {
  return 'export default ' + content;
}

export function UERemoveExportDefault(content: string) {
  return content && content.replace(/^[\s\r\n]*export default\s*/, '');
}

/**
 * 获取 ExtraLib 智能提示声明内容
 */
export async function UEGetExtraLib(): Promise<string> {
  const { ExtraLib } = await import('./extraLib');
  return ExtraLib;
}