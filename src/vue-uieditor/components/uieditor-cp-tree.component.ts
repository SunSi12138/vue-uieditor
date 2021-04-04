import { UEService } from '../base/ue-service';
import { UEVue, UEVueComponent, UEVueInject, UEVueLife } from '../base/vue-extends';
import { LayuiRender } from '../layui/layui-render';
import _ from 'lodash';


@UEVueComponent({})
export default class UieditorCpTree extends UEVue {

  @UEVueInject('service')
  service: UEService;

  @UEVueLife('mounted')
  private _m1() {

    this._renderTree();
  }

  
  private _renderTree() {
    const cps = this.service.components;

    layui.tree.render(_.assign({
      elem: null
      , data: []
      , showCheckbox: false  //是否显示复选框
      , accordion: false  //是否开启手风琴模式
      , onlyIconControl: false //是否仅允许节点左侧图标控制展开收缩
      , isJump: false  //点击文案跳转地址
      , edit: false  //操作节点图标
    }, { elem: this.$refs.tree1, data: cps.tree }));

  }

  @UEVueLife('destroyed')
  private _d1() {
    LayuiRender.destroy(this.$el);
  }

}
