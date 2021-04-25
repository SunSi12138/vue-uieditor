import { UEContextmenuItem } from "./ue-contextmenu-item";
import { UERenderItem } from "./ue-render-item";
import { UEService } from "./ue-service";
import { UEVueMixin } from "./vue-extends";
import _ from 'lodash';

export type UEObject = { [key: string]: any };

export interface UEOption {
  /** vue 组合，扩展到组件内部，如：组件、指令或方法等 */
  mixins?: UEVueMixin[];
  /** 转换器，定义json的渲染行为 和 定义组件在编辑时的行为属性 */
  transfer?: UETransfer;
  /** 设置模板到编辑器左边树 */
  templates?: UETemplate[];
  /** 编辑器设置 */
  readonly editor?: { [type: string]: UETransferEditor };
  /** 转换器处理之前 */
  transferBefore?: (render: UERenderItem, extend?: UETransferExtend) => UERenderItem;
  /** 转换器处理之后 */
  transferAfter?: (render: UERenderItem, extend?: UETransferExtend) => UERenderItem;
  /** 扩展代码智能提示声明 */
  extraLib?(): Promise<string>;
  /** 添加全局变量，object对象 */
  global?(): UEObject;
  /** 是否开启 babel 在线编译（要加载babel-standalone js），默认为 true */
  babel?: boolean;
}

export type UETransferExtend = {
  /** Vue 初始化数据 */
  data?: UEObject;
  /** 编辑中 */
  readonly editing?: boolean;
  readonly service?: UEService;
  readonly editor?: UETransferEditor;
  /** 当前 render */
  readonly render?: UERenderItem;
  /** 全局变量 */
  global?: any;
  readonly options?: UEOption;
  /**
   * 添加 mixin
   * @param mixin 
   * @param before 
   */
  extendMixin(mixin: UEVueMixin, before?: boolean);
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
}

type RenderProp = {
  bind?: boolean;
  has?: boolean;
  event?: boolean;
  name: string;
  value?: any;
};

