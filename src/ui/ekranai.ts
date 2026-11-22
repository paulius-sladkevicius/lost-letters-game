// Pradžios, istorijos, skyriaus, laužo, Knygos ir tėvų ekranai.

import { skyrius } from '../content';
import { bosasAtrakintas, DABARTINIS_SKYRIUS, saleAtrakinta, pakeistiVarda } from '../game/engine';
import { VARDO_ILGIS } from '../game/rules';
import { sauksmininkas, sutvarkytiVarda } from '../game/text';
import type { Zaidimas } from './app';
import { deme, herojus, kambarioIkona, kaukas, knygosIkona, lauzas, uzraktas, zvaigzdute, ziezirba } from './art';
import { h, svg } from './dom';
import { burtoMygtukas, hud, ziezirbosBurbulas } from './kova';
import { skaitomasTekstas } from './skaitymas';
import { nustatymuMygtukai } from './kambarys';
import { ISTORIJA, ZIEZIRBA, atsitiktine } from './tekstai';

const lauzoSpalva = (z: Zaidimas) => (z.b.kosmetika.includes('lauzoSpalva') ? 'melyna' : 'iprasta');
const zz = (z: Zaidimas, dydis: number) => svg(ziezirba(z.b.puslapiai.length, z.b.kosmetika.includes('kepure'), dydis));

// ------------------------------------------------------------------ Pradžia

export function ekranasPradzia(z: Zaidimas): HTMLElement {
  const b = z.busena;
  const virsus = h(
    'div',
    { class: 'pradzios-virsus' },
    h('h1', { class: 'pavadinimas antraste-ranka' }, 'Dingusios raidės'),
    svg(deme('vidutinis'), 'pradzios-deme'),
  );
  if (!b) {
    const ivestis = h('input', {
      id: 'vardas',
      type: 'text',
      class: 'vardo-ivestis',
      maxlength: VARDO_ILGIS,
      autocomplete: 'off',
      autocapitalize: 'words',
      spellcheck: 'false',
      enterkeyhint: 'go',
      'data-fokusas': 'vardas',
    }) as HTMLInputElement;
    const mygtukas = h('button', { type: 'submit', class: 'pagrindinis', disabled: true }, 'Pradėti') as HTMLButtonElement;
    ivestis.addEventListener('input', () => {
      mygtukas.disabled = !sutvarkytiVarda(ivestis.value);
    });
    const forma = h(
      'form',
      {
        class: 'vardo-forma',
        onsubmit: (e: Event) => {
          e.preventDefault();
          const v = sutvarkytiVarda(ivestis.value, VARDO_ILGIS);
          if (v) z.pradetiNauja(v);
        },
      },
      h('label', { for: 'vardas', class: 'vardo-klausimas' }, 'Kuo tu vardu?'),
      ivestis,
      mygtukas,
    );
    return h('main', { class: 'ekranas pradzia', 'data-ekranas': 'pradzia' }, virsus, forma);
  }
  return h(
    'main',
    { class: 'ekranas pradzia', 'data-ekranas': 'pradzia' },
    virsus,
    h('div', { class: 'ziezirba-sako didelis' }, zz(z, 64), h('p', { class: 'burbulas skaitymas' }, `Labas, ${b.kreipinys}!`)),
    h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.zaisti() }, 'Žaisti'),
    h(
      'div',
      { class: 'mygtuku-eile' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), 'Knyga'),
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('tevai') }, svg(uzraktas(24)), 'Tėvams'),
    ),
    h('div', { class: 'mygtuku-eile nustatymai-eile' }, nustatymuMygtukai(z)),
  );
}

// ------------------------------------------------------------------ Istorija

export function ekranasIstorija(z: Zaidimas): HTMLElement {
  const i = z.istorijosPsl;
  const paveikslai = [
    () => h('div', { class: 'paveikslas' }, svg(knygosIkona(110)), svg(deme('mazas'), 'mazas-piesinys')),
    () => h('div', { class: 'paveikslas' }, svg(deme('mazas'), 'mazas-piesinys'), svg(deme('vidutinis'), 'mazas-piesinys'), svg(deme('pabeges'), 'mazas-piesinys')),
    () => h('div', { class: 'paveikslas' }, svg(ziezirba(0, false, 120))),
    () => h('div', { class: 'paveikslas' }, svg(kaukas(90)), svg(lauzas('iprasta', 100))),
    () => h('div', { class: 'paveikslas' }, svg(herojus(z.b.iranga, false, 100)), svg(ziezirba(0, false, 90))),
  ];
  const paskutinis = i >= ISTORIJA.length - 1;
  return h(
    'main',
    { class: 'ekranas istorija', 'data-ekranas': 'istorija' },
    h('h1', { class: 'antraste-ranka' }, 'Istorija'),
    paveikslai[i](),
    h(
      'section',
      { class: 'teksto-kortele' },
      h('p', { class: 'tekstas skaitymas' }, skaitomasTekstas(z.tekstas(ISTORIJA[i]), { skiemenys: z.b.nustatymai.skiemenys })),
    ),
    h('p', { class: 'puslapio-nr' }, `${i + 1} / ${ISTORIJA.length}`),
    h(
      'button',
      {
        type: 'button',
        class: 'pagrindinis',
        'data-fokusas': 'istorija-toliau',
        onclick: () => {
          if (paskutinis) z.baigtiIstorija();
          else {
            z.istorijosPsl++;
            z.render();
          }
        },
      },
      paskutinis ? 'Pradėkime!' : 'Toliau',
    ),
  );
}

// ------------------------------------------------------------------ Skyriaus žemėlapis

export function ekranasSkyrius(z: Zaidimas): HTMLElement {
  const b = z.b;
  const sk = skyrius(z.t, DABARTINIS_SKYRIUS);
  const korteles = sk.sales.map((s, i) => {
    const sb = b.sales[s.id];
    const atrakinta = saleAtrakinta(b, z.t, s.id);
    return h(
      'button',
      {
        type: 'button',
        class: `sales-korta kampai-${i % 4}${sb.baigta ? ' baigta' : ''}`,
        disabled: !atrakinta,
        'data-sale': s.id,
        onclick: () => z.eitiPrieSales(s.id),
      },
      h('span', { class: 'sales-nr antraste-ranka' }, `${i + 1}`),
      h('span', { class: 'sales-vardas' }, s.pavadinimas),
      atrakinta
        ? h('span', { class: 'mini-zvaigzdutes', 'aria-label': `${sb.zvaigzdutes} žvaigždutės` }, [1, 2, 3].map((n) => svg(zvaigzdute(n <= sb.zvaigzdutes, 22))))
        : svg(uzraktas(24)),
    );
  });
  const bosoAtrakintas = bosasAtrakintas(b, z.t);
  const bosas = h(
    'button',
    { type: 'button', class: `sales-korta boso-korta${b.bosasNugaletas ? ' baigta' : ''}`, disabled: !bosoAtrakintas, 'data-sale': 'bosas', onclick: () => z.eitiPrieBoso() },
    svg(deme('bosas'), 'boso-ikona'),
    h('span', { class: 'sales-vardas' }, sk.bosas.vardas),
    bosoAtrakintas ? h('span', { class: 'mazas-tekstas' }, b.bosasNugaletas ? 'Nugalėta' : 'Bosas') : svg(uzraktas(24)),
  );
  return h(
    'main',
    { class: 'ekranas skyrius', 'data-ekranas': 'skyrius' },
    hud(z),
    h('h1', { class: 'antraste-ranka' }, `${sk.numeris} skyrius · ${sk.pavadinimas}`),
    h('div', { class: 'saliu-sarasas' }, korteles, bosas),
    b.bosasNugaletas ? ziezirbosBurbulas(z, 'Skyrius įveiktas! Kiti skyriai – jau greitai.') : null,
    h(
      'div',
      { class: 'mygtuku-eile apacioje' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), 'Knyga'),
      h('button', { type: 'button', class: 'antrinis', onclick: () => { z.ekranas = 'pradzia'; z.render(); } }, 'Pradžia'),
    ),
  );
}

// ------------------------------------------------------------------ Laužas

export function ekranasLauzas(z: Zaidimas): HTMLElement {
  const b = z.b;
  const boso = b.vieta.kur === 'bosoLauzas';
  const sale = b.vieta.kur === 'lauzas' ? skyrius(z.t, DABARTINIS_SKYRIUS).sales.find((s) => s.id === (b.vieta as { sale: string }).sale) : null;
  const pavadinimas = boso ? 'Laužas prieš bosą' : `Laužas · ${sale?.pavadinimas ?? ''}`;
  const zinute = z.zinute ?? (boso ? ZIEZIRBA.bosoLauzas : atsitiktine(ZIEZIRBA.lauzas));
  return h(
    'main',
    { class: 'ekranas lauzas', 'data-ekranas': boso ? 'bosoLauzas' : 'lauzas' },
    hud(z),
    h('h1', { class: 'antraste-ranka' }, pavadinimas),
    h(
      'div',
      { class: 'lauzo-scena' },
      h('button', { type: 'button', class: 'herojaus-mygtukas', 'aria-label': 'Mano daiktai', onclick: () => z.rodytiLangus([{ tipas: 'daiktai' }]) }, svg(herojus(b.iranga, b.kosmetika.includes('apsiaustas'), 96))),
      svg(lauzas(lauzoSpalva(z), 110), 'lauzo-ugnis'),
      h('div', { class: 'kaukas-ir-ziezirba' }, zz(z, 60), svg(kaukas(64))),
    ),
    ziezirbosBurbulas(z, zinute),
    h(
      'button',
      {
        type: 'button',
        class: 'pagrindinis',
        'data-pirmas': '1',
        'data-veiksmas': boso ? 'i-kova' : 'i-sale',
        onclick: () => (boso ? z.pradetiBosoKova() : z.ieitiISale()),
      },
      boso ? 'Į kovą!' : 'Į salę',
    ),
    h(
      'div',
      { class: 'mygtuku-eile' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.rodytiLangus([{ tipas: 'daiktai' }]) }, svg(kambarioIkona('lobis', 28)), 'Daiktai'),
      burtoMygtukas(z, 'gydymas'),
    ),
    h(
      'div',
      { class: 'mygtuku-eile' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), 'Knyga'),
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.iSkyriausZemelapi() }, 'Skyrius'),
      nustatymuMygtukai(z),
    ),
  );
}

// ------------------------------------------------------------------ Didžioji Knyga

export function ekranasKnyga(z: Zaidimas): HTMLElement {
  const b = z.b;
  const sk = skyrius(z.t, DABARTINIS_SKYRIUS);
  const turi = b.puslapiai.includes(sk.numeris);
  const n = { skiemenys: b.nustatymai.skiemenys };
  return h(
    'main',
    { class: 'ekranas knyga', 'data-ekranas': 'knyga' },
    h('h1', { class: 'antraste-ranka' }, 'Didžioji Knyga'),
    h(
      'article',
      { class: `knygos-puslapis${turi ? '' : ' po-rasalu'}`, 'data-puslapis': sk.numeris },
      h('h2', { class: 'antraste-ranka' }, `${sk.numeris} puslapis · ${sk.puslapis.pavadinimas}`),
      turi
        ? h('p', { class: 'tekstas skaitymas' }, skaitomasTekstas(z.tekstas(sk.puslapis.tekstas), n))
        : h('div', { class: 'po-rasalu-turinys' }, svg(deme('bosas'), 'mazas-piesinys'), h('p', { class: 'skaitymas' }, 'Šis puslapis dar po rašalu. Nugalėk Didžiąją Dėmę!')),
    ),
    h(
      'section',
      { class: 'zodziai' },
      h('h2', { class: 'antraste-ranka' }, `Grįžę žodžiai: ${b.zodziai.length}`),
      b.zodziai.length
        ? h('ul', { class: 'zodziu-sarasas' }, b.zodziai.map((w) => h('li', { class: 'zodzio-lapelis skaitymas' }, skaitomasTekstas(w, n))))
        : h('p', { class: 'skaitymas' }, 'Kol kas tuščia. Nugalėk Dėmę – ir žodis sugrįš!'),
      h('p', { class: 'mazas-tekstas' }, `Pabėgę žodžiai: ${b.pabege.length} · Sugauti: ${b.sugauti}`),
    ),
    h(
      'div',
      { class: 'busimi-puslapiai', 'aria-label': 'Kiti puslapiai dar dingę' },
      [2, 3, 4, 5, 6].map((p) => h('span', { class: 'busimas' }, `${p}`)),
    ),
    h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.uzdaryti() }, 'Užverti Knygą'),
  );
}

// ------------------------------------------------------------------ Tėvų skydelis

let vartai: { a: number; b: number; atrakinta: boolean; trinti: boolean } | null = null;

function laikas(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'mažiau nei minutė';
  const val = Math.floor(min / 60);
  return val > 0 ? `${val} val. ${min % 60} min.` : `${min} min.`;
}

export function ekranasTevai(z: Zaidimas): HTMLElement {
  if (!vartai) vartai = { a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4), atrakinta: false, trinti: false };
  const v = vartai;
  const uzdaryti = () => {
    vartai = null;
    z.uzdaryti();
  };
  if (!v.atrakinta) {
    const ivestis = h('input', { id: 'vartai', type: 'text', inputmode: 'numeric', class: 'vardo-ivestis', autocomplete: 'off', 'data-fokusas': 'vartai' }) as HTMLInputElement;
    const klaida = h('p', { class: 'klaidos-tekstas', role: 'alert' });
    return h(
      'main',
      { class: 'ekranas tevai', 'data-ekranas': 'tevai' },
      h('h1', { class: 'antraste-ranka' }, 'Tėvams'),
      h(
        'form',
        {
          class: 'vardo-forma',
          onsubmit: (e: Event) => {
            e.preventDefault();
            if (Number(ivestis.value.trim()) === v.a * v.b) {
              v.atrakinta = true;
              z.render();
            } else {
              klaida.textContent = 'Neteisingai. Pabandykite dar kartą.';
              ivestis.value = '';
            }
          },
        },
        h('label', { for: 'vartai', class: 'tevu-klausimas' }, `Suaugusiojo klausimas: kiek bus ${v.a} × ${v.b}?`),
        ivestis,
        klaida,
        h('button', { type: 'submit', class: 'pagrindinis' }, 'Atrakinti'),
      ),
      h('button', { type: 'button', class: 'antrinis', onclick: uzdaryti }, 'Atgal'),
    );
  }

  const b = z.b;
  const sk = skyrius(z.t, DABARTINIS_SKYRIUS);
  const isveiktos = sk.sales.filter((s) => b.sales[s.id]?.baigta).length;
  const klaidingos = Object.entries(b.uzduotys)
    .filter(([, s]) => s.klaidos > 0)
    .sort((x, y) => y[1].klaidos - x[1].klaidos)
    .slice(0, 30);
  const pabege = new Set(b.pabege.map((p) => p.uzduotis));

  const laukas = (id: string, zyme: string, reiksme: string, keisti: (v: string) => void, vieta = '') => {
    const ivestis = h('input', { id, type: 'text', value: reiksme, placeholder: vieta, autocomplete: 'off', maxlength: VARDO_ILGIS }) as HTMLInputElement;
    ivestis.addEventListener('change', () => keisti(ivestis.value));
    return h('div', { class: 'laukas' }, h('label', { for: id }, zyme), ivestis);
  };
  const jungiklis = (id: string, zyme: string, ijungta: boolean, keisti: (v: boolean) => void) => {
    const box = h('input', { id, type: 'checkbox', checked: ijungta }) as HTMLInputElement;
    box.addEventListener('change', () => {
      keisti(box.checked);
      z.render();
    });
    return h('label', { class: 'jungiklis', for: id }, box, h('span', null, zyme));
  };

  return h(
    'main',
    { class: 'ekranas tevai atrakinta', 'data-ekranas': 'tevai' },
    h('h1', { class: 'antraste-ranka' }, 'Tėvų skydelis'),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Pažanga'),
      h(
        'dl',
        { class: 'statistika' },
        h('dt', null, 'Pasiektas skyrius'),
        h('dd', null, `${sk.numeris} – ${sk.pavadinimas}: salės ${isveiktos} iš ${sk.sales.length}, bosas ${b.bosasNugaletas ? 'nugalėtas' : 'dar nenugalėtas'}`),
        h('dt', null, 'Žaidimo laikas'),
        h('dd', { 'data-laikas': '1' }, laikas(b.statistika.laikasMs)),
        h('dt', null, 'Atsakymai'),
        h('dd', null, `teisingi ${b.statistika.teisingi}, klaidos ${b.statistika.klaidos}`),
        h('dt', null, 'Knygoje žodžių'),
        h('dd', null, `${b.zodziai.length}, pabėgusių ${b.pabege.length}, sugautų ${b.sugauti}`),
      ),
      h('h3', null, 'Klaidingi žodžiai'),
      klaidingos.length
        ? h(
            'ul',
            { class: 'klaidingi' },
            klaidingos.map(([id, s]) => {
              const u = z.t.uzduotys.get(id);
              const zodis = u?.zodis ?? u?.uzuomina ?? id;
              return h(
                'li',
                null,
                h('strong', null, z.tekstas(zodis)),
                ` – klaidų: ${s.klaidos}${pabege.has(id) ? ' (dar kartojama)' : ''}`,
                u ? h('div', { class: 'mazas-tekstas' }, z.tekstas(`${u.tekstas} ${u.klausimas}`)) : null,
              );
            }),
          )
        : h('p', null, 'Klaidų dar nėra.'),
    ),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Vardas ir savi žodžiai'),
      laukas('t-vardas', 'Vaiko vardas', b.vardas, (val) => {
        const v2 = sutvarkytiVarda(val);
        if (v2) z.keistiNustatymus((x) => pakeistiVarda(x, v2));
        z.render();
      }),
      laukas('t-kreipinys', 'Kaip Žiežirba kreipiasi (šauksmininkas)', b.kreipinys, (val) =>
        z.keistiNustatymus((x) => ({ ...x, kreipinys: sutvarkytiVarda(val) || sauksmininkas(x.vardas) })),
      ),
      laukas('t-seima', 'Šeimos narys', b.nustatymai.savi.seimosNarys, (val) =>
        z.keistiNustatymus((x) => ({ ...x, nustatymai: { ...x.nustatymai, savi: { ...x.nustatymai.savi, seimosNarys: val.trim() } } })), 'Mama'),
      laukas('t-draugas', 'Draugas', b.nustatymai.savi.draugas, (val) =>
        z.keistiNustatymus((x) => ({ ...x, nustatymai: { ...x.nustatymai, savi: { ...x.nustatymai.savi, draugas: val.trim() } } })), 'Ema'),
      laukas('t-augintinis', 'Augintinis', b.nustatymai.savi.augintinis, (val) =>
        z.keistiNustatymus((x) => ({ ...x, nustatymai: { ...x.nustatymai, savi: { ...x.nustatymai.savi, augintinis: val.trim() } } })), 'Murkis'),
      h('p', { class: 'mazas-tekstas' }, 'Šie vardai įrašomi į kai kuriuos tekstus (vardininko linksniu).'),
    ),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Jungikliai'),
      jungiklis('t-skiemenys', 'Ilgus žodžius spalvinti skiemenimis (va-ri-nis)', b.nustatymai.skiemenys, (x) =>
        z.keistiNustatymus((y) => ({ ...y, nustatymai: { ...y.nustatymai, skiemenys: x } }))),
      jungiklis('t-didziosios', 'Rodyti DIDŽIOSIOMIS raidėmis', b.nustatymai.didziosios, (x) =>
        z.keistiNustatymus((y) => ({ ...y, nustatymai: { ...y.nustatymai, didziosios: x } }))),
      jungiklis('t-garsas', 'Garso efektai', b.nustatymai.garsas, (x) => {
        if (x !== b.nustatymai.garsas) z.perjungtiGarsa();
      }),
    ),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Pradėti iš naujo'),
      h(
        'button',
        {
          type: 'button',
          class: 'pavojingas',
          onclick: () => {
            if (!v.trinti) {
              v.trinti = true;
              z.render();
              return;
            }
            vartai = null;
            z.istrintiZaideja();
          },
        },
        v.trinti ? 'Tikrai ištrinti visą progresą?' : 'Ištrinti progresą',
      ),
    ),
    h('button', { type: 'button', class: 'pagrindinis', onclick: uzdaryti }, 'Uždaryti'),
  );
}
