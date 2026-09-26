import {Detector} from '../detector';
import {DetectorType} from 'src/utils/enum';
import {now, IS} from 'src/utils/util';

export default class extends Detector {

  constructor () {
    super({
      type: DetectorType.Debugger,
      enabled: IS.iosChrome || IS.iosEdge,
    });
  }

  detect () {
    const date = now();
    (() => {debugger;})();
    if (now() - date > 100) {
      this.onDevToolOpen();
    }
  }
}