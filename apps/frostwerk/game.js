/* =====================================================================
   FROSTWERK – Der Instandhalter
   Ein kleines Browsergame in einer Eisfabrik. Präsentiert von Grollmus.
   Keine Abhängigkeiten – einfach index.html im Browser öffnen.
   ===================================================================== */
'use strict';
(() => {

// ---------------------------------------------------------------------
// Konstanten & Balancing
// ---------------------------------------------------------------------
const W = 1280, H = 720, MAX = 5;
const CFG = {
  startMoney: 250,
  batchTime: 1.2,         // s pro Charge Eis, wenn die Linie läuft
  batchValue: 10,         // € pro Charge
  maxFaults: 3,           // max. gleichzeitige Störungen
  onlineBase: 90, onlineStep: 50,   // Kurskosten: base + step * Stufe
  onlineTimeBase: 8, onlineTimeStep: 2,
  presenceFactor: 1.25,   // Präsenz-Aufschlag auf die Kursgebühr
  presenceDowntime: 150,  // geplanter Stillstand während Präsenzschulung (€)
  presenceDuration: 5.5,  // Echtzeit-Sekunden der Seminarszene
  serviceBase: 60, serviceSev: 35, serviceTime: 15, serviceTimeSev: 5,   // Herstellerservice
  grantBase: 180, grantStep: 20, grantCooldown: 90, grantFailCooldown: 45, // Weiterbildungszuschuss
  advanceBase: 300, advanceStep: 30, advanceFee: 0.10, advanceShare: 0.5,  // Budgetvorschuss
  coffeeCost: 5, coffeeTime: 25,
  tipEvery: 42,
  practiceDiscount: 0.05, maxDiscount: 0.25,
  repairBonusBase: 10, repairBonusLvl: 10, repairBonusSev: 5, // Geldbonus für selbst behobene Störungen
  postRepairGrace: 3,     // s Schonfrist nach Ende einer Reparatur, bevor die nächste Störung kommen kann
};

const TECH = {
  sps: { name: 'SPS & TIA Portal',   short: 'SPS', color: '#42a5f5', game: 'seq',    mg: 'Online-Diagnose – Befehlsfolge eingeben' },
  pn:  { name: 'PROFINET',           short: 'PN',  color: '#66bb6a', game: 'timing', mg: 'Netzwerk-Analyse – Telegramme synchronisieren' },
  pb:  { name: 'PROFIBUS',           short: 'PB',  color: '#ba68c8', game: 'timing', mg: 'Bus-Messung – Signalflanken treffen' },
  drv: { name: 'Antriebstechnik',    short: 'DRV', color: '#ffa726', game: 'timing', mg: 'Frequenzumrichter – Drehzahl einregeln' },
  hmi: { name: 'HMI & SCADA',        short: 'HMI', color: '#26c6da', game: 'seq',    mg: 'Bedienpanel – Bedienfolge eingeben' },
  sec: { name: 'Industrial Security',short: 'SEC', color: '#ef5350', game: 'seq',    mg: 'Zugang absichern – Sicherheitscode eingeben' },
};
const TK = Object.keys(TECH);

const FAULTS = {
  sps: ['CPU im STOP – Zykluszeitüberschreitung', 'Peripheriezugriffsfehler – Diagnosepuffer läuft voll',
        'Pufferbatterie leer – remanente Daten in Gefahr', 'Nach Programmänderung wird ein Ausgang doppelt beschrieben'],
  pn:  ['IO-Device nicht erreichbar – Gerätename fehlt nach Tausch', 'Telegrammausfälle durch beschädigten Stecker an Port 2',
        'Doppelte IP-Adresse im Anlagennetz', 'Hohe Netzlast – Watchdog spricht an'],
  pb:  ['Abschlusswiderstand am Segmentende deaktiviert', 'Reflexionen auf der Leitung – Telegrammwiederholungen',
        'Slave 12 meldet sich nicht – Adresskonflikt', 'Schirm nicht aufgelegt – EMV-Störungen'],
  drv: ['Frequenzumrichter: Überstrom beim Anfahren', 'Motorlager läuft heiß',
        'Umrichter-Übertemperatur – Lüfter verschmutzt', 'Drehzahlabweichung – Geber liefert Fehlsignale'],
  hmi: ['Bedienpanel eingefroren', 'Rezept „Vanille Deluxe“ lässt sich nicht laden',
        'Alarmflut – die eigentliche Ursache ist nicht erkennbar', 'Verbindung Panel ↔ SPS unterbrochen'],
  sec: ['Unbekannter USB-Stick am Leitrechner', 'Verdächtiger Datenverkehr aus dem Büronetz',
        'Standardpasswort an einem Switch entdeckt', 'Fernzugang ohne Freigabe aktiv'],
};

const TIPS = [
  'PROFIBUS: Abschlusswiderstände gehören nur an den ersten und letzten Teilnehmer eines Segments.',
  'PROFINET: Gerätenamen eindeutig vergeben – nach einem Gerätetausch muss der Name neu zugewiesen werden.',
  'SPS: Erst den Diagnosepuffer lesen, dann schrauben.',
  'Antriebe: Lüfter und Kühlkörper regelmäßig reinigen – Wärme ist der Feind der Leistungselektronik.',
  'Industrial Security: Standardpasswörter sofort ändern und Netze segmentieren.',
  'HMI: Gute Alarmtexte sparen in der Nachtschicht wertvolle Minuten.',
  'Vorbeugende Instandhaltung ist günstiger als jeder ungeplante Stillstand.',
  'Schirmung sauber auflegen – viele „sporadische“ Busfehler sind EMV-Probleme.',
  'Wer seine Anlage kennt, findet Fehler schneller. Schulung lohnt sich!',
  'Budget knapp? Viele Betriebe haben ein Weiterbildungsbudget – frag deine Werkleitung.',
];

const QUIZ = [
  ['pb',  'Wo werden bei PROFIBUS DP die Abschlusswiderstände aktiviert?', ['Am ersten und letzten Teilnehmer eines Segments', 'An jedem Teilnehmer', 'Nur am Master']],
  ['pb',  'Wie viele Teilnehmer sind pro PROFIBUS-RS485-Segment ohne Repeater zulässig?', ['32', '126', '8']],
  ['pb',  'Was ist eine typische Ursache für Telegrammwiederholungen bei PROFIBUS?', ['Reflexionen durch falsche Terminierung oder Stichleitungen', 'Zu viele Rezepte im HMI', 'Ein voller Diagnosepuffer der CPU']],
  ['pn',  'Woran erkennt der IO-Controller ein PROFINET-IO-Device beim Hochlauf?', ['Am Gerätenamen', 'An der Seriennummer', 'Am Kabeltyp']],
  ['pn',  'Auf welcher Technologie basiert PROFINET?', ['Industrial Ethernet', 'RS485', 'CAN-Bus']],
  ['pn',  'Was muss nach dem Tausch eines PROFINET-Geräts meist erledigt werden?', ['Gerätenamen zuweisen (falls kein automatischer Gerätetausch aktiv ist)', 'Die CPU neu urlöschen', 'Alle Switches neu starten']],
  ['sps', 'Welcher Organisationsbaustein enthält bei S7 das zyklische Hauptprogramm?', ['OB1', 'OB100', 'OB82']],
  ['sps', 'Wo findest du bei einer S7-CPU die Historie von Fehlerereignissen?', ['Im Diagnosepuffer', 'Im Prozessabbild der Ausgänge', 'In der Hardware-Konfiguration']],
  ['sps', 'Was passiert, wenn eine CPU in STOP geht?', ['Das Anwenderprogramm wird nicht mehr bearbeitet', 'Das Programm läuft mit halber Zykluszeit weiter', 'Nur die Analogwerte werden eingefroren']],
  ['drv', 'Wie verändert ein Frequenzumrichter die Drehzahl eines Asynchronmotors?', ['Über Frequenz und Spannung der Motorspeisung', 'Über die Anzahl der Motorlager', 'Über den Querschnitt der Motorleitung']],
  ['drv', 'Häufige Ursache für Überstrom beim Anfahren eines Antriebs?', ['Zu kurze Hochlauframpe', 'Zu großer Abschlusswiderstand', 'Falscher Gerätename']],
  ['drv', 'Was hilft gegen Übertemperatur im Umrichter?', ['Lüfter und Kühlkörper reinigen', 'Hochlaufzeit verkürzen', 'Zykluszeit der SPS erhöhen']],
  ['hmi', 'Wofür steht SCADA?', ['Supervisory Control and Data Acquisition', 'Safe Control and Drive Automation', 'System Check and Diagnostic Alarm']],
  ['hmi', 'Was zeichnet eine gute Alarmmeldung aus?', ['Eindeutiger Text mit Ursache und Handlungsempfehlung', 'Möglichst viele Alarme gleichzeitig', 'Ein lauter Signalton reicht']],
  ['sec', 'Welche Normenreihe behandelt die IT-Sicherheit industrieller Automatisierungssysteme?', ['IEC 62443', 'IEC 61131-3', 'ISO 9001']],
  ['sec', 'Was ist ein Grundprinzip für sichere Anlagennetze?', ['Segmentierung in Zonen mit kontrollierten Übergängen', 'Alle Geräte in ein flaches Netz', 'Fernzugang immer dauerhaft offen lassen']],
  ['sec', 'Was tust du mit Standardpasswörtern an Netzwerkkomponenten?', ['Bei der Inbetriebnahme ändern', 'Auf dem Gerät aufkleben', 'Nichts – sie sind ja dokumentiert']],
];

const RANKS = [[0, 'Azubi'], [6, 'Geselle'], [12, 'Techniker'], [18, 'Spezialist'], [24, 'Experte'], [30, 'Meister']];

// ---------------------------------------------------------------------
// Anlage
// ---------------------------------------------------------------------
const LINE_Y = 170, MW = 118, MH = 130;
const MACHINES = [
  { name: 'Rohstoffannahme', kind: 'tank',    techs: ['pb', 'hmi'], maker: 'Brenner Tankbau' },
  { name: 'Mischer',         kind: 'mixer',   techs: ['drv', 'sps'], maker: 'Rührwerk Huber' },
  { name: 'Pasteurisierer',  kind: 'pasteur', techs: ['sps', 'hmi', 'pb'], maker: 'Plattentherm' },
  { name: 'Homogenisator',   kind: 'homog',   techs: ['drv', 'pb'], maker: 'Druckwerk Sommer' },
  { name: 'Gefrierzylinder', kind: 'freezer', techs: ['sps', 'pn', 'drv'], maker: 'Frostline Anlagenbau' },
  { name: 'Abfüllung',       kind: 'filler',  techs: ['pn', 'drv', 'hmi'], maker: 'Kegel Abfülltechnik' },
  { name: 'Härtetunnel',     kind: 'tunnel',  techs: ['pn', 'sec'], maker: 'Polarwerk' },
].map((m, i) => ({ ...m, x: 220 + i * 148, y: LINE_Y, w: MW, h: MH }));
MACHINES.push({ name: 'Leitstand / SCADA', kind: 'scada', techs: ['sec', 'hmi', 'pn', 'sps'], maker: 'Leitwerk Systemhaus', x: 650, y: 452, w: 180, h: 96 });

// Instandhaltungsbüro (Akademie-Terminal, Kaffee, Regal). Bewusst nicht ganz links unten:
// Dort liegt auf Touch-Geräten der virtuelle Joystick und würde das Büro verdecken.
const OFFICE_X = 320, OFFICE_W = 250;
const TERMINAL = { x: OFFICE_X + 26, y: 470, w: 104, h: 48, name: 'Grollmus Akademie' };
const COFFEE   = { x: OFFICE_X + 166, y: 470, w: 46, h: 48, name: 'Kaffeeautomat' };
const START_POS = { x: OFFICE_X + 120, y: 610 };
const BOARD    = { x: 960, y: 520, w: 280, h: 170, name: 'Sponsor' };
const BOSS     = { x: 50, y: 150, w: 120, h: 92, name: 'Werkleitung' };
const OBSTACLES = [...MACHINES, TERMINAL, COFFEE, BOARD, BOSS];

// ---------------------------------------------------------------------
// DOM & Hilfsfunktionen
// ---------------------------------------------------------------------
const $ = s => document.querySelector(s);
const stage = $('#stage'), cv = $('#game'), ctx = cv.getContext('2d');
const modal = $('#modal'), screenEl = $('#screen'), toastsEl = $('#toasts'), skillsEl = $('#skills');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtMoney = v => '€ ' + Math.round(v).toLocaleString('de-DE');
const fmtTime = s => { s = Math.floor(s); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pipsHTML = (lvl, color) => `<span class="pips" style="--c:${color}">${Array.from({ length: MAX }, (_, i) => `<span class="pip${i < lvl ? ' on' : ''}"></span>`).join('')}</span>`;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

// Bühne (Canvas + HUD) wird als Ganzes skaliert. Die UI-Ebene (Dialoge, Bildschirme, Toasts) liegt separat darüber:
// Auf großen Displays deckt sie die Bühne exakt ab (gleiche Skalierung), auf kleinen Displays den ganzen Viewport
// mit einer eigenen, lesbaren Skalierung – Dialoge werden dort nicht mit der Bühne winzig.
const ui = $('#ui'), uiz = $('#uiz');
const COMPACT_BELOW = 0.75;
function fit() {
  const iw = innerWidth, ih = innerHeight;
  const s = Math.min(iw / W, ih / H), sl = (iw - W * s) / 2, st = (ih - H * s) / 2;
  stage.style.transform = `scale(${s})`;
  stage.style.left = sl + 'px';
  stage.style.top = st + 'px';
  const compact = s < COMPACT_BELOW;
  document.body.classList.toggle('compact', compact);
  const r = compact ? { l: 0, t: 0, w: iw, h: ih } : { l: sl, t: st, w: W * s, h: H * s };
  const z = compact ? clamp(Math.min(iw / 760, ih / 420), 0.6, 1.1) : s;
  Object.assign(ui.style, { left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px' });
  Object.assign(uiz.style, { width: (r.w / z) + 'px', height: (r.h / z) + 'px', transform: `scale(${z})` });
}
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 150));
fit();

// ---------------------------------------------------------------------
// Sound (WebAudio, prozedural)
// ---------------------------------------------------------------------
let actx = null, muted = store.get('frostwerk-muted') === '1';
function audioInit() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* kein Audio */ } }
  if (actx && actx.state === 'suspended') actx.resume().catch(() => {});   // iOS/Android: erst nach Nutzergeste
}
function tone(freq, dur = 0.12, type = 'square', vol = 0.05, delay = 0, slide = 0) {
  if (!actx || muted) return;
  const t0 = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
const SFX = {
  alarm() { tone(880, .14, 'square', .05); tone(660, .14, 'square', .05, .16); tone(880, .14, 'square', .05, .32); },
  hit()   { tone(1200, .07, 'triangle', .07); },
  key()   { tone(700, .05, 'triangle', .05); },
  miss()  { tone(180, .2, 'sawtooth', .05, 0, -80); },
  fix()   { [523, 659, 784, 1047].forEach((f, i) => tone(f, .14, 'triangle', .06, i * .08)); },
  level() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .18, 'triangle', .06, i * .09)); },
  coin()  { tone(1568, .06, 'square', .025); tone(2093, .08, 'square', .025, .05); },
  click() { tone(500, .04, 'triangle', .04); },
  phone() { for (let i = 0; i < 3; i++) { tone(1400, .08, 'sine', .05, i * .18); tone(1100, .08, 'sine', .05, i * .18 + .08); } },
};

