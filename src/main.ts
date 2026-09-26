import './utils/log';
import {disableKeyAndMenu} from './utils/key-menu';
import {initInterval} from './utils/interval';
import {getUrlParam, initIS, initNative, IS} from './utils/util';
import {mergeConfig, config} from './utils/config';
import md5 from './utils/md5';
import sha256 from './utils/sha256';
import version from './version';
import {initDetectors} from './detector/index';
import {DetectorType} from './utils/enum';
import {isDevToolOpened} from './utils/open-state';
import {IConfig, IUnableDevtool} from './type';
import {initLogs} from './utils/log';
import {checkScriptUse} from './plugins/script-use';

let running = false, suspended = false;

export const unableDevtool: IUnableDevtool = Object.assign(((opts?: Partial<IConfig>) => {
  const r = (reason = '') => ({success: !reason, reason});
  if (running) return r('already running');
  initIS(); // ! 首先初始化env
  initNative(); // 保存原生方法
  initLogs(); // 然后初始化log
  mergeConfig(opts);
  // 被 token 绕过 或者
  if (checkTk()) return r('token passed');
  // 开启了保护seo 并且 是seobot
  if ((config.seo && IS.seoBot)) return r('seobot');
  running = true;
  initInterval(unableDevtool);
  disableKeyAndMenu(unableDevtool);
  initDetectors();
  return r();
}), {
  md5,
  sha256,
  version,
  DetectorType,
  isDevToolOpened,
} as any);

// strict 模式下忽略外部写入，防止 javascript:UnableDevtool.isSuspend=true 绕过
Object.defineProperties(unableDevtool, {
  isRunning: {get: () => running, set: (v: boolean) => {if (!config.strict) running = v;}},
  isSuspend: {get: () => suspended, set: (v: boolean) => {if (!config.strict) suspended = v;}},
});

function checkTk () {
  if (!config.sha256 && !config.md5) return false;
  const tk = getUrlParam(config.tkName);
  if (!tk) return false;
  // 命中tk，优先使用 sha256
  return config.sha256 ?
    sha256(tk) === config.sha256.toLowerCase() :
    md5(tk) === config.md5;
}

const options = checkScriptUse();
if (options) {
  unableDevtool(options);
}