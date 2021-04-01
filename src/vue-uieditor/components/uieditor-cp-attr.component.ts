import _ from 'lodash';
import { UETransferEditorAttrs, UETransferEditorAttrsItem } from '../base/ue-base';
import { UEService } from '../base/ue-service';
import { UEVue, UEVueComponent, UEVueInject, UEVueLife } from '../base/vue-extends';
import { LayuiRender } from '../layui/layui-render';

type GroupItem = {
  group: string;
  order: number;
  value: UETransferEditorAttrsItem;
  items: UETransferEditorAttrsItem[];
}

const _vReg = /^\s*v\-*/;
const $: JQueryStatic = layui.$;

function _makeGroupList(attrList: UETransferEditorAttrsItem[]): GroupItem[] {

  let groupList: GroupItem[] = [];
  _.forEach(_.groupBy(attrList, 'group'), function (items, group) {
    items = _.orderBy(items, 'order', 'asc');
    const value = _.first(items);
    const gItem: GroupItem = {
      group,
      order: value.groupOrder,
      value,
      items
    };
    groupList.push(gItem);
  });
  groupList = _.orderBy(groupList, 'order', 'asc');
  return groupList;
}

@UEVueComponent({})
export default class UieditorCpAttr extends UEVue {

  @UEVueInject('service')
  service: UEService;

  @UEVueLife('created')
  private _c1() {
  }

  @UEVueLife('mounted')
  private _m1() {
    this._makeAttrs();

    // const cps = this.service.components;

    // LayuiRender.renderTree({ elem: this.$refs.tree1, data: cps.tree });
  }

  @UEVueLife('destroyed')
  private _d1() {
    LayuiRender.destroy(this.$el);
  }

  private _makeAttrs() {
    const attrs: UETransferEditorAttrs = _.cloneDeep(this.service.current.attrs);
    const attrList: UETransferEditorAttrsItem[] = [];
    const attrCustList: UETransferEditorAttrsItem[] = [];
    const eventList: UETransferEditorAttrsItem[] = [];
    const eventCustList: UETransferEditorAttrsItem[] = [];
    const vueList: UETransferEditorAttrsItem[] = [];
    _.forEach(attrs, (attr, name) => {
      if (attr.show === false) return;
      if (_.size(attr.datas) > 0) {
        const list = attr['dataEx'] = [];
        _.forEach(attr.datas, function (item) {
          if (!item) return;
          list.push(_.isString(item) ? { text: item, value: item } : item);
        });
      }

      // 是否 v- 属性，如 v-if....
      attr['isPrefxV'] = _vReg.test(attr.name);

      if (attr.event) {
        if (attr.cust)
          eventCustList.push(attr);
        else
          eventList.push(attr);
      } else if (attr.vue) {
        vueList.push(attr);
      } else {
        if (attr.cust)
          attrCustList.push(attr);
        else
          attrList.push(attr);
      }
    });

    const attrGroupList = _makeGroupList(attrList);
    let isAddBtn = 'isAddBtn';
    attrGroupList.push({
      group: '自定义属性',
      order: 999,
      value: {},
      items: [
        ..._.orderBy(attrCustList, 'name', 'asc'),
        {
          [isAddBtn]: true, value: '',
          name: '_ue_cust_attr_add_', text: '添加属性',
          placeholder: '属性名称', order: 999,
          codeBtn: false, enabledBind: false
        }
      ]
    });
    let html = this._makeFormDom(attrGroupList);
    $(this.$refs.attrContent).html(html);

    const eventGroupList = _makeGroupList(eventList);
    eventGroupList.push({
      group: '自定义事件',
      order: 999,
      value: {},
      items: [
        ..._.orderBy(eventCustList, 'name', 'asc'),
        {
          [isAddBtn]: true, value: '',
          name: '_ue_cust_event_add_', text: '添加事件',
          placeholder: '事件名称', order: 999,
          codeBtn: false, enabledBind: false
        }
      ]
    });
    html = this._makeFormDom(eventGroupList);
    $(this.$refs.eventContent).html(html);

    const vueGroupList = _makeGroupList(vueList);
    html = this._makeFormDom(vueGroupList);
    $(this.$refs.vueContent).html(html);

    LayuiRender.render(this.$el);

  }


