<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <div style="height: 340px; width: 100%">
      <vue-uieditor :options="options" :json="json" />
    </div>
  </div>
</template>

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
    ],
  };

  @UEVueLife("mounted")
  private _mounted1() {
    // setTimeout(() => {
    //   this.json = {
    //     type: "div",
    //     children: [
    //       {
    //         type: "span",
    //         children: [`test:${new Date().valueOf()}`],
    //       },
    //     ],
    //   };
    // }, 3000);
  }
}
</script>
