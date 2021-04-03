<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <div class="uieditor-div">
      <vue-uieditor :options="options" :json="json" />
    </div>
  </div>
</template>
<style lang="less" scoped>
.uieditor-div {
  position: absolute;
  top: 0;
  bottom: 2px;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
<script lang="ts">
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import { UEOption } from "../vue-uieditor/base/ue-base";
import { UERender } from "../vue-uieditor/base/ue-render";
import { UERenderItem } from "../vue-uieditor/base/ue-render-item";
import {
  UEVue,
  UEVueComponent,
  UEVueLife,
} from "../vue-uieditor/base/vue-extends";
const groupOrder = 10;
const group = "测试组件库/基础组件";

@UEVueComponent({
  components: {
    HelloWorld,
  },
})
export default class Home extends UEVue {
  options: UEOption = UERender.DefineOption({
    transfer: {
      "test-text": {
        transfer(render, extend) {
          const { getPropText } = extend;
          render.type = "span";
          const text = getPropText("text", "Text", true);
          render.children = [text];
          return render;
        },
        editor: {
          text: "Text 文本",
          order: 0,
          groupOrder,
          group,
          inline: true,
          icon: "layui-icon layui-icon-align-left",
          attrs: {
            text: {
              effect: true,
              enabledBind: true,
              row:true,
              value: "测试文本",
              type: "select",
              datas: ["sm", "lg", "dd"],
              desc:'TEST DESC',
              order: 0,
            },
            slider: {
              effect: false,
              row: false,
              value: "0",
              type: "slider",
              typeOption: { min: 1, max: 24, step: 1 },
              order: 1,
            },
            select: {
              effect: false,
              row: false,
              value: "sm",
              type: "select-only",
              datas: ["sm", "lg", "dd"],
              order: 2,
            },
            boolean: {
              effect: false,
              row: false,
              value: "true",
              type: 'boolean',
              order: 2,
            },
            click: { event: true, order: 30 },
          },
        },
      },
    },
    transferBefore(render) {
      return render;
    },
    transferAfter(render) {
      return render;
    },
  });

  json: UERenderItem = {
    type: "uieditor-div",
    children: [
      {
        type: "uieditor-text",
        props: {
          text: "test1",
          name:'name1'
        },
      },
      {
        type: "uieditor-div",
        children: [
          {
            type: "uieditor-text",
            props: {
              text: "test1222",
            },
          },
          {
            type: "test-text",
            props: {
              text: "测试文本",
            },
          },
        ],
      },
    ],
  };

  @UEVueLife("mounted")
  private _mounted1() {
    // setTimeout(() => {
    //   this.json = {
    //     type: "uieditor-div",
    //     children: [
    //       {
    //         type: "uieditor-text",
    //         props: {
    //           text: "test1-" + new Date().valueOf(),
    //         },
    //       },
    //     ],
    //   };
    // }, 3000);
  }
}
</script>