// ---------------------------------------------------------------------
// Spielzustand
// ---------------------------------------------------------------------
let G = null;
const player = { x: START_POS.x, y: START_POS.y, r: 15, face: 1, walk: 0, moving: false, target: null, stuck: 0 };
const particles = [], floats = [];
let playerName = store.get('frostwerk-name') || 'Instandhalter';

function newGame() {
  G = {
    mode: 'walk', time: 0, run: 0, up: 0, flow: 0,
    money: CFG.startMoney, produced: 0, batchT: 0, lineOk: true,
    skills: { sps: 1, pn: 0, pb: 0, drv: 1, hmi: 0, sec: 0 },
    discount: Object.fromEntries(TK.map(t => [t, 0])),
    online: null, presence: null, mg: null, dlg: null,
    coffee: 0, repairing: false, advance: 0, grantCd: 0, quiz: null, quizLast: [], bossHint: false,
    nextFault: 10, nextTip: 18,
    stats: { self: 0, bonus: 0, service: 0, grants: 0, grantMoney: 0, advances: 0, online: 0, presence: 0, faults: 0, earned: 0, spent: 0, longest: 0 },
    downStreak: 0,
    rank: 'Azubi', hudT: 0,
  };
  MACHINES.forEach(m => { m.fault = null; m.remote = 0; m.remoteMax = 0; m.restart = 0; m.anim = 0; });
  Object.assign(player, { x: START_POS.x, y: START_POS.y, face: 1, walk: 0, target: null, stuck: 0 });
  particles.length = 0; floats.length = 0; toastsEl.innerHTML = '';
  renderSkills();
}

const totalLvl = () => TK.reduce((s, t) => s + G.skills[t], 0);
const rankOf = n => RANKS.reduce((r, [min, name]) => n >= min ? name : r, 'Azubi');
const onlineCost = t => Math.round((CFG.onlineBase + CFG.onlineStep * G.skills[t]) * (1 - G.discount[t]));
const onlineDur = t => CFG.onlineTimeBase + CFG.onlineTimeStep * G.skills[t];
function presenceInfo(t) {
  const L = G.skills[t], gain = Math.min(2, MAX - L);
  let fee = 0; for (let i = 0; i < gain; i++) fee += CFG.onlineBase + CFG.onlineStep * (L + i);
  fee = Math.round(fee * CFG.presenceFactor);
  return { gain, fee, cost: fee + CFG.presenceDowntime };
}
const serviceCost = f => CFG.serviceBase + CFG.serviceSev * f.sev;
const serviceTime = f => CFG.serviceTime + CFG.serviceTimeSev * f.sev;
const grantAmount = () => CFG.grantBase + CFG.grantStep * totalLvl();
const advanceAmount = () => CFG.advanceBase + CFG.advanceStep * totalLvl();
const cheapestCourse = () => Math.min(...TK.filter(t => G.skills[t] < MAX).map(onlineCost));
const pay = v => { G.money -= v; G.stats.spent += v; };

// ---------------------------------------------------------------------
// Toasts & Floats
// ---------------------------------------------------------------------
function toast(html, cls = '', dur = 4.5) {
  const el = document.createElement('div');
  el.className = 'toast ' + cls; el.innerHTML = html;
  toastsEl.appendChild(el);
  while (toastsEl.children.length > 3) toastsEl.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, dur * 1000);
}
const floatText = (x, y, text, color = '#fff', size = 14) => floats.push({ x, y, text, color, size, life: 1.4 });

// ---------------------------------------------------------------------
// Eingabe
// ---------------------------------------------------------------------
const keys = {};
const DIR_KEYS = { arrowleft: 'L', a: 'L', arrowright: 'R', d: 'R', arrowup: 'U', w: 'U', arrowdown: 'D', s: 'D' };
const ARROW = { L: '←', R: '→', U: '↑', D: '↓' };

addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') startGame(); return; }   // auch Bildschirmtastaturen
  setTouch(false);
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  const first = !keys[k];
  keys[k] = true;
  if (!first && e.repeat) return;
  onKey(k);
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (G && G.mode === 'walk') setPause(true); });

function onKey(k) {
  if (k === 'm') { muted = !muted; store.set('frostwerk-muted', muted ? '1' : '0'); toast(muted ? 'Ton aus' : 'Ton an', '', 1.5); return; }
  if (!G) { if (k === 'enter') startGame(); return; }
  switch (G.mode) {
    case 'walk':
      if (k === 'e' || k === ' ' || k === 'enter') interact();
      else if (k === 'p' || k === 'escape') setPause(true);
      break;
    case 'paused': if (k === 'p' || k === 'escape' || k === 'enter') setPause(false); break;
    case 'dialog':
      if (k === ' ' || k === 'enter') faultAction('self');
      else if (k === 'h') faultAction('service');
      else if (k === 'escape') closeModal();
      break;
    case 'menu': case 'info': case 'boss': if (k === 'escape') closeModal(); break;
    case 'quiz': if (['1', '2', '3'].includes(k)) answerQuiz(+k - 1); break;
    case 'online': if (k === 'escape' || k === 'e' || k === ' ') pauseOnline(); break;
    case 'minigame': mgKey(k); break;
    case 'end': if (k === 'enter') showTitle(); break;
  }
}

// ---- Touch & Maus ---------------------------------------------------
let touchMode = matchMedia('(pointer: coarse)').matches;
function setTouch(on) {
  if (on === touchMode) return;
  touchMode = on; document.body.classList.toggle('touch', on);
}
document.body.classList.toggle('touch', touchMode);
addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || e.pointerType === 'pen') setTouch(true); else if (e.pointerType === 'mouse') setTouch(false); audioInit(); }, true);
addEventListener('contextmenu', e => { if (e.target.tagName !== 'INPUT') e.preventDefault(); });

// Bildschirmkoordinaten → Spielkoordinaten
function toGame(cx, cy) {
  const r = cv.getBoundingClientRect();
  return { x: (cx - r.left) / r.width * W, y: (cy - r.top) / r.height * H };
}
// Antippen/Anklicken der Halle: zum Ziel laufen, bei Objekten dort automatisch interagieren
function tapAt(cx, cy) {
  if (!G) return;
  if (G.mode === 'online') pauseOnline();
  if (G.mode !== 'walk') return;
  const p = toGame(cx, cy);
  if (p.x < 0 || p.y < 0 || p.x > W || p.y > H) return;
  let hit = null, hd = 1e9;
  for (const it of interactables()) {
    const o = it.o;
    if (p.x < o.x - 14 || p.x > o.x + o.w + 14 || p.y < o.y - 40 || p.y > o.y + o.h + 14) continue;
    const d = distRect(p.x, p.y, o);
    if (d < hd) { hd = d; hit = it; }
  }
  const r = player.r;
  player.target = { x: clamp(p.x, 22 + r, W - 10 - r), y: clamp(p.y, 122 + r, H - 8 - r), o: hit ? hit.o : null, t: 0 };
  player.stuck = 0;
}
cv.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) tapAt(e.clientX, e.clientY); });

// Virtueller Joystick: Daumen irgendwo auf die Halle legen und ziehen. Kurzes Antippen = tapAt().
const joy = { id: null, x0: 0, y0: 0, x: 0, y: 0, t0: 0, moved: false };
const joyEl = $('#joy'), knobEl = $('#joy-knob'), touchEl = $('#touch'), actBtn = $('#t-act');
const JOY_R = 56;
touchEl.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  if (hitsPause(e.clientX, e.clientY)) { e.preventDefault(); touchPause(); return; }
  if (joy.id !== null) return;
  e.preventDefault();
  joy.id = e.pointerId; joy.x0 = e.clientX; joy.y0 = e.clientY; joy.x = joy.y = 0; joy.t0 = performance.now(); joy.moved = false;
  try { touchEl.setPointerCapture(e.pointerId); } catch { /* ignore */ }
});
touchEl.addEventListener('pointermove', e => {
  if (e.pointerId !== joy.id) return;
  const dx = e.clientX - joy.x0, dy = e.clientY - joy.y0, d = Math.hypot(dx, dy);
  if (!joy.moved && d > 12) {
    joy.moved = true;
    joyEl.classList.add('active'); joyEl.style.left = joy.x0 + 'px'; joyEl.style.top = joy.y0 + 'px';
    if (G && G.mode === 'online') pauseOnline();
  }
  if (!joy.moved) return;
  const k = Math.min(1, d / JOY_R), mag = k < 0.2 ? 0 : (k - 0.2) / 0.8;
  joy.x = d ? dx / d * mag : 0; joy.y = d ? dy / d * mag : 0;
  knobEl.style.transform = `translate(${d ? dx / d * Math.min(d, JOY_R) : 0}px, ${d ? dy / d * Math.min(d, JOY_R) : 0}px)`;
});
function joyEnd(e) {
  if (e.pointerId !== joy.id) return;
  if (!joy.moved && e.type === 'pointerup' && performance.now() - joy.t0 < 400) tapAt(e.clientX, e.clientY);
  joy.id = null; joy.x = joy.y = 0; joy.moved = false;
  joyEl.classList.remove('active'); joyEl.style.left = joyEl.style.top = ''; knobEl.style.transform = '';
}
touchEl.addEventListener('pointerup', joyEnd);
touchEl.addEventListener('pointercancel', joyEnd);
actBtn.addEventListener('pointerdown', e => { e.preventDefault(); onKey('e'); });
// Der Pause-Button sitzt in der Oberleiste (unter der Touch-Ebene). Treffer werden daher hier geprüft –
// mit großzügiger Tippfläche, die nach unten über die (nicht bedienbare) Skill-Leiste reicht.
const pauseBtn = $('#t-pause');
function hitsPause(cx, cy) {
  const r = pauseBtn.getBoundingClientRect();
  if (!r.width) return false;
  return cx >= r.left - 16 && cx <= r.right + 16 && cy >= r.top - 12 && cy <= r.bottom + Math.max(16, r.height);
}
function touchPause() {
  if (!G) return;
  if (G.mode === 'online') pauseOnline();
  setPause(true);
}

