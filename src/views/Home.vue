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
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import { UEOption } from '../vue-uieditor/base/ue-base';
import { UERenderItem } from '../vue-uieditor/base/ue-render-item';

@Component({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  options:UEOption = {
    transfer:{},
    transferBefore(render){
      return render;
    },
    transferAfter(render){
      return render;
    }
  };

  json:UERenderItem = {
    type:'div',
    children:[{
      type:'span',
      children:['test']
    }]
  };
  
}
</script>
