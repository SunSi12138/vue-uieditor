<template>
  <component v-if="vueRender" ref="renderComponent" :is="vueRender">
    <slot></slot>
  </component>
</template>
<script lang="ts" src="./vue-uieditor-render.component.ts"></script>