// Hochformat auf Touch-Geräten: Spiel pausieren (Hinweis "Gerät drehen" kommt per CSS)
const portraitMq = matchMedia('(orientation: portrait) and (pointer: coarse)');
const checkPortrait = () => { if (portraitMq.matches && G && G.mode === 'walk') setPause(true); };
portraitMq.addEventListener ? portraitMq.addEventListener('change', checkPortrait) : portraitMq.addListener(checkPortrait);
document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.mode === 'walk') setPause(true); });

// Minispiele per Touch: Buttons reagieren schon beim Antippen (pointerdown), nicht erst beim Loslassen
modal.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-mg]');
  if (!b) return;
  e.preventDefault();
  mgKey(b.dataset.mg);
});

modal.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b || b.disabled) return;
  SFX.click();
  const a = b.dataset.a, t = b.dataset.t;
  if (a === 'self' || a === 'service') faultAction(a);
  else if (a === 'grant') startQuiz();
  else if (a === 'advance') takeAdvance();
  else if (a === 'answer') answerQuiz(+b.dataset.i);
  else if (a === 'close') closeModal();
  else if (a === 'online') startOnline(t);
  else if (a === 'presence') startPresence(t);
  else if (a === 'abort') { closeModal(); }
});
screenEl.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b) return;
  if (b.dataset.a === 'start') startGame();
  if (b.dataset.a === 'title') showTitle();
  if (b.dataset.a === 'resume') setPause(false);
});

// ---------------------------------------------------------------------
// Bewegung, Kollision, Interaktion
// ---------------------------------------------------------------------
function distRect(px, py, o) {
  const cx = clamp(px, o.x, o.x + o.w), cy = clamp(py, o.y, o.y + o.h);
  return Math.hypot(px - cx, py - cy);
}
function blocked(x, y) {
  const r = player.r;
  if (x < 22 + r || x > W - 10 - r || y < 122 + r || y > H - 8 - r) return true;
  return OBSTACLES.some(o => distRect(x, y, o) < r);
}
function movePlayer(dt) {
  let dx = 0, dy = 0, mag = 1;
  if (keys.arrowleft || keys.a) dx--; if (keys.arrowright || keys.d) dx++;
  if (keys.arrowup || keys.w) dy--; if (keys.arrowdown || keys.s) dy++;
  if (!dx && !dy && (joy.x || joy.y)) { dx = joy.x; dy = joy.y; mag = Math.min(1, Math.hypot(dx, dy)); }
  if (dx || dy) player.target = null;            // manuelle Steuerung hat Vorrang
  else if (player.target) {
    const tg = player.target;
    if (tg.o && distRect(player.x, player.y, tg.o) < 40) {
      player.target = null; player.moving = false;
      const it = interactables().find(i => i.o === tg.o);
      if (it) { SFX.click(); it.act(); }
      return;
    }
    const ddx = tg.x - player.x, ddy = tg.y - player.y, d = Math.hypot(ddx, ddy);
    if (d < 6) player.target = null; else { dx = ddx; dy = ddy; }
  }
  player.moving = !!(dx || dy);
  if (!player.moving) return;
  const len = Math.hypot(dx, dy), sp = 230 * (G.coffee > 0 ? 1.4 : 1) * dt * mag;
  dx = dx / len * sp; dy = dy / len * sp;
  if (Math.abs(dx) > 0.05) player.face = Math.sign(dx);
  const ox = player.x, oy = player.y;
  if (!blocked(player.x + dx, player.y)) player.x += dx;
  if (!blocked(player.x, player.y + dy)) player.y += dy;
  player.walk += dt;
  // Automatisches Laufen abbrechen, wenn ein Hindernis den Weg versperrt
  if (player.target) {
    player.stuck = Math.hypot(player.x - ox, player.y - oy) < sp * 0.3 ? player.stuck + dt : 0;
    if (player.stuck > 0.3) { player.target = null; player.moving = false; }
  }
}

function interactables() {
  const list = [];
  for (const m of MACHINES) {
    if (m.fault && m.remote <= 0) list.push({ o: m, label: 'Störung untersuchen', act: () => openFault(m) });
  }
  list.push({ o: TERMINAL, label: G.online ? `Online-Kurs fortsetzen (${TECH[G.online.tech].short})` : 'Grollmus Akademie öffnen', act: openAcademy });
  list.push({ o: COFFEE, label: `Kaffee holen (€${CFG.coffeeCost})`, act: drinkCoffee });
  list.push({ o: BOARD, label: 'Über den Sponsor', act: openSponsor });
  list.push({ o: BOSS, label: 'Mit der Werkleitung sprechen', act: openBoss });
  return list;
}
function nearest() {
  let best = null, bd = 44;
  for (const it of interactables()) {
    const d = distRect(player.x, player.y, it.o);
    if (d < bd) { bd = d; best = it; }
  }
  return best;
}
function interact() { const n = nearest(); if (n) { SFX.click(); n.act(); } }

function drinkCoffee() {
  if (G.money < CFG.coffeeCost) { toast('Nicht genug Kleingeld für Kaffee.', 'bad', 2); return; }
  pay(CFG.coffeeCost); G.coffee = CFG.coffeeTime;
  toast('☕ Frisch gebrüht! Du bist für 25 Sekunden schneller unterwegs.', 'good', 3);
}

function setPause(on) {
  if (on) {
    if (G.mode !== 'walk') return;
    G.mode = 'paused'; player.target = null;
    screenEl.className = '';
    screenEl.style.background = 'rgba(5,8,12,.75)';
    screenEl.innerHTML = `<div class="panel" style="text-align:center;width:420px">
      <h2>Pause</h2><p class="small">Kurze Brotzeit. Die Anlage wartet.</p>
      <div class="btns" style="justify-content:center"><button class="primary" data-a="resume">Weiter ▶<kbd>P</kbd></button>
      <button data-a="title">Zum Titelbildschirm</button></div></div>`;
  } else if (G.mode === 'paused') {
    G.mode = 'walk'; screenEl.className = 'hidden'; screenEl.style.background = '';
  }
}

// ---------------------------------------------------------------------
// Störungen
// ---------------------------------------------------------------------
function spawnFault() {
  const active = MACHINES.filter(m => m.fault).length;
  if (active >= CFG.maxFaults) return;
  const cands = MACHINES.filter(m => !m.fault && m.restart <= 0);
  if (!cands.length) return;
  const m = pick(cands);
  // Besser ausgebildete Technologien fallen seltener aus (vorbeugende Instandhaltung)
  const weights = m.techs.map(t => Math.pow(MAX + 1 - G.skills[t], 1.4));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0), tech = m.techs[0];
  for (let i = 0; i < m.techs.length; i++) { r -= weights[i]; if (r <= 0) { tech = m.techs[i]; break; } }
  const x = Math.random(), sev = x < .5 ? 1 : x < .85 ? 2 : 3;
  m.fault = { tech, sev, text: pick(FAULTS[tech]), t: 0 };
  G.stats.faults++;
  SFX.alarm();
  toast(`<b style="color:${TECH[tech].color}">⚠ ${m.name}</b> – ${esc(m.fault.text)}`, 'bad', 5);
  for (let i = 0; i < 12; i++) spark(m.x + m.w / 2, m.y + 30, '#ff7043');
}

function difficultyText(L, sev) {
  const d = sev * 2 - L;
  if (d <= -2) return '<span style="color:#81c784">Routine – das machst du im Schlaf.</span>';
  if (d <= 0) return '<span style="color:#aed581">Machbar – du kennst dich aus.</span>';
  if (d <= 2) return '<span style="color:#ffb74d">Knifflig – eine Schulung würde helfen.</span>';
  return '<span style="color:#e57373">Sehr schwer – ohne Fachwissen kaum zu lösen. Vielleicht den Herstellerservice rufen?</span>';
}

function openFault(m) {
  const f = m.fault, t = TECH[f.tech], L = G.skills[f.tech], sc = serviceCost(f);
  G.mode = 'dialog'; G.dlg = m;
  modal.className = '';
  modal.innerHTML = `<div class="panel">
    <div class="ph" style="--c:${t.color}"><span class="badge">${t.short}</span> Störung an <b>${esc(m.name)}</b></div>
    <div class="ftext">${esc(f.text)}</div>
    <div class="meta"><span>Technologie: <b>${t.name}</b></span>
      <span>Schwere: <b style="color:#ff8a65">${'▲'.repeat(f.sev)}${'△'.repeat(3 - f.sev)}</b></span>
      <span>Dein Skill: ${pipsHTML(L, t.color)}</span></div>
    <p class="diff">Einschätzung: ${difficultyText(L, f.sev)} · Reparaturbonus bei Erfolg: <b style="color:#ffd54f">€${repairBonus(f.tech, f.sev)}</b></p>
    <div class="btns">
      <button class="primary" data-a="self">Selbst beheben<kbd>Leertaste</kbd></button>
      <button data-a="service" ${G.money >= sc ? '' : 'disabled'}>📞 Hersteller anrufen · €${sc}<kbd>H</kbd></button>
      <button data-a="close">Zurück<kbd>Esc</kbd></button>
    </div>
    <p class="small" style="margin-top:12px">Herstellerservice: Der Service von <b>${esc(m.maker)}</b> (Hersteller dieses Anlagenteils) behebt die Störung in ca. ${serviceTime(f)} s – du kannst dich derweil um andere Dinge kümmern.</p>
  </div>`;
}

function faultAction(a) {
  const m = G.dlg; if (!m || !m.fault) { closeModal(); return; }
  if (a === 'self') startMinigame(m);
  else if (a === 'service') {
    const f = m.fault, sc = serviceCost(f);
    if (G.money < sc) return;
    pay(sc);
    m.remote = m.remoteMax = serviceTime(f);
    G.stats.service++;
    SFX.phone();
    toast(`📞 Herstellerservice <b>${esc(m.maker)}</b>: „Unser Techniker kümmert sich darum!“`, '', 4);
    closeModal();
  }
}

function closeModal() {
  modal.className = 'hidden'; modal.innerHTML = '';
  G.mg = null; G.dlg = null;
  G.quiz = null;
  if (['dialog', 'menu', 'info', 'minigame', 'boss', 'quiz'].includes(G.mode)) G.mode = 'walk';
}

function repaired(m, how) {
  m.fault = null; m.remote = 0; m.restart = 1.6;
  SFX.fix();
  for (let i = 0; i < 26; i++) spark(m.x + m.w / 2, m.y + m.h / 2, pick(['#81c784', '#fff59d', '#4fc3f7']));
  floatText(m.x + m.w / 2, m.y - 10, how === 'self' ? 'Behoben!' : 'Service OK', '#81c784', 16);
}

