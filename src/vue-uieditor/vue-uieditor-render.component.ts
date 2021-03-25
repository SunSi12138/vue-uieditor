
import { UEVue, UEVueComponent, UEVueLife, UEVueProp } from './base/vue-extends';

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

  vueRender = null;// { render() { } };

  @UEVueLife('created')
  private _created1() {
    console.warn('render', this);
  }


}
