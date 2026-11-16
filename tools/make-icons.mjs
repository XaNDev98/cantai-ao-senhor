// Gera os ícones PNG do app (sem dependências): node tools/make-icons.mjs
import { writeFileSync } from 'node:fs';
import zlib from 'node:zlib';

function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const IN = hex('#1d3166'), OUT = hex('#08112a'), G1 = hex('#f7e3b0'), G2 = hex('#c2954a'), RING = hex('#d6b26e');

// cor de um ponto (u,v em 0..1); retorna [r,g,b,a]
function sample(u, v, { rounded, scale }) {
  // fundo arredondado (ícone "any") ou quadrado cheio (maskable)
  if (rounded) {
    const r = 0.22, dx = Math.max(r - u, 0, u - (1 - r)), dy = Math.max(r - v, 0, v - (1 - r));
    if (dx * dx + dy * dy > r * r) return [0, 0, 0, 0];
  }
  const d = Math.hypot(u - 0.5, v - 0.38) / 0.75;
  let c = mix(IN, OUT, Math.min(1, d));
  // brilho dourado suave
  const gl = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.42) / 0.36);
  c = mix(c, G2, gl * gl * 0.35);
  // coordenadas do desenho (escala para a área segura do maskable)
  const x = 0.5 + (u - 0.5) / scale, y = 0.5 + (v - 0.5) / scale;
  const ring = Math.abs(Math.hypot(x - 0.5, y - 0.5) - 0.33);
  if (ring < 0.0125) c = mix(c, RING, 0.6);
  const vert = Math.abs(x - 0.5) < 0.0375 && y > 0.195 && y < 0.805;
  const hor = Math.abs(y - 0.365) < 0.036 && Math.abs(x - 0.5) < 0.18;
  if (vert || hor) c = mix(G1, G2, Math.min(1, Math.max(0, (y - 0.195) / 0.61)));
  return [...c, 255];
}

function render(size, opts) {
  const SS = 4, buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    let acc = [0, 0, 0, 0];
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const s = sample((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size, opts);
      acc = [acc[0] + s[0] * s[3], acc[1] + s[1] * s[3], acc[2] + s[2] * s[3], acc[3] + s[3]];
    }
    const a = acc[3] / (SS * SS), o = (py * size + px) * 4;
    buf[o] = a ? acc[0] / acc[3] : 0; buf[o + 1] = a ? acc[1] / acc[3] : 0; buf[o + 2] = a ? acc[2] / acc[3] : 0; buf[o + 3] = a;
  }
  return png(size, size, buf);
}

const out = new URL('../icons/', import.meta.url);
writeFileSync(new URL('icon-192.png', out), render(192, { rounded: true, scale: 1 }));
writeFileSync(new URL('icon-512.png', out), render(512, { rounded: true, scale: 1 }));
writeFileSync(new URL('maskable-512.png', out), render(512, { rounded: false, scale: 0.8 }));
writeFileSync(new URL('apple-touch-icon.png', out), render(180, { rounded: false, scale: 0.92 }));
console.log('ícones gerados');