// ---------------------------------------------------------------------
// Minispiele
// ---------------------------------------------------------------------
function startMinigame(m) {
  const f = m.fault, t = TECH[f.tech], L = G.skills[f.tech], s = f.sev;
  G.mode = 'minigame';
  modal.className = 'see-through';
  const head = `<div class="mgt">${t.mg}</div>
    <div class="ph" style="--c:${t.color};margin-top:4px"><span class="badge">${t.short}</span> ${esc(m.name)}: ${esc(f.text)}</div>`;
  if (t.game === 'timing') {
    const zw = Math.max(0.07, 0.13 + 0.05 * L - 0.025 * s);
    G.mg = { type: 'timing', m, pos: 0, dir: 1, speed: Math.max(0.45, 0.85 + 0.22 * s - 0.1 * L), zw, zs: rand(0.1, 0.9 - zw),
             need: clamp(2 + s - Math.floor(L / 2), 1, 5), hits: 0, stun: 0, flash: 0 };
    modal.innerHTML = `<div class="panel mg" style="--c:${t.color}">${head}
      <div class="bar" id="mg-bar"><div class="grid"></div><div class="zone" id="mg-zone"></div><div class="cursor" id="mg-cur"></div></div>
      <div class="hits" id="mg-hits"></div>
      <div class="mgtouch t-only"><button class="primary hit" data-mg="e">⚡ Jetzt!</button><button data-a="close">Abbrechen</button></div>
      <p class="help"><span class="k-only"><kbd>Leertaste</kbd> drücken, wenn der Cursor im grünen Bereich ist · <kbd>Esc</kbd> abbrechen</span>
        <span class="t-only">„Jetzt!“ antippen, wenn der Cursor im grünen Bereich ist</span></p></div>`;
  } else {
    const len = clamp(3 + 2 * s - L, 3, 9);
    G.mg = { type: 'seq', m, len, seq: newSeq(len), idx: 0, t: 0, tmax: len * (0.85 + 0.22 * L) + 1, stun: 0 };
    modal.innerHTML = `<div class="panel mg" style="--c:${t.color}">${head}
      <div class="seq" id="mg-seq"></div>
      <div class="timer"><div id="mg-timer"></div></div>
      <div class="mgtouch t-only">${['arrowleft', 'arrowup', 'arrowdown', 'arrowright'].map(k => `<button data-mg="${k}">${ARROW[DIR_KEYS[k]]}</button>`).join('')}
        <button data-a="close">Abbrechen</button></div>
      <p class="help"><span class="k-only">Folge mit <kbd>Pfeiltasten</kbd> oder <kbd>WASD</kbd> eingeben · <kbd>Esc</kbd> abbrechen</span>
        <span class="t-only">Folge mit den Pfeil-Buttons eingeben</span></p></div>`;
  }
  G.mg.el = { bar: $('#mg-bar'), zone: $('#mg-zone'), cur: $('#mg-cur'), hits: $('#mg-hits'), seq: $('#mg-seq'), timer: $('#mg-timer') };
  renderMinigame(true);
}
const newSeq = n => Array.from({ length: n }, () => pick(['L', 'R', 'U', 'D']));

function mgKey(k) {
  const g = G.mg; if (!g) return;
  if (k === 'escape') { closeModal(); return; }
  if (!g.m.fault) { closeModal(); return; }
  if (g.stun > 0) return;
  if (g.type === 'timing') {
    if (k !== ' ' && k !== 'enter' && k !== 'e') return;
    if (g.pos >= g.zs && g.pos <= g.zs + g.zw) {
      g.hits++; g.flash = 0.25; SFX.hit();
      if (g.hits >= g.need) return mgSuccess();
      g.zs = rand(0.05, 0.95 - g.zw); g.speed *= 1.06;
    } else {
      g.hits = Math.max(0, g.hits - 1); g.stun = 0.55; SFX.miss(); shake();
    }
    renderMinigame(true);
  } else {
    const d = DIR_KEYS[k]; if (!d) return;
    if (d === g.seq[g.idx]) {
      g.idx++; SFX.key();
      if (g.idx >= g.len) return mgSuccess();
    } else { mgSeqFail(); }
    renderMinigame(true);
  }
}
function mgSeqFail() {
  const g = G.mg;
  g.seq = newSeq(g.len); g.idx = 0; g.t = 0; g.stun = 0.6; SFX.miss(); shake();
}
function shake() { const p = modal.querySelector('.panel'); if (p) { p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); } }

const repairBonus = (tech, sev) => CFG.repairBonusBase + CFG.repairBonusLvl * G.skills[tech] + CFG.repairBonusSev * sev;

function mgSuccess() {
  const m = G.mg.m, tech = m.fault.tech, bonus = repairBonus(tech, m.fault.sev);
  G.stats.self++;
  G.money += bonus; G.stats.bonus += bonus;
  floatText(m.x + m.w / 2, m.y - 32, '+€' + bonus + ' Bonus', '#ffd54f', 15);
  toast(`💰 Reparaturbonus: <b>+${fmtMoney(bonus)}</b> (${TECH[tech].name}, Stufe ${G.skills[tech]})`, 'good', 3);
  const before = G.discount[tech];
  if (G.skills[tech] < MAX) G.discount[tech] = Math.min(CFG.maxDiscount, G.discount[tech] + CFG.practiceDiscount);
  repaired(m, 'self');
  closeModal();
  if (G.discount[tech] > before) toast(`Praxiserfahrung in <b>${TECH[tech].name}</b>: −${Math.round(G.discount[tech] * 100)} % auf die nächste Schulung.`, 'good', 3.5);
  renderSkills();
}

function updateMinigame(dt) {
  const g = G.mg; if (!g) return;
  if (!g.m.fault) { closeModal(); return; }
  if (g.stun > 0) g.stun -= dt;
  if (g.flash > 0) g.flash -= dt;
  if (g.type === 'timing') {
    if (g.stun <= 0) {
      g.pos += g.dir * g.speed * dt;
      if (g.pos > 1) { g.pos = 1; g.dir = -1; }
      if (g.pos < 0) { g.pos = 0; g.dir = 1; }
    }
  } else if (g.stun <= 0) {
    g.t += dt;
    if (g.t >= g.tmax) { mgSeqFail(); renderMinigame(true); }
  }
  renderMinigame(false);
}

function renderMinigame(full) {
  const g = G.mg; if (!g || !g.el) return;
  const e = g.el;
  if (g.type === 'timing') {
    e.cur.style.left = (g.pos * 100) + '%';
    e.bar.classList.toggle('stun', g.stun > 0);
    e.bar.classList.toggle('flash', g.flash > 0);
    if (full) {
      e.zone.style.left = (g.zs * 100) + '%'; e.zone.style.width = (g.zw * 100) + '%';
      e.hits.innerHTML = Array.from({ length: g.need }, (_, i) => `<span class="${i < g.hits ? 'on' : ''}"></span>`).join('');
    }
  } else {
    e.timer.style.width = (100 * (1 - g.t / g.tmax)) + '%';
    e.seq.classList.toggle('stun', g.stun > 0);
    if (full) e.seq.innerHTML = g.seq.map((d, i) => `<span class="${i < g.idx ? 'done' : i === g.idx ? 'cur' : ''}">${ARROW[d]}</span>`).join('');
  }
}

// ---------------------------------------------------------------------
// Grollmus Akademie (Schulungen)
// ---------------------------------------------------------------------
function openAcademy() {
  if (G.online) { resumeOnline(); return; }
  G.mode = 'menu';
  renderAcademy();
}
function renderAcademy() {
  modal.className = '';
  const rows = TK.map(t => {
    const T = TECH[t], L = G.skills[t], P = presenceInfo(t);
    const oc = onlineCost(t);
    const done = L >= MAX;
    const doneBtn = '<button disabled><b>✔ Gemeistert</b><small>Stufe 5 erreicht</small></button>';
    const onBtn = done ? doneBtn
      : `<button data-a="online" data-t="${t}" ${G.money >= oc ? '' : 'disabled'}><b>💻 Online +1</b><small>€${oc} · ${onlineDur(t)} s</small></button>`;
    const prBtn = done ? doneBtn
      : `<button class="primary" data-a="presence" data-t="${t}" ${G.money >= P.cost ? '' : 'disabled'}><b>🏫 Präsenz +${P.gain}</b><small>€${P.cost}</small></button>`;
    // Name, Stufe und (optional) Praxisrabatt teilen sich eine Zelle mit fester Höhe –
    // so verschiebt ein eingeblendeter Rabatt weder die Spalten noch die Buttons.
    return `<div class="trow" style="--c:${T.color}">
      <div class="tinfo"><span class="tn" title="${T.name}">${T.name}</span>${pipsHTML(L, T.color)}
        <span class="disc">${G.discount[t] > 0 && !done ? `Praxisrabatt −${Math.round(G.discount[t] * 100)} %` : ''}</span></div>
      ${onBtn}${prBtn}</div>`;
  }).join('');
  modal.innerHTML = `<div class="panel academy">
    <div class="ahead"><span class="glogo">GROLLMUS</span><h2>Akademie – Schulungsportal</h2></div>
    <div class="alead">
      <div><b>💻 Online-Schulung</b> – günstig und flexibel. Du lernst hier am Terminal, die Anlage läuft weiter.
      Kommt eine Störung dazwischen, kannst du den Kurs jederzeit pausieren und später fortsetzen.</div>
      <div><b>🏫 Präsenzschulung</b> – bis zu zwei Stufen auf einmal, praxisnah an echter Hardware.
      Teurer, und die Anlage geht in einen geplanten Stillstand (€${CFG.presenceDowntime} Produktionsausfall).</div>
    </div>
    ${rows}
    <div class="afoot"><span>Budget: <b style="color:#fff">${fmtMoney(G.money)}</b> · Selbst behobene Störungen geben Praxisrabatt (max. 25 %).<br>
      ${G.money < cheapestCourse() ? '<b style="color:#ffd54f">Budget zu knapp? Die Werkleitung (oben links in der Halle) kann Geld für Weiterbildung freigeben.</b>' : 'Budget knapp? Die Werkleitung oben links kann helfen.'}</span>
      <button data-a="close">Schließen<kbd>Esc</kbd></button></div>
  </div>`;
}

function startOnline(t) {
  if (G.online) return;
  const c = onlineCost(t);
  if (G.money < c || G.skills[t] >= MAX) return;
  pay(c);
  G.online = { tech: t, p: 0, dur: onlineDur(t) };
  G.stats.online++;
  closeModal();
  resumeOnline();
  toast(`💻 Online-Kurs <b>${TECH[t].name}</b> gestartet. <span class="k-only"><kbd>E</kbd> pausiert den Kurs.</span><span class="t-only">✋ oder Laufen pausiert den Kurs.</span>`, 'tip', 3.5);
}
function resumeOnline() {
  G.mode = 'online';
  player.x = TERMINAL.x + TERMINAL.w / 2; player.y = TERMINAL.y + TERMINAL.h + player.r + 2;
}
function pauseOnline() {
  G.mode = 'walk';
  toast(`Online-Kurs pausiert (${Math.round(100 * G.online.p / G.online.dur)} %). Am Terminal geht's weiter.`, '', 2.5);
}
function updateOnline(dt) {
  const o = G.online;
  o.p += dt;
  if (o.p >= o.dur) {
    const t = o.tech;
    G.online = null; G.mode = 'walk';
    levelUp(t, 1, 'Online-Schulung');
  }
}

function startPresence(t) {
  const P = presenceInfo(t);
  if (G.money < P.cost || P.gain <= 0) return;
  pay(P.cost);
  G.stats.presence++;
  closeModal();
  G.mode = 'presence';
  G.presence = { tech: t, t: 0, gain: P.gain, msgI: -1 };
  const T = TECH[t];
  screenEl.className = '';
  screenEl.innerHTML = `<div class="seminar">
    <div class="title" style="width:auto"><div class="pre" style="margin-bottom:10px">Präsenzschulung</div></div>
    <div class="classroom">
      <div class="whiteboard"><div class="wh">GROLLMUS AKADEMIE</div><div class="wt">${T.name}</div>
        <div style="font-size:13px;margin-top:6px;color:#435">Praxis-Workshop · Stufe ${G.skills[t] + 1}${P.gain > 1 ? '–' + (G.skills[t] + P.gain) : ''}</div>
        <svg width="140" height="60" viewBox="0 0 140 60"><polyline fill="none" stroke="${T.color}" stroke-width="3"
          points="0,50 20,30 40,40 60,12 80,26 100,8 120,20 140,4"/></svg></div>
      <svg class="trainer" viewBox="0 0 40 90"><circle cx="20" cy="12" r="10" fill="#e0b48a"/><rect x="8" y="24" width="24" height="38" rx="5" fill="#1d6fd1"/>
        <rect x="10" y="62" width="8" height="26" fill="#2b3440"/><rect x="22" y="62" width="8" height="26" fill="#2b3440"/>
        <line x1="32" y1="30" x2="44" y2="10" stroke="#e0b48a" stroke-width="5" stroke-linecap="round"/></svg>
      <div class="desks"><div class="desk"></div><div class="desk me"></div><div class="desk" style="--hc:#e53935"></div><div class="desk" style="--hc:#43a047"></div></div>
    </div>
    <div class="semtext" id="semtext"></div>
    <div class="semprog"><div id="semprog" style="width:0"></div></div>
    <p class="small" style="margin-top:10px">Die Anlage befindet sich während deiner Abwesenheit im geplanten Stillstand.</p>
  </div>`;
}
const SEM_MSGS = ['Anreise zur Grollmus Akademie …', 'Theorie kompakt – von Profis aus der Praxis', 'Hands-on am echten Hardware-Aufbau',
  'Fachsimpeln in der Kaffeepause', 'Fehlersuche im Team – Trainer gibt Profi-Tricks', 'Zertifikat erhalten! Zurück in die Eisfabrik …'];
