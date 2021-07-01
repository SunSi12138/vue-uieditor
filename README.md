# VUE 可视化编辑器(vue-uieditor)

[![image](https://img.shields.io/badge/vue-2.6.x-brightgreen.svg)](https://github.com/vuejs/vue)
[![image](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://cli.vuejs.org/zh/)


- 基于 VUE 2.x
- 在线可视化VUE开发，所见即所得
- 支持 es2015 JS 语法
- 开发结果不用二次编译，马上可以使用
- 减轻开发成本，提升项目维护效率
- 可实现低代码开发

## 相关资源

- [本工程开发环境](https://gitee.com/days2020/vue-uieditor/blob/master/doc/DEVELOP.md)

- [demo](http://days2020.gitee.io/iview-uieditor)

- [演示](http://days2020.gitee.io/iview-uieditor/#/demo)

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
import Vue from 'vue';
import VueUieditor from 'vue-uieditor';

Vue.use(VueUieditor);
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

## vue-uieditor 组件属性列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| options  | UEOption | 空 | UEOption 参数 |
| json  | JSON | 空 | json 内容 |
| tmpl  | string | 空 | html 内容 |
| theme  | UETheme | 空 | 主题 |
| on-ready  | 事件 | ({service:UEService)=>void | 编辑准备好 |
| on-change  | 事件 | ({service:UEService)=>void | 编辑内容改变 |
| on-select  | 事件 | (p)=>void; | 选择时 |
| on-add-component  | 事件 | (p)=>void; | 添加内容，如：拖入组件或模板 |
| on-change-mode  | 事件 | (p)=>void; | 当前模式改变（design, json...） |

## vue-uieditor-render 组件属性列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| options  | UEOption | 空 | UEOption 参数 |
| json  | JSON | 空 | json 内容 |
| tmpl  | string | 空 | html 内容 |
| mixin  | vue mixin | 空 | 组合 vue |
| query  | any | 空 | 可以使用$this.$query获取内容 |
| params  | any | 空 | 可以使用$this.$params获取内容 |

## \$this 对像

- 为统一和加强this对像，可以在任何脚本使用 \$this，并建议使用此对像

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
| http  | Function | ()=> object | $http或数据源method配置，[参考](http://days2020.gitee.io/iview-uieditor/#/demo?id=options_http) |
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

- 组件主题

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
| leftBar  | UESideBar | 空 | 左边工具栏（组件与模板） |
| rightBar  | UESideBar | 空 | 右边工具栏（属性） |
| about  | Function | ({ service: UEService }): string | 设置关于对话框内容 |
| contextmenus  | Function | ({ render: UERenderItem; parent: UERenderItem; editor: UETransferEditor; service: UEService; }): UEContextmenuItem[] | 选中组件的添加快捷菜单 |

## toolBar: UEToolBar

- 顶部工具栏

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
| title  | string | 空 | 标题，如有图标，用于tip |
| icon  | string | 空 | 图标 |
| divided  | boolean | false | 分离线 |
| disabled  | boolean | false | 禁用 |
| show  | boolean | false | 是否显示 |
| click  | 方法 | (e: any): void | 点击 |

## leftBar / rightBar: UESideBar

- 则边工具栏

```ts
theme: UETheme = {
  ...,
  leftBar: {
    show:true,
    filter({item}){ return item.name.indexOf('text') >= 0; }
  }
};
```

### 成员变量列表

|  名称   | 类型  | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  |
| show  | boolean | false | 是否显示 |
| filter  | 方法 | ({item,all,service}): boolean | 过滤 |

## 特殊组件属性

- 限制组件编辑行为操作属性

```ts

/** 标记为不能选择 */
const UECanNotSelectProps = 'ue-cant-select';
/** 标记为不能移动 */
const UECanNotMoveProps = 'ue-cant-move';
/** 标记为不能删除 */
const UECanNotRemoveProps = 'ue-cant-remove';
/** 标记为不能复制 */
const UECanNotCopyProps = 'ue-cant-copy';
/** 标记为不能选择子节点 */
const UECanNotSelectChildProps = 'ue-cant-select-child';
/** 标记为不能移动子节点 */
const UECanNotMoveChildProps = 'ue-cant-move-child';
/** 标记为不能删除子节点 */
const UECanNotRemoveChildProps = 'ue-cant-remove-child';
/** 标记为不能复制子节点 */
const UECanNotCopyChildProps = 'ue-cant-copy-child';
/** 标记为不能移入子节点 */
const UECanNotMoveInProps = 'ue-cant-movein';
/** 标记为不能移出子节点 */
const UECanNotMoveOutProps = 'ue-cant-moveout';
/** 标记节点是否锁定 */
const UEIsLockProps = 'ue-is-lock';
/** 标记节点是否折叠 */
const UEIsCollapseProps = 'ue-is-collapse';

```

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
| selectChild  | boolean | true |  是否可以选中子节点（编辑） |
| remove  | boolean | true |  是否可以删除（编辑） |
| removeChild  | boolean | true |  是否可以删除子节点（编辑） |
| draggable  | boolean | true |  是否可以拖动（编辑） |
| draggableChild  | boolean | true |  是否可以拖动子节点（编辑） |
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
| movingOut  | Function | (p: any) => boolean | 拖动时处理，返回true|false，决定是否可以将子节点移出本节点 |
| movingIn  | Function | (p: any) => boolean | 拖动时处理，返回true|false，决定是否可以移出入节点 |
| initAttr  | Function | (p: any) => void | 编辑时初始化render.attrs |
| transferAttr  | Function | (p: any) => void | 编辑渲染时转换 render 和 attr，转换内容会生成到JSON |
| transferAttrAfter  | Function | (p: any) => void | 编辑渲染时转换 render.attrs 到 render 之后 |
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
| type  | text, slider, slider-only, select, select-only, boolean, boolean-only, number, custom' | text | 显示类型 |
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

#### getTmpl

- 获取模板（html）

```ts
getTmpl(): string
```

#### setTmpl

- 设置模板（html）

```ts
setTmpl(html:string): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| html  | string | 是 | 空 | html模板内容 |

#### getJson

- 获取json

```ts
getJson(): string
```

#### setJson

- 设置json

```ts
getJson(json:string | object): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| json  | string, object | 是 | 空 | json内容 |

#### getScript

- 获取代码(script)

```ts
getScript(): string
```

#### setScript

- 设置代码

```ts
setScript(script:string): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| script  | string | 是 | 空 | 代码内容 |

#### getCurRender

- 获取当前选中节点

```ts
getCurRender(): UERenderItem
```

#### getRenderItem

- 获取指定ID的节点

```ts
getRenderItem(id: string, context?: UERenderItem): UERenderItem
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | ID |
| context  | UERenderItem | 否 | rootRender | 搜索上下文节点 |

#### getRenderByType

- 获取指定ID的节点

```ts
getRenderByType(type: string, context?: UERenderItem): UERenderItem
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| type  | string | 是 | 空 | 类型 |
| context  | UERenderItem | 否 | rootRender | 搜索上下文节点 |

#### getParentRenderItem

- 获取父节点

```ts
getParentRenderItem(render: UERenderItem, all?: boolean): UERenderItem
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| all  | UERenderItem | 否 | 是 | 是否所有内容，否则根据select设置查找父节点 |

#### getParentRenderByType

- 根据类型，获取父级节点

```ts
getParentRenderByType(render: UERenderItem, type: string): UERenderItem
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| type  | string | 是 | 空 | 类型 |

#### closest

- 向上查找节点，包涵本身

```ts
closest(render: UERenderItem, fn: (render: UERenderItem) => boolean): UERenderItem
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| fn  | (render: UERenderItem) => boolean | 是 | 空 | 搜索条件，返回true |

#### empty

- 清空内容

```ts
empty(cnf?: boolean): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| cnf  | boolean | 否 | false | 是否提示确认框 |

#### getRenderTemp

- 获取 render 的临时内容，使用于内容传送

```ts
getRenderTemp(id: string, key: string): any
getRenderTemp(render: UERenderItem, key: string): any
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | 节点ID |
| render  | UERenderItem | 是 | 空 | 节点 |
| key  | string | 是 | 空 | 内容key |

#### getRenderTemp

- 设置 render 的临时内容，使用于内容传送

```ts
setRenderTemp(id: string, key: string, value: any): any;
setRenderTemp(render: UERenderItem, key: string, value: any): any;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | 节点ID |
| render  | UERenderItem | 是 | 空 | 节点 |
| key  | string | 是 | 空 | 内容key |
| value  | any | 是 | 空 | 内容 |

#### delCur

- 删除选中节点

```ts
delCur(cnf?: boolean, norefresh?: boolean): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| cnf  | boolean | 否 | true | 是否提示确认框 |
| norefresh  | boolean | 否 | false | 是否不刷新 |

#### deleteWidget

- 删除节点

```ts
deleteWidget(parentId: string, id: string, norefresh?: boolean): void
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| parentId  | string | 是 | 空 | 父节点ID |
| id  | string | 是 | 空 | 节点ID |
| norefresh  | boolean | 否 | false | 是否不刷新 |

#### getAttr

- 获取节点属性

```ts
getAttr(id: string, key: string): UETransferEditorAttrsItem
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | 节点ID |
| key  | string | 是 | 空 | 属性key |

#### setAttr

- 设置节点属性

```ts
setAttr(id: string, attr: UETransferEditorAttrsItem, refresh?: boolean): Promise<void>
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | 节点ID |
| attr  | UETransferEditorAttrsItem | 是 | 空 | 属性内容 |
| refresh  | boolean | 否 | 是 | 是否刷新 |

#### addAttr

- 添加自定义节点属性

```ts
addAttr(id: string, key: string): UETransferEditorAttrsItem;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | 节点ID |
| key  | string | 是 | 空 | 属性key |

#### refresh

- 刷新

```ts
refresh(): Promise<any>
```

#### setCurrent

- 设置（选中）当前节点

```ts
setCurrent(render: UERenderItem): any;
setCurrent(id: string): any;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| id  | string | 是 | 空 | 节点ID |
| render  | render | 是 | 空 | 节点 |

#### addByType

- 在指定节点添加（插入）新内容（根据类型）

```ts
addByType(type: string, renderId: string, type2: UEDragType2): Promise<void>;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| type  | string | 是 | 空 | 节点类型，如：uieditor-div |
| renderId  | string | 是 | 空 | 节点Id |
| type2  | in, before, after | 是 | 空 | 位置 |

#### addByJson

- 在指定节点添加（插入）新内容（根据json内容）

```ts
addByJson(json: any, renderId: string, type2: UEDragType2): Promise<void>;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| json  | string, object | 是 | 空 | json内容 |
| renderId  | string | 是 | 空 | 节点Id |
| type2  | in, before, after | 是 | 空 | 位置 |

#### addByTmpl

- 在指定节点添加（插入）新内容（根据模板html内容）

```ts
addByTmpl(template: string, renderId: string, type2: UEDragType2): Promise<void>;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| template  | string | 是 | 空 | 模板html内容 |
| renderId  | string | 是 | 空 | 节点Id |
| type2  | in, before, after | 是 | 空 | 位置 |

#### isLocked

- 节点是否锁定

```ts
isLocked(render: UERenderItem): boolean;
isLocked(id: string): boolean;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |

#### locked

- 锁定节点

```ts
locked(render: UERenderItem, locked: boolean): Promise<any>;
locked(id: string, locked: boolean): Promise<any>;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |
| locked  | boolean | 是 | 空 | 是否锁定 |

#### isCollapse

- 是否折叠节点

```ts
isCollapse(render: UERenderItem): boolean;
isCollapse(id: string): boolean;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |

#### collapse

- 折叠节点

```ts
collapse(render: UERenderItem, isCollapse: boolean): Promise<any>;
collapse(id: string, isCollapse: boolean): Promise<any>;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |
| isCollapse  | boolean | 是 | 空 | 是否折叠 |

#### canRemove

- 是否可以删除

```ts
canRemove(render: UERenderItem): boolean;
canRemove(id: string): boolean;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |

#### canCopy

- 是否可以复制

```ts
canCopy(render: UERenderItem): boolean;
canCopy(id: string): boolean;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |

#### canSelect

- 是否可以选中

```ts
canSelect(render: UERenderItem): boolean;
canSelect(id: string): boolean;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| render  | UERenderItem | 是 | 空 | 节点 |
| id  | string | 是 | 空 | 节点Id |

#### canMove

- 是否可以移动

```ts
canMove(fromId: string, toId: string, type2: UEDragType2): boolean;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| fromId  | string | 是 | 空 | 要移动节点Id |
| toId  | string | 是 | 空 | 移动到节点Id |
| type2  | in, before, after | 是 | 空 | 位置 |

#### move

- 移动节点

```ts
move(fromId: string, toId: string, type2: string): Promise<any>;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| fromId  | string | 是 | 空 | 要移动节点Id |
| toId  | string | 是 | 空 | 移动到节点Id |
| type2  | in, before, after | 是 | 空 | 位置 |

#### copyCur

- 复制当前节点

```ts
copyCur(): void;
```

#### copyCurToNext

- 复制当前节点到后面位置

```ts
copyCurToNext(): void;
```

#### cutCur

- 剪切当前节点

```ts
cutCur(): void;
```

#### pasteCur

- 粘贴当前节点

```ts
pasteCur(pos?: 'before' | 'after' | 'child', keepCur?: boolean, currentId?: string, focus?: boolean): void;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| pos  | before, after, child | 否 | 空 | 位置 |
| keepCur  | boolean | 否 | 空 | 保留当前节点 |
| currentId  | string | 否 | 空 | 当前节点 |
| focus  | boolean | 否 | 空 | 粘贴后选中 |


## export class UERender

- UERender 常用方法

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

### 函数列表

#### AddGlobalTemplates

- 添加公共模板

```ts
static AddGlobalTemplates(templates: UETemplate[]): void;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| templates  | UETemplate[] | 是 | 空 | 模板内容 |

#### AddGlobalTransfer

- 添加公共 transfer

```ts
static AddGlobalTransfer(...transfers: UETransfer[]): void;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| transfers  | UETemplate[] | 是 | 空 | transfer |

#### DefineOption

- 定义 options

```ts
static DefineOption(options: UEOption): UEOption;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| options  | UEOption | 是 | 空 | 参数 |

#### DefineTransfer

- 定义 transfer

```ts
static DefineTransfer(transfer: UETransfer): UETransfer;
```

##### 参数

|  名称   | 类型  | 是否必选 | 默认值 | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| transfer  | UETransfer | 是 | 空 | transfer |
