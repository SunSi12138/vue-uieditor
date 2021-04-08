import _ from 'lodash';
import { UETransferEditorAttrs, UETransferEditorAttrsItem } from '../base/ue-base';
import { UEHelper } from '../base/ue-helper';
import { UEService } from '../base/ue-service';
import { UETransFn, UEVue, UEVueComponent, UEVueInject, UEVueLife } from '../base/vue-extends';
import { LayuiHelper } from '../layui/layui-helper';
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

  isEmpty = false;

  renderId: string;

  setTab(index) {
    this.service['_attr_tabcurindex_'] = index;
  }

  @UEVueLife('created')
  private _c1() {
    const current = this.service.current;
    this.renderId = current.id;
    this.isEmpty = _.size(current.attrs) == 0
    if (this.isEmpty) return;
  }

  @UEVueLife('mounted')
  private _m1() {
    if (this.isEmpty) return;
    this._initEvent();
    this._makeAttrs();
  }

  @UEVueLife('destroyed')
  private _d1() {
    layui.off('select', 'form');
    LayuiRender.destroy(this.$el);
  }

  private refresh() {
    layui.off('select', 'form');
    const current = this.service.current;
    this.isEmpty = _.size(current.attrs) == 0
    this._makeAttrs();
  }

  private _model;
  private _attrs: UETransferEditorAttrs;
  private _makeAttrs() {
    if (this.isEmpty) return;
    const attrs: UETransferEditorAttrs = this._attrs = _.cloneDeep(this.service.current.attrs);
    const attrList: UETransferEditorAttrsItem[] = [];
    const attrCustList: UETransferEditorAttrsItem[] = [];
    const eventList: UETransferEditorAttrsItem[] = [];
    const eventCustList: UETransferEditorAttrsItem[] = [];
    const vueList: UETransferEditorAttrsItem[] = [];
    const model = {};
    _.forEach(attrs, (attr, name) => {
      if (attr.show === false) return;
      if (_.size(attr.datas) > 0) {
        const datas = [];
        _.forEach(attr.datas, function (item) {
          if (!item) return;
          datas.push(_.isString(item) ? { text: item, value: item } : item);
        });
        attr.datas = datas;
      }
      model[name] = attr.value;

      // 是否 v- 属性，如 v-if....
      attr['isPrefxV'] = _vReg.test(name);

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
    this._model = model;

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

    this._renderDom();

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
      const name = attr.key;

      const attrBind = attr.enabledBind || attr.bind || (attr.type != 'boolean-only' && attr['isPrefxV']) || attr.event ? ' attr-bind' : ''
      const attrBindColor = attr.enabledBind ? (attr.bind ? ' layui-bg-blue-active' : 'layui-bg-blue')
        : (attr['isPrefxV'] || attr.event || attr.bind ? ` layui-bg-gray` : '');
      const attrBindHtml = !attrBind ? '' : `<span name="${name}" class="layui-badge ${attrBindColor}">
      ${attr.event ? '@' : (attr['isPrefxV'] ? 'v' : ':')}
      </span>`;

      const desc = attr.desc ? `<i name="${name}" class="layui-icon layui-icon-about"></i>` : '';

      const attrCode = attr.codeBtn !== false ? ' attr-code' : '';
      const codeBtn = attr.codeBtn !== false ? `<i ue-attr-codebtn name="${name}" class="layui-icon layui-icon-form"></i>` : '';
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
        name="${name}"
        ue-attr-addinput
        placeholder="${attr.placeholder || ''}"
        autocomplete="off"
        class="layui-input"
      />
      <div class="layui-btn-group">
        <button
          type="button"
          ue-attr-addbtn
          name="${name}"
          class="layui-btn layui-btn-sm layui-btn-normal"
        >
          <i name="${name}" class="layui-icon">&#xe654;</i>
        </button>
      </div>`;
      } else {
        switch (attr.type) {
          case 'slider':
            attrInputHtml = `<div ue-slider name="${name}"></div>`;
            break;
          case 'select':
          case 'boolean':
            attrInputHtml = `<div ue-selectInput name="${name}"></div>`;
            break;
          case 'boolean-only':
            attrInputHtml = `<input type="checkbox" name="${name}" lay-skin="switch" title="开关">`;
            break;
          case 'select-only':
            const datas = attr.datas;
            const sHtmlList = _.map(datas, function (item) {
              return `<option value="${item.value}">${item.text}</option>`;
            });
            attrInputHtml = `<select
              name="${name}"
            >
              ${sHtmlList.join('')}
            </select>`;
            break;
          default:
            attrInputHtml = `<input
            type="text"
            name="${name}"
            autocomplete="off"
            placeholder="${attr.placeholder || ''}"
            class="layui-input"
          />`;
            break;
        }
      }

      const htmlFormItem = `${htmlClose}${htmlHead}
        <div class="layui-col-xs${row}">
          <label class="layui-form-label">
            ${desc}
            ${attr.text}
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


  private _formName = `attrform-${UEHelper.makeAutoId()}`

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
    lay-filter="${this._formName}"
  >${this._makeFormItemDom(groupItem)}</form></div></div>`;
      htmlGroupList.push(htmlGroup);
    });

    return htmlGroupList.join('');
  }

  private _initEvent() {
    const jo = $(this.$el);
    const $this = this;

    const tabIndex = this.service['_attr_tabcurindex_'] || 0;
    if (tabIndex > 0)
      jo.find('.layui-tab-title').children().eq(tabIndex).trigger('click');


    //绑定切换
    jo.on('click', '.layui-bg-blue,.layui-bg-blue-active', function (e) {
      var jo = $(e.target);
      const name = $(e.target).attr('name');
      const attr = $this._attrs[name];

      if (jo.hasClass('layui-bg-blue-active')) {
        jo.addClass('layui-bg-blue');
        jo.removeClass('layui-bg-blue-active');
        if (attr) attr.bind = false;
      } else {
        jo.addClass('layui-bg-blue-active');
        jo.removeClass('layui-bg-blue');
        if (attr) attr.bind = true;
      }
      $this._changeAttr(name, false);
    });

    //禁止绑定切换按钮选择
    jo.on('selectstart', '.layui-bg-blue,.layui-bg-gray', function (e) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    });

    //属性描述
    jo.on('click', '.layui-icon-about', function (e) {
      const name = $(e.target).attr('name');
      const attr = $this._attrs[name];
      if (attr && attr.desc) {
        LayuiHelper.msg(attr.desc);
      }
    });

    // 属性代码编辑
    jo.on('click', '[ue-attr-codebtn]', function (e) {
      const name = $(e.target).attr('name');
      const attr = $this._attrs[name];
      if (!attr) return;
      $this.service.showMonacoEditorOther({
        content: $this._model[name],
        language: attr.language as any || 'javascript',
        save(content) {
          $this._change(name, content);
          layui.form.val(this._formName, { [name]: content });
        }
      });
    });


    const addAttr = function (e) {
      const inputName = $(e.target).attr('name');
      const isEvent = inputName === '_ue_cust_event_add_';
      const name = _.trim($(`input[name="${inputName}"]`).val() as string || '');
      if (!name) return;
      const attr = $this.service.addAttr($this.renderId, isEvent ? `@${name}` : name);
      if (attr) {
        $this.refresh();
      }
    };

    jo.on('keydown', '[ue-attr-addinput]', function (e) {
      if (e.keyCode == 13) {
        e.stopPropagation();
        e.preventDefault();
        addAttr(e);
        return false;
      }
    });

    jo.on('click', '[ue-attr-addbtn]', function (e) {
      addAttr(e);
    });
  }

  private _renderDom() {
    const jo = $(this.$el);
    const form = layui.form;
    const selectInput = layui.selectInput,
      slider = layui.slider;
    const model = this._model;
    const attrs = this._attrs;

    form.render();

    jo.find('.layui-form[lay-filter="' + this._formName + '"]').change((e) => {
      var jInput = $(e.target);
      this._change(jInput.attr('name'), jInput.val());
    });

    jo.find('[ue-selectInput]').each(function (index, el) {
      const jItem = $(el);
      const name = jItem.attr('name');
      const attr = attrs[name];
      const datas = attr.datas || [];
      selectInput.render({
        elem: jItem,
        data: _.map(datas, function (item) { return { value: item.value, name: item.text }; }),
        placeholder: attr.placeholder || '',
        name: name,
        remoteSearch: false
      });
    });

    jo.find('[ue-slider]').each((index, el) => {
      const jItem = $(el);
      const name = jItem.attr('name');
      const attr = attrs[name];
      const typeOption = attr.typeOption;

      slider.render(_.assign({
        min: 1,
        max: 24
      }, typeOption, {
        elem: $(el),
        name,
        change: (value) => {
          this._changeAsync(name, value);
        }
      }));
    });

    //初始赋值
    form.val(this._formName, model || {});

    // //事件监听
    form.on('select', (data) => {
      const name = $(data.elem).attr('name');
      this._change(name, data.value);
    });

    form.on('switch', (data) => {
      const name = $(data.elem).attr('name');
      this._change(name, data.elem.checked);
    });

    // form.on('checkbox', function (data) {
    //   console.log(this.checked, data.elem.checked);
    // });

    // form.on('switch', function (data) {
    //   console.log(data);
    // });

    // form.on('radio', function (data) {
    //   console.log(data);
    // });


  }

  @UETransFn((fn) => _.debounce(fn, 50))
  private _changeAsync(name, value) {
    this._change(name, value);
  }

  private _change(name, value) {
    _.set(this._model, name, value);
    const attr = this._attrs[name];
    if (attr) {
      attr.value = value;
      this.service.setAttr(this.renderId, attr);
    }
    // console.warn('form change', this, name, value);
  }

  /**
   * 通知修改了 attr
   * @param name 
   */
  private _changeAttr(name, refresh = true) {
    const attr = this._attrs[name];
    if (attr) {
      this.service.setAttr(this.renderId, attr, refresh);
    }
    // console.warn('form change', this, name, value);
  }

}