function updatePresence(dt) {
  const p = G.presence;
  p.t += dt;
  const f = clamp(p.t / CFG.presenceDuration, 0, 1);
  const i = Math.min(SEM_MSGS.length - 1, Math.floor(f * SEM_MSGS.length));
  const bar = $('#semprog'); if (bar) bar.style.width = (f * 100) + '%';
  if (i !== p.msgI) { p.msgI = i; const el = $('#semtext'); if (el) el.textContent = SEM_MSGS[i]; }
  if (p.t >= CFG.presenceDuration) {
    screenEl.className = 'hidden'; screenEl.innerHTML = '';
    G.presence = null; G.mode = 'walk';
    Object.assign(player, { x: START_POS.x, y: START_POS.y });
    levelUp(p.tech, p.gain, 'Präsenzschulung');
  }
}

function levelUp(t, n, how) {
  G.skills[t] = Math.min(MAX, G.skills[t] + n);
  G.discount[t] = 0;
  SFX.level();
  for (let i = 0; i < 40; i++) spark(player.x, player.y - 20, pick([TECH[t].color, '#fff59d', '#ffffff']));
  floatText(player.x, player.y - 50, `${TECH[t].short} Stufe ${G.skills[t]}!`, TECH[t].color, 18);
  toast(`🎓 ${how} abgeschlossen: <b style="color:${TECH[t].color}">${TECH[t].name}</b> jetzt auf Stufe ${G.skills[t]}/${MAX}.`, 'good', 4);
  const r = rankOf(totalLvl());
  if (r !== G.rank) { G.rank = r; setTimeout(() => toast(`🏅 Beförderung! Du bist jetzt <b>${r}</b>.`, 'good', 4.5), 600); }
  renderSkills();
  if (TK.every(k => G.skills[k] >= MAX)) {
    G.mode = 'finishing';
    setTimeout(showEnd, 2200);
  }
}

// ---------------------------------------------------------------------
// Sponsor-Info
// ---------------------------------------------------------------------
function openSponsor() {
  G.mode = 'info';
  modal.className = '';
  modal.innerHTML = `<div class="panel sponsorinfo">
    <span class="glogo">GROLLMUS</span>
    <h2>Offizieller Sponsor der Frostwerk Eisfabrik</h2>
    <p>Ohne Automatisierung kein Eis: SPS, Feldbusse, Antriebe, Bedienen &amp; Beobachten und Industrial Security
       müssen perfekt zusammenspielen. Grollmus bringt Instandhalter mit Schulungen auf den neuesten Stand – online und in Präsenz.</p>
    <p>Im Spiel findest du Grollmus hier:</p>
    <p>💻 <b>Akademie-Terminal</b> im Instandhaltungsbüro – Online-Schulungen buchen<br>
       🏫 <b>Präsenzseminare</b> – zwei Stufen auf einmal, praxisnah an echter Hardware<br>
       💡 <b>Grollmus-Tipps</b> – kleine Praxis-Weisheiten während der Schicht</p>
    <div class="btns"><button class="primary" data-a="close">Zurück an die Arbeit<kbd>Esc</kbd></button></div>
  </div>`;
}

// ---------------------------------------------------------------------
// Werkleitung: Geld für Weiterbildung organisieren
// ---------------------------------------------------------------------
function openBoss() {
  G.mode = 'boss';
  renderBoss();
}
function renderBoss(extra = '') {
  modal.className = '';
  const down = !G.lineOk, ga = grantAmount(), aa = advanceAmount(), back = Math.round(aa * (1 + CFG.advanceFee));
  const quote = down
    ? '„Die Linie steht, und Sie kommen mit einer Schulungsanfrage? … Na schön. Gerade deshalb brauchen wir bessere Fachleute. Überzeugen Sie mich.“'
    : '„Läuft ja ordentlich! Was kann ich für Sie tun?“';
  const grantBtn = G.grantCd > 0
    ? `<button disabled>Wieder möglich in ${Math.ceil(G.grantCd)} s</button>`
    : `<button class="primary" data-a="grant">Fachgespräch führen</button>`;
  const advBtn = G.advance > 0
    ? `<button disabled>Noch ${fmtMoney(G.advance)} offen</button>`
    : `<button data-a="advance">${fmtMoney(aa)} Vorschuss nehmen</button>`;
  modal.innerHTML = `<div class="panel boss">
    <div class="ph" style="--c:#b39ddb"><span class="badge">WERKLEITUNG</span> Dr. Eisele</div>
    <div class="ftext">${quote}</div>
    ${extra}
    <div class="opts">
      <div class="opt"><b>🎓 Weiterbildungszuschuss</b>
        <p>Beantworte eine Fachfrage. Ist sie richtig, gibt die Werkleitung <b>${fmtMoney(ga)}</b> aus dem Weiterbildungsbudget frei – <b>nicht rückzahlbar</b>.
        Bei einer falschen Antwort musst du ${CFG.grantFailCooldown} s warten.</p>${grantBtn}</div>
      <div class="opt"><b>💶 Budgetvorschuss</b>
        <p>Du bekommst sofort <b>${fmtMoney(aa)}</b>. Zurückgezahlt werden <b>${fmtMoney(back)}</b>: Dafür gehen automatisch ${Math.round(CFG.advanceShare * 100)} % der Produktionserlöse ab,
        bis alles beglichen ist. Es kann immer nur ein Vorschuss offen sein.</p>${advBtn}</div>
    </div>
    <div class="btns"><button data-a="close">Zurück an die Arbeit<kbd>Esc</kbd></button></div>
  </div>`;
}
function startQuiz() {
  if (G.grantCd > 0) return;
  let pool = QUIZ.map((q, i) => i).filter(i => !G.quizLast.includes(i));
  const i = pick(pool);
  G.quizLast.push(i); if (G.quizLast.length > 8) G.quizLast.shift();
  const [tech, q, answers] = QUIZ[i];
  const order = [0, 1, 2].sort(() => Math.random() - 0.5);
  G.quiz = { i, order };
  G.mode = 'quiz';
  const T = TECH[tech];
  modal.innerHTML = `<div class="panel boss">
    <div class="ph" style="--c:${T.color}"><span class="badge">${T.short}</span> Fachgespräch mit der Werkleitung</div>
    <div class="ftext">${esc(q)}</div>
    <div class="answers">${order.map((a, k) => `<button data-a="answer" data-i="${k}"><kbd>${k + 1}</kbd> ${esc(answers[a])}</button>`).join('')}</div>
    <p class="small">„Zeigen Sie mir, dass sich die Investition lohnt.“</p>
  </div>`;
}
function answerQuiz(k) {
  const q = G.quiz; if (!q || k < 0 || k > 2) return;
  const [tech, , answers] = QUIZ[q.i];
  const right = q.order[k] === 0;
  G.quiz = null; G.mode = 'boss';
  if (right) {
    const ga = grantAmount();
    G.money += ga; G.stats.grants++; G.stats.grantMoney += ga;
    G.grantCd = CFG.grantCooldown;
    SFX.fix();
    toast(`🎓 Weiterbildungszuschuss genehmigt: <b>+${fmtMoney(ga)}</b>`, 'good', 4);
    renderBoss(`<div class="verdict good">✔ Richtig! „Überzeugt. ${fmtMoney(ga)} aus dem Weiterbildungsbudget sind freigegeben – investieren Sie es gut.“</div>`);
  } else {
    G.grantCd = CFG.grantFailCooldown;
    SFX.miss();
    renderBoss(`<div class="verdict bad">✘ Leider falsch. Richtig wäre: <b>${esc(answers[0])}</b>.<br>„Kommen Sie wieder, wenn Sie sich sicherer sind.“ Gerade deshalb wäre eine Schulung in <b>${TECH[tech].name}</b> sinnvoll.</div>`);
  }
}
function takeAdvance() {
  if (G.advance > 0) return;
  const aa = advanceAmount();
  G.money += aa; G.advance = Math.round(aa * (1 + CFG.advanceFee)); G.stats.advances++;
  SFX.coin();
  toast(`💶 Budgetvorschuss erhalten: <b>+${fmtMoney(aa)}</b>. Die Rückzahlung läuft automatisch über die Produktion.`, 'good', 4.5);
  renderBoss(`<div class="verdict good">„In Ordnung. Aber die Linie muss laufen, sonst sehen wir das Geld nie wieder.“</div>`);
}

// ---------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------
function renderSkills() {
  skillsEl.innerHTML = TK.map(t => {
    const T = TECH[t], L = G.skills[t];
    let sub = '';
    if (G.online && G.online.tech === t) sub = `Online ${Math.round(100 * G.online.p / G.online.dur)} %`;
    else if (L >= MAX) sub = 'Meister';
    else if (G.discount[t] > 0) sub = `−${Math.round(G.discount[t] * 100)} %`;
    const prog = G.online && G.online.tech === t ? `<div class="prog" style="width:${100 * G.online.p / G.online.dur}%"></div>` : '';
    return `<div class="skill${L >= MAX ? ' max' : ''}" style="--c:${T.color}">
      <div class="n"><b class="nm-l">${T.name}</b><b class="nm-s">${T.short}</b><span>${L}/${MAX}</span></div>${pipsHTML(L, T.color)}<span class="sub">${sub}</span>${prog}</div>`;
  }).join('');
}
function renderHud() {
  $('#h-money').textContent = fmtMoney(G.money);
  $('#h-prod').textContent = G.produced.toLocaleString('de-DE') + ' 🍦';
  const av = G.run > 0 ? 100 * G.up / G.run : 100;
  const ae = $('#h-avail'); ae.textContent = av.toFixed(1) + ' %';
  ae.style.color = av > 85 ? '#81c784' : av > 65 ? '#ffd54f' : '#e57373';
  $('#h-time').textContent = fmtTime(G.time);
  $('#h-rank').textContent = G.rank;
  const adv = $('#h-adv'); adv.textContent = G.advance > 0 ? fmtMoney(G.advance) + ' offen' : '–';
  adv.style.color = G.advance > 0 ? '#ffb74d' : '';
}

// ---------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------
function update(dt) {
  if (!G) return;
  const m = G.mode;
  if (m === 'presence') { updatePresence(dt); return; }
  const live = m === 'walk' || m === 'minigame' || m === 'online';
  updateFx(dt);
  if (!live) return;

  G.time += dt;
  if (m === 'walk') movePlayer(dt); else player.moving = false;
  if (m === 'online') updateOnline(dt);
  if (m === 'minigame') updateMinigame(dt);
  if (G.coffee > 0) G.coffee -= dt;
  if (G.grantCd > 0) G.grantCd -= dt;
  if (!G.bossHint && G.time > 20 && !G.lineOk && G.money < cheapestCourse()) {
    G.bossHint = true;
    toast('💡 Die Linie steht und das Budget reicht nicht für eine Schulung? Sprich mit der <b>Werkleitung</b> oben links.', 'tip', 6);
  }

  // Störungen – solange der Instandhalter selbst repariert (Minispiel), verschleißen die
  // übrigen Maschinen nicht; der Störungs-Countdown ruht. Der Herstellerservice pausiert nichts.
  const repairing = m === 'minigame';
  if (G.repairing && !repairing) G.nextFault = Math.max(G.nextFault, CFG.postRepairGrace);
  G.repairing = repairing;
  if (!repairing) G.nextFault -= dt;
  if (!repairing && G.nextFault <= 0) {
    spawnFault();
    G.nextFault = rand(8, 13) * (1 + totalLvl() * 0.025);
  }
  for (const mc of MACHINES) {
    if (mc.fault) {
      mc.fault.t += dt;
      if (Math.random() < dt * 6) smoke(mc.x + rand(20, mc.w - 20), mc.y + 10);
      if (mc.remote > 0) {
        mc.remote -= dt;
        if (mc.remote <= 0) { repaired(mc, 'remote'); toast(`✅ ${mc.name}: Störung durch den Herstellerservice (${esc(mc.maker)}) behoben.`, 'good', 3); }
      }
    } else if (mc.restart > 0) mc.restart -= dt;
  }

  // Produktion
  const ok = MACHINES.every(mc => !mc.fault && mc.restart <= 0);
  G.lineOk = ok; G.run += dt;
  if (ok) {
    G.up += dt; G.flow += dt; G.downStreak = 0;
    MACHINES.forEach(mc => mc.anim += dt);
    G.batchT += dt;
    while (G.batchT >= CFG.batchTime) {
      G.batchT -= CFG.batchTime;
      G.produced++; G.stats.earned += CFG.batchValue;
      const repay = Math.min(G.advance, CFG.batchValue * CFG.advanceShare);
      G.advance -= repay; G.money += CFG.batchValue - repay;
      floatText(W - 50, LINE_Y + 70, '+€' + (CFG.batchValue - repay), repay ? '#ffb74d' : '#ffd54f', 13);
      if (repay && G.advance <= 0) { G.advance = 0; toast('💶 Budgetvorschuss vollständig zurückgezahlt. Die Werkleitung ist zufrieden.', 'good', 3.5); }
      if (G.produced % 10 === 0) SFX.coin();
    }
  } else {
    G.downStreak += dt; G.stats.longest = Math.max(G.stats.longest, G.downStreak);
  }

  // Grollmus-Tipps
  G.nextTip -= dt;
  if (G.nextTip <= 0) { G.nextTip = CFG.tipEvery; toast(`💡 <span class="g">GROLLMUS-TIPP</span> ${pick(TIPS)}`, 'tip', 6.5); }

  G.hudT -= dt;
  if (G.hudT <= 0) { G.hudT = 0.2; renderHud(); if (G.online) renderSkills(); }
}

