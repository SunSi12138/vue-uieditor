import { Component, Prop, Vue } from 'vue-property-decorator';

import { Layuidestroy, LayuiInit } from './layui-test';
import { UEVue, UEVueComponent, UEVueEvent, UEVueLife, UEVueProp } from './base/vue-extends';

import './layui-import';

@UEVueComponent({})
export default class VueUieditor extends UEVue {
  @UEVueProp() private msg!: string;

  @UEVueLife('mounted')
  private _mounted1() {
    LayuiInit(this.$el);
    console.warn('this', this);
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    Layuidestroy(this.$el);
  }

}
