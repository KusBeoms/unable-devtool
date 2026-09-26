// ! 提前保存原生方法，防止页面加载后被 javascript: 注入的代码覆盖
const dateNow = Date.now;

export function now () {
  return dateNow();
}

export const native = {
  setTimeout: null as any as typeof setTimeout,
  clearTimeout: null as any as typeof clearTimeout,
  setInterval: null as any as typeof setInterval,
  clearInterval: null as any as typeof clearInterval,
  win: null as any as (name: 'outerWidth'|'outerHeight'|'innerWidth'|'innerHeight'|'devicePixelRatio') => number,
  setHTML: null as any as (el: Element, html: string) => void,
};

export function initNative () {
  native.setTimeout = window.setTimeout.bind(window);
  native.clearTimeout = window.clearTimeout.bind(window);
  native.setInterval = window.setInterval.bind(window);
  native.clearInterval = window.clearInterval.bind(window);
  const getters: Record<string, (() => number) | undefined> = {};
  ['outerWidth', 'outerHeight', 'innerWidth', 'innerHeight', 'devicePixelRatio'].forEach(name => {
    getters[name] = Object.getOwnPropertyDescriptor(window, name)?.get;
  });
  native.win = name => {
    const get = getters[name];
    return get ? get.call(window) : (window as any)[name];
  };
  const setInner = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.set;
  native.setHTML = (el, html) => {
    if (setInner) setInner.call(el, html);
    else el.innerHTML = html;
  };
}

export function calculateTime (func: Function) {
  const start = now();
  func();
  return now() - start;
}

export function getUrlParam (name: string) {
  let {search} = window.location;
  const {hash} = window.location;
  // # 在 ? 之前，即 http://localhost/#file?key=value，会导致 search 为空。
  if (search === '' && hash !== '') {
    // 为 search 补上前缀'?'，以便后面的逻辑处理不变。
    search = `?${hash.split('?')[1]}`;
  }
  if (search !== '' && search !== undefined) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const r = search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
  }
  return '';
}

export function onPageShowHide (
  onshow: ()=>void,
  onhide: ()=>void,
) {
  const doc = document as any;
  let hidden = '', state = '', visibilityChange;
  if (typeof doc.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
    state = 'visibilityState';
  } else if (typeof doc.mozHidden !== 'undefined') {
    hidden = 'mozHidden';
    visibilityChange = 'mozvisibilitychange';
    state = 'mozVisibilityState';
  } else if (typeof doc.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
    state = 'msVisibilityState';
  } else if (typeof doc.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
    state = 'webkitVisibilityState';
  }
  // 用原生 getter 读取真实状态，防止伪造 visibilitychange 事件使检测永久暂停
  const getState = state && typeof Document !== 'undefined' ?
    Object.getOwnPropertyDescriptor(Document.prototype, state)?.get : undefined;
  const cb = function () {
    if ((getState ? getState.call(doc) : doc[state]) === hidden) {
      onhide();
    } else {
      onshow();
    }
  };
  doc.removeEventListener(visibilityChange, cb, false);
  doc.addEventListener(visibilityChange, cb, false);
}

export function hackAlert (before?: ()=>void, after?: ()=>void) {
  const _alert = window.alert;
  const _confirm = window.confirm;
  const _prompt = window.prompt;
  const mod = (fn: Function) => {
    return (...args: any[]) => {
      if (before) {before();}
      // finally: 防止 alert({toString(){throw 0}}) 抛错后 after 不执行导致检测永久暂停
      try {
        return fn(...args);
      } finally {
        if (after) {after();}
      }
    };
  };
  try {
    window.alert = mod(_alert);
    window.confirm = mod(_confirm);
    window.prompt = mod(_prompt);
  } catch (e) {
    
  }
}

export const IS = {
  iframe: false,
  pc: false,
  qqBrowser: false,
  firefox: false,
  macos: false,
  edge: false,
  oldEdge: false,
  ie: false,
  iosChrome: false,
  iosEdge: false,
  chrome: false,
  seoBot: false,
  mobile: false,
};

export function initIS () {
  const ua = navigator.userAgent.toLowerCase();

  const has = (name: string) => ua.indexOf(name) !== -1;

  const mobile = isMobile();
  const iframe = !!window.top && window !== window.top;
  const pc = !mobile;
  const qqBrowser = has('qqbrowser');
  const firefox = has('firefox');
  const macos = has('macintosh');
  const edge = has('edge');
  const oldEdge = edge && !has('chrome');
  const ie = oldEdge || has('trident') || has('msie');
  const iosChrome = has('crios');
  const iosEdge = has('edgios');
  const chrome = has('chrome') || iosChrome;
  // google lighthouse ua中有 moto g power
  const seoBot = !mobile && /(googlebot|baiduspider|bingbot|applebot|petalbot|yandexbot|bytespider|chrome\-lighthouse|moto g power)/i.test(ua);

  Object.assign(IS, {
    iframe, pc, qqBrowser, firefox, macos, edge, oldEdge,
    ie, iosChrome, iosEdge, chrome, seoBot, mobile,
  });
}

function isMobileByUa () {
  return /(iphone|ipad|ipod|ios|android)/i.test(navigator.userAgent.toLowerCase());
}

function isMobile () {
  const {platform, maxTouchPoints} = navigator;
  if (typeof maxTouchPoints === 'number') {
    return maxTouchPoints > 1;
  }
  if (typeof platform === 'string') {
    const v = platform.toLowerCase();
    if (/(mac|win)/i.test(v)) return false;
    else if (/(android|iphone|ipad|ipod|arch)/i.test(v)) return true;
  }
  return isMobileByUa();
}

function createLargeObject () {
  const largeObject: Record<string, string> = {};
  for (let i = 0; i < 500; i++) {
    largeObject[`${i}`] = `${i}`;
  }
  return largeObject;
}

export function createLargeObjectArray () {
  const largeObject = createLargeObject();
  const largeObjectArray = [];

  for (let i = 0; i < 50; i++) {
    largeObjectArray.push(largeObject);
  }

  return largeObjectArray;
}