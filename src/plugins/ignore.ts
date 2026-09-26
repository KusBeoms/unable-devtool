import {config} from '../utils/config';

let lastUrl = '';
let lastIgnored = false;

export function isIgnored () {
  const {ignore} = config;
  if (!ignore) return false;

  if (typeof ignore === 'function') {
    return ignore();
  }

  if (ignore.length === 0) return false;
    
  // strict: 只匹配 origin，防止通过 ?localhost 或 history.replaceState 伪造 url 绕过
  const href = config.strict ? location.origin : location.href;
  if (lastUrl === href) return lastIgnored;
  lastUrl = href;

  let result = false;

  for (const item of ignore) {
    if (typeof item === 'string') {
      if (href.indexOf(item) !== -1) {
        result = true;
        break;
      }
    } else {
      if (item.test(href)) {
        result = true;
        break;
      }
    }
  }
  lastIgnored = result;
  return result;
}