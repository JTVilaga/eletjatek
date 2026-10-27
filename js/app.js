// Élet – John Horton Conway életjátéka
// FONTOS: ha ezt a fájlt módosítod, emeld meg a VERZIO értékét (a frissit.bat ezt automatikusan megteszi).
const VERZIO = '1.10';

// ---- Beállítások ----
const MERET = 40;                 // a rács MERET x MERET cellából áll
const VALOSZINUSEG = 0.3;         // véletlen kezdéskor ennyi cella lesz élő

// ---- Állapot ----
let racs = ürRacs();              // 2D tömb: 0 = halott, 1 = élő
let generacio = 0;
let fut = false;
let idozito = null;

// ---- Elemek ----
const vaszon = document.getElementById('vaszon');
const ctx = vaszon.getContext('2d');
const elemGeneracio = document.getElementById('generacio');
const elemElok = document.getElementById('elok');
const btnIndit = document.getElementById('btnIndit');
const sebessegCsuszka = document.getElementById('sebesseg');

// ---- Segédfüggvények ----
function ürRacs() {
  const uj = [];
  for (let y = 0; y < MERET; y++) {
    uj.push(new Array(MERET).fill(0));
  }
  return uj;
}

// Egy cella élő szomszédainak száma. A szél átfordul (a rács gömbként zárul).
function szomszedokSzama(x, y) {
  let db = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + MERET) % MERET;
      const ny = (y + dy + MERET) % MERET;
      db += racs[ny][nx];
    }
  }
  return db;
}

// ---- Rajzolás ----
function meretezes() {
  const szelesseg = Math.min(window.innerWidth - 32, 600);
  vaszon.style.width = szelesseg + 'px';
  vaszon.style.height = szelesseg + 'px';
  const dpr = window.devicePixelRatio || 1;
  vaszon.width = szelesseg * dpr;
  vaszon.height = szelesseg * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  kirajzol();
}

function kirajzol() {
  const meret = vaszon.clientWidth;
  const cella = meret / MERET;
  const styles = getComputedStyle(document.documentElement);
  const halott = styles.getPropertyValue('--halott').trim();
  const elo = styles.getPropertyValue('--elo').trim();
  const racsSzin = styles.getPropertyValue('--racs').trim();

  ctx.fillStyle = halott;
  ctx.fillRect(0, 0, meret, meret);

  // Halvány rácsvonalak
  ctx.strokeStyle = racsSzin;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= MERET; i++) {
    const p = Math.round(i * cella) + 0.5;
    ctx.moveTo(p, 0); ctx.lineTo(p, meret);
    ctx.moveTo(0, p); ctx.lineTo(meret, p);
  }
  ctx.stroke();

  // Élő cellák
  ctx.fillStyle = elo;
  for (let y = 0; y < MERET; y++) {
    for (let x = 0; x < MERET; x++) {
      if (racs[y][x]) {
        ctx.fillRect(x * cella + 1, y * cella + 1, cella - 2, cella - 2);
      }
    }
  }
}

function frissitAdatok() {
  let elok = 0;
  for (let y = 0; y < MERET; y++) {
    for (let x = 0; x < MERET; x++) {
      elok += racs[y][x];
    }
  }
  elemGeneracio.textContent = generacio;
  elemElok.textContent = elok;
}

// ---- Az élet szabályai ----
// Élő cella 2 vagy 3 élő szomszéddal él tovább, halott cella 3 szomszéddal éled újra.
function lepes() {
  const uj = ürRacs();
  for (let y = 0; y < MERET; y++) {
    for (let x = 0; x < MERET; x++) {
      const n = szomszedokSzama(x, y);
      const el = racs[y][x];
      uj[y][x] = (el && (n === 2 || n === 3)) || (!el && n === 3) ? 1 : 0;
    }
  }
  racs = uj;
  generacio++;
  kirajzol();
  frissitAdatok();
}

// ---- Vezérlés ----
function idozitoIndit() {
  // Sebesség: 1 = lassú (1000 ms), 10 = gyors (100 ms)
  const kesleltetes = 1100 - Number(sebessegCsuszka.value) * 100;
  idozito = setTimeout(() => {
    lepes();
    if (fut) idozitoIndit();
  }, kesleltetes);
}

function indítasVagyMegallitas() {
  fut = !fut;
  btnIndit.textContent = fut ? 'Megállítás' : 'Indítás';
  if (fut) {
    idozitoIndit();
  } else {
    clearTimeout(idozito);
  }
}

function veletlen() {
  racs = ürRacs();
  for (let y = 0; y < MERET; y++) {
    for (let x = 0; x < MERET; x++) {
      racs[y][x] = Math.random() < VALOSZINUSEG ? 1 : 0;
    }
  }
  generacio = 0;
  kirajzol();
  frissitAdatok();
}

function torol() {
  if (fut) indítasVagyMegallitas();
  racs = ürRacs();
  generacio = 0;
  kirajzol();
  frissitAdatok();
}

// Koppintásra a cella élő/halott állapota megfordul
vaszon.addEventListener('pointerdown', (e) => {
  const rect = vaszon.getBoundingClientRect();
  const cella = rect.width / MERET;
  const x = Math.floor((e.clientX - rect.left) / cella);
  const y = Math.floor((e.clientY - rect.top) / cella);
  if (x < 0 || y < 0 || x >= MERET || y >= MERET) return;
  racs[y][x] = racs[y][x] ? 0 : 1;
  kirajzol();
  frissitAdatok();
});

btnIndit.addEventListener('click', indítasVagyMegallitas);
document.getElementById('btnLepes').addEventListener('click', () => {
  if (!fut) lepes();
});
document.getElementById('btnVeletlen').addEventListener('click', () => {
  if (fut) indítasVagyMegallitas();
  veletlen();
});
document.getElementById('btnTorol').addEventListener('click', torol);

window.addEventListener('resize', meretezes);

// ---- Indulás ----
document.getElementById('verzio').textContent = VERZIO;
meretezes();
frissitAdatok();

// Offline működéshez a service worker (ha a böngésző támogatja)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
