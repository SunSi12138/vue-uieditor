# vue-uieditor

## 本项目开发环境

- [DEVELOP](https://gitee.com/days2020/vue-uieditor/blob/master/doc/DEVELOP.md)

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