// ---------------------------------------------------------------------
// Partikel
// ---------------------------------------------------------------------
function spark(x, y, color) {
  const a = rand(0, Math.PI * 2), s = rand(60, 260);
  particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: rand(.4, .9), max: .9, color, size: rand(2, 4), g: 400 });
}
function smoke(x, y) {
  particles.push({ x, y, vx: rand(-12, 12), vy: rand(-40, -25), life: rand(1, 1.8), max: 1.8, color: 'smoke', size: rand(6, 12), g: 0 });
}
function updateFx(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt; if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.color === 'smoke') p.size += dt * 10;
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i]; f.life -= dt; f.y -= 30 * dt;
    if (f.life <= 0) floats.splice(i, 1);
  }
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------
function rr(x, y, w, h, r, fill, stroke, lw = 1) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function metal(x, y, w, h, c1 = '#c9d3dd', c2 = '#7d8995') {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, c2); g.addColorStop(.35, c1); g.addColorStop(.6, '#e9eef3'); g.addColorStop(1, c2);
  return g;
}
function text(t, x, y, size = 12, color = '#fff', align = 'center', weight = '600') {
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(t, x, y);
}

function drawFloor() {
  ctx.fillStyle = '#3b424c'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#ffffff0a'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 110; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Gehweg-Markierung
  ctx.fillStyle = '#e0b62e'; ctx.fillRect(262, 350, W - 262, 4); ctx.fillRect(262, 420, W - 262, 4);
  ctx.fillStyle = '#ffffff10';
  for (let x = 300; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 378); ctx.lineTo(x + 26, 387); ctx.lineTo(x, 396); ctx.fill(); }
  text('FLUCHTWEG', 760, 387, 11, '#ffffff22', 'center', '800');
  // Wand
  const g = ctx.createLinearGradient(0, 0, 0, 120);
  g.addColorStop(0, '#2a323d'); g.addColorStop(1, '#4b5562');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 120);
  ctx.fillStyle = '#232a33'; ctx.fillRect(0, 112, W, 8);
  // Kühlhaus-Tür rechts
  rr(W - 26, LINE_Y + 40, 26, 90, 2, '#9ec9e8', '#5d8fb5', 2);
  text('❄', W - 13, LINE_Y + 60, 14, '#fff');
}

function drawOffice() {
  const x = OFFICE_X;
  rr(x, 440, OFFICE_W, 270, 6, '#2e3f52', '#4d6580', 2);
  ctx.fillStyle = '#ffffff08';
  for (let i = 0; i < 12; i++) ctx.fillRect(x, 440 + i * 22, OFFICE_W, 11);
  text('INSTANDHALTUNG', x + OFFICE_W / 2, 694, 11, '#9fb6cf', 'center', '800');
  // Regal mit Ersatzteilen
  rr(x + 210, 560, 34, 120, 3, '#5a4632');
  for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#e57373', '#64b5f6', '#ffd54f', '#81c784'][i]; ctx.fillRect(x + 215, 568 + i * 28, 24, 14); }
  // Pflanze
  ctx.fillStyle = '#795548'; ctx.fillRect(x + 12, 660, 18, 18);
  ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.arc(x + 21, 652, 13, 0, 7); ctx.fill();
}

function drawTerminal(t) {
  const o = TERMINAL;
  rr(o.x, o.y + 18, o.w, o.h - 18, 4, '#6d5236', '#4a3725');
  rr(o.x + 22, o.y - 30, 60, 42, 4, '#111', '#555', 2);
  const g = ctx.createLinearGradient(0, o.y - 26, 0, o.y + 8);
  g.addColorStop(0, '#2a7de0'); g.addColorStop(1, '#0b4a94');
  rr(o.x + 25, o.y - 27, 54, 36, 2, g);
  text('G', o.x + 52, o.y - 12, 20, '#fff', 'center', '900');
  text('AKADEMIE', o.x + 52, o.y + 3, 7, '#cfe4ff', 'center', '700');
  ctx.fillStyle = '#333'; ctx.fillRect(o.x + 48, o.y + 12, 8, 8);
  if (G.online) {
    ctx.save(); ctx.globalAlpha = .5 + .5 * Math.sin(t * 6);
    rr(o.x + 20, o.y - 32, 64, 46, 5, null, '#4fa3ff', 2); ctx.restore();
  }
}
function drawCoffee(t) {
  const o = COFFEE;
  rr(o.x, o.y - 24, o.w, o.h + 24, 4, '#263238', '#455a64', 2);
  rr(o.x + 8, o.y - 16, 30, 14, 2, '#80deea');
  rr(o.x + 15, o.y + 18, 16, 16, 2, '#fff');
  text('☕', o.x + 23, o.y + 4, 14, '#fff');
  if (G.coffee > 0) text('☁', o.x + 23, o.y - 34 - Math.sin(t * 3) * 3, 12, '#ffffff88');
}

function drawBoard() {
  const o = BOARD, x = o.x, y = o.y;
  ctx.fillStyle = '#555'; ctx.fillRect(x + 40, y + 120, 8, 50); ctx.fillRect(x + o.w - 48, y + 120, 8, 50);
  const g = ctx.createLinearGradient(x, y, x + o.w, y + 130);
  g.addColorStop(0, '#1d6fd1'); g.addColorStop(1, '#0a3a78');
  rr(x, y, o.w, 128, 8, g, '#7fb6ff', 2);
  ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x + o.w - 30, y + 100, 20 + i * 18, Math.PI, Math.PI * 1.5); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); }
  ctx.restore();
  text('OFFIZIELLER SPONSOR', x + o.w / 2, y + 22, 11, '#bfe0ff', 'center', '700');
  text('GROLLMUS', x + o.w / 2, y + 56, 38, '#ffffff', 'center', '900');
  text('Schulungen für die Automatisierung', x + o.w / 2, y + 88, 13, '#e3f0ff', 'center', '600');
  text('Akademie online & in Präsenz', x + o.w / 2, y + 108, 11, '#bfe0ff', 'center', '500');
}

function drawBoss(t) {
  rr(28, 128, 182, 208, 6, '#3b3346', '#5d4f70', 2);
  text('WERKLEITUNG', 119, 322, 11, '#c8b8de', 'center', '800');
  // Werkleitung hinter dem Schreibtisch
  const bx = 110, by = 176 + Math.sin(t * 1.5) * 1.2;
  rr(bx - 12, by - 4, 24, 26, 5, '#37474f');
  ctx.fillStyle = '#fff'; ctx.fillRect(bx - 4, by - 4, 8, 10);
  ctx.fillStyle = '#c62828'; ctx.fillRect(bx - 1.5, by - 3, 3, 12);
  ctx.fillStyle = '#d7a77e'; ctx.beginPath(); ctx.arc(bx, by - 14, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.arc(bx, by - 17, 9, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 7, by - 16, 5, 4); ctx.strokeRect(bx + 2, by - 16, 5, 4); ctx.lineWidth = 1;
  // Schreibtisch
  rr(50, 200, 120, 42, 4, '#6d4c41', '#4e342e', 2);
  rr(60, 192, 34, 10, 2, '#eceff1'); rr(130, 186, 26, 16, 2, '#263238');
  if (G.lineOk === false) {
    const y = 140 + Math.sin(t * 4) * 2;
    rr(126, y - 10, 34, 20, 6, '#fff');
    text('!?', 143, y, 13, '#c62828', 'center', '900');
  }
  if (G.advance > 0) text(`Vorschuss: ${fmtMoney(G.advance)}`, 110, 258, 10, '#ffb74d');
  else if (G.grantCd > 0) text(`Nächstes Fachgespräch in ${Math.ceil(G.grantCd)} s`, 110, 258, 10, '#b0a4c4');
}

function drawPipes() {
  for (let i = 0; i < 6; i++) {
    const a = MACHINES[i], b = MACHINES[i + 1], y = a.y + 88;
    rr(a.x + a.w - 4, y, b.x - a.x - a.w + 8, 12, 3, '#9aa6b2', '#5f6b77');
    ctx.fillStyle = '#ffffff40'; ctx.fillRect(a.x + a.w, y + 2, b.x - a.x - a.w, 2);
    if (G.lineOk) {
      ctx.fillStyle = i < 3 ? '#fff8e1' : i < 5 ? '#ffe0b2' : '#f8bbd0';
      for (let k = 0; k < 3; k++) {
        const px = a.x + a.w + ((G.flow * 40 + k * 10) % (b.x - a.x - a.w));
        ctx.beginPath(); ctx.arc(px, y + 6, 2.5, 0, 7); ctx.fill();
      }
    }
  }
  // Auslaufband zum Kühlhaus
  const L = MACHINES[6], y = L.y + 100;
  rr(L.x + L.w - 6, y, W - 26 - (L.x + L.w - 6), 16, 2, '#2d3238', '#555');
  ctx.strokeStyle = '#ffffff18';
  for (let x = L.x + L.w; x < W - 26; x += 8) { const ox = (x + (G.flow * 40) % 8); ctx.beginPath(); ctx.moveTo(ox, y + 2); ctx.lineTo(ox, y + 14); ctx.stroke(); }
  for (let k = 0; k < 3; k++) {
    const span = W - 26 - (L.x + L.w);
    const px = L.x + L.w + ((G.flow * 40 + k * span / 3) % span);
    drawCup(px, y - 2, ['#f48fb1', '#fff59d', '#a1887f'][k]);
  }
}
function drawCup(x, y, c) {
  ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.moveTo(x - 7, y - 8); ctx.lineTo(x + 7, y - 8); ctx.lineTo(x + 5, y + 2); ctx.lineTo(x - 5, y + 2); ctx.fill();
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y - 9, 6, Math.PI, 0); ctx.fill();
}

