import {config} from './config';
import {native} from './util';
// import {clearDDInterval} from './interval';

export function closeWindow () {
  // clearDDInterval();
  if (config.url) {
    window.location.href = config.url;
  } else if (config.rewriteHTML) {
    try {
      native.setHTML(document.documentElement, config.rewriteHTML);
    } catch (e) {
      // for 'TrustedHTML' assignment
      document.documentElement.innerText = config.rewriteHTML;
    }
  } else {
    try {
      window.opener = null;
      window.open('', '_self');
      // 需要是由js跳转到这个页面才可以关闭这个页面
      window.close();
      window.history.back();
    } catch (e) {
      console.log(e);
    }
    // native: 防止 setTimeout 被覆盖后跳转失效
    native.setTimeout(() => {
      // 否则执行跳转到 url
      window.location.href = config.timeOutUrl || 'about:blank';
    }, 500);
  }
}
