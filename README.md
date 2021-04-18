# vue-uieditor

## 本项目开发环境

### 安装环境

```
yarn install
```

### 启动开发环境
```
npm run dev
```

### 发布web到 ./dist
```
npm run build
```

### 发布lib到 ./lib， 发布结果可以直接发布到npm服务器，或在html使用script引用
```
npm run lib
```

### Run your unit tests
```
yarn test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## lib 安装与使用

### 安装vue-uieditor

```
yarn install vue-uieditor
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

### 代码引用 vue-uieditor，或使用正规方式代码import

```ts
import 'vue-uieditor';
```

### 或使用正规方式代码import

```ts
import { UERender } from 'vue-uieditor';

UERender.AddGlobalTransfer(IViewTransfer);
```


