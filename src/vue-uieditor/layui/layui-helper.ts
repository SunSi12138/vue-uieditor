import _ from 'lodash';
import './layui-import';

export interface LayuiLayerOption {
  content: string;
  time: number;
  shade: boolean;
  skin: string;
  title: string | false;
  //是否显示关闭按钮
  closeBtn: boolean;
  btn: string[] | false,
  resize: boolean;
  end(): void;
};

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
      layui.layer.confirm(msg, _.assign({
        btn: ['确定', '取消'],
        title:'确认框'
      }, option, {
        end() {
          if (option?.end) option.end();
          fn();
        }
      }), function (index) {
        layui.layer.close(index);
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
      layui.layer.alert(msg, _.assign({}, option, {
        // btn: ['确定', '取消'],
        end() {
          if (option?.end) option.end();
          r()
        }
      }));
    });
  }

  static msg(msg, option?: LayuiLayerOption) {
    return new Promise(function (r) {
      layui.layer.msg(msg, _.assign({
        time: 0, //20s后自动关闭
        btn: ['确定']
      }, option, {
        end() {
          if (option?.end) option.end();
          r()
        }
      }));
    });
  }

}