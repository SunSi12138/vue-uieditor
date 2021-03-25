
export interface UERenderItem {
    /** 标签类型 */
    type?: string;
    /** 文本内容，优先使用children */
    content?: string;
    /** 属性 */
    props?: any;
    /** 子节点 */
    children?: UERenderItem[];
    /** 是否组件，如果false不创建组件 */
    isComponent?: boolean;
    /** 获取父节点 */
    parent?(): UERenderItem;
}