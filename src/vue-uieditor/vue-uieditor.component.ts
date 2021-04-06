import _ from 'lodash';
import { UEMode, UEOption, UETheme, UEToolBar } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UEHelper } from './base/ue-helper';
import { UERender } from './base/ue-render';
import { UEService } from './base/ue-service';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueProvide, UEVueWatch } from './base/vue-extends';
import uieditorCpAttr from './components/uieditor-cp-attr.component.vue';
import uieditorCpTree from './components/uieditor-cp-tree.component.vue';
import uieditorMonacoEditor from './components/uieditor-monaco-editor.component.vue';
import { LayuiRender } from './layui/layui-render';
import './transfer';
import { UEDrag } from './ue-drag';


@UEVueComponent({
  components: {
    'uieditor-cp-tree': uieditorCpTree,
    'uieditor-cp-attr': uieditorCpAttr,
    'uieditor-monaco-editor': uieditorMonacoEditor
  }
})
export default class VueUieditor extends UEVue {

  @UEVueProp()
  private options!: UEOption;

  get optionEx() {
    const options = this.options;
    return UERender.GlobalToOptions(options);
  }

  @UEVueWatch('optionEx')
  private _wOptions(options) {
    if (this.service) {
      const json = this.service.getJson();
      (this.service as any).options = options;
      this.service.setJson(json);
    }
  }

  @UEVueProp()
  private json!: UEOption;

  @UEVueWatch('json')
  private _wJson(json) {
    console.warn('json', json)
    if (this.service) {
      this.service.setJson(json);
    }
  }

  private _service: UEService;
  get service(): UEService {
    if (!this.$isBeingDestroyed && !this._service) {
      this._service = new UEService(this, this.optionEx);
    }
    return this._service;
  }
  @UEVueProvide('service')
  private _pService() {
    return this.service;
  }
  @UEVueProvide('uieditor')
  private _pUiEditor() {
    return this;
  }


  @UEVueProp()
  private theme!: UETheme;
  get themeEx(): UETheme {
    return this.theme || {};
  }
  get modes(): UEMode[] {
    return this.themeEx.modes;
  }
  get toolbar(): UEToolBar[] {
    return this.themeEx.toolBar;
  }
  get hasToolbar() {
    return _.size(this.toolbar) > 0;
  }
  toolbarDisabled(item) {
    let disabled = item.disabled;
    if (_.isFunction(disabled)) {
      disabled = disabled.call(item, { item, service: this.service });
    }
    item._ue_disabled;
    return disabled;
  }
  toolbarClick(event, item) {
    if (item._ue_disabled || !item.click) return;
    item.click({ item, event, service: this.service });
  }
  hasMode(mode: UEMode) {
    return !this.modes || _.includes(this.modes, mode);
  }

  current: any = null;

  get isInited() {
    return !!this.current?.json;
  }

  private _initEvents() {
    const $: JQueryStatic = layui.$,
      layer = layui.layer;
    const jo = $(this.$el);

    jo.click(function () {
      closeTip();
    });
    let tipId;
    const closeTip = function () {
      if (!tipId) return;
      layer.close(tipId);
      tipId = null;
    };
    jo.on('mouseenter', '[layui-tip]', (e) => {
      const jTip = $(e.currentTarget);
      const text = jTip.attr('layui-tip');
      if (!text) return;
      tipId = layer.tips(text, jTip, {
        tips: (~~jTip.attr('layui-tip-direction')) || 1
      });
    });
    jo.on('mouseleave', '[layui-tip]', (e) => {
      closeTip();
    });

    jo.on('selectstart', '.layui-tab-title,.tool-bar', (e) => {
      e.stopPropagation();
      e.preventDefault();
      return false;
    });
  }

  _drager: any;

  @UEVueLife('mounted')
  private async _mounted1() {
    const options = this.optionEx || {};
    await UECompiler.init({ bable: options.babel !== false });
    const service = this.service;
    this.current = service.current;
    await service.setJson(this.json);
    await this.$nextTick();
    this.keys();
    this._initEvents();
    layui.$(this.$el).on('click', '.tool-bar, .editor-json-content, .uieditor-mode-title', (e) => {
      this.service.foucs();
    });

    this.$on('on-refesh-select-box', ({ service, id }) => {
      drager.select(id);
    });
    this.$on('on-set-json', ({ service, json }) => {
      drager.select(service.current.id);
      this.contextmenu();
    });
    this.$on('on-change-mode', ({ service, mode, oldMode }) => {
      if (mode != 'design') {
        drager.unSelect();
      }
    });

    const drager = this._drager = UEDrag.dragStart(this.$el, {
      select: (e) => {
        const { fromEl } = e;
        const id = fromEl.id;
        this.service.setCurrent(id);
      },
      dragstart(e) {
        return true;
      },
      dragover(e) {
        return true;
      },
      drop: (e) => {
        const { $, isTreeNode, fromEl, toEl, pos } = e;
        if (isTreeNode) {
          const cpId = $(fromEl).data('id');
          const renderId = toEl.id;
          this.service.addComponent(cpId, renderId, pos.type2);
        } else {
          const fromId = fromEl.id;
          const toId = toEl.id;
          this.service.move(fromId, toId, pos.type2);

        }
        return true;
      },
      control: (ev) => {
        const fromEl = ev.fromEl;
        const renderId = fromEl?.id;
        if (!renderId) return;
        const curRender = this.service.getRenderItem(renderId);
        if (!curRender) return;

        const { editor, attrs } = curRender;
        const text = curRender.editor?.textFormat(editor, attrs);

        let isCollapse = false;
        let collapseFn;
        if (!editor.base || editor.collapse) {
          isCollapse = UERender.isCollapse(attrs);
          collapseFn = (e) => {
            this.service.collapse(renderId)
          };
        }

        const control = {
          title: {
            collapse: collapseFn,
            text,
            show: true,
            isCollapse
          },
          toolbars: [{
            text: '复制',
            icon: 'layui-icon layui-icon-file-b',
            show: true,
            click: (item, e) => {
              this.service.copyCurToNext()
            }
          }, {
            text: '删除',
            icon: 'layui-icon layui-icon-close',
            show: true,
            click: (item, e) => {
              this.service.delCur();
            }
          }]
        };
        return control;
      }
    });
    this.contextmenu();

  }

