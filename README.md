# VUE 可视化编辑器(vue-uieditor)

- 基于 VUE 2.x
- 在线可视化VUE开发，所见即所得
- 支持 es2015 JS 语法
- 开发结果不用二次编译，马上可以使用
- 减轻开发成本，提升项目维护效率
- 可实现低代码开发

## 相关文档

- [本工程开发环境](https://gitee.com/days2020/vue-uieditor/blob/master/doc/DEVELOP.md)

- [开发文档](https://gitee.com/days2020/vue-uieditor/blob/master/doc/API.md)

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


