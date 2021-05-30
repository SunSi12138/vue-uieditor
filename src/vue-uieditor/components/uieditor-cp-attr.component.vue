<template>
  <div
    v-if="!isEmpty"
    class="layui-tab layui-tab-brief editor-pane-tab"
    lay-filter="docDemoTabBrief"
  >
    <ul class="layui-tab-title">
      <li class="layui-this" @click="setTab(0)">属性</li>
      <li @click="setTab(1)">事件</li>
      <li @click="setTab(2)">Vue</li>
      <li @click="setTab(3)">数据源</li>
    </ul>
    <div class="layui-tab-content">
      <!-- 属性 -->
      <div class="layui-tab-item layui-show">
        <!-- <form
          class="layui-form uieditor-searchform"
          action=""
          lay-filter="attrsearch"
        >
          <input
            type="text"
            placeholder="请输入搜索关键字"
            autocomplete="off"
            class="layui-input"
          />
          <i class="layui-icon layui-icon-search"></i>
        </form> -->
        <div
          class="layui-collapse editor-pane-collapse"
          lay-filter="attrcollapse"
           ref="attrContent"
        >
        </div>
      </div>
      <!-- 事件 -->
      <div class="layui-tab-item">
        <div
          class="layui-collapse editor-pane-collapse"
          lay-filter="eventcollapse"
          ref="eventContent"
        ></div>
      </div>
      <!-- Vue -->
      <div class="layui-tab-item">
        <div
          class="layui-collapse editor-pane-collapse"
          lay-filter="vuecollapse"
          ref="vueContent"
        ></div>
      </div>
      <!-- 数据源 -->
      <div class="layui-tab-item">
        <div
          class="layui-collapse editor-pane-collapse"
          lay-filter="dscollapse"
          ref="dsContent"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./uieditor-cp-attr.component.ts"></script>
