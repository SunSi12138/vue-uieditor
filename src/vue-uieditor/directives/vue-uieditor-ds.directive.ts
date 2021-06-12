import _ from "lodash";
import { DirectiveOptions, VNode, VNodeDirective } from "vue";
import { UEHttpRequestConfig } from '../base/ue-base';
import { UEHelper } from '../base/ue-helper';

let _undef;

function _setDatasource(binding: Readonly<VNodeDirective>, vnode: VNode) {
  if (!binding.value) return;
  const context = vnode.context;
  if (!context) return;
  const { $dsRefs, $ds } = context as any;
  if (!$dsRefs) return;
  const [http, option] = binding.value;
  const { name, auto } = option || {};
  if (!name) return;
  let dsInst = _.get($dsRefs, name);
  const isAuto = auto !== false;

  const newDS = _.assign(dsInst || {}, {
    option,
    data: dsInst && !isAuto ? dsInst.data : _undef,
    send(p?: UEHttpRequestConfig) {
      if (!http) return;
      const { method, url, query, data } = option;
      if (option['on-send-before']) option['on-send-before'](option);
      //返回数据
      return http[method || 'get'](url, _.assign({ method, url, query, data }, p)).then(function (data) {
        const dsRef = _.get($dsRefs, name);
        dsRef.data = data;
        if (option['on-map']) option['on-map'](dsRef);
        _.set($ds, name, dsRef.data);
        if (option['on-complete']) option['on-complete'](dsRef);
        return data;
      });
    }
  });
  if (!_.has($ds, name)) {
    context.$set($ds, name, _undef);
  }
  if (!dsInst) {
    context.$set($dsRefs, name, { data: _undef });
    _.assign(_.get($dsRefs, name), newDS);
  }
  if (isAuto) {
    _.get($dsRefs, name).send();
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
    if (!context) return;
    const { $dsRefs } = context as any;
    if (!$dsRefs) return;
    const [http, config] = binding.value;
    const { name } = config || {};
    if (!name) return;
    _.set($dsRefs, name, null);
  }
};
