import { UEOption } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UERender } from './base/ue-render';
import { UEService } from './base/ue-service';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueProvide, UEVueWatch } from './base/vue-extends';
import uieditorCpAttr from './components/uieditor-cp-attr.component.vue';
import uieditorCpTree from './components/uieditor-cp-tree.component.vue';
import uieditorMonacoEditor from './components/uieditor-monaco-editor.component.vue';
import { LayuiHelper } from './layui/layui-helper';
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
    return UERender.GlobalTransferToOptions(options);
  }

  @UEVueProp()
  private json!: UEOption;

  @UEVueWatch('optionEx')
  private _wOptions(options) {
    if (this.service) {
      const json = this.service.getJson();
      (this.service as any).options = options;
      this.service.setJson(json);
    }
  }

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
    this._initEvents();
    const options = this.optionEx || {};
    await UECompiler.init({ bable: options.babel !== false });
    const service = this.service;
    this.current = service.current;
    await service.setJson(this.json);
    await this.$nextTick();
    this.contextmenu();
    // LayuiRender.render(this.$el);

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

        // const fromEl = ev.fromEl;
        // const renderId = _getIdByContent(fromEl);
        // let render = this.getRenderItem(renderId);
        // let editor = _getRenderEditor(render);
        // if (!editor) return;
        // const operation = editor.operation;
        // const pRender = this.getParentRenderItem(render);
        // const parentId = _getRenderId(pRender);
        // // let pContainerBox = false;
        // const pEditor = _getRenderEditor(pRender);
        // if (!pEditor) return;
        // const pOperation = pEditor.operation;
        // if (editor.containerBox) editor = pEditor;
        // let containerBox = editor.containerBox;
        // // if (containerBox) pContainerBox = true;
        // const title = containerBox ? '' : editor.textFormat(editor, _getRenderAttrs(render));
        let isCollapse = false;
        let collapseFn;
        if (!editor.base || editor.collapse) {
          isCollapse = UERender.isCollapse(attrs);
          collapseFn = (e) => {
            this.service.collapse(renderId)
          };
        }

        // BgLogger.debug('fromEl', fromEl)
        const control = {
          title: {
            // show: !containerBox,
            // isCollapse: collapse,
            collapse: collapseFn,
            text,
            show: true,
            isCollapse,
            // collapse(e) {
            //   // this.collapse(renderId)
            //   // BgLogger.debug('collapse', e);
            // }
          },
          toolbars: [{
            text: '复制',
            icon: 'layui-icon layui-icon-file-b',
            show: true,
            click: (item, e) => {
              LayuiHelper.msg('复制! - ' + this.service.current.id);
              // this.copyCurToNext(parentId, renderId, true);
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

  }

  private contextmenu() {

    //右键菜单
    layui.dropdown.render({
      elem: '.uieditor-drag-item,.uieditor-drag-content', //也可绑定到 document，从而重置整个右键
      trigger: 'contextmenu', //contextmenu
      isAllowSpread: false, //禁止菜单组展开收缩
      //style: 'width: 200px', //定义宽度，默认自适应
      id: 'ue-contextmenu', //定义唯一索引
      data: (p) => {
        const current = this.service.current;
        const id = current.id;
        const canPaste = this.service.canPaste;

        console.log('data', p);
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
                click: (item) => {
                  this.service.pasteCur('before');
                }
              },
              {
                title: '后 面',
                click: (item) => {
                  this.service.pasteCur('after');
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
      },
      click: function (obj, jo) {
        if (!obj.disabled)
          obj?.click(obj, jo);
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
