const K: number[] = [], H: number[] = [];

// 前 64 个质数立方根 / 前 8 个质数平方根的小数部分
(function () {
  const frac = (x: number) => ((x - Math.floor(x)) * 0x100000000) | 0;
  for (let n = 2, c = 0; c < 64; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (!prime) continue;
    if (c < 8) H[c] = frac(Math.pow(n, 1 / 2));
    K[c++] = frac(Math.pow(n, 1 / 3));
  }
})();

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export default function sha256 (text: string) {
  const s = unescape(encodeURIComponent(text)); // utf-8 bytes
  const len = s.length;
  const words: number[] = [];
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= s.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
  words[(((len + 8) >> 6) << 4) + 15] = len * 8;

  const h = H.slice();
  const w: number[] = [];
  for (let j = 0; j < words.length; j += 16) {
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = words[j + i] | 0;
      } else {
        const w15 = w[i - 15], w2 = w[i - 2];
        w[i] = (w[i - 16] + (rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)) +
          w[i - 7] + (rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10))) | 0;
      }
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, hh].forEach((v, i) => {h[i] = (h[i] + v) | 0;});
  }
  return h.map(v => ('0000000' + (v >>> 0).toString(16)).slice(-8)).join('');
}