function drawMachine(m, t) {
  const { x, y, w, h } = m, a = m.anim;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 2, w / 2 + 6, 9, 0, 0, 7); ctx.fill();
  switch (m.kind) {
    case 'tank': {
      ctx.fillStyle = '#555'; ctx.fillRect(x + 24, y + h - 14, 6, 14); ctx.fillRect(x + w - 30, y + h - 14, 6, 14);
      rr(x + 14, y + 18, w - 28, h - 30, 6, metal(x + 14, 0, w - 28, 0));
      ctx.fillStyle = '#dfe6ec'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 18, (w - 28) / 2, 9, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#8895a1'; ctx.stroke();
      rr(x + w - 32, y + 32, 8, 70, 3, '#1d2630');
      const lv = 0.55 + 0.25 * Math.sin(a * 0.7);
      rr(x + w - 31, y + 32 + 70 * (1 - lv), 6, 70 * lv, 2, '#fffde7');
      rr(x + 26, y + 50, 46, 18, 2, '#1e5aa8'); text('MILCH', x + 49, y + 59, 10, '#fff', 'center', '800');
      break;
    }
    case 'mixer': {
      rr(x + w / 2 - 18, y, 36, 22, 3, '#37474f', '#263238');
      ctx.save(); ctx.translate(x + w / 2, y + 11); ctx.rotate(a * 8);
      ctx.fillStyle = '#90a4ae'; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-1.5, -8, 3, 8); } ctx.restore();
      rr(x + 10, y + 22, w - 20, h - 30, 10, metal(x + 10, 0, w - 20, 0));
      ctx.fillStyle = '#1b2530'; ctx.beginPath(); ctx.arc(x + w / 2, y + 70, 26, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff3e0'; ctx.beginPath(); ctx.arc(x + w / 2, y + 74, 22, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill();
      ctx.save(); ctx.translate(x + w / 2, y + 70); ctx.rotate(a * 5);
      ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 0); ctx.stroke(); }
      ctx.restore(); ctx.lineWidth = 1;
      ctx.strokeStyle = '#90a4ae'; ctx.beginPath(); ctx.arc(x + w / 2, y + 70, 26, 0, 7); ctx.stroke();
      break;
    }
    case 'pasteur': {
      rr(x + 6, y + 20, w - 12, h - 26, 4, '#455a64', '#263238', 2);
      for (let i = 0; i < 14; i++) {
        const px = x + 16 + i * 6;
        ctx.fillStyle = i % 2 ? '#b0bec5' : '#eceff1'; ctx.fillRect(px, y + 30, 4, 72);
      }
      ctx.fillStyle = '#e53935'; ctx.fillRect(x + 6, y + 36, 8, 8);
      ctx.fillStyle = '#1e88e5'; ctx.fillRect(x + w - 14, y + 84, 8, 8);
      ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.arc(x + w / 2, y + 16, 14, 0, 7); ctx.fill();
      ctx.strokeStyle = '#37474f'; ctx.lineWidth = 2; ctx.stroke();
      const ang = Math.PI * (0.8 + 0.5 * (m.fault ? 1 : 0.6 + 0.05 * Math.sin(a * 2)));
      ctx.strokeStyle = '#d32f2f'; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 16); ctx.lineTo(x + w / 2 + Math.cos(ang) * 10, y + 16 + Math.sin(ang) * 10); ctx.stroke();
      ctx.lineWidth = 1; text('72°C', x + w / 2, y + 112, 9, '#ffcc80', 'center', '700');
      break;
    }
    case 'homog': {
      for (let i = 0; i < 3; i++) {
        const ph = Math.sin(a * 10 + i * 2.1) * 8;
        rr(x + 24 + i * 26, y + 4 + ph, 14, 34, 2, '#cfd8dc', '#78909c');
      }
      rr(x + 8, y + 34, w - 16, h - 40, 6, '#1565c0', '#0d47a1', 2);
      rr(x + 16, y + 44, w - 32, 30, 3, '#0d2a4d');
      text(m.fault ? '--- bar' : `${Math.round(180 + 8 * Math.sin(a * 3))} bar`, x + w / 2, y + 59, 13, m.fault ? '#ef9a9a' : '#80d8ff', 'center', '700');
      ctx.fillStyle = '#90caf9'; ctx.fillRect(x + 16, y + 90, w - 32, 4);
      text('HOMOGENISATOR', x + w / 2, y + 106, 8, '#bbdefb', 'center', '700');
      break;
    }
    case 'freezer': {
      rr(x + 2, y + 40, w - 4, 62, 30, metal(x, 0, w, 0, '#d6eef8', '#7fa8c0'), '#5d8fb5', 2);
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .7;
      for (let i = 0; i < 6; i++) {
        const fx = x + 14 + ((i * 19 + a * 30) % (w - 28)), fy = y + 50 + (i * 13) % 40;
        text('❄', fx, fy, 9 + (i % 3) * 2, '#ffffff');
      }
      ctx.globalAlpha = 1;
      rr(x + w / 2 - 20, y + 10, 40, 30, 4, '#37474f', '#263238');
      ctx.save(); ctx.translate(x + w / 2, y + 25); ctx.rotate(a * 9);
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, 3); ctx.stroke(); }
      ctx.restore(); ctx.lineWidth = 1;
      ctx.fillStyle = '#546e7a'; ctx.fillRect(x + 20, y + 102, 8, 22); ctx.fillRect(x + w - 28, y + 102, 8, 22);
      text('−6°C', x + w / 2, y + 116, 9, '#b3e5fc', 'center', '700');
      break;
    }
    case 'filler': {
      ctx.fillStyle = '#607d8b'; ctx.fillRect(x + 10, y + 10, 6, h - 14); ctx.fillRect(x + w - 16, y + 10, 6, h - 14);
      rr(x + 6, y + 6, w - 12, 34, 4, metal(x, 0, w, 0), '#78909c');
      ctx.fillStyle = '#b0bec5'; ctx.beginPath(); ctx.moveTo(x + 40, y + 40); ctx.lineTo(x + w - 40, y + 40); ctx.lineTo(x + w / 2 + 5, y + 62); ctx.lineTo(x + w / 2 - 5, y + 62); ctx.fill();
      const drip = (a * 1.6) % 1;
      if (G.lineOk) { ctx.fillStyle = '#f8bbd0'; ctx.fillRect(x + w / 2 - 2, y + 62, 4, 30 * drip); }
      rr(x + 6, y + 100, w - 12, 10, 2, '#2d3238');
      for (let k = 0; k < 4; k++) drawCup(x + 14 + ((a * 25 + k * 26) % (w - 28)), y + 98, ['#f48fb1', '#fff59d', '#a1887f', '#ce93d8'][k]);
      break;
    }
    case 'tunnel': {
      rr(x, y + 26, w, h - 34, 6, '#263a52', '#1b2a3c', 2);
      rr(x + 12, y + 44, w - 24, 50, 4, '#0b1520');
      const gl = ctx.createLinearGradient(x, y + 44, x, y + 94); gl.addColorStop(0, '#4fc3f799'); gl.addColorStop(1, '#4fc3f711');
      rr(x + 12, y + 44, w - 24, 50, 4, gl);
      for (let i = 0; i < 5; i++) {
        const on = Math.floor(a * 4 + i) % 5 === 0 && G.lineOk;
        ctx.fillStyle = on ? '#80d8ff' : '#2b4a66'; ctx.fillRect(x + 16 + i * 18, y + 32, 12, 5);
      }
      text('HÄRTETUNNEL −35°C', x + w / 2, y + 106, 8, '#b3e5fc', 'center', '700');
      rr(x + w / 2 - 22, y, 44, 26, 3, '#37474f');
      ctx.fillStyle = '#90a4ae'; for (let i = 0; i < 5; i++) ctx.fillRect(x + w / 2 - 18 + i * 8, y + 4, 4, 18);
      break;
    }
    case 'scada': {
      rr(x, y + 40, w, h - 40, 4, '#4e3b2a', '#33261b', 2);
      for (let i = 0; i < 3; i++) {
        const mx = x + 10 + i * 56;
        rr(mx, y, 50, 36, 3, '#111', '#444');
        rr(mx + 3, y + 3, 44, 28, 2, m.fault ? (Math.floor(t * 4) % 2 ? '#4a0d0d' : '#1a0606') : '#0a2236');
        if (!m.fault) {
          ctx.strokeStyle = ['#66bb6a', '#4fc3f7', '#ffca28'][i]; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let k = 0; k <= 40; k += 4) { const v = Math.sin((k + a * 30) * 0.2 + i) * 7 + Math.sin((k + a * 10) * 0.5) * 3; k ? ctx.lineTo(mx + 5 + k, y + 17 + v) : ctx.moveTo(mx + 5 + k, y + 17 + v); }
          ctx.stroke(); ctx.lineWidth = 1;
        } else text('ALARM', mx + 25, y + 17, 10, '#ef5350', 'center', '800');
      }
      rr(x + w / 2 - 30, y + 54, 60, 8, 2, '#222');
      text('LEITSTAND', x + w / 2, y + 80, 10, '#d7ccc8', 'center', '800');
      break;
    }
  }

  // Störungsfärbung
  if (m.fault) {
    ctx.save(); ctx.globalAlpha = 0.12 + 0.1 * Math.sin(t * 8);
    rr(x - 4, y - 4, w + 8, h + 8, 8, '#ff1744'); ctx.restore();
  }

  // Statuslampe
  const lx = x + w - 6, ly = y + 2;
  let lc = '#43a047';
  if (m.fault) lc = m.remote > 0 ? '#ffb300' : (Math.floor(t * 4) % 2 ? '#ff1744' : '#5a0d0d');
  else if (m.restart > 0) lc = '#29b6f6';
  else if (!G.lineOk) lc = '#9e9d24';
  ctx.save(); ctx.shadowColor = lc; ctx.shadowBlur = 12;
  ctx.fillStyle = lc; ctx.beginPath(); ctx.arc(lx, ly, 6, 0, 7); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#222'; ctx.fillRect(lx - 4, ly + 6, 8, 5);

  // Beschriftung
  const ty = y + h + 16;
  ctx.font = '600 11px "Segoe UI", system-ui, sans-serif';
  const tw = ctx.measureText(m.name).width + 12;
  rr(x + w / 2 - tw / 2, ty - 8, tw, 16, 3, '#11161dcc');
  text(m.name, x + w / 2, ty, 11, '#dfe7ef');

  if (m.fault) {
    const T = TECH[m.fault.tech], by = y - 22 + Math.sin(t * 5) * 3;
    rr(x + w / 2 - 30, by - 11, 60, 22, 5, T.color, '#0008');
    text('⚠ ' + T.short, x + w / 2, by, 12, '#071018', 'center', '800');
    if (m.remote > 0) {
      const f = 1 - m.remote / m.remoteMax;
      rr(x + 4, ty + 12, w - 8, 8, 3, '#11161d');
      rr(x + 4, ty + 12, (w - 8) * f, 8, 3, '#ffb300');
      text('Herstellerservice', x + w / 2, ty + 28, 9, '#ffd54f');
    }
  } else if (m.restart > 0) {
    text('Wiederanlauf …', x + w / 2, ty + 16, 10, '#81d4fa');
  }
}

