// Gera vendor/acordes.json a partir da base aberta Open Guitar Chords
// (https://openguitarchords.com/data — uso livre, inclusive comercial).
// Uso: node tools/build-acordes.mjs
import { writeFileSync } from 'node:fs';

const res = await fetch('https://openguitarchords.com/data/chords.json');
if (!res.ok) throw new Error('HTTP ' + res.status);
const data = await res.json();
const out = {};
for (const c of data.chords) {
  out[c.symbol] = {
    f: c.frets,                                   // casa por corda (Mi grave → Mi agudo); "x" = não tocar
    d: c.fingers,                                 // dedo: 1 indicador … 4 mínimo; 0 = nenhum
    b: (c.barres || []).map(b => [b.fret, b.from, b.to]),
    o: c.baseFret || 1                            // casa inicial do desenho
  };
}
const file = new URL('../vendor/acordes.json', import.meta.url);
writeFileSync(file, JSON.stringify({ fonte: 'Open Guitar Chords — https://openguitarchords.com', acordes: out }));
console.log(Object.keys(out).length, 'acordes gravados em vendor/acordes.json');
