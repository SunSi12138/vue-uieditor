
## 开发文档


### options 

```ts
export interface UEOption
```

- vue-uieditor 组件参数

```html
<vue-uieditor :options="options" />
<vue-uieditor-render :options="options" />
```

#### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| mixins  | 数组 | [] | vue 组合，扩展到组件内部，如：组件、指令或方法等 |
| transfer  | UETransfer | {} | 转换器，定义json的渲染行为 和 定义组件在编辑时的行为属性 |
| templates  | UETemplate | [] | 设置模板到编辑器左边树 |
