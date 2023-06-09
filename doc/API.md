
## 开发文档

### options: UEOption

- vue-uieditor 组件参数

```html
<vue-uieditor :options="options" />
<vue-uieditor-render :options="options" />
```

```ts
options: UEOption = UERender.DefineOption({
  mixins:[{
    data(){
      return {
        text:'hello'
      };
    },
    created(){

    }
  }],
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
    ],
    async extraLib(){
      return `const text:string;`
    },
    global(){
      return {
        _:lodash
      };
    },
    transfer:UERender.DefineTransfer({
      'uieditor-div': {
        "editor": {
          text: 'Div 块级标签',
          order: 0,
          groupOrder:0,
          group:'公用组件库/基础组件',
          icon: 'layui-icon layui-icon-template-1',
          container: true
        }
      }
    })
});
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
options: UEOption = UERender.DefineOption({
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
});
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

### theme: UETheme

- vue-uieditor 组件主题

```html
<vue-uieditor :theme="theme" />
```

```ts
theme: UETheme = {
  modes: ["json", "script", "tmpl"],
  toolBar: [
    {
      title: "测试",
      click: ({ service }) => {
        this.json = service.getJson();
        console.log('json', JSON.stringify(json));
      },
    }
  ],
  contextmenus({ render, service }) {
    return [
      {
        title: "测 试",
        disabled: !render,
        click: (item) => {
          console.log(
            JSON.stringify(service.getJson(false, render) || {});
          );
        },
      },
    ];
  }
};
```

#### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| modes  | Array | ['json', 'script', 'tmpl] | 编辑器可用模式：'json' | 'script' | 'tmpl |
| toolBar  | UEToolBar[] | [] | 设置顶部工具栏 |
| about  | Function | ({ service: UEService }): string | 设置关于对话框内容 |
| contextmenus  | Function | ({ render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[] | 选中组件的添加快捷菜单 |

### toolBar: UEToolBar

- vue-uieditor 组件顶部工具栏

```ts
theme: UETheme = {
  ...,
  toolBar: [
    {
      title: "测试",
      click: ({ service }) => {
        this.json = service.getJson();
        console.log('json', JSON.stringify(json));
      },
    }
  ]
};
```

#### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| modes  | Array | ['json', 'script', 'tmpl] | 编辑器可用模式：'json' | 'script' | 'tmpl |
| toolBar  | UEToolBar[] | [] | 设置顶部工具栏 |
| about  | Function | ({ service: UEService }): string | 设置关于对话框内容 |
| contextmenus  | Function | ({ render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[] | 选中组件的添加快捷菜单 |

### transfer: UETransfer

- 转换器，定义json的渲染行为 和 定义组件在编辑时的行为属性

```ts
options: UEOption = UERender.DefineOption({
    ...,
    transfer:UERender.DefineTransfer({
      'uieditor-div': {
        "editor": {
          text: 'Div 块级标签',
          order: 0,
          groupOrder:0,
          group:'公用组件库/基础组件',
          icon: 'layui-icon layui-icon-template-1',
          container: true
        }
      }
    })
});
```


#### UETransferItem 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| type  | string | 空 | 组件名称 |
| editor  | UETransferEditor | 空 | 组件编辑时属性与行为特性 |
| transfer  | Function | (render: UERenderItem, extend?: UETransferExtend): UERenderItem | 渲染时转换 render, 如果返回空不渲染 |


### editor: UETransferEditor

- 组件编辑时属性与行为特性

```ts
options: UEOption = UERender.DefineOption({
    ...,
    transfer:UERender.DefineTransfer({
      'uieditor-div': {
        "editor": {
          text: 'Div 块级标签',
          order: 0,
          groupOrder:0,
          group:'公用组件库/基础组件',
          icon: 'layui-icon layui-icon-template-1',
          container: true
        }
      }
    })
});
```


#### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| type  | string | 空 | 组件名称 |
| editor  | UETransferEditor | 空 | 组件编辑时属性与行为特性 |
| transfer  | Function | (render: UERenderItem, extend?: UETransferExtend): UERenderItem | 渲染时转换 render, 如果返回空不渲染 |
