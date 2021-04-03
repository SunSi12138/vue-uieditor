<template>
  <div class="layui-uieditor">
    <div class="layui-tab layui-tab-card">
      <!-- tool-bar -->
      <div class="tool-bar" v-if="current.mode == 'design'">
        <div class="layui-btn-group">
          <button
            type="button"
            layui-tip="新建"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @click="service.empty()"
          >
            <i class="layui-icon layui-icon-file-b"></i>
          </button>
          <button
            type="button"
            layui-tip="刷新"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @click="service.refresh()"
          >
            <i class="layui-icon layui-icon-refresh"></i>
          </button>
          <button
            type="button"
            layui-tip="撤销"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @clic="service.history.pre()"
          >
            <i class="layui-icon layui-icon-left"></i>
          </button>
          <button
            type="button"
            layui-tip="恢复"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @clic="service.history.next()"
          >
            <i class="layui-icon layui-icon-right"></i>
          </button>
          <button
            type="button"
            layui-tip="删除"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @click="service.delCur()"
          >
            <i class="layui-icon layui-icon-delete"></i>
          </button>
          <!-- <button
            type="button"
            layui-tip="设置"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
          >
            <i class="layui-icon layui-icon-set-fill"></i>
          </button> -->
          <button
            type="button"
            layui-tip="关于"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
          >
            <i class="layui-icon layui-icon-about"></i>
          </button>
        </div>
      </div>
      <div
        class="tool-bar"
        v-if="['script', 'json', 'tmpl'].indexOf(current.mode) >= 0"
      >
        <div class="layui-btn-group">
          <button
            type="button"
            layui-tip="格式化"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @click="$refs.modeMonacoEditor.formatCode()"
          >
            <i class="layui-icon layui-icon-align-left"></i>
          </button>
          <button
            type="button"
            layui-tip="应用"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
            @click="current.monacoEditor.save()"
          >
            <i class="layui-icon layui-icon-ok"></i>
          </button>
        </div>
      </div>
      <div
        class="tool-bar"
        v-if="current.mode == 'other'"
      >
        <div class="layui-btn-group">
          <button
            type="button"
            layui-tip="格式化"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @click="$refs.monacoEditorOther.formatCode()"
          >
            <i class="layui-icon layui-icon-align-left"></i>
          </button>
          <button
            type="button"
            layui-tip="应用"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm divided"
            @click="current.monacoEditorOther.save()"
          >
            <i class="layui-icon layui-icon-ok"></i>
          </button>
          <button
            type="button"
            layui-tip="取消"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
            @click="current.monacoEditorOther.close()"
          >
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
      </div>
      <div
        class="tool-bar"
        v-if="current.mode == 'preview'"
      >
        <div class="layui-btn-group">
           <button
            type="button"
            layui-tip="设置模拟参数"
            layui-tip-direction="3"
            class="layui-btn layui-btn-primary layui-btn-sm"
          >
            <i class="layui-icon layui-icon-set-fill"></i>
          </button>
        </div>
      </div>
      <ul class="layui-tab-title">
        <li
          design
          class="layui-tab-first layui-this"
          @click="service.setMode('design')"
        >
          设计
        </li>
        <li script @click="service.setMode('script')">代码</li>
        <li tmpl @click="service.setMode('tmpl')">模板</li>
        <li json @click="service.setMode('json')">JSON</li>
        <li preview @click="service.setMode('preview')">预览</li>
        <li other @click="service.setMode('other')" style="display:none">其他</li>
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
                    <span
                      v-for="(item, index) in current.breadcrumbs"
                      :key="index"
                    >
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
                      <span
                        v-if="!item.isLast"
                        class="center-breadcrumb-item-separator"
                        >&gt;</span
                      >
                    </span>
                  </div>
                  <div class="editor-json-content">
                    <vue-uieditor-render
                      v-if="current && current.json && current.mode == 'design'"
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
                <uieditor-cp-attr
                  v-if="!current.refreshAttr && current.attrs"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="layui-tab-item">
          <uieditor-monaco-editor
            v-if="current.mode == 'script'"
            v-model="current.monacoEditor.content"
            :extraLib="current.monacoEditor.extraLib"
            :format-auto="current.monacoEditor.formatAuto"
            :language="current.monacoEditor.language"
            ref="modeMonacoEditor"
          />
        </div>
        <div class="layui-tab-item">
          <uieditor-monaco-editor
            v-if="current.mode == 'tmpl'"
            v-model="current.monacoEditor.content"
            :extraLib="current.monacoEditor.extraLib"
            :format-auto="current.monacoEditor.formatAuto"
            :language="current.monacoEditor.language"
            ref="modeMonacoEditor"
          />
        </div>
        <div class="layui-tab-item">
          <uieditor-monaco-editor
            v-if="current.mode == 'json'"
            v-model="current.monacoEditor.content"
            :extraLib="current.monacoEditor.extraLib"
            :format-auto="current.monacoEditor.formatAuto"
            :language="current.monacoEditor.language"
            ref="modeMonacoEditor"
          />
        </div>
        <div class="layui-tab-item">
          <vue-uieditor-render
            v-if="current.mode == 'preview'"
            :options="options"
            :json="current.monacoEditor.content"
            preview
          />
        </div>
        <div class="layui-tab-item">
          <uieditor-monaco-editor
            v-if="current.mode == 'other'"
            v-model="current.monacoEditorOther.content"
            :extraLib="current.monacoEditorOther.extraLib"
            :format-auto="current.monacoEditorOther.formatAuto"
            :language="current.monacoEditorOther.language"
            ref="monacoEditorOther"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./vue-uieditor.component.ts"></script>

