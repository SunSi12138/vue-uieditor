import { UEOption } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UEService } from './base/ue-service';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueProvide, UEVueWatch } from './base/vue-extends';
import './layui-import';
import { Layuidestroy, LayuiInit } from './layui-test';
import './transfer';
import { UERender } from './base/ue-render';


@UEVueComponent({})
export default class VueUieditor extends UEVue {

  @UEVueProp()
  private options!: UEOption;

  get optionEx() {
    const options = this.options;
    return UERender.GlobalTransferToOptions(options);
  }

  @UEVueProp()
  private json!: UEOption;

  @UEVueWatch('optionEx')
  private _wOptions(options) {
    console.warn('optionEx', options)
    if (this.service) {
      const json = this.service.getJson();
      (this.service as any).options = options;
      this.service.setJson(json);
    }
  }

  private _service: UEService;
  get service(): UEService {
    if (!this.$isBeingDestroyed && !this._service) {
      console.warn('this.optionEx', this.optionEx);
      this._service = new UEService(this, this.optionEx);
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

  current = null;

  @UEVueLife('mounted')
  private async _mounted1() {
    const options = this.optionEx || {};
    console.log('init1')
    await UECompiler.init({ bable: options.babel !== false });
    console.log('init2')
    const service = this.service;
    this.current = service.current;
    await service.setJson(this.json);
    console.log('init3')
    await this.$nextTick();
    console.log('init4')
    LayuiInit(this.$el);
    console.log('init5')
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    this._service?._destroy();
    this._service = null;
    Layuidestroy(this.$el);
  }

}
