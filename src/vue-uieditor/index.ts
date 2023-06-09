// 导入颜色选择器组件
// import vueUieditor from "./vue-uieditor.component.vue";

import { UEBaseComponents } from './components/base.component';
import { UieditorDSDirective } from './directives/vue-uieditor-ds.directive';

export * from './base/ue-base';
export * from './base/ue-compiler';
export * from './base/ue-contextmenu-item';
export * from './base/ue-helper';
export * from './base/ue-render';
export * from './base/ue-render-item';
export * from './base/vue-extends';



// 存储组件列表
const components: any = {
  ...UEBaseComponents,
  'vue-uieditor': () => import(/* webpackChunkName: "vue_uieditor_cp" */ './vue-uieditor.component.vue'),
  'uieditor-monaco-editor': () => import(/* webpackChunkName: "vue_uieditor_cp" */ './components/uieditor-monaco-editor.component.vue'),
  'vue-uieditor-render': () => import(/* webpackChunkName: "vue_uieditor_render_cp" */ './vue-uieditor-render.component.vue')
};


const directives = {
  "uieditor-ds": UieditorDSDirective,
};

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install: any = function (Vue: any) {
  // 判断是否安装
  if (install.installed) return;

  Object.keys(components).forEach(function (name) {
    Vue.component(name, components[name]);
  });

  Object.keys(directives).forEach(function (name) {
    Vue.directive(name, directives[name]);
  });

  // 遍历注册全局组件
  // components.forEach(component => {
  //   Vue.component(component.name, component)
  // });
};
// 判断是否是直接引入文件
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export const VueUieditor = {
  // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
  install,
  // 以下是具体的组件列表
  components
};

export default VueUieditor;
