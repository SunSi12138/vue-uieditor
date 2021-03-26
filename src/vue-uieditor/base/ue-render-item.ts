
export interface UERenderItem {
    /** 标签类型 */
    type?: string;
    /** 文本内容，优先使用children */
    content?: string;
    /** 属性 */
    props?: any;
    /** 子节点 */
    children?: (UERenderItem | string)[];
    /** 是否创建此节点，默认为 true */
    isRender?: boolean;
    /** 获取父节点 */
    parent?(): UERenderItem;
}