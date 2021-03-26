
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueInject } from './base/vue-extends';
import { UEService } from './base/ue-service';

@UEVueComponent({})
export default class VueUieditorRender extends UEVue {
  @UEVueProp()
  private json!: string;

  @UEVueProp()
  private query!: string;

  @UEVueProp()
  private params!: string;

  @UEVueProp(Boolean)
  private editing!: boolean;

  @UEVueInject('service')
  service: UEService;

  // get service(): UEService {
  //   return this.uieditor?.service;
  // }

  vueRender = null;// { render() { } };

  @UEVueLife('created')
  private _created1() {
    console.warn('render', this, this.service);
  }


}
