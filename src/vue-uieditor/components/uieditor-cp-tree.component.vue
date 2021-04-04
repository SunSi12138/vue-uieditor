<template>
  <div>
    <form class="layui-form uieditor-searchform" action="" lay-filter="first">
      <input
        type="text"
        placeholder="请输入搜索关键字"
        autocomplete="off"
        class="layui-input"
        v-model="searchText"
        @keydown="keydown"
      />
      <i
        class="layui-icon"
        :class="!searchText ? 'layui-icon-search' : 'layui-icon-close'"
        @click="removeSearchText()"
      ></i>
    </form>
    <div
      class="layui-collapse editor-pane-collapse"
      lay-filter="uieditor-cp-tree"
    >
      <!-- 组件 -->
      <div class="layui-colla-item">
        <h2 class="layui-colla-title">
          <span class="editor-pane-collapse-title">组件</span>
          <i class="layui-icon layui-colla-icon"></i>
        </h2>
        <div class="layui-colla-content layui-show">
          <div class="uieditor-cp-tree" ref="tree1"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./uieditor-cp-tree.component.ts"></script>
