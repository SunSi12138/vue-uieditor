<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <div v-if="isRender">
      <a href="javascript:void(0)" @click="isRender = false">设计</a>
      <vue-uieditor-render :options="options" :json="json" />
    </div>
    <div v-else class="uieditor-div">
      <vue-uieditor
        :options="options"
        :json="json"
        :theme="theme"
        @on-ready="onReady"
        @on-change="onChange"
      />
    </div>
  </div>
</template>
<style lang="less" scoped>
.uieditor-div {
  position: fixed;
  top: 0;
  bottom: 2px;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
<script lang="ts">
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import { UEHelper } from "../vue-uieditor";
import {
  UECanNotMoveInProps,
  UECanNotMoveOutProps,
  UECanNotMoveProps,
  UECanNotSelectProps,
  UEOption,
  UETheme,
} from "../vue-uieditor/base/ue-base";
import { UERender } from "../vue-uieditor/base/ue-render";
import { UERenderItem } from "../vue-uieditor/base/ue-render-item";
import {
  UEVue,
  UEVueComponent,
  UEVueData,
  UEVueLife,
} from "../vue-uieditor/base/vue-extends";
import { LayuiHelper } from "../vue-uieditor/layui/layui-helper";
const groupOrder = 10;
const group = "测试组件库/基础组件";

@UEVueComponent({
  components: {
    HelloWorld,
  },
})
export default class Home extends UEVue {
  options: UEOption = UERender.DefineOption({
    global() {
      return {
        merge() {
          return "merge ok";
        },
      };
    },
    http() {
      return {
        async get(url, config) {
          return { name: "aaaa" + UEHelper.makeAutoId() };
        },
      };
    },
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
          text: "%text%",
          defaultText: "Text 文本",
          order: 0,
          groupOrder,
          group,
          inline: true,
          icon: "layui-icon layui-icon-align-left",
          transferAttr({ render }) {
            // render.props[UECanNotSelectProps] = true;
            render.props[UECanNotMoveProps] = true;

            render.props["aaaa"] = true;
          },
          contextmenu({ render, service }) {
            return [
              {
                title: "测试 Editor",
                click() {
                  LayuiHelper.msg(
                    JSON.stringify(service.getJson(false, render) || {})
                  );
                },
              },
            ];
          },
          toolbar({ render, service }) {
            return [
              {
                title: "添加",
                icon: "layui-icon layui-icon-addition",
                click() {
                  service.addByComponent(
                    {
                      $isTmpl: true,
                      item: {
                        json:
                          '{"type":"uieditor-text","props":{"text":"test1222"}}',
                      },
                    },
                    render.editorId,
                    "after"
                  );
                },
              },
            ];
          },
          attrs: {
            text: {
              effect: true,
              enabledBind: true,
              row: true,
              value: "测试文本",
              type: "select",
              datas: ["sm", "lg", "dd"],
              desc: "TEST DESC",
              order: 0,
            },
            slider: {
              effect: false,
              row: false,
              value: "2",
              type: "slider",
              enabledBind: true,
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
              effect: true,
              row: false,
              type: "boolean-only",
              order: 2,
            },
            click: { event: true, order: 30 },
          },
        },
      },
      "test-div": {
        type: "div",
        editor: {
          text: "Test Div 块级标签",
          order: 0,
          groupOrder,
          group,
          icon: "layui-icon layui-icon-template-1",
          container: true,
          toolbar({ render, service }) {
            return [
              {
                title: "添加",
                icon: "layui-icon layui-icon-addition",
                click() {
                  service.addByJson(
                    { type: "test-text", props: { text: "test1222" } },
                    render.editorId,
                    "in"
                  );
                },
              },
            ];
          },
        },
      },
    },
    templates: [
      {
        title: "JSON Object",
        group: "测试模板库/测试模板",
        json: {
          type: "uieditor-div",
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
      "<!-- aaa -->",
      {
        type: "uieditor-text",
        props: {
          text: "test1",
          name: "name1",
        },
      },
      {
        type: "uieditor-div",
        props: {
          [UECanNotMoveOutProps]: true,
          [UECanNotMoveInProps]: true,
        },
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
          {
            type: "uieditor-div",
            props: {
              [UECanNotSelectProps]: true,
              [UECanNotMoveProps]: true,
            },
          },
        ],
      },
    ],
  };

  isRender = false;

  theme: UETheme;
  @UEVueData()
  private initData() {
    return {
      theme: {
        modes: ["json", "script", "tmpl"],
        toolBar: [
          {
            title: "测试",
            click: ({ service }) => {
              this.json = service.getJson();
              this.isRender = true;
            },
          },
          {
            title: "当前节点信息",
            icon: "layui-icon layui-icon-heart",
            disabled: ({ service }) => !service.getCurRender(),
            click: ({ service }) => {
              const render = service.getCurRender();
              LayuiHelper.msg(
                JSON.stringify(service.getJson(false, render) || {})
              );
            },
          },
        ],
        contextmenus({ render, service }) {
          return [
            {
              title: "测 试",
              disabled: !render,
              click: (item) => {
                LayuiHelper.msg(
                  JSON.stringify(service.getJson(false, render) || {})
                );
              },
            },
          ];
        },
      } as UETheme,
    };
  }

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

  onReady({ service }) {
    console.warn("onReady", service);
  }

  onChange({ service }) {
    console.warn("onChange", service);
  }
}
</script>
