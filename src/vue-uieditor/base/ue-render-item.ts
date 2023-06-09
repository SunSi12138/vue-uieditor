import { UETransferEditor, UETransferEditorAttrs, UETransferEditorAttrsItem, UEObject } from './ue-base';

export interface UERenderItem {
    /** 标签类型 */
    type?: string;
    /** 属性 */
    props?: any;
    /** 子节点 */
    children?: (UERenderItem | string)[];
    /** 是否创建此节点，默认为 true */
    isRender?: boolean;
    /** 获取父节点 */
    parent?(): UERenderItem;
    content?: string;
    /** 编辑时的ID */
    readonly editorId?: string;
    /** 编辑时的 parent ID */
    readonly editorPId?: string;
    /** 编辑器组件配置 */
    readonly editor?: UETransferEditor;
    /**
     * 存放临时内容
     */
    readonly temp?: UEObject;
    /** 编辑器组件属性配置 */
    readonly attrs?: UETransferEditorAttrs;
    /** 编辑器设计时使用 */
    'editor-attrs'?: any;
}