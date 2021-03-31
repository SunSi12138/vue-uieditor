<template>
  <div class="layui-uieditor">
    <div class="layui-tab layui-tab-card">
      <!-- tool-bar -->
      <div class="tool-bar">
        <div class="layui-btn-group">
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            文字
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
          >
            <i class="layui-icon layui-icon-refresh"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            <i class="layui-icon layui-icon-left"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            <i class="layui-icon layui-icon-right"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
          >
            <i class="layui-icon layui-icon-align-left"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            <i class="layui-icon layui-icon-ok"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            <i class="layui-icon layui-icon-close"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
          >
            <i class="layui-icon layui-icon-set-fill"></i>
          </button>
          <button
            type="button"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            <i class="layui-icon layui-icon-about"></i>
          </button>
        </div>
      </div>
      <ul class="layui-tab-title">
        <li class="layui-tab-first layui-this">设计</li>
        <li>代码</li>
        <li>模板</li>
        <li>JSON</li>
        <li>预览</li>
      </ul>
      <div class="layui-tab-content">
        <div class="layui-tab-item layui-show">
          <div class="editor-pane">
            <div class="left">
              <div class="left-content">
                <form
                  class="layui-form uieditor-searchform"
                  action=""
                  lay-filter="first"
                >
                  <input
                    type="text"
                    placeholder="请输入搜索关键字"
                    autocomplete="off"
                    class="layui-input"
                  />
                  <i class="layui-icon layui-icon-search"></i>
                </form>
                <div
                  class="layui-collapse editor-pane-collapse"
                  lay-filter="test"
                >
                  <!-- 组件 -->
                  <div class="layui-colla-item">
                    <h2 class="layui-colla-title">
                      <span class="editor-pane-collapse-title">组件</span>
                      <i class="layui-icon layui-colla-icon"></i>
                    </h2>
                    <div class="layui-colla-content layui-show">
                      <uieditor-cp-tree />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="center">
              <div class="center-content">
                <div class="editor-content">
                  <div class="center-breadcrumb" v-if="current">
                    <span v-for="(item, index) in current.breadcrumbs" :key="index">
                      <span v-if="!item.canOpt" class="center-breadcrumb-item">
                        {{ item.text }}
                      </span>
                      <a
                        v-else
                        @click="service.setCurrent(item.id)"
                        class="center-breadcrumb-item link"
                      >
                        {{ item.text }}
                      </a>
                      <span v-if="!item.isLast" class="center-breadcrumb-item-separator">&gt;</span>
                    </span>
                  </div>
                  <div class="editor-json-content">
                    <vue-uieditor-render
                      v-if="current && current.json"
                      :options="options"
                      :json="current.json"
                      :mixin="current.mixin"
                      editing
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="right">
              <div class="right-content">
                <div
                  class="layui-tab layui-tab-brief editor-pane-tab"
                  lay-filter="docDemoTabBrief"
                >
                  <ul class="layui-tab-title" style="display:none;">
                    <li class="layui-this">属性</li>
                    <li>事件</li>
                  </ul>
                  <div class="layui-tab-content">
                    <!-- 属性 -->
                    <div class="layui-tab-item layui-show">
                      <uieditor-cp-attr v-if="!current.refreshAttr && current.attrs" />
                    </div>
                    <!-- 事件 -->
                    <div class="layui-tab-item">
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="layui-tab-item">代码</div>
        <div class="layui-tab-item">模板</div>
        <div class="layui-tab-item">JSON</div>
        <div class="layui-tab-item">预览</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./vue-uieditor.component.ts"></script>

