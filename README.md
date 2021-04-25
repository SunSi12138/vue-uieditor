# VUE 可视化编辑器(vue-uieditor)

- 基于 VUE 2.x
- 在线可视化VUE开发，所见即所得
- 支持 es2015 JS 语法
- 开发结果不用二次编译，马上可以使用
- 减轻开发成本，提升项目维护效率
- 可实现低代码开发

## 相关资源

- [本工程开发环境](https://gitee.com/days2020/vue-uieditor/blob/master/doc/DEVELOP.md)

- 演示

## 安装与使用

### 安装

```
yarn add vue-uieditor
```

### vue-uieditor资源加载，使用 webpack copy

```ts

config.plugin('copy-vue-uieditor-assets').use(CopyWebpackPlugin, [
  [{
    from: './node_modules/vue-uieditor/vue-uieditor',
    to: './vue-uieditor/'
  }]
]);

```

### 引用 vue-uieditor

```ts
import 'vue-uieditor';
```

### 使用编辑器组件

```html
<vue-uieditor :options="options" :json="json" :theme="theme" />
```


### 使用宣染组件

- 宣染组件：将编辑器组件的JSON渲染到页面上
- options 和 json 与编辑器组件一般是一致的

```html
<vue-uieditor-render :options="options" :json="json" />
```


# 开发文档（API）

## options: UEOption

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

### 成员变量列表

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

## templates: UETemplate

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

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| title  | string | 空 | 标题 |
| icon  | string | 空 | 图标 |
| group  | string | 空 | 分组 |
| groupOrder  | number | 空 | 分组顺序，同分组的第一个groupOrder生效 |
| json  | string 或 object | 空 | json 模板，可以json字串或json对像 |
| template  | string | 空 | html 模板，如果有json内容，优先使用json内容 |
| moving  | Function | (p: any) => boolean | 拖动时处理，返回true|false，决定是否可以拖动到目标 |

## theme: UETheme

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

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| modes  | Array | ['json', 'script', 'tmpl] | 编辑器可用模式：json, script, tmpl |
| toolBar  | UEToolBar[] | [] | 设置顶部工具栏 |
| about  | Function | ({ service: UEService }): string | 设置关于对话框内容 |
| contextmenus  | Function | ({ render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[] | 选中组件的添加快捷菜单 |

## toolBar: UEToolBar

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

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| modes  | Array | ['json', 'script', 'tmpl] | 编辑器可用模式：json, script, tmpl |
| toolBar  | UEToolBar[] | [] | 设置顶部工具栏 |
| about  | Function | ({ service: UEService }): string | 设置关于对话框内容 |
| contextmenus  | Function | ({ render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[] | 选中组件的添加快捷菜单 |

## transfer: UETransfer

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


### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| type  | string | 空 | 组件名称 |
| editor  | UETransferEditor | 空 | 组件编辑时属性与行为特性 |
| transfer  | Function | (render: UERenderItem, extend?: UETransferExtend): UERenderItem | 渲染时转换 render, 如果返回空不渲染 |


## editor: UETransferEditor

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

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| text  | string | ((p: { editor: UETransferEditor, attrs: UETransferEditorAttrs }) => string) | 空 | 显示名称, 支持属性变量, 如:%label% |
| defaultText  | string | 空 | 如果text为空时默认内容 |
| icon  | string | 空 | 图标 |
| json  | string | 空 | 默认JSON模板内容 |
| template  | string | 空 | 默认HTML模板内容 |
| order  | number | 99 | 排序 |
| group  | string | 空 | 分组，可用"/"实现分组层级，如：基础库/基础组件 |
| groupOrder  | number | 99 | 分组排序 |
| base  | boolean | true | 是否基础组件，编辑时作为独立组件，子孙节点不能选中等操作 |
| container  | boolean | false | 是否容器，如：div |
| containerBorder  | boolean | false | 是否显示容器边框，方便编辑时定位 |
| controlLeft  | boolean | true | 是否在容器左边留空方便选择，容器时默认为 true |
| empty  | string | 空 | 编辑时使用黑块代替组件显示，处理大型组件占用性能 |
| collapse  | boolean | true |  是否可以收起，容器时默认为 true |
| select  | boolean | true |  是否可以选中（编辑） |
| draggable  | boolean | true |  是否可以拖动（编辑） |
| showInTree  | boolean | true |  是否显示在组件树 |
| show  | boolean | true |  是否显示 |
| inline  | boolean | true |  编辑时是否强制显示为inline |
| className  | string | 空 |  编辑时临时添加样式 |
| placeholderAttr  | boolean | false |  组件是否有placeholder属性 |
| disabledAttr  | boolean | false |  组件是否有 disabled 属性 |
| hideAttrs  | string[] | [] |  隐藏已有属性attr，如: ['class'] |
| hideAttrGroups  | string[] | [] |  隐藏已有属性分组 |
| attrs  | UETransferEditorAttrs | 空 | 设置组件属性栏 |
| coping  | Function | (p: { render: UERenderItem; parent: UERenderItem; service: UEService; }) => boolean | 处理是否可以复制，并可以处理复制内容 |
| contenting  | Function | (p: any) => boolean | 是否可以拖动组件为子节点，容器时才会生产 |
| moving  | Function | (p: any) => boolean | 拖动时处理，返回true|false，决定是否可以拖动到目标 |
| movingChild  | Function | (p: any) => boolean | 拖动时处理，返回true|false，决定是否可以移动子节点 |
| transferAttr  | Function | (p: any) => void | 编辑渲染时转换 render 和 attr，转换内容会生成到JSON |
| contextmenu  | Function | (p: any) => void | 选中对像的快捷菜单 |
| toolbar  | Function | (p: any) => void | 选中对像的工具栏 |

## attrs: UETransferEditorAttrs

- 组件编辑时属性与行为特性

```ts
options: UEOption = UERender.DefineOption({
    ...,
    transfer:UERender.DefineTransfer({
      'uieditor-img': {
        "editor": {
          text: "Image 图片",
          order: 2,
          groupOrder:0,
          group:'公用组件库/基础组件',
          icon: 'layui-icon layui-icon-picture',
          inline: true,
          attrs: {
            src: {
              order: 0,
              value: './vue-uieditor/assets/images/demo.png',
              effect: true,
            },
            style: { value: 'min-width:30px;min-height:30px' }
          }
        }
      }
    })
});
```

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| text  | string | 空 | 显示名称 |
| value  | any | 空 | 默认值 |
| demoValue  | any | 空 | 编辑时代替value，保证组件编辑时的显示效果和防止使用value时出错 |
| editValue  | any | 空 | 进入高级代码编写时，使用些属性代替 value 属性 |
| desc  | string | 空 | 描述说明 |
| codeBtn  | boolean | true | 是否默认代码编辑按钮 |
| language  | string | javascript | 代码编辑语言，如：javascript,html |
| row  | boolean | false | 是否占一行 |
| group  | string | 空 | 分组 |
| groupOrder  | number | 99 | 分组顺序，同组第一个为准 |
| order  | number | 99 | 顺序 |
| show  | boolean | true | 是否显示属性 |
| event  | boolean | false | 是否事件 |
| vue  | boolean | false | 是否vue属性 |
| effect  | boolean | false | 是否在编辑时生效 |
| editorOlny  | boolean | false | 此属性只使用于编辑器，即最终结果没有此属性 |
| type  | text, slider, select, select-only, boolean, boolean-only, number, custom' | text | 显示类型 |
| typeOption  | any | 空 | 显示类型的参数，如：type为'slider'时，typeOption={min:1,max:24} |
| datas  | string[] | 空 | 显示类型数据源，如：type为'select'时，datas=['small', 'large'] |
| bind  | boolean | false | 是否为bind属性 |
| enabledBind  | boolean | false | 是否允许修改bind属性 |
| editorBind  | boolean | false | 编辑是否使用bind，编辑开此项容易报错 |
| change  | Function | (attr: UETransferEditorAttrsItem, service: UEService) => boolean | 改变时处理，返回false中断 |


## service: UEService

- 组件编辑时属性与行为特性

```ts
options: UEOption = UERender.DefineOption({
    ...,
    transfer:UERender.DefineTransfer({
      'uieditor-div': {
        "editor": {
          text: "Div",
          order: 2,
          groupOrder:0,
          group:'公用组件库/基础组件',
          icon: 'layui-icon layui-icon-picture',
          inline: true,
          transferAttr({ service }) {
            console.log('service', service.getJson())
          }
      }
    })
});
```

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| $uieditor  | Vue | 空 | 获取当前编辑组件 |
| options  | UEOption | 空 | 获取当前options |
| history  | object | 空 | 获取历史记录信息 |
| current  | object | 空 | 获取当前信息，如果选中id等 |
| rootRender  | object | 空 | 获取当前JSON root |

### 成员函数列表

#### setModeUI

- 设置当前模式

```ts
setModeUI(mode: UEMode): void;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| mode  | design, json, script, tmpl, preview | 是 | design | 模式 |

#### showMonacoEditorOther

- 显示代码编辑器

```ts
showMonacoEditorOther(option: MonacoEditorContext): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| option  | MonacoEditorContext | 是 | 空 | 选项 |
