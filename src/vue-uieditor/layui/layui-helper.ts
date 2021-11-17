import _ from 'lodash';
import './layui-import';

export interface LayuiLayerOption {
  content?: string;
  time?: number;
  shade?: boolean;
  skin?: string;
  title?: string | false;
  //是否显示关闭按钮
  closeBtn?: boolean;
  btn?: string[] | false,
  resize?: boolean;
  end?(): void;
};

const layer = layui.layer;

export class LayuiHelper {

  /**
   * 返回 true | false | undefined
   * @param msg 
   */
  static confirm(msg: string, option?: LayuiLayerOption): Promise<boolean | undefined> {
    return new Promise(function (r) {
      let isEnd = false;
      const fn = function (res?: any) {
        if (isEnd) return;
        isEnd = true;
        r(res);
      };
      layer.confirm(msg, _.assign({
        btn: ['确定', '取消'],
        title: '确认框'
      }, option, {
        end() {
          if (option?.end) option.end();
          fn(null);
        }
      }), function (index) {
        layer.close(index);
        fn(true);
      }, function (index) {
        fn(false);
      });
    });
  }

  /**
   * 返回 true | false | undefined
   * @param msg 
   */
  static alert(msg, option?: LayuiLayerOption): Promise<boolean | undefined> {
    return new Promise(function (r) {
      layer.alert(msg, _.assign({}, option, {
        // btn: ['确定', '取消'],
        end() {
          if (option?.end) option.end();
          r(null)
        }
      }));
    });
  }

  /**
   * 返回 true | false | undefined
   * @param msg 
   */
  static prompt(msg, option?: LayuiLayerOption): Promise<any> {
    return new Promise(function (r) {
      layer.prompt(_.assign({ title: msg, formType: 1 }, option, {
        end() {
          if (option?.end) option.end();
          r(null);
        }
      }), function (s, index) {
        layer.close(index);
        r(s);
      });
    });
  }

  static msg(msg, option?: LayuiLayerOption) {
    return new Promise(function (r) {
      layer.msg(msg, _.assign({
        time: 0, //20s后自动关闭
        btn: ['确定']
      }, option, {
        end() {
          if (option?.end) option.end();
          r(null)
        }
      }));
    });
  }

  /**
   * requestAnimationFrame, fn返回 false 停止
   * @param fn 
   * @param tick 
   * @param once， 只处理一次 
   */
  static requestAnimationFrame(fn, tick, once?:boolean) {
    if (!once && fn() === false) return;
    (function done() {
      setTimeout(function () {
        requestAnimationFrame(function () {
          if (fn() === false) return;
          if (once) return;
          done();
        });
      }, tick || 1);
    })();
  }

}