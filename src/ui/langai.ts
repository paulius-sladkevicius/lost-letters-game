// Iššokantys langai: grobis „Imu / Palieku“, lobis, durys, salės pabaiga ir kt.

import { uzduotis } from '../content';
import { DAIKTAI, daiktoAprasas, daiktoPavadinimas, palyginti } from '../game/equipment';
import { KAUKAI_MOKA_MANOS } from '../game/rules';
import { rastiKambari, rastiSale } from '../game/engine';
import type { Zaidimas, Langas } from './app';
import {
  daiktoIkona,
  herojus,
  kaukas,
  KOSMETIKOS_VARDAI,
  lauzas,
  manosLasas,
  rodykle,
  sirdele,
  zvaigzdute,
  ziezirba,
} from './art';
import { h, svg } from './dom';
import { skaitomasTekstas } from './skaitymas';
import { zemelapioVaizdas } from './zemelapis';
import { ZIEZIRBA } from './tekstai';

let langoNr = 0;

function remas(z: Zaidimas, tipas: string, antraste: string, ...turinys: (HTMLElement | null)[]): HTMLElement {
  const id = `lango-antraste-${++langoNr}`;
  void z;
  return h(
    'div',
    { class: 'uzdanga' },
    h(
      'div',
      { class: `langas langas-${tipas}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id, 'data-langas': tipas },
      h('h2', { class: 'antraste-ranka', id }, antraste),
      ...turinys,
    ),
  );
}

const toliau = (z: Zaidimas, tekstas = 'Toliau') =>
  h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.uzdarytiLanga() }, tekstas);

const skaitomas = (z: Zaidimas, tekstas: string, klase = 'tekstas') =>
  h('p', { class: `${klase} skaitymas` }, skaitomasTekstas(z.tekstas(tekstas), { skiemenys: z.b.nustatymai.skiemenys }));

export function langas(z: Zaidimas, l: Langas): HTMLElement {
  const b = z.b;
  switch (l.tipas) {
    case 'nugaletas': {
      const antraste = l.pabeges ? (l.sugautas ? 'Pabėgęs žodis sugautas!' : 'Dėmė išsisklaidė!') : 'Dėmė virto raidėmis!';
      return remas(
        z,
        l.tipas,
        antraste,
        l.zodis && (!l.pabeges || l.sugautas)
          ? h('div', { class: 'grizes-zodis' }, h('p', { class: 'mazas-tekstas' }, 'Į Knygą grįžo žodis:'), h('p', { class: 'didelis-zodis skaitymas' }, l.zodis))
          : skaitomas(z, 'Šis žodis dar sugrįš. Tada jį sugausi!'),
        l.kardoMana > 0
          ? h('p', { class: 'atlygis' }, svg(manosLasas(16)), `Kardas: +${l.kardoMana} ${l.kardoMana === 1 ? 'mana' : 'manos'}`)
          : null,
        toliau(z),
      );
    }
    case 'grobis': {
      const { daiktas, lygis } = l.grobis;
      const dabar = b.iranga[daiktas];
      const kryptis = palyginti(daiktas, lygis, dabar);
      const korta = (lv: typeof lygis, zyme: string, klase: string) =>
        h(
          'div',
          { class: `daikto-korta ${klase}` },
          h('p', { class: 'mazas-tekstas' }, zyme),
          h('div', { class: 'daikto-eilute' }, svg(daiktoIkona(daiktas, lv, 52)), skaitomas(z, `${daiktoPavadinimas(daiktas, lv)}.`, 'daikto-vardas')),
          skaitomas(z, daiktoAprasas(daiktas, lv), 'daikto-aprasas'),
        );
      return remas(
        z,
        l.tipas,
        'Radai daiktą!',
        korta(lygis, 'Naujas', 'naujas'),
        h(
          'div',
          { class: 'palyginimas', role: 'img', 'aria-label': kryptis === 'aukstyn' ? 'Geresnis' : kryptis === 'zemyn' ? 'Prastesnis' : 'Toks pat' },
          svg(rodykle(kryptis)),
        ),
        korta(dabar, 'Dabar turi', 'dabartinis'),
        h('p', { class: 'mazas-tekstas' }, `Kaukai už atiduotą daiktą duos ${KAUKAI_MOKA_MANOS} manas.`),
        h(
          'div',
          { class: 'mygtuku-eile' },
          h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.priimtiGrobi(true) }, 'Imu'),
          h('button', { type: 'button', class: 'antrinis', onclick: () => z.priimtiGrobi(false) }, 'Palieku'),
        ),
      );
    }
    case 'lobis':
      return remas(
        z,
        l.tipas,
        'Lobis!',
        svg(kambarioIkonaDidele(), 'lobio-piesinys'),
        h(
          'p',
          { class: 'atlygis' },
          svg(sirdele(true, 24)),
          `+${l.planuota.sirdeles}`,
          svg(manosLasas(16)),
          `+${l.planuota.mana}`,
        ),
        l.sirdeles < l.planuota.sirdeles || l.mana < l.planuota.mana
          ? h(
              'p',
              { class: 'mazas-tekstas' },
              [l.sirdeles < l.planuota.sirdeles ? 'Širdelių jau pilna.' : '', l.mana < l.planuota.mana ? 'Manos jau pilna.' : '']
                .filter(Boolean)
                .join(' '),
            )
          : null,
        toliau(z),
      );
    case 'dovana':
      return remas(
        z,
        l.tipas,
        'Kaukų dovana!',
        svg(kaukas(80)),
        skaitomas(z, `Kaukai tau dovanoja: ${KOSMETIKOS_VARDAI[l.dovana]}.`),
        toliau(z, 'Ačiū!'),
      );
    case 'durys': {
      if (b.vieta.kur !== 'sale') return remas(z, l.tipas, 'Durys', toliau(z));
      const kamb = rastiKambari(rastiSale(z.t, b.vieta.sale), b.vieta.kambarys);
      const misle = uzduotis(z.t, kamb.slaptosDurys!.misle);
      const tvarka = l.tvarka;
      return remas(
        z,
        l.tipas,
        'Slaptos durys',
        skaitomas(z, misle.tekstas),
        misle.klausimas ? skaitomas(z, misle.klausimas, 'klausimas') : null,
        h(
          'div',
          { class: 'atsakymai' },
          tvarka.map((i, poz) =>
            h(
              'button',
              { type: 'button', class: `atsakymas skaitymas kampai-${poz}`, 'data-atsakymas': misle.atsakymai[i].tekstas, onclick: () => z.atsakytiMislei(i) },
              misle.atsakymai[i].tekstas,
            ),
          ),
        ),
        h('button', { type: 'button', class: 'antrinis', 'data-pirmas': '1', onclick: () => z.uzdarytiLanga() }, 'Atgal'),
      );
    }
    case 'saleBaigta':
      return remas(
        z,
        l.tipas,
        'Salė įveikta!',
        h(
          'div',
          { class: 'zvaigzdutes', role: 'img', 'aria-label': `${l.zvaigzdutes} žvaigždutės iš 3` },
          [1, 2, 3].map((i) => svg(zvaigzdute(i <= l.zvaigzdutes, 48))),
        ),
        h(
          'div',
          { class: 'ziezirba-sako' },
          svg(ziezirba(b.puslapiai.length, b.kosmetika.includes('kepure'), 56)),
          h('p', { class: 'burbulas skaitymas' }, ZIEZIRBA.saleBaigta),
        ),
        h(
          'div',
          { class: 'mygtuku-eile' },
          h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.rytojTesiam(true) }, 'Tęsiam dabar'),
          h('button', { type: 'button', class: 'antrinis', onclick: () => z.rytojTesiam(false) }, 'Rytoj'),
        ),
      );
    case 'pralaimejimas':
      return remas(
        z,
        l.tipas,
        'Širdelės baigėsi',
        h('div', { class: 'paveikslas' }, svg(ziezirba(b.puslapiai.length, b.kosmetika.includes('kepure'), 70)), svg(lauzas(b.kosmetika.includes('lauzoSpalva') ? 'melyna' : 'iprasta', 80))),
        skaitomas(z, ZIEZIRBA.pralaimejimas),
        h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.pralaimeti() }, 'Prie laužo'),
      );
    case 'pergale':
      return remas(
        z,
        l.tipas,
        'Didžioji Dėmė nugalėta!',
        h('div', { class: 'paveikslas' }, svg(ziezirba(1, b.kosmetika.includes('kepure'), 96), 'sviecia')),
        skaitomas(z, ZIEZIRBA.pergale),
        toliau(z),
      );
    case 'zemelapis':
      return remas(z, l.tipas, 'Salės žemėlapis', zemelapioVaizdas(z), h('p', { class: 'mazas-tekstas' }, 'Eik mygtukais „◀“ ir „Eiti ▶“.'), toliau(z, 'Uždaryti'));
    case 'daiktai':
      return remas(
        z,
        l.tipas,
        'Mano daiktai',
        svg(herojus(b.iranga, b.kosmetika.includes('apsiaustas'), 96)),
        h(
          'ul',
          { class: 'daiktu-sarasas' },
          DAIKTAI.map((d) =>
            h(
              'li',
              null,
              svg(daiktoIkona(d, b.iranga[d], 44)),
              h('div', null, skaitomas(z, `${daiktoPavadinimas(d, b.iranga[d])}.`, 'daikto-vardas'), skaitomas(z, daiktoAprasas(d, b.iranga[d]), 'daikto-aprasas')),
            ),
          ),
        ),
        toliau(z, 'Uždaryti'),
      );
  }
}

function kambarioIkonaDidele(): string {
  return `<svg width="120" height="96" viewBox="0 0 34 30"><path d="M3 12 H31 V28 H3 Z" fill="#b8742c" stroke="#24233f" stroke-width="1.6"/><path d="M3 12 C3 3 31 3 31 12" fill="#d79a3c" stroke="#24233f" stroke-width="1.6"/><rect x="14" y="14" width="6" height="6" fill="#f6c344" stroke="#24233f" stroke-width="1.2"/><circle cx="9" cy="9" r="1.2" fill="#f6c344"/><circle cx="25" cy="8" r="1.4" fill="#f6c344"/></svg>`;
}
