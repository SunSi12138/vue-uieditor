import { Component, Prop, Vue } from 'vue-property-decorator';

import { Layuidestroy, LayuiInit } from './layui-test';
import { UEVue, UEVueComponent, UEVueEvent, UEVueLife, UEVueProp } from './base/vue-extends';

import './layui-import';
import { UECompiler } from './base/ue-compiler';

@UEVueComponent({})
export default class VueUieditor extends UEVue {
  @UEVueProp() private msg!: string;

  @UEVueLife('mounted')
  private _mounted1() {
    LayuiInit(this.$el);
    console.warn('this', this, ...[1,2,3]);
    UECompiler.babelInit().then(function(){
      const fn = UECompiler.babelTransformToFunEx(['name', 'id'], 'return {name, id}');
      console.warn('babelTransformToFunEx', fn('user1', '1111'), fn);
    });
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    Layuidestroy(this.$el);
  }

}
