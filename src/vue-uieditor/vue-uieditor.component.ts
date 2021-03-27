import { UEOption } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UEService } from './base/ue-service';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueProvide } from './base/vue-extends';
import './layui-import';
import { Layuidestroy, LayuiInit } from './layui-test';



@UEVueComponent({})
export default class VueUieditor extends UEVue {

  @UEVueProp()
  private options!: UEOption;

  @UEVueProp()
  private json!: UEOption;

  private _service: UEService;
  get service(): UEService {
    if (!this.$isBeingDestroyed && !this._service) {
      this._service = new UEService(this);
    }
    return this._service;
  }
  @UEVueProvide('service')
  private _pService() {
    return this.service;
  }
  @UEVueProvide('uieditor')
  private _pUiEditor() {
    return this;
  }


  @UEVueLife('created')
  private async _created1() {
    const options = this.options || {};
    await UECompiler.init({ bable: options.babel !== false })
  }



  @UEVueLife('mounted')
  private _mounted1() {
    LayuiInit(this.$el);
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    this._service = null;
    Layuidestroy(this.$el);
  }

}
