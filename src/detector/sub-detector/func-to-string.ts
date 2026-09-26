import {Detector} from '../detector';
import {DetectorType} from 'src/utils/enum';
import {clearLog, log} from 'src/utils/log';
import {IS} from 'src/utils/util';

export default class extends Detector {
  count: number;
  func: Function;

  constructor () {
    super({
      type: DetectorType.FuncToString,
      enabled: (!IS.iosChrome && !IS.iosEdge),
    });
  }

  init () {
    this.count = 0;
    this.func = () => {};
    this.func.toString = () => {
      this.count ++;
      return '';
    };
  }

  detect () {
    this.count = 0;
    log(this.func);
    clearLog();
    if (this.count >= 2) {
      this.onDevToolOpen();
    }
  }
}