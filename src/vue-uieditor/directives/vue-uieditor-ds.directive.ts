import _ from "lodash";
import { DirectiveOptions, VNode, VNodeDirective } from "vue";
import { UEHelper } from '../base/ue-helper';

function _setDatasource(binding: Readonly<VNodeDirective>, vnode: VNode) {
  const inst = vnode.componentInstance;
  const context = vnode.context;
  if (!inst || !context) return;
  const [datasourceOpt, opt] = binding.value;
  const { http } = datasourceOpt || {};
  if (!http || !opt) return;
  if (UEHelper.isEqualNotFn(inst['$datasource']?.optBak, opt)) return;
  const { key, id } = opt;
  vnode['bg_ds_info'] = { key, id };
  const newOpt = {
    ...opt,
    inst,
    context
  };
  let datasource = id ? _.get(context, id) : '';
  const newDatasource = _.assign(datasource || {}, {
    optBak: { ...opt },
    opt: newOpt,
    data: null,
    send(params?: any) {
      //返回数据
      return http(params, newOpt).then(function (data) {
        context && _.set(context, key, data);
        newDatasource.data = data;
        return data;
      });
    }
  });
  if (!datasource) {
    id && _.set(context, id, newDatasource);
    inst['$datasource'] = newDatasource;
  }
  if (newOpt.auto) {
    newDatasource.send();
  }
}

export const UieditorDSDirective: DirectiveOptions = {
  /** 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置 */
  bind(el, binding, vnode, oldVnode) {
    _setDatasource(binding, vnode);
  },
  /**
   * 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
   * 指令的值可能发生了改变，也可能没有。
   * 但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)
   */
  update(el, binding, vnode, oldVnode) {
    if (UEHelper.isEqualNotFn(binding.value, binding.oldValue)) return;
    _setDatasource(binding, vnode);
  },
  /** 只调用一次，指令与元素解绑时调用 */
  unbind(el, binding, vnode, oldVnode) {
    const context = vnode.context;
    const info = vnode['bg_ds_info'];
    if (info?.key) _.set(context, info.key, undefined);
    if (info?.id) _.set(context, info.id, undefined);
    const oldInfo = oldVnode && oldVnode['bg_ds_info'];
    if (oldInfo && !_.isEqual(oldInfo, info)) {
      if (oldInfo?.key) _.set(context, oldInfo.key, undefined);
      if (oldInfo?.id) _.set(context, oldInfo.id, undefined);
    }
    if (vnode.componentInstance) vnode.componentInstance['$datasource'] = null;
  }
};
