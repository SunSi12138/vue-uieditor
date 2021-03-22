import { Component, Prop, Vue } from 'vue-property-decorator';

import './layui/css/layui-uieditor.css';
import './layui/css/modules/layer/default/layer.css';

import './layui/layui.js';
import './layui/lay/modules/tree.js';
import './layui/lay/modules/jquery.js';
import './layui/lay/modules/form.js';
import './layui/lay/modules/layer.js';
import './layui/lay/modules/layedit.js';
import './layui/lay/modules/element.js';
import './layui/lay/modules/colorpicker.js';
import './layui/lay/modules/slider.js';
import './layui/lay/modules/selectInput.js';
import { LayuiInit } from './layui-test';

@Component({
  created(){
    console.warn('created', this);
  },
  mounted(){
    LayuiInit()
  }
})
export default class VueUieditor extends Vue {
  @Prop() private msg!: string;

  created(){
    console.warn('this', this);
  }
  
}