  private contextmenuFn() {
    const current = this.service.current;
    const id = current.id;
    const canPaste = this.service.canPaste;
    const render = this.service.getCurRender();
    const editor = render?.editor;

    return [
      {
        title: '复 制',
        disabled: !id,
        click: (item) => {
          this.service.copyCur();
        }
      },
      {
        title: '剪 切',
        disabled: !id,
        click: (item) => {
          this.service.cutCur();
        }
      },
      {
        title: '粘 贴',
        disabled: !canPaste,
        click: (item) => {
          this.service.pasteCur();
        }
      },
      {
        title: '粘贴到...',
        disabled: !canPaste || !id,
        child: [
          {
            title: '前 面',
            disabled: !canPaste || !id,
            click: (item) => {
              this.service.pasteCur('before');
            }
          },
          {
            title: '后 面',
            disabled: !canPaste || !id,
            click: (item) => {
              this.service.pasteCur('after');
            }
          },
          {
            title: '子节点',
            disabled: !canPaste || !id || !editor.container,
            click: (item) => {
              this.service.pasteCur('child');
            }
          }
        ]
      },
      { type: '-' }, {
        title: '删 除',
        disabled: !id,
        click: (item) => {
          this.service.delCur();
        }
      }
    ];
  }

  private _isContextMenuInit;
  private contextmenu() {

    if (!this._isContextMenuInit) {
      this._isContextMenuInit = true;
      //右键菜单
      layui.dropdown.render({
        elem: '.uieditor-drag-sel-box',
        trigger: 'contextmenu',
        isAllowSpread: false, //禁止菜单组展开收缩
        //style: 'width: 200px', //定义宽度，默认自适应
        id: 'ue-cxtmenu-' + UEHelper.makeAutoId(), //定义唯一索引
        data: (p) => {
          return this.contextmenuFn();
        },
        click: function (obj, jo) {
          if (!obj.disabled)
            obj?.click(obj, jo);
        }
      });
    }


    //右键菜单
    layui.dropdown.render({
      elem: '.uieditor-drag-item,.uieditor-drag-content',
      trigger: 'contextmenu',
      isAllowSpread: false, //禁止菜单组展开收缩
      //style: 'width: 200px', //定义宽度，默认自适应
      id: 'ue-cxtmenu-' + UEHelper.makeAutoId(), //定义唯一索引
      data: (p) => {
        return this.contextmenuFn();
      },
      click: function (obj, jo) {
        if (!obj.disabled)
          obj?.click(obj, jo);
      }
    });

  }

  private keys() {
    const jContent = layui.$(this.$el).find('.editor-json-content');
    jContent.keyup((e) => {
      if (this.service.current.mode != 'design' || this.$isRouteActived === false || this.$isDestroyed) return;
      let isDone = false;
      const keyCode = e.keyCode;
      if (!e.ctrlKey) {
        switch (keyCode) {
          //del
          case 46:
            this.service.delCur(false);
            isDone = true;
            break;
          //向左选择（父）
          case 37:
            this.service.selectParent();
            isDone = true;
            break;
          //向上选择
          case 38:
            this.service.selectPre();
            isDone = true;
            break;
          //向右选择(第一个子节点)
          case 39:
            this.service.selectChild();
            isDone = true;
            break;
          //向下选择
          case 40:
            //tab
            // case 9:
            this.service.selectNext();
            isDone = true;
            break;
        }
      } else {
        switch (keyCode) {
          //ctrl + f
          // case 70:
          //   this.showSearchList();
          //   isDone = true;
          //   break;
          //ctrl + c
          case 67:
            this.service.copyCur();
            isDone = true;
            break;
          //ctrl + x
          case 88:
            this.service.cutCur();
            isDone = true;
            break;
          //ctrl + v
          case 86:
            this.service.pasteCur();
            isDone = true;
            break;
          //ctrl + z
          case 90:
            this.service.history.pre();
            isDone = true;
            break;
          //ctrl + y
          case 89:
            this.service.history.next();
            isDone = true;
            break;
        }
      }
      if (isDone) {
        this.$refs.jsonFoucs['focus']();
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    });
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    this._drager?.destroy();
    this._service?._destroy();
    this._service = this._drager = null;
    LayuiRender.destroy(this.$el);
  }

}