  private _makeFormItemDom(group: GroupItem) {
    const htmlFormItemList = [];

    let colIndex = 0, isClose = true;
    let last = _.last(group.items);
    _.forEach(group.items, (attr, index) => {
      const isLast = attr == last;
      const isRow = attr.row || (isLast && isClose);//最后一个自动占一行
      const row = isRow ? '12' : '6';
      colIndex++;

      const attrBind = attr.enabledBind || attr.bind || attr['isPrefxV'] || attr.event ? ' attr-bind' : ''
      const attrBindColor = attr.enabledBind ? (attr.bind ? ' layui-bg-blue-active' : 'layui-bg-blue') : attr['isPrefxV'] || attr.event || attr.bind ? ` layui-bg-gray` : '';
      const attrBindHtml = !attrBind ? '' : `<span class="layui-badge ${attrBindColor}">
      ${attr.event ? '@' : (attr['isPrefxV'] ? 'v' : (attr.enabledBind ? ':' : ''))}
      </span>`;

      const desc = attr.desc ? `<i class="layui-icon layui-icon-about"></i>` : '';

      const attrCode = ' attr-code';
      const codeBtn = attr.codeBtn !== false ? '<i class="layui-icon layui-icon-form"></i>' : '';
      const htmlClose = isRow && !isClose ? '</div></div>' : '';
      const isAddBtn = attr['isAddBtn'];
      const htmlHead = isRow || colIndex == 1 ? `<div class="layui-form-item${isAddBtn ? ' uieditor-add-item' : ''}">
      <div class="layui-row layui-col-space4">` : '';
      const htmlEnd = isRow || colIndex == 2 ? `</div></div>` : '';
      isClose = !!htmlEnd;


      let attrInputHtml: string;
      if (isAddBtn) {
        attrInputHtml = `<input
        type="text"
        name="addEvent"
        required
        placeholder="${attr.placeholder || attr.text || attr.name}"
        autocomplete="off"
        class="layui-input"
      />
      <div class="layui-btn-group">
        <button
          type="button"
          class="layui-btn layui-btn-sm layui-btn-normal"
        >
          <i class="layui-icon">&#xe654;</i>
        </button>
      </div>`;
      } else {
        attrInputHtml = `<input
        type="text"
        name="${attr.name}"
        autocomplete="off"
        placeholder="${attr.placeholder}"
        class="layui-input"
      />`;
      }

      const htmlFormItem = `${htmlClose}${htmlHead}
        <div class="layui-col-xs${row}">
          <label class="layui-form-label">
            ${desc}
            ${attr.text || attr.name}
          </label>
          <div class="layui-input-block${attrBind}${attrCode}">
            ${attrBindHtml}
            ${attrInputHtml}
            ${codeBtn}
          </div>
        </div>
      ${htmlEnd}`;

      if (isClose) colIndex = 0;

      htmlFormItemList.push(htmlFormItem);
    });
    if (!isClose) htmlFormItemList.push(`</div></div>`);
    return htmlFormItemList.join('')
  }

  private _makeFormDom(groupList: GroupItem[]) {

    const htmlGroupList = [];
    _.forEach(groupList, (groupItem, index) => {
      const groupName = (groupItem.group || '').replace('___ue_event_', '事件').replace('___ue_vue_', 'Vue');
      const htmlGroup = `<div class="layui-colla-item"><h2 class="layui-colla-title">
      <span class="editor-pane-collapse-title">${groupName}</span>
      <i class="layui-icon layui-colla-icon"></i>
    </h2><div class="layui-colla-content layui-show"><form
    class="layui-form layui-form-pane1 uieditor-form"
    action=""
    lay-filter="attrg${index}"
  >${this._makeFormItemDom(groupItem)}</form></div></div>`;
      htmlGroupList.push(htmlGroup);
    });

    return htmlGroupList.join('');
  }


}
