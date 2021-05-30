import _ from "lodash";
import { DirectiveOptions, VNode, VNodeDirective } from "vue";
import { UEHelper } from '../base/ue-helper';
import { UEHttpRequestConfig } from '../base/ue-base';

function _setDatasource(binding: Readonly<VNodeDirective>, vnode: VNode) {
  if (!binding.value) return;
  const context = vnode.context;
  if (!context || !_.has(context, '$datasource')) return;
  const [http, option] = binding.value;
  const { name, url, auto } = option || {};
  if (!http || !name || !url) return;
  const { $datasource } = context as any;
  let ds = _.get($datasource, name);

  const newDS = _.assign(ds || {}, {
    option,
    data: null,
    send(p?: UEHttpRequestConfig) {
      const { method, url, query, data } = option;
      //返回数据
      return http[method || 'get'](url, _.assign({ method, url, query, data }, p)).then(function (data) {
        _.get(context, name).data = data;
        return data;
      });
    }
  });
  if (!ds) {
    context.$set($datasource, name, { data: null });
    _.assign(_.get(context, name), newDS);
  }
  if (auto) {
    _.get(context, name).send();
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
    if (!binding.value) return;
    const context = vnode.context;
    if (!context || !_.has(context, '$datasource')) return;
    const [http, config] = binding.value;
    const { name } = config || {};
    if (!http || !name) return;
    const { $datasource } = context as any;
    _.set($datasource, name, null);
  }
};