function drawPlayer(t) {
  const p = player, step = p.moving ? Math.sin(p.walk * 14) : 0, bob = p.moving ? Math.abs(step) * 2 : 0;
  const sitting = G.mode === 'online';
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 15, 14, 5, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(p.x, p.y - bob); ctx.scale(p.face, 1);
  // Beine
  ctx.fillStyle = '#1a3a6b';
  ctx.fillRect(-7, 4, 6, 10 + step * 3); ctx.fillRect(1, 4, 6, 10 - step * 3);
  ctx.fillStyle = '#222'; ctx.fillRect(-8, 12 + step * 3, 8, 4); ctx.fillRect(1, 12 - step * 3, 8, 4);
  // Körper (Latzhose + Warnweste)
  rr(-11, -14, 22, 22, 5, '#1e5aa8');
  ctx.fillStyle = '#ff9800'; ctx.fillRect(-11, -4, 22, 4);
  ctx.fillStyle = '#e0e0e0'; ctx.fillRect(-11, -3, 22, 1.5);
  // Arme + Schraubenschlüssel
  ctx.fillStyle = '#1e5aa8';
  ctx.save(); ctx.translate(9, -10); ctx.rotate(sitting ? -0.6 : 0.3 + step * 0.4);
  ctx.fillRect(0, 0, 5, 13); ctx.fillStyle = '#e0b48a'; ctx.fillRect(0, 12, 5, 4);
  ctx.fillStyle = '#b0bec5'; ctx.fillRect(1, 15, 3, 10); ctx.beginPath(); ctx.arc(2.5, 26, 4, 0, 7); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(-13, -10); ctx.rotate(-0.2 - step * 0.4); ctx.fillStyle = '#1e5aa8'; ctx.fillRect(0, 0, 5, 13); ctx.fillStyle = '#e0b48a'; ctx.fillRect(0, 12, 5, 4); ctx.restore();
  // Kopf + Helm
  ctx.fillStyle = '#e0b48a'; ctx.beginPath(); ctx.arc(0, -22, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#222'; ctx.fillRect(3, -24, 2, 3);
  ctx.fillStyle = '#ffd000'; ctx.beginPath(); ctx.arc(0, -25, 10, Math.PI, 0); ctx.fill();
  ctx.fillRect(-11, -26, 24, 3);
  ctx.fillStyle = '#1d6fd1'; ctx.fillRect(-4, -33, 8, 3);
  ctx.restore();
  if (G.coffee > 0 && p.moving && Math.random() < 0.3) particles.push({ x: p.x - p.face * 10, y: p.y + 10, vx: -p.face * 20, vy: -10, life: .4, max: .4, color: '#ffffff55', size: 3, g: 0 });
}

function drawFx() {
  for (const p of particles) {
    const a = clamp(p.life / p.max, 0, 1);
    if (p.color === 'smoke') { ctx.fillStyle = `rgba(90,90,95,${a * 0.5})`; }
    else { ctx.globalAlpha = a; ctx.fillStyle = p.color; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  }
  for (const f of floats) {
    ctx.globalAlpha = clamp(f.life, 0, 1);
    text(f.text, f.x, f.y, f.size, f.color, 'center', '800');
    ctx.globalAlpha = 1;
  }
}

function drawPrompt() {
  if (G.mode === 'online') {
    const o = G.online, f = o.p / o.dur, x = player.x, y = player.y - 62;
    rr(x - 90, y - 16, 180, 34, 6, '#0d1520ee', '#4fa3ff');
    text(`💻 ${TECH[o.tech].name}`, x, y - 5, 11, '#cfe4ff');
    rr(x - 80, y + 6, 160, 6, 3, '#223');
    rr(x - 80, y + 6, 160 * f, 6, 3, '#4fa3ff');
    return;
  }
  if (G.mode !== 'walk') return;
  const n = nearest(); if (!n) return;
  const o = n.o, label = n.label;
  // Auf kleinen Displays (Kompaktmodus) größer zeichnen, damit der Hinweis lesbar bleibt
  const k = document.body.classList.contains('compact') ? 1.6 : 1, fs = 13 * k, bh = 28 * k, kw = 20 * k;
  ctx.font = `600 ${fs}px "Segoe UI", system-ui, sans-serif`;
  const tw = ctx.measureText(label).width + kw + 24 * k;
  const x = clamp(o.x + o.w / 2, tw / 2 + 4, W - tw / 2 - 4), y = Math.max(o.y - 50 * k, 130 + bh / 2);
  rr(x - tw / 2, y - bh / 2, tw, bh, 6, '#0d1520ee', '#ffd000', 1.5);
  rr(x - tw / 2 + 6 * k, y - 9 * k, kw, 18 * k, 3, '#ffd000');
  text(touchMode ? '✋' : 'E', x - tw / 2 + 6 * k + kw / 2, y, 12 * k, '#000', 'center', '800');
  text(label, x + (kw + 4 * k) / 2, y, fs, '#fff');
}
function drawTarget(t) {
  const tg = player.target; if (!tg || G.mode !== 'walk') return;
  const r = 8 + 3 * Math.sin(t * 8);
  ctx.save(); ctx.strokeStyle = '#ffd000'; ctx.lineWidth = 2; ctx.globalAlpha = .8;
  ctx.beginPath(); ctx.ellipse(tg.x, tg.y + 14, r * 1.6, r * .7, 0, 0, 7); ctx.stroke(); ctx.restore();
}

function drawStatusBanner(t) {
  const down = MACHINES.filter(m => m.fault);
  if (!down.length) return;
  const x = 760, y = 387;
  ctx.save(); ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 6);
  rr(x - 150, y - 16, 300, 32, 6, '#4a0d0dcc', '#ef5350', 2);
  text(`LINIE STEHT – ${down.length} Störung${down.length > 1 ? 'en' : ''}`, x, y, 14, '#ffcdd2', 'center', '800');
  ctx.restore();
}

function draw(t) {
  drawFloor();
  drawOffice();
  drawPipes();
  for (const m of MACHINES) drawMachine(m, t);
  drawTerminal(t); drawCoffee(t); drawBoard(); drawBoss(t);
  drawStatusBanner(t);
  drawTarget(t);
  // Spieler hinter/vor Objekten: einfache Tiefensortierung genügt hier
  drawPlayer(t);
  drawFx();
  drawPrompt();
}

// ---------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------
function showTitle() {
  G = null;
  modal.className = 'hidden'; modal.innerHTML = '';
  screenEl.className = ''; screenEl.style.background = '';
  const best = store.get('frostwerk-best');
  screenEl.innerHTML = `<div class="title">
    <div class="pre">Ein Instandhalter-Abenteuer</div>
    <h1>FROSTWERK</h1>
    <h3>Die Eisfabrik muss laufen.</h3>
    <div class="story">
      Du bist <b>Instandhalter</b> in der Frostwerk Eisfabrik. Sieben Prozessmaschinen und ein Leitstand verwandeln Milch in Eiscreme –
      doch sobald <b>eine</b> Maschine stört, steht die ganze Linie. SPS, PROFINET, PROFIBUS, Antriebe, HMI &amp; SCADA und Industrial Security:
      jede Störung verlangt das passende Know-how.<br><br>
      Verdiene mit laufender Produktion Budget und bilde dich in der <b>Grollmus Akademie</b> weiter – <b>online</b> am Terminal oder
      in <b>Präsenz</b>. Je höher dein Skill, desto schneller die Reparatur und desto seltener die Ausfälle.
      Ziel: <b>Alle sechs Technologien auf Stufe 5</b> – dann bist du Meister-Instandhalter.
    </div>
    <div class="controls k-only">
      <div><b>Bewegen</b>Pfeiltasten / WASD oder Klick</div>
      <div><b>Interagieren</b>E oder Leertaste</div>
      <div><b>Pause · Ton</b>P · M</div>
    </div>
    <div class="controls t-only">
      <div><b>Bewegen</b>Daumen auf die Halle legen und ziehen</div>
      <div><b>Interagieren</b>Objekt antippen oder ✋</div>
      <div><b>Pause</b>❚❚ oben rechts</div>
    </div>
    <div class="startrow">
      <input id="pname" maxlength="24" enterkeyhint="go" autocomplete="off" value="${esc(playerName)}" placeholder="Dein Name" aria-label="Name des Instandhalters">
      <button class="primary" data-a="start">Schicht beginnen ▶</button>
    </div>
    ${best ? `<div class="best">Bestzeit zum Meister: ${fmtTime(+best)}</div>` : ''}
    <div class="presented">präsentiert von <span class="glogo">GROLLMUS</span></div>
  </div>`;
}

function startGame() {
  audioInit();
  if (touchMode) goFullscreen();
  const inp = $('#pname');
  if (inp) { playerName = inp.value.trim() || 'Instandhalter'; store.set('frostwerk-name', playerName); inp.blur(); }
  screenEl.className = 'hidden'; screenEl.innerHTML = '';
  newGame();
  renderHud();
  toast('Schichtbeginn! Halte die Linie am Laufen. Das <span class="g">GROLLMUS</span> Akademie-Terminal steht im Instandhaltungsbüro unten.', 'tip', 6);
}

// Auf Mobilgeräten Vollbild + Querformat anfordern (wo unterstützt; iOS-Safari ignoriert das still)
function goFullscreen() {
  const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!rq || document.fullscreenElement || document.webkitFullscreenElement) return;
  try {
    const p = rq.call(el, { navigationUI: 'hide' });
    if (p && p.then) p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
  } catch { /* ignore */ }
}

function showEnd() {
  G.mode = 'end';
  modal.className = 'hidden';
  const av = G.run > 0 ? 100 * G.up / G.run : 100;
  const stars = av >= 85 ? 3 : av >= 70 ? 2 : 1;
  const best = +(store.get('frostwerk-best') || 0);
  const isBest = !best || G.time < best;
  if (isBest) store.set('frostwerk-best', String(Math.floor(G.time)));
  const date = new Date().toLocaleDateString('de-DE');
  SFX.level();
  screenEl.className = ''; screenEl.style.background = '';
  screenEl.innerHTML = `<div class="endwrap">
    <div class="cert">
      <div class="ch"><span class="glogo">GROLLMUS</span><span style="font-size:11px;letter-spacing:2px;color:#7a5c12">AKADEMIE</span></div>
      <h1>Zertifikat</h1>
      <div style="font-size:12px;letter-spacing:2px;color:#7a5c12">MEISTER-INSTANDHALTER · FROSTWERK EISFABRIK</div>
      <div class="who">${esc(playerName)}</div>
      <p>hat alle sechs Automatisierungstechnologien bis zur Höchststufe gemeistert und die Eisproduktion souverän am Laufen gehalten:</p>
      <ul>${TK.map(t => `<li>${TECH[t].name}</li>`).join('')}</ul>
      <p style="font-size:11px;color:#666;margin-top:16px">Ausgestellt am ${date} · Spielzeit ${fmtTime(G.time)}</p>
      <div class="seal">GROLLMUS<br>★ ★ ★<br>MEISTER</div>
    </div>
    <div class="endstats">
      <h2>Schicht beendet!</h2>
      <div class="stars">${'★'.repeat(stars)}<span style="color:#3a4556">${'★'.repeat(3 - stars)}</span></div>
      <div class="sgrid">
        <span>Zeit bis zum Meister</span><span>${fmtTime(G.time)}${isBest ? ' 🏆' : ''}</span>
        <span>Verfügbarkeit der Linie</span><span>${av.toFixed(1)} %</span>
        <span>Eis produziert</span><span>${G.produced.toLocaleString('de-DE')} 🍦</span>
        <span>Umsatz erwirtschaftet</span><span>${fmtMoney(G.stats.earned)}</span>
        <span>Störungen aufgetreten</span><span>${G.stats.faults}</span>
        <span>Selbst behoben</span><span>${G.stats.self}</span>
        <span>Reparaturboni</span><span>${fmtMoney(G.stats.bonus)}</span>
        <span>Herstellerservice gerufen</span><span>${G.stats.service}</span>
        <span>Weiterbildungszuschüsse</span><span>${G.stats.grants} · ${fmtMoney(G.stats.grantMoney)}</span>
        <span>Budgetvorschüsse</span><span>${G.stats.advances}</span>
        <span>Online-Schulungen</span><span>${G.stats.online}</span>
        <span>Präsenzschulungen</span><span>${G.stats.presence}</span>
        <span>Längster Stillstand</span><span>${G.stats.longest.toFixed(0)} s</span>
      </div>
      <p class="small">${stars === 3 ? 'Weltklasse! Die Eisfabrik lief wie geschmiert.' : stars === 2 ? 'Starke Leistung – mit früheren Schulungen geht da noch mehr.' : 'Geschafft! Tipp: Früh in Schulungen investieren senkt Ausfälle deutlich.'}</p>
      <div class="btns"><button class="primary" data-a="title">Neue Schicht<kbd>Enter</kbd></button></div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------
// Hauptschleife
// ---------------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = now / 1000;
  if (G) { update(dt); draw(t); }
  else drawIdle(t);
  syncTouchUi();
  requestAnimationFrame(frame);
}
// Touch-Steuerung nur zeigen, wenn sie gebraucht wird (über data-mode + CSS)
let lastMode = '', lastReady = null;
function syncTouchUi() {
  const mode = G ? G.mode : 'title';
  if (mode !== lastMode) {
    lastMode = mode; document.body.dataset.mode = mode;
    actBtn.textContent = mode === 'online' ? '⏸' : '✋';
    if (mode !== 'walk' && mode !== 'online' && joy.id !== null) joyEnd({ pointerId: joy.id, type: 'cancel' });
  }
  const ready = mode === 'walk' && !!nearest();
  if (ready !== lastReady) { lastReady = ready; actBtn.classList.toggle('ready', ready); }
}

// Hintergrund-Animation hinter dem Titelbild
const idle = { lineOk: true, flow: 0, mode: 'idle', coffee: 0, online: null };
function drawIdle(t) {
  const saved = G; G = idle; idle.flow = t;
  MACHINES.forEach(m => { m.fault = m.fault || null; m.anim = t; });
  drawFloor(); drawOffice(); drawPipes(); MACHINES.forEach(m => drawMachine(m, t)); drawTerminal(t); drawCoffee(t); drawBoard(); drawBoss(t);
  G = saved;
}

// Debug-/Test-Hook (z. B. für automatisierte Tests) – beeinflusst das Spiel nicht
window.__frostwerk = { get state() { return G; }, MACHINES, CFG, spawnFault: () => spawnFault(), levelUp: (t, n) => levelUp(t, n, 'Test'),
  openAcademy: () => openAcademy(), openFault: m => openFault(m), startMinigame: m => startMinigame(m), update: dt => update(dt), startPresence: t => startPresence(t), openBoss: () => openBoss(), answerQuiz: k => answerQuiz(k), QUIZ };

showTitle();
requestAnimationFrame(frame);
})();
