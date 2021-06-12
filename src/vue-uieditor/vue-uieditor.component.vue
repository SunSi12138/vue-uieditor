<template>
  <div class="vue-uieditor" v-if="current">
    <div
      class="editor-json-content"
      v-show="isDesign"
      :style="{ overflow: current.caclSize ? '' : 'hidden' }"
    >
      <input class="editor-json-focus" ref="jsonFoucs" />
      <vue-uieditor-render
        v-if="current.json && isDesign"
        :options="optionEx"
        :json="current.json"
        :mixin="current.mixin"
        editing
      />
    </div>
    <div
      class="editor-priview-content"
      v-show="isPreview"
      :style="{ overflow: current.caclSize ? '' : 'hidden' }"
    >
      <vue-uieditor-render
        v-if="isPreview"
        :options="optionEx"
        :json="current.monacoEditor.content"
        preview
      />
    </div>
    <div class="layui-uieditor">
      <div class="layui-tab layui-tab-card">
        <!-- tool-bar -->
        <div class="tool-bar" v-if="isDesign">
          <div class="layui-btn-group">
            <button
              v-for="(item, index) in toolbar"
              type="button"
              :layui-tip="item.title"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm"
              :class="{
                'layui-disabled': item.disabledEx,
                divided: item.divided,
              }"
              v-show="item.showEx"
              @click="toolbarClick($event, item)"
            >
              <i v-if="item.icon" :class="item.icon"></i>
              <span v-else>{{ item.title }}</span>
            </button>
            <button
              type="button"
              layui-tip="清空"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm"
              :class="{ divided: hasToolbar }"
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
              :class="{ 'layui-disabled': !history.canPre }"
              @click="history.pre()"
            >
              <i class="layui-icon layui-icon-left"></i>
            </button>
            <button
              type="button"
              layui-tip="恢复"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm"
              :class="{ 'layui-disabled': !history.canNext }"
              @click="history.next()"
            >
              <i class="layui-icon layui-icon-right"></i>
            </button>
            <button
              type="button"
              layui-tip="删除"
              layui-tip-direction="3"
              :class="{
                'layui-disabled': !current.id || !service.canRemove(current.id),
              }"
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
              layui-tip="显示/隐藏左边组件栏"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm divided"
              :class="{'ue-active':leftBar.show}"
              @click="leftBar.show = !leftBar.show"
            >
              <i class="layui-icon layui-icon-app"></i>
            </button>
            <button
              type="button"
              layui-tip="显示/隐藏右边属性栏"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm"
              :class="{'ue-active':rightBar.show}"
              @click="rightBar.show = !rightBar.show"
            >
              <i class="layui-icon layui-icon-slider"></i>
            </button>
            <button
              type="button"
              layui-tip="关于"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm divided"
              @click="about()"
            >
              <i class="layui-icon layui-icon-about"></i>
            </button>
          </div>
        </div>
        <div
          class="tool-bar"
          v-if="
            ['script', 'json', 'tmpl'].indexOf(current.mode) >= 0 &&
            !current.monacoEditorOther.show
          "
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
        <div class="tool-bar" v-if="current.monacoEditorOther.show">
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
        <div class="tool-bar" v-if="isPreview">
          <div class="layui-btn-group">
            <button
              type="button"
              layui-tip="设置模拟参数"
              layui-tip-direction="3"
              class="layui-btn layui-btn-primary layui-btn-sm"
              @click="service.showPreviewOpt()"
            >
              <i class="layui-icon layui-icon-set-fill"></i>
            </button>
          </div>
        </div>
        <ul class="layui-tab-title uieditor-mode-title">
          <li
            design
            class="layui-tab-first layui-this"
            @click="service.setMode('design')"
          >
            设计
          </li>
          <li
            script
            @click="service.setMode('script')"
            v-if="hasMode('script')"
          >
            代码
          </li>
          <li tmpl @click="service.setMode('tmpl')" v-if="hasMode('tmpl')">
            Tmpl
          </li>
          <li json @click="service.setMode('json')" v-if="hasMode('json')">
            JSON
          </li>
          <li preview @click="service.setMode('preview')">预览</li>
          <li other style="display: none" @click="service.setMode('other')">
            其他
          </li>
        </ul>
        <div class="layui-tab-content">
          <div class="layui-tab-item layui-show">
            <div
              class="editor-pane"
              :class="{
                'left-hide': !leftBar.show,
                'right-hide': !rightBar.show,
              }"
            >
              <div class="left" v-if="leftBar.show">
                <div class="left-content">
                  <uieditor-cp-tree />
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
                        <span
                          v-if="!item.canOpt"
                          class="center-breadcrumb-item"
                        >
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
                    <div class="editor-json-content-in">
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="right" v-if="rightBar.show">
                <div class="right-content">
                  <uieditor-cp-attr
                    v-if="!current.refreshAttr && current.attrs"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="layui-tab-item" v-if="hasMode('script')">
            <div class="layui-tab-codeeditor">
              <uieditor-monaco-editor
                v-if="current.mode == 'script'"
                v-model="current.monacoEditor.content"
                :extraLib="current.monacoEditor.extraLib"
                :format-auto="current.monacoEditor.formatAuto"
                :language="current.monacoEditor.language"
                ref="modeMonacoEditor"
              />
            </div>
          </div>
          <div class="layui-tab-item" v-if="hasMode('tmpl')">
            <div class="layui-tab-codeeditor">
              <uieditor-monaco-editor
                v-if="current.mode == 'tmpl'"
                v-model="current.monacoEditor.content"
                :extraLib="current.monacoEditor.extraLib"
                :format-auto="current.monacoEditor.formatAuto"
                :language="current.monacoEditor.language"
                ref="modeMonacoEditor"
              />
            </div>
          </div>
          <div class="layui-tab-item" v-if="hasMode('json')">
            <div class="layui-tab-codeeditor">
              <uieditor-monaco-editor
                v-if="current.mode == 'json'"
                v-model="current.monacoEditor.content"
                :extraLib="current.monacoEditor.extraLib"
                :format-auto="current.monacoEditor.formatAuto"
                :language="current.monacoEditor.language"
                ref="modeMonacoEditor"
              />
            </div>
          </div>
          <div class="layui-tab-item">
            <div class="editor-priview-content-in"></div>
          </div>
          <div class="layui-tab-item">
            <div class="layui-tab-codeeditor">
              <uieditor-monaco-editor
                v-if="current.monacoEditorOther.show"
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
    </div>
  </div>
</template>

<script lang="ts" src="./vue-uieditor.component.ts"></script>

