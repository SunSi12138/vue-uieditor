import { Component, Prop, Vue } from 'vue-property-decorator';

import './layui/css/layui-uieditor.less';
import './layui/css/modules/layer/default/layer.css';

import './layui/layui.js';
import './layui/lay/modules/jquery.js';
import './layui/lay/modules/layer.js';
import './layui/lay/modules/form.js';
import './layui/lay/modules/layedit.js';
import './layui/lay/modules/element.js';
import './layui/lay/modules/colorpicker.js';
import './layui/lay/modules/slider.js';
import './layui/lay/modules/tree.js';
import './layui/lay/modules/selectInput.js';
import { Layuidestroy, LayuiInit } from './layui-test';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp } from './base/vue-extends';

declare const layui:any;

@UEVueComponent({
  created(){
    console.warn('created', this);
  },
  mounted(){
    LayuiInit(this.$el);
  },
  destroyed(){
    Layuidestroy(this.$el);
  }
})
export default class VueUieditor extends UEVue {
  @UEVueProp() private msg!: string;


  @UEVueLife('created')
  private _created1(){
    console.warn('_created1 1111', this);
  }
 
  @UEVueLife('created')
  private _created2(){
    console.warn('_created1 2222', this);
  } 

  
  @UEVueLife('destroyed')
  private _destroyed1(){
    console.warn('destroyed 1111', this);
  } 
}
