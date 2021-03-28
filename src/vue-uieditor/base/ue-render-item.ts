import { UETransferEditor, UETransferEditorAttrs, UETransferEditorAttrsItem } from './ue-base';

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
    /** 编辑时的ID */
    readonly editorId?: string;
    /** 编辑时的 parent ID */
    readonly editorPId?: string;
    /** 编辑器组件配置 */
    readonly editor?: UETransferEditor;
    /** 编辑器组件属性配置 */
    readonly attrs?: UETransferEditorAttrs;
}