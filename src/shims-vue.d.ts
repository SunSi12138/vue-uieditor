declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare const layui: {
  $: JQueryStatic;
  form: any;
  [key: string]: any;
};

