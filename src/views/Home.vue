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
  top:0;
  bottom: 2px;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import { UEOption } from "../vue-uieditor/base/ue-base";
import { UERenderItem } from "../vue-uieditor/base/ue-render-item";
import {
  UEVue,
  UEVueComponent,
  UEVueLife,
} from "../vue-uieditor/base/vue-extends";
import { UERender } from "../vue-uieditor/base/ue-render";

@UEVueComponent({
  components: {
    HelloWorld,
  },
})
export default class Home extends UEVue {
  options: UEOption = UERender.DefineOption({
    transfer: {},
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
