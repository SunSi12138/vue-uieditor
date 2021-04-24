
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

### templates: UETemplate

- 设置模板到编辑器左边树

```ts
options: UEOption = {
  ...,
  templates: [
      {
        title: "JSON Object",
        group: "测试模板库/测试模板",
        json: {
          type: "uieditor-div"
        },
      },
      {
        title: "Tmpl",
        group: "测试模板库/测试模板",
        template: `<template>
	<uieditor-div>
	</uieditor-div>
</template>`,
      },
    ]
};
```

#### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| title  | string | 空 | 标题 |
| icon  | string | 空 | 图标 |
| group  | string | 空 | 分组 |
| groupOrder  | number | 空 | 分组顺序，同分组的第一个groupOrder生效 |
| json  | string 或 object | 空 | json 模板，可以json字串或json对像 |
| template  | string | 空 | html 模板，如果有json内容，优先使用json内容 |
| moving  | Function | (p: any) => boolean | 拖动时处理，返回true|false，决定是否可以拖动到目标 |
