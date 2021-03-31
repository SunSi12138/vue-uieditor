import { UEService } from '../base/ue-service';
import { UEVue, UEVueComponent, UEVueInject, UEVueLife } from '../base/vue-extends';
import { LayuiRender } from '../layui/layui-render';
import _ from 'lodash';
import { UETransferEditorAttrs, UETransferEditorAttrsItem } from '../base/ue-base';

type GroupItem = {
  group: string;
  order: number;
  value: UETransferEditorAttrsItem;
  items: UETransferEditorAttrsItem[];
}


const _vReg = /^\s*v\-*/;

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
      if (attr.event) attr.group = '___ue_event_';
      if (attr.vue) attr.group = '___ue_vue_';
      attrList.push(attr);
    });
    console.warn('attrList', attrList);
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
    console.warn('groupList', groupList);

    const $: JQueryStatic = layui.$;

    const attrGroupList = _.filter(groupList, function (item) { return item.group != '___ue_event_' && item.group != '___ue_vue_'; });
    let html = this._makeFormDom(attrGroupList);
    $(this.$refs.attrContent).html(html);

    const eventGroupList = _.filter(groupList, function (item) { return item.group == '___ue_event_'; });
    html = this._makeFormDom(eventGroupList);
    $(this.$refs.eventContent).html(html);

    const vueGroupList = _.filter(groupList, function (item) { return item.group == '___ue_vue_'; });
    html = this._makeFormDom(vueGroupList);
    $(this.$refs.vueContent).html(html);

    LayuiRender.render(this.$el);

  }


  private _makeFormItemDom(group: GroupItem) {
    const htmlFormItemList = [];

    const addFormItem = `<div class="layui-form-item uieditor-add-item">
    <label class="layui-form-label">添加属性</label>
    <div class="layui-input-block">
      <input
        type="text"
        name="addEvent"
        required
        placeholder="属性名称"
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
      </div>
    </div>
  </div>`;

    let colIndex = 0, isClose = true;
    let last = _.last(group.items);
    _.forEach(group.items, (item, index) => {
      const isLast = item == last;
      const isRow = item.row || (isLast && isClose);//最后一个自动占一行
      const row = isRow ? '12' : '6';
      colIndex++;

      const attrBind = item.enabledBind || item.bind || item['isPrefxV'] || item.event ? ' attr-bind' : ''
      const attrBindColor = item.enabledBind ? (item.bind ? ' layui-bg-blue-active' : 'layui-bg-blue') : item['isPrefxV'] || item.event || item.bind ? ` layui-bg-gray` : '';
      const attrBindHtml = !attrBind ? '' : `<span class="layui-badge ${attrBindColor}">
      ${item.event ? '@' : (item['isPrefxV'] ? 'v' : (item.enabledBind ? ':' : ''))}
      </span>`;

      const desc = item.desc ? `<i class="layui-icon layui-icon-about"></i>` : '';

      const attrCode = ' attr-code';
      const codeBtn = item.codeBtn !== false ? '<i class="layui-icon layui-icon-form"></i>' : '';
      const htmlClose = isRow && !isClose ? '</div></div>' : '';
      const htmlHead = isRow || colIndex == 1 ? `<div class="layui-form-item">
      <div class="layui-row layui-col-space4">` : '';
      const htmlEnd = isRow || colIndex == 2 ? `${isLast ? addFormItem : ''}</div></div>` : '';
      isClose = !!htmlEnd;
      const htmlFormItem = `${htmlClose}${htmlHead}
        <div class="layui-col-xs${row}">
          <label class="layui-form-label">
            ${desc}
            ${item.text || item.name}
          </label>
          <div class="layui-input-block${attrBind}${attrCode}">
            ${attrBindHtml}
            <input
              type="text"
              name="disabled"
              autocomplete="off"
              class="layui-input"
            />
            ${codeBtn}
          </div>
        </div>
      ${htmlEnd}`;

      if (isClose) colIndex = 0;

      htmlFormItemList.push(htmlFormItem);
    });
    if (!isClose) htmlFormItemList.push(`${addFormItem}</div></div>`);
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
