import _ from 'lodash';
import { UEHelper } from '../base/ue-helper';
import { UEService } from '../base/ue-service';
import { UEVue, UEVueComponent, UEVueInject, UEVueLife } from '../base/vue-extends';
import { LayuiRender } from '../layui/layui-render';


@UEVueComponent({})
export default class UieditorCpTree extends UEVue {

  @UEVueInject('service')
  service: UEService;

  @UEVueLife('mounted')
  private _m1() {

    this._renderTree();
  }


  private _cps: { list: any[], tree: any[] };
  private _renderTree() {
    const cps = this.service.components;
    this._cps = _.cloneDeep(cps);

    layui.tree.render({
      elem: this.$refs.tree1
      , data: this._cps.tree
      , showCheckbox: false  //是否显示复选框
      , accordion: false  //是否开启手风琴模式
      , onlyIconControl: false //是否仅允许节点左侧图标控制展开收缩
      , isJump: false  //点击文案跳转地址
      , edit: false  //操作节点图标
      , id: this.treeId
    });

  }

  searchText = '';
  treeId = `ue-cp-tree-${UEHelper.makeAutoId()}`;
  search() {
    const searchText = this.searchText;
    const tree = layui.tree;
    const cps = this._cps;
    let data;
    if (!searchText) {
      data = cps.tree;
    } else {
      const sReg = new RegExp(_.escapeRegExp(searchText), 'i');
      data = _.filter(cps.list, function (treeItem) {
        return treeItem.item.show !== false && sReg.test(treeItem.title);
      });
    }

    tree.reload(this.treeId, {
      data
    });
  }
  keydown(e) {
    if (e.keyCode == 13) {
      e.stopPropagation();
      e.preventDefault();
      this.search();
      return false;
    }
  }
  removeSearchText() {
    this.searchText = '';
    this.search();
  }

  @UEVueLife('destroyed')
  private _d1() {
    LayuiRender.destroy(this.$el);
  }

}
