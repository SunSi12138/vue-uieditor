
## 开发文档


### options: UEOption

- vue-uieditor 组件参数

```html
<vue-uieditor :options="options" />
<vue-uieditor-render :options="options" />
```

#### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| mixins  | Array | [] | vue 组合，扩展到组件内部，如：组件、指令或方法等 |
| templates  | UETemplate | [] | 设置模板到编辑器左边树 |
| transfer  | UETransfer | {} | 转换器，定义json的渲染行为 和 定义组件在编辑时的行为属性 |
| transferBefore  | Function | (render: UERenderItem, extend?: UETransferExtend) => UERenderItem | 转换器处理之前 |
| transferAfter  | Function | (render: UERenderItem, extend?: UETransferExtend) => UERenderItem | 转换器处理之后 |
| extraLib  | Function | ()=> Promise<string> | 扩展代码智能提示声明 |
| global  | Function | ()=> object | 定义全局变量 |
| babel  | Boolean | true | 是否开启 babel 在线编译（要加载babel-standalone js），默认为 true |