export interface UETransferEditorAttrsItem {
  /** render属性props名称，一般与key相同，请参考transition appear事件与属性的定义 */
  readonly name?: string;
  /** 定义attr的key */
  readonly key?: string;
  /** 是否自定义属性，属性栏自定义的属性，可删除的属性 */
  readonly cust?: boolean;
  /** 显示名称 */
  text?: string;
  /** 默认值 */
  value?: any;
  /** 编辑时代替value，保证组件编辑时的显示效果和防止使用value时出错 */
  demoValue?: any;
  /** 进入高级代码编写时，使用些属性代替 value 属性 */
  editValue?: string | { get(): any; set(val: any): void; };
  /** 是否默认代码编辑按钮，默认为: true */
  codeBtn?: boolean;
  placeholder?: string;
  /** 描述 */
  desc?: string;
  /** 代码编辑器的语言，javascript, typescript, ts, css */
  language?: string;
  //是否占一行，默认为 false
  row?: boolean;
  /** 分组 */
  group?: string;
  /** 分组顺序，同组第一个为准 */
  groupOrder?: number;
  /** 顺序 */
  order?: number;
  /** 是否显示属性，默认：true */
  show?: boolean;
  /** 是否事件，默认：false */
  event?: boolean;
  /** 是否vue属性，默认：false */
  vue?: boolean;
  /** 是否在编辑时生效，默认：false */
  effect?: boolean;
  /** 此属性只使用于编辑器，即最终结果没有此属性 */
  editorOlny?: boolean;
  /** 显示类型，默认：text，custom为自定义（弹出对话框） */
  type?: 'text' | 'slider' | 'select' | 'select-only' | 'boolean' | 'boolean-only' | 'number' | 'custom';
  /** 显示类型的参数 */
  typeOption?: any;
  /** 数据源, string[] | {text:string;value:string;} */
  datas?: any[] | ((p: { attr: UETransferEditorAttrsItem; attrs: UETransferEditorAttrs; service: UEService }) => any[]);
  /** 是否为bind属性，默认为 false */
  bind?: boolean;
  /** 是否允许编辑bind属性, 默认 true */
  enabledBind?: boolean;
  /** 编辑是否使用bind，默认: false */
  editorBind?: boolean;
  /** 是否支持 codeEditor, 不是全部属性支持，默认为: true */
  codeEditor?: boolean;
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
  text?: string | ((p: { editor: UETransferEditor, attrs: UETransferEditorAttrs }) => string);
  /** 如果text为空时默认内容 */
  defaultText?: string;
  /** 格式化 text */
  textFormat?(editor: UETransferEditor, attrs: UETransferEditorAttrs): string;
  /** 名称 */
  readonly name?: string;
  placeholder?: string;
  icon?: string;
  /** 默认的模板内容(JSON) */
  json?: UERenderItem;
  /** 默认的模板内容 */
  template?: string;
  /** 排序，默认：99 */
  order?: number;
  /** 分组，可用"/"实现分组层级，如：基础库/基础组件 */
  group?: string;
  /** 分组顺序 */
  groupOrder?: number;
  /** 是否容器组件（可以插入子节点），默认为 false */
  container?: boolean;
  /** 是否显示容器边框，默认为 false */
  containerBorder?: boolean;
  /** 是否在左边留空方便控制 */
  controlLeft?: boolean;
  /** 是否基础组件，编辑时作为独立组件，内容不能拖动，默认：true */
  base?: boolean;
  /** 编辑时使用div代替显示 */
  empty?: string;
  /** 是否可以收起，容器时默认为 true */
  collapse?: boolean;
  /** 编辑时临时添加样式 */
  className?: string | ((p: { render: UERenderItem, editor: UETransferEditor, attrs: UETransferEditorAttrs }) => string);
  /** 是否可以选中（编辑），默认：true */
  select?: boolean;
  /** 是否可以拖动（编辑），默认：true */
  draggable?: boolean;
  /** 是否显示在组件树，默认为 true */
  showInTree?: boolean;
  /** 编辑时是否显示 */
  show?: boolean;
  /** 编辑时是否强制显示为inline */
  inline?: boolean;
  /** 是否有placeholder属性， 默认为:false */
  placeholderAttr?: boolean;
  /** 是否有 disabled 属性， 默认为:false */
  disabledAttr?: boolean;
  /** 处理是否可以复制 */
  coping?: (p: { render: UERenderItem; parent: UERenderItem; service: UEService; }) => boolean;
  /** 是否可以拖动组件为子节点，容器时才会生产 */
  contenting?: (p: {
    /** 当前render(父层) */
    fromRender: UERenderItem;
    /** 移动到 render */
    toRender: UERenderItem;
    /** 当前render的editort */
    fromEditor: UETransferEditor;
    /** 移动到 render 的editort*/
    toEditor: UETransferEditor;
    /** 容器render(父层) */
    fromParent: UERenderItem;
    /** 容器render(父层) */
    toParent: UERenderItem;
    service: UEService;
  }) => boolean;
  /** 拖动时处理，返回true|false，决定是否可以拖动到目标 */
  moving?: (p: {
    /** 当前render(父层) */
    fromRender: UERenderItem;
    /** 移动到 render */
    toRender: UERenderItem;
    /** 当前render的editort */
    fromEditor: UETransferEditor;
    /** 移动到 render 的editort*/
    toEditor: UETransferEditor;
    /** 容器render(父层) */
    fromParent: UERenderItem;
    /** 容器render(父层) */
    toParent: UERenderItem;
    type2?: UEDragType2;
    service: UEService;
  }) => boolean;
  /** 是否可以移动子节点 */
  movingChild?: (p: {
    /** 当前render(父层) */
    fromRender: UERenderItem;
    /** 移动到 render */
    toRender: UERenderItem;
    /** 当前render的editort */
    fromEditor: UETransferEditor;
    /** 移动到 render 的editort*/
    toEditor: UETransferEditor;
    /** 容器render(父层) */
    fromParent: UERenderItem;
    /** 容器render(父层) */
    toParent: UERenderItem;
    service: UEService;
  }) => boolean;
  /**
   * 编辑渲染时转换 render 和 attr
   */
  transferAttr?: (p: { render: UERenderItem; attrs: UETransferEditorAttrs; editor: UETransferEditor; editing: boolean; service: UEService; }) => void;
  /**
   * 选中对像的快捷菜单
   */
  contextmenu?: (p: { render: UERenderItem; attrs: UETransferEditorAttrs; editor: UETransferEditor; service: UEService; }) => UEContextmenuItem[];
  /**
   * 选中对像的工具栏
   */
  toolbar?: (p: { render: UERenderItem; attrs: UETransferEditorAttrs; editor: UETransferEditor; service: UEService; }) => UEContextmenuItem[];
  /** 隐藏attr，如: ['class'] */
  hideAttrs?: string[];
  /** 隐藏attr group，如: ['Vue'] */
  hideAttrGroups?: string[];
  /** 属性栏 */
  attrs?: UETransferEditorAttrs;
}


export interface UETransferItem {
  /** 组件名称 */
  type?: string;
  /** 默认属性 */
  props?: UEObject;
  /** 编辑器配置 */
  editor?: UETransferEditor;
  /**
   * 渲染时转换 render, 如果返回空不渲染
   */
  transfer?: (render: UERenderItem, extend?: UETransferExtend) => UERenderItem;
}

export interface UETransfer {
  [key: string]: UETransferItem;
}

/**
 * 获取 ExtraLib 智能提示声明内容
 */
export async function UEGetExtraLib(): Promise<string> {
  const { ExtraLib } = await import('./extraLib');
  return ExtraLib;
}

export interface UETemplate {
  /**
   * 分组
   */
  group?: string;
  /**
   * 分组顺序，同分组的第一个groupOrder生效
   */
  groupOrder?: number;
  /**
   * 标题
   */
  title?: string;
  icon?: string;
  /**
   * 描述
   */
  desc?: string;
  /**
   * json 模板，可以json字串或json对像
   */
  json?: string | UEObject;
  /**
   * html 模板，如果有json内容，优先使用json内容
   */
  template?: string;
  /** 拖动时处理，返回true|false，决定是否可以拖动到目标 */
  moving?: (p: {
    /** 移动到 render */
    toRender: UERenderItem;
    /** 移动到 render 的editort*/
    toEditor: UETransferEditor;
    fromEditor: UETransferEditor;
    /** 容器render(父层) */
    toParent: UERenderItem;
    type2?: UEDragType2;
    service: UEService;
  }) => boolean;
}

export type UEThemeMode = 'json' | 'script' | 'tmpl';

export type UEMode = UEThemeMode | 'design' | 'json' | 'script' | 'tmpl' | 'preview' | 'other';


export interface UEThemeEvent {
  item: any;
  event: any;
  service: UEService;
}

export interface UEToolBar {
  title?: string;
  icon?: string;
  divided?: boolean;
  disabled?: boolean | ((e: UEThemeEvent) => boolean);
  show?: boolean | ((e: UEThemeEvent) => boolean);
  /** 点击, 返回 false 不处理默认行为 */
  click?(e: UEThemeEvent): void | boolean | Promise<void | boolean>;
}

export interface UETheme {
  /**
   * 设置关于对话框内容
   * @param p 
   */
  about?(p: { service: UEService }): string | (Promise<string>);
  /**
   * 编辑器可用模式：'json' | 'script' | 'tmpl
   */
  modes?: UEThemeMode[],
  /** 设置顶部工具栏 */
  toolBar?: UEToolBar[];
  /** 选中组件的添加快捷菜单 */
  contextmenus?(p: { render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[];
}


export type UEDragType = 'in' | 'top' | 'bottom' | 'left' | 'right';
export type UEDragType2 = 'in' | 'before' | 'after';

/** 标记为不能选择 */
export const UECanNotSelectProps = 'ue-cant-select';
/** 标记为不能移动 */
export const UECanNotMoveProps = 'ue-cant-move';
/** 标记为不能删除 */
export const UECanNotRemoveProps = 'ue-cant-remove';
/** 标记为不能复制 */
export const UECanNotCopyProps = 'ue-cant-copy';
/** 标记为不能选择子节点 */
export const UECanNotSelectChildProps = 'ue-cant-select-child';
/** 标记为不能移动子节点 */
export const UECanNotMoveChildProps = 'ue-cant-move-child';
/** 标记为不能删除子节点 */
export const UECanNotRemoveChildProps = 'ue-cant-remove-child';
/** 标记为不能复制子节点 */
export const UECanNotCopyChildProps = 'ue-cant-copy-child';
/** 标记为不能移入子节点 */
export const UECanNotMoveInProps = 'ue-cant-movein';
/** 标记为不能移出子节点 */
export const UECanNotMoveOutProps = 'ue-cant-moveout';
/** 标记节点是否锁定 */
export const UEIsLockProps = 'ue-is-lock';
/** 标记节点是否折叠 */
export const UEIsCollapseProps = 'ue-is-collapse';

const cantPropReg = /^\s*ue\-cant\-/;
const isPropReg = /^\s*ue\-is\-/;

/**
 * 删除 ue 私有特殊属性，如：ue-cant-move
 * @param props 
 */
export function UEClearPrivateProps(props) {
  if (_.size(props) == 0) return;
  _.forEach(props, function (value, key) {
    if (cantPropReg.test(key) || isPropReg.test(key)) {
      delete props[key];
    }
  });
}
/**
 * 是否不能标示属性名称
 * @param name 
 */
export function UEIsCanNotProps(name: string) {
  return cantPropReg.test(name);
}

/**
 * 是否不能操作
 * @param render 
 * @param cantName 标记名称, 如：UECanNotSelectProps
 */
export function UEIsCanNot(render, cantName: string) {
  if (!render) return false;
  if (render.props && render.props[cantName]) return true;
  const attr = render.attrs && render.attrs[cantName];
  return attr?.value;
}
