import {IUnableDevtool} from '../type';
import {Detector} from '../detector/detector';
import {config} from './config';
import {clearLog} from './log';
import {clearDevToolOpenState, checkOnDevClose} from './open-state';
import {hackAlert, IS, native, now, onPageShowHide} from './util';
import {isIgnored} from 'src/plugins/ignore';
import DebugLib from 'src/detector/sub-detector/debug-lib';

let interval: any = 0, timer: any = 0;
const calls: Detector[] = [];
let time = 0;
let lastTick = 0, stopped = false;
let tick = () => {};

export function initInterval (dd: IUnableDevtool) {
  let _pause = false;
  const pause = () => {_pause = true;};
  const goon = () => {_pause = false;};
  hackAlert(pause, goon); // 防止 alert等方法触发了debug延迟计算
  onPageShowHide(goon, pause); // 防止切后台触发了debug延迟计算

  tick = () => {
    lastTick = now();
    if (dd.isSuspend || _pause || isIgnored()) return;
    for (const detector of calls) {
      clearDevToolOpenState(detector.type);
      detector.detect(time++);
    };
    clearLog();
    checkOnDevClose();
  };
  startInterval();

  // 定时器被外部 clearInterval 暴力清除时，在用户交互/窗口变化时自动恢复
  const heal = () => {
    if (!stopped && now() - lastTick > config.interval * 3) startInterval();
  };
  ['resize', 'focus', 'blur', 'keydown', 'pointerdown'].forEach(name => {
    window.addEventListener(name, heal, true);
  });

  // stopIntervalTime 之后判断 如果不是pc去掉定时器interval，为了优化移动端的性能
  // 如果控制面板被打开了该定时器timer会被清除
  timer = native.setTimeout(() => {
    if (!IS.pc && !DebugLib.isUsing()) {
      clearDDInterval();
    }
  }, config.stopIntervalTime);
}

function startInterval () {
  native.clearInterval(interval);
  lastTick = now();
  interval = native.setInterval(tick, config.interval);
}

export function registInterval (detector: Detector) {
  calls.push(detector);
}

export function clearDDInterval () {
  stopped = true;
  native.clearInterval(interval);
}

export function clearDDTimeout () {
  native.clearTimeout(timer);
}
