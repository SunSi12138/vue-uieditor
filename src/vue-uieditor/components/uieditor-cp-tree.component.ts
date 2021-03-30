import { UEService } from '../base/ue-service';
import { UEVue, UEVueComponent, UEVueInject, UEVueLife } from '../base/vue-extends';
import { Layuidestroy, LayuiTree } from '../layui-test';


@UEVueComponent({})
export default class UieditorCpTree extends UEVue {

  @UEVueInject('service')
  service: UEService;

  @UEVueLife('mounted')
  private _m1() {

    const cps = this.service.components;

    LayuiTree({ elem: this.$refs.tree1, data: cps.tree });
  }

  @UEVueLife('destroyed')
  private _d1() {
    Layuidestroy(this.$el);
  }

}
