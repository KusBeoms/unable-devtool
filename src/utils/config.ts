import {IConfig} from '../type';
import {closeWindow} from './close-window';

export const config: IConfig = {
  md5: '',
  sha256: '',
  strict: false,
  ondevtoolopen: closeWindow, // ondevtoolopen 优先级高于 url
  ondevtoolclose: null, // ondevtoolclose 监听
  url: '',
  timeOutUrl: '',
  tkName: 'ddtk',
  interval: 500,
  disableMenu: true, // 是否禁用右键菜单
  stopIntervalTime: 5000, // 在移动端时取消监视的等待时长
  clearIntervalWhenDevOpenTrigger: false, // 是否在触发之后停止监控
  detectors: [1, 3, 4, 5, 6, 7], // 默认不启用 size / reg-to-string 检测器，防止误伤
  clearLog: true,
  disableSelect: false,
  disableInputSelect: false,
  disableCopy: false,
  disableCut: false,
  disablePaste: false,
  ignore: null,
  disableIframeParents: true,
  seo: true,
  rewriteHTML: '',
};

const MultiTypeKeys = ['detectors', 'ondevtoolclose', 'ignore'];

export function mergeConfig (opts: Partial<IConfig> = {}) {
  if (opts.onDevtoolOpen) { opts.ondevtoolopen = opts.onDevtoolOpen; }
  if (opts.onDevtoolClose) { opts.ondevtoolclose = opts.onDevtoolClose; }
    
  for (const key in config) {
    const k = key as keyof IConfig;
    if (
      typeof opts[k] !== 'undefined' &&
        (typeof config[k] === typeof opts[k] || MultiTypeKeys.indexOf(k) !== -1)
    ) {
      (config as any)[k] = opts[k];
    }
  }
  checkConfig();
}

function checkConfig () {
  if (
    typeof config.ondevtoolclose === 'function' &&
        config.clearIntervalWhenDevOpenTrigger === true
  ) {
    config.clearIntervalWhenDevOpenTrigger = false;
    console.warn('【UNABLE-DEVTOOL】clearIntervalWhenDevOpenTrigger 在使用 ondevtoolclose 时无效');
  }
}