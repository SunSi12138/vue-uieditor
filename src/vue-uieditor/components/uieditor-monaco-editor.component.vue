<template>
  <div
    :style="style"
    class="uieditor-monaco-editor"
    :class="{ 'uieditor-monaco-editor-focus': isFocus }"
  >
    <iframe
      :id="id"
      class="uieditor-monaco-editor-iframe"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script lang="ts" src="./uieditor-monaco-editor.component.ts"></script>
<style lang="less">
.uieditor-monaco-editor {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;

  &.uieditor-monaco-editor-focus {
    box-shadow: 0 0 0 1px rgba(41, 116, 255, 0.25);
  }

  > .uieditor-monaco-editor-iframe {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
}
</style>