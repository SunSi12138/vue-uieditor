import _ from 'lodash';
import { UEMode, UEOption, UETheme, UEToolBar } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UEContextmenuItem } from './base/ue-contextmenu-item';
import { UEHelper } from './base/ue-helper';
import { UERender } from './base/ue-render';
import { UEService } from './base/ue-service';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueProvide, UEVueWatch } from './base/vue-extends';
import uieditorCpAttr from './components/uieditor-cp-attr.component.vue';
import uieditorCpTree from './components/uieditor-cp-tree.component.vue';
import { LayuiHelper } from './layui/layui-helper';
import { LayuiRender } from './layui/layui-render';
import './transfer';
import { UEDrag } from './ue-drag';

function _toolbarDisabled(item, service) {
  let disabled = item.disabled;
  if (_.isFunction(disabled)) {
    disabled = disabled.call(item, { item, service });
  }
  return disabled;
}
function _toolbarShow(item, service) {
  let show = item.show;
  if (_.isFunction(show)) {
    show = show.call(item, { item, service });
  }
  return show !== false;
}

function _makeMenuDivided(menus) {
  const newMenus = [];
  _.forEach(menus, function (item) {
    if (item.show === false) return;
    if (item.divided) {
      newMenus.push({ type: '-' });
    }
    newMenus.push(item);
    if (_.size(item.child) > 0)
      item.child = _makeMenuDivided(item.child);
  });
  return newMenus;
};


@UEVueComponent({
  components: {
    'uieditor-cp-tree': uieditorCpTree,
    'uieditor-cp-attr': uieditorCpAttr
  }
})
export default class VueUieditor extends UEVue {

  @UEVueProp()
  private options!: UEOption;

  get optionEx() {
    const options = UERender.DefineOption(this.options);
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
  private json!: any;

  @UEVueWatch('json')
  private _wJson(json) {
    if (this.service) {
      this.service.setJson(json);
    }
  }

  @UEVueProp()
  private template!: string;

  @UEVueWatch('template')
  private _wTemplate(template) {
    if (this.service) {
      this.service.setTmpl(template);
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
    this._makeToolbarDisabled();
    return this.themeEx.toolBar;
  }
  get hasToolbar() {
    return _.size(this.toolbar) > 0;
  }
  private _makeToolbarDisabled() {
    _.forEach(this.themeEx.toolBar, (item) => {
      item['disabledEx'] = _toolbarDisabled(item, this.service);
      item['showEx'] = _toolbarShow(item, this.service);
      return item;
    });
  }
  toolbarClick(event, item) {
    if (item.disabledEx || !item.click) return;
    item.click({ item, event, service: this.service });
  }
  hasMode(mode: UEMode) {
    return !this.modes || _.includes(this.modes, mode);
  }
  get themeContextmenus() {
    return this.themeEx.contextmenus;
  }

  current: any = null;
  history: any = null;

  get isInited() {
    return !!this.current?.json;
  }

  get isDesign() {
    return this.current.mode == 'design' && !this.current.monacoEditorOther.show;
  }
  get isPreview() {
    return this.current.mode == 'preview' && !this.current.monacoEditorOther.show;
  }
  private _initEvents() {
    const $: JQueryStatic = layui.$,
      layer = layui.layer;
    const jo = $(this.$el);

    const jEditorJsonContent = jo.find('.editor-json-content');
    const jEditorJsonContentIn = jo.find('.editor-json-content-in').children();
    let jEditorJsonContentRest = null;
    var syncEditorContentSize = () => {
      if (this.$isBeingDestroyed || !this.current) return false;
      if (this.service.current.mode != 'design' || this.current.monacoEditorOther.show) return;
      let rest = jEditorJsonContentIn.offset();
      let height = jEditorJsonContentIn.outerHeight() - 5;
      let width = jEditorJsonContentIn.outerWidth();
      _.assign(rest, { height, width });
      if (_.isEqual(jEditorJsonContentRest, rest)) return;
      jEditorJsonContentRest = rest;
      jEditorJsonContent.offset(rest).width(width).height(height);
    }
    LayuiHelper.requestAnimationFrame(syncEditorContentSize, 100);


    //editor-priview-content

    (() => {
      const jPreviewJsonContent = jo.find('.editor-priview-content');
      const jPreviewJsonContentIn = jo.find('.editor-priview-content-in');
      let jPriviewJsonContentRest = null;
      var syncEditorContentSize = () => {
        if (this.$isBeingDestroyed || !this.current) return false;
        if (this.service.current.mode != 'preview' || this.current.monacoEditorOther.show) return;
        let rest = jPreviewJsonContentIn.offset();
        let height = jPreviewJsonContentIn.outerHeight() - 15;
        let width = jPreviewJsonContentIn.outerWidth() - 10;
        _.assign(rest, { height, width });
        if (_.isEqual(jPriviewJsonContentRest, rest)) return;
        jPriviewJsonContentRest = rest;
        jPreviewJsonContent.offset(rest).width(width).height(height);
      }
      LayuiHelper.requestAnimationFrame(syncEditorContentSize, 100);
    })();

    jo.click(() => {
      closeTip();
      this._makeToolbarDisabled();
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
    jo.on('mousedown', '[layui-tip]', (e) => {
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
    this.history = service.history;

    if (this.json)
      await service.setJson(this.json);
    else if (this.template)
      await service.setTmpl(this.template);
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
      canSelect: (e) => {
        const { isTreeNode, fromEl } = e;
        if (isTreeNode) return true;
        const fromId = fromEl.id;
        if (!this.service.canSelect(fromId)) return false;
      },
      select: (e) => {
        const { fromEl } = e;
        const id = fromEl.id;
        this.service.setCurrent(id);
      },
      canMove: (e) => {
        const { isTreeNode, fromEl } = e;
        if (isTreeNode) return true;
        const fromId = fromEl.id;
        const toId = '';//toEl.id;
        if (!this.service.canMove(fromId, '', 'in')) return false;
      },
      dragstart: (e) => {
        return true;
      },
      dragover: (e) => {
        const { $, isTreeNode, fromEl, toEl, pos } = e;
        if (!pos) return false;
        if (isTreeNode) {
          const cpId = $(fromEl).data('id');
          const renderId = toEl.id;
          if (!this.service.canAddByDrag(cpId, renderId, pos.type2)) return false;
        } else {
          const fromId = fromEl.id;
          const toId = toEl.id;
          if (!this.service.canMove(fromId, toId, pos.type2)) return false;
        }
        return true;
      },
      drop: (e) => {
        const { $, isTreeNode, fromEl, toEl, pos } = e;
        if (!pos) return false;
        if (isTreeNode) {
          const cpId = $(fromEl).data('id');
          const renderId = toEl.id;

          if (!this.service.canAddByDrag(cpId, renderId, pos.type2)) return false;
          this.service.addByDrag(cpId, renderId, pos.type2);
        } else {
          const fromId = fromEl.id;
          const toId = toEl.id;
          if (!this.service.canMove(fromId, toId, pos.type2)) return false;
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
          isCollapse = this.service.isCollapse(curRender);
          collapseFn = (e) => {
            this.service.collapse(curRender, !isCollapse);
          };
        }

        //editor contextmenus
        const editorToolbars = editor?.toolbar;
        const editorToolbarMenus = !isCollapse && editorToolbars && editorToolbars({
          render: curRender,
          service,
          attrs: curRender?.attrs,
          editor
        }) || [];


        const isLocked = service.isLocked(curRender)

        const control = {
          title: {
            collapse: collapseFn,
            text,
            show: true,
            isCollapse
          },
          toolbars: [
            ...editorToolbarMenus,
            {
              title: isLocked ? '解锁' : '锁定',
              icon: `layui-icon ${isLocked ? 'layui-icon-key' : 'layui-icon-password'}`,
              show: !isCollapse && !!collapseFn,
              click: () => {
                this.service.locked(renderId, !isLocked);
              }
            },
            {
              title: '复制',
              icon: 'layui-icon layui-icon-file-b',
              show: service.canCopy(renderId),
              click: () => {
                this.service.copyCurToNext()
              }
            }, {
              title: '删除',
              icon: 'layui-icon layui-icon-close',
              show: service.canRemove(renderId),
              click: () => {
                this.service.delCur(false);
              }
            }] as UEContextmenuItem[]
        };
        return control;
      }
    });
    this.contextmenu();

    this.$emit('on-ready', { service });

  }

  private contextmenuFn() {
    const service = this.service;
    const canPaste = service.canPaste;
    const render = service.getCurRender();
    const editor = render?.editor;

    //editor contextmenus
    const editorContextMenus = editor?.contextmenu;
    const editorMenus = editorContextMenus && editorContextMenus({
      render,
      service,
      attrs: render?.attrs,
      editor
    }) || [];

    //theme contextmens
    const themeContextmenus = this.themeContextmenus;
    const themeMenus = themeContextmenus && themeContextmenus({
      render,
      service,
      parent: service.getParentRenderItem(render),
      editor
    }) || [];

    if (_.size(editorMenus) > 0 && _.size(themeMenus) > 0) {
      _.first(themeMenus).divided = true;
    }
    const addMenus = [...editorMenus, ...themeMenus];

    const menus = [
      ...addMenus,
      {
        title: '复 制',
        divided: _.size(addMenus) > 0,
        click: (item) => {
          this.service.copyCur();
        }
      },
      {
        title: '剪 切',
        disabled: !render,
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
        disabled: !canPaste || !render,
        child: [
          {
            title: '前 面',
            disabled: !canPaste || !render,
            click: (item) => {
              this.service.pasteCur('before');
            }
          },
          {
            title: '后 面',
            disabled: !canPaste || !render,
            click: (item) => {
              this.service.pasteCur('after');
            }
          },
          {
            title: '子节点',
            disabled: !canPaste || !render || !editor.container,
            click: (item) => {
              this.service.pasteCur('child');
            }
          }
        ]
      },
      {
        title: '删 除',
        disabled: !render,
        divided: true,
        click: (item) => {
          this.service.delCur();
        }
      }
    ] as UEContextmenuItem[];

    return _makeMenuDivided(menus);
  }

  private _contextMenuDD1: any;
  private _contextMenuDD2: any;
  private contextmenu() {

    if (!this._contextMenuDD1) {
      //右键菜单
      this._contextMenuDD1 = layui.dropdown.render({
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


    if (this._contextMenuDD2) this._contextMenuDD2.destroy();
    //右键菜单
    this._contextMenuDD2 = layui.dropdown.render({
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

  async about() {
    const theme = this.themeEx;
    const content = !theme.about ? `<a href="${process.env.VUE_APP_UE_HOMEPAGE}" target="_blank">${process.env.VUE_APP_UE_NAME.toUpperCase()} ${process.env.VUE_APP_UE_VERSION} (2021)</a><div>${process.env.VUE_APP_UE_DESC}</div>`
      : await theme.about({ service: this.service });
    LayuiHelper.alert(content, { title: '关于' });
  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    this._contextMenuDD1?.destroy();
    this._contextMenuDD2?.destroy();

    this._drager?.destroy();
    this._service?._destroy();
    this._service = this._drager =
      this._contextMenuDD1 = this._contextMenuDD2 =
      this.current = null;
    LayuiRender.destroy(this.$el);
  }

}
