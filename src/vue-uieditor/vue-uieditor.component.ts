import { Component, Prop, Vue } from 'vue-property-decorator';

import { Layuidestroy, LayuiInit } from './layui-test';
import { UEVue, UEVueComponent, UEVueEvent, UEVueLife, UEVueProp, UEVueProvide } from './base/vue-extends';

import './layui-import';
import { UECompiler } from './base/ue-compiler';
import { UEService } from './base/ue-service';

@UEVueComponent({})
export default class VueUieditor extends UEVue {
  @UEVueProp() private msg!: string;

  private _service: UEService;
  get service(): UEService {
    if (!this.$isBeingDestroyed && !this._service) this._service = new UEService(this);
    return this._service;
  }
  @UEVueProvide('service')
  private _pUiEditor() {
    return this.service;
  }

  @UEVueLife('mounted')
  private _mounted1() {
    LayuiInit(this.$el);
    console.warn('this', this, ...[1, 2, 3]);
    UECompiler.init().then(function () {
      const fn = UECompiler.babelTransformToFunEx(['name', 'id'], 'return {name, id}');
      console.warn('babelTransformToFunEx', fn('user1', '1111'), fn);
    });
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    this._service = null;
    Layuidestroy(this.$el);
  }

}
