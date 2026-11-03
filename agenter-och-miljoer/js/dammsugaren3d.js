// Bli dammsugaren: samma dammsugarvärld som i Sandlådan, men eleven är agentprogrammet
// och ser världen i 3D från robotens höjd. Med delvis observerbarhet syns bara det sensorerna når.
import * as THREE from 'three';
import { World, MAPS, DIRS, SHOT_GRACE } from './world.js';
import { AGENTS } from './agents.js';
import { headless, el } from './sim.js';
import { makeRivals, RIVALS } from './rivals.js';

const STEPS = 200;
const WALL_H = 1.4;     // en ruta är 1 × 1, väggarna är höga sett från golvet
const CAM_Y = 0.16;     // kameran sitter på robotens framkant
const TWEEN = 0.14;     // sekunder per rörelse
const VR_SCALE = 0.1;   // i VR krymps eleven till robotens storlek: 1 m i rummet blir 10 cm

const ORDER = ['N', 'E', 'S', 'W'];
const YAW = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };
const REL = ['framför', 'till höger', 'bakom', 'till vänster'];
const rel = (facing, d) => (ORDER.indexOf(d) - ORDER.indexOf(facing) + 4) % 4;
const turn = (facing, k) => ORDER[(ORDER.indexOf(facing) + k + 4) % 4];
const pct = (x) => `${Math.round(x * 100)} %`;

const SWITCHES = [
  { k: 'observable', namn: 'Observerbarhet', opts: [['partial', 'Delvis'], ['full', 'Full']], hint: 'Delvis: du ser bara det sensorerna når. Full: du ser hela lägenheten och kartan.' },
  { k: 'stochastic', namn: 'Slump', opts: [[false, 'Deterministisk'], [true, 'Stokastisk']], hint: 'Hjulen slirar ibland, sugningen misslyckas ibland.' },
  { k: 'dynamic', namn: 'Förändring', opts: [[false, 'Statisk'], [true, 'Dynamisk']], hint: 'Ny smuts dyker upp då och då.' },
  { k: 'dog', namn: 'Agenter', opts: [[false, 'En'], [true, 'Flera']], hint: 'Hunden Sixten vill leka och har ibland leriga tassar.' },
  { k: 'battery', namn: 'Batteri', opts: [[false, 'Obegränsat'], [true, 'Begränsat']], hint: '40 steg per laddning. Stå på den gröna laddplattan och vänta för att ladda.' },
  { k: 'rivals', namn: 'Motståndare', opts: [[0, 'Inga'], [1, '1'], [2, '2'], [3, '3']], hint: 'Tävling: AI-dammsugare (agenterna från Sandlådan) suger smuts åt sig själva. Den som suger upp mest vinner.' },
  { k: 'shoot', namn: 'Skjutläge', opts: [[false, 'Av'], [true, 'På']], hint: `Skjut dammbollar rakt fram med F. Den som träffas åker ut – och motståndarna skjuter också! Fred de första ${SHOT_GRACE} stegen.` },
];

const cfg = { map: 'lagenhet', observable: 'partial', stochastic: false, dynamic: false, dog: false, battery: false, rivals: 0, shoot: false };
let seed = 1 + Math.floor(Math.random() * 1e6);

// ---------- 3D ----------
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');   // origo där huvudet är när VR startar, så det funkar sittande och stående
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, 1, 0.02, 60);
const headlamp = new THREE.PointLight(0xfff1dd, 0, 3.2, 1.6);
camera.add(headlamp);
// Riggen är roboten: den flyttas och vrids i rummet. Kameran (och i VR huvudet) sitter i den.
const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);
const inVR = () => renderer.xr.isPresenting;
const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8070, 1.6);
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(3, 8, 2);
scene.add(hemi, sun);

function resize() {
  if (inVR()) return;
  const r = canvas.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / Math.max(1, r.height);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);

function hash(i, k) {
  let h = (i * 374761393 + k * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#c9a77c';
  g.fillRect(0, 0, 128, 128);
  for (let k = 0; k < 4; k++) {           // fyra parkettbrädor per ruta
    g.fillStyle = ['#c49f72', '#cfae85', '#c7a376', '#d2b28a'][k];
    g.fillRect(0, k * 32 + 1, 128, 30);
    g.strokeStyle = 'rgba(90,60,30,.12)';
    for (let s = 0; s < 6; s++) { g.beginPath(); g.moveTo(0, k * 32 + 6 + s * 4); g.lineTo(128, k * 32 + 4 + s * 4.3); g.stroke(); }
  }
  g.strokeStyle = 'rgba(70,45,20,.45)';
  g.lineWidth = 2;
  g.strokeRect(1, 1, 126, 126);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const FLOOR_TEX = floorTexture();
const MAT = {
  wall: new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: .9 }),
  skirt: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: .6 }),
  ceil: new THREE.MeshBasicMaterial({ color: 0xc9c3b8 }),
  dirt: new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 1 }),
  crumb: new THREE.MeshStandardMaterial({ color: 0x3d2812, roughness: 1 }),
  charger: new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x0b5a28, roughness: .5 }),
  bolt: new THREE.MeshStandardMaterial({ color: 0xfff3b0, emissive: 0xffd84a, emissiveIntensity: .8 }),
  dog: new THREE.MeshStandardMaterial({ color: 0xb07a45, roughness: .8 }),
  dogDark: new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: .8 }),
  eye: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .2 }),
  botBody: new THREE.MeshStandardMaterial({ color: 0x2b2b33, roughness: .5, metalness: .2 }),
  sensor: new THREE.MeshStandardMaterial({ color: 0xf4f4f4, emissive: 0x666666, roughness: .3 }),
  ball: new THREE.MeshStandardMaterial({ color: 0x8a7a66, roughness: 1, emissive: 0x2a2018 }),
};
const SHOT_SPEED = 14;   // rutor per sekund för dammbollen

let level = null;   // allt som hör till en omgång: värld, 3D-objekt, minne
let world = null;
let brains = [];    // motståndarnas agenter (tävlingsläget)
const rivalActions = () => brains.map(b => b.act());

function buildLevel() {
  if (level) scene.remove(level.root);
  world = new World({ ...cfg, seed });
  const root = new THREE.Group();
  const { w, h } = world;

  const floorTex = FLOOR_TEX.clone();
  floorTex.repeat.set(w, h);
  floorTex.needsUpdate = true;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .75 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((w - 1) / 2, 0, (h - 1) / 2);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, h), MAT.ceil);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set((w - 1) / 2, WALL_H, (h - 1) / 2);
  root.add(floor, ceil);

  const wallCells = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (world.isWall(x, y)) wallCells.push([x, y]);
  const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, WALL_H, 1), MAT.wall, wallCells.length);
  const skirts = new THREE.InstancedMesh(new THREE.BoxGeometry(1.04, .07, 1.04), MAT.skirt, wallCells.length);
  const m = new THREE.Matrix4();
  wallCells.forEach(([x, y], k) => {
    walls.setMatrixAt(k, m.makeTranslation(x, WALL_H / 2, y));
    skirts.setMatrixAt(k, m.makeTranslation(x, .035, y));
  });
  root.add(walls, skirts);

  // Smuts: några platta fläckar och smulor per ruta, fasta för varje ruta.
  const dirtMeshes = new Map();
  const blob = new THREE.CircleGeometry(1, 14);
  const crumb = new THREE.DodecahedronGeometry(1, 0);
  for (const i of world.floor) {
    const { x, y } = world.xy(i);
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const s = new THREE.Mesh(blob, MAT.dirt);
      s.rotation.x = -Math.PI / 2;
      const r = .12 + hash(i, k) * .16;
      s.scale.set(r, r * (.6 + hash(i, k + 9) * .5), 1);
      s.position.set((hash(i, k + 3) - .5) * .55, .004 + k * .001, (hash(i, k + 6) - .5) * .55);
      g.add(s);
    }
    for (let k = 0; k < 7; k++) {
      const c = new THREE.Mesh(crumb, MAT.crumb);
      c.scale.setScalar(.006 + hash(i, k + 20) * .009);
      c.position.set((hash(i, k + 30) - .5) * .7, .012, (hash(i, k + 40) - .5) * .7);
      g.add(c);
    }
    g.position.set(x, 0, y);
    g.visible = world.isDirty(x, y);
    g.userData.target = g.visible ? 1 : 0;
    root.add(g);
    dirtMeshes.set(i, g);
  }

  const ch = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(.38, .42, .03, 32), MAT.charger);
  pad.position.y = .015;
  const bolt = new THREE.Mesh(new THREE.ExtrudeGeometry(boltShape(), { depth: .01, bevelEnabled: false }), MAT.bolt);
  bolt.rotation.x = -Math.PI / 2;
  bolt.position.y = .032;
  ch.add(pad, bolt);
  ch.position.set(world.charger.x, 0, world.charger.y);
  root.add(ch);

  let dog = null;
  if (world.dog) {
    dog = makeDog();
    dog.position.set(world.dog.x, 0, world.dog.y);
    dog.userData.to = dog.position.clone();
    root.add(dog);
  }

  // Motståndarna: en 3D-dammsugare och en "hjärna" (agent) var.
  brains = makeRivals(world, seed);
  const rivals = world.rivals.map((r, k) => {
    const m = makeVacuum(RIVALS[k].color);
    m.position.set(r.x, 0, r.y);
    m.rotation.y = YAW[r.heading];
    m.userData.to = m.position.clone();
    m.userData.yawTo = m.rotation.y;
    root.add(m);
    return m;
  });

  scene.add(root);
  busy = false;
  queued.length = 0;
  const facing = 'E';
  level = {
    root, dirtMeshes, dog, rivals, shots: [], dying: [], facing,
    yaw: YAW[facing], yawTo: YAW[facing],
    pos: new THREE.Vector3(world.bot.x, CAM_Y, world.bot.y), from: null, to: null, t0: 0,
    shake: 0,
    known: new Int8Array(w * h).fill(-1), // -1 okänt, 0 rent, 1 smutsigt (senast sett), 2 vägg, 3 öppet men inte besökt
    over: false,
  };
  remember();
  applyLook();
  updateHud();
}

// En robotdammsugare sedd utifrån: rund kropp, färgad topp och en vit sensor fram (−z är framåt).
function makeVacuum(color) {
  const g = new THREE.Group();
  const top = new THREE.MeshStandardMaterial({ color, roughness: .45 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .09, 32), MAT.botBody);
  body.position.y = .055;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(.28, .3, .02, 32), top);
  lid.position.y = .11;
  const bumper = new THREE.Mesh(new THREE.CylinderGeometry(.365, .365, .05, 32, 1, true, Math.PI * .65, Math.PI * .7), top);
  bumper.position.y = .05;
  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .03, 16), MAT.sensor);
  sensor.position.set(0, .13, -.17);
  g.add(body, lid, bumper, sensor);
  return g;
}

function boltShape() {
  const s = new THREE.Shape();
  const p = [[.04, .2], [-.1, -.02], [-.01, -.02], [-.05, -.2], [.1, .04], [.01, .04]];
  s.moveTo(...p[0]);
  for (const q of p.slice(1)) s.lineTo(...q);
  return s;
}

function makeDog() {
  const g = new THREE.Group();
  const box = (sx, sy, sz, mat, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); b.position.set(x, y, z); g.add(b); return b; };
  box(.26, .24, .56, MAT.dog, 0, .38, 0);
  for (const [x, z] of [[-.09, -.2], [.09, -.2], [-.09, .2], [.09, .2]]) box(.07, .26, .07, MAT.dog, x, .13, z);
  box(.2, .2, .22, MAT.dog, 0, .56, -.34);
  box(.12, .09, .12, MAT.dogDark, 0, .5, -.48);
  box(.05, .14, .05, MAT.dogDark, -.08, .68, -.3);
  box(.05, .14, .05, MAT.dogDark, .08, .68, -.3);
  box(.03, .03, .01, MAT.eye, -.05, .6, -.455);
  box(.03, .03, .01, MAT.eye, .05, .6, -.455);
  const tail = box(.04, .04, .2, MAT.dogDark, 0, .48, .34);
  tail.rotation.x = -.6;
  g.userData.tail = tail;
  return g;
}

// Utseendet beror på observerbarheten: full = upplyst rum, delvis = mörker och bara strålkastaren.
function applyLook() {
  const partial = cfg.observable === 'partial';
  scene.background = new THREE.Color(partial ? 0x05040c : 0xdcd6ca);
  scene.fog = partial ? new THREE.Fog(0x05040c, .25, 1.55) : new THREE.Fog(0xdcd6ca, 8, 22);
  hemi.intensity = partial ? .05 : 1.6;
  sun.intensity = partial ? 0 : 1.2;
  headlamp.intensity = partial ? 2.2 : 0;
  mapOn = !partial;
}

// ---------- spelet ----------
let busy = false;
const queued = [];   // knapptryckningar under en rörelse sparas och körs i tur och ordning

function act(a) {
  if (!level || level.over) return;
  if (busy) { if (queued.length < 3) queued.push(a); return; }
  audio.resume();
  if (a === 'L' || a === 'R') {
    level.facing = turn(level.facing, a === 'R' ? 1 : -1);
    level.yawTo += a === 'R' ? -Math.PI / 2 : Math.PI / 2;
    updateHud();
    if (queued.length) act(queued.shift());
    return;
  }
  if (a === 'SKJUT') {
    if (!cfg.shoot) return;
    if (world.t < SHOT_GRACE) { say(`Fred – du kan skjuta om ${SHOT_GRACE - world.t} steg.`); return; }
    if (world.bot.cool > 0) { say(`Laddar om … ${world.bot.cool} steg kvar.`); return; }
    world.bot.heading = level.facing;   // skjut dit du tittar
  }
  const action = a === 'F' ? level.facing : a === 'B' ? turn(level.facing, 2) : a;
  const dirtyBefore = world.isDirty(world.bot.x, world.bot.y);
  const ev = world.step(action, rivalActions());

  if (ev.shot) { fireShot(ev.shot, null); audio.pew(); }
  world.rivals.forEach((r, k) => { if (r.last && r.last.shot) fireShot(r.last.shot, k); });

  if (ev.dead) say('Batteriet är slut.');
  else if (ev.blocked) {
    const r = rel(level.facing, ev.actual);
    const what = world.dog && !world.isWall(world.bot.x + DIRS[ev.actual][0], world.bot.y + DIRS[ev.actual][1]) ? 'Hunden står i vägen' : 'Stöt';
    say(`${what} ${REL[r]}!`);
    bump(r);
    audio.thud();
  } else if (ev.slipped) say(`Hjulen slirade – du hamnade ${REL[rel(level.facing, ev.actual)]}.`);
  if (action === 'SUG') {
    level.shake = .35;
    if (ev.failed) { say('Sugningen misslyckades. Försök igen.'); audio.suck(false); }
    else if (dirtyBefore) { say('Slurp! Rent här.'); audio.suck(true); buzz(.35, 220); }
    else { say('Här var det redan rent.'); audio.suck(false); }
  }
  if (action === 'VANTA') {
    const onCh = world.bot.x === world.charger.x && world.bot.y === world.charger.y;
    say(cfg.battery && onCh ? 'Laddar …' : 'Du väntar ett steg.');
  }

  level.from = level.pos.clone();
  level.to = new THREE.Vector3(world.bot.x, CAM_Y, world.bot.y);
  level.t0 = performance.now();
  busy = !level.from.equals(level.to);
  if (level.dog && world.dog) {
    const to = new THREE.Vector3(world.dog.x, 0, world.dog.y);
    if (!to.equals(level.dog.userData.to)) level.dog.lookAt(level.dog.position.clone().multiplyScalar(2).sub(to));
    level.dog.userData.to = to;
  }
  syncRivals();
  syncDirt();
  remember();
  updateHud();
  if (world.bot.out) {
    level.over = true;   // spela inte fler drag – slutrutan visas när dammbollen träffat
    queued.length = 0;
    setTimeout(finish, 1100);
  } else if (world.bot.dead || world.t >= STEPS) finish();
  else if (!busy && queued.length) act(queued.shift());
}

// Motståndarnas mål i 3D (de glider dit i frame()).
function syncRivals() {
  world.rivals.forEach((r, k) => {
    const m = level.rivals[k];
    if (!m || m.userData.gone) return;
    m.userData.to = new THREE.Vector3(r.x, 0, r.y);
    let yaw = YAW[r.heading];
    while (yaw - m.userData.yawTo > Math.PI) yaw -= 2 * Math.PI;   // vrid kortaste vägen
    while (m.userData.yawTo - yaw > Math.PI) yaw += 2 * Math.PI;
    m.userData.yawTo = yaw;
  });
}

// En dammboll flyger från skytten till där den stannar. Träffen visas när bollen kommer fram.
function fireShot(shot, shooter) {
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 10), MAT.ball);
  const from = new THREE.Vector3(shot.from.x, .14, shot.from.y);
  const d = DIRS[shot.dir];
  from.x += d[0] * .3; from.z += d[1] * .3;
  // Missar bollen flyger den ända fram till väggen (eller räckvidden) i stället för rutans mitt.
  const reach = shot.hit ? 0 : .4;
  const to = new THREE.Vector3(shot.to.x + d[0] * reach, .14, shot.to.y + d[1] * reach);
  ball.position.copy(from);
  level.root.add(ball);
  const dur = Math.max(.12, from.distanceTo(to) / SHOT_SPEED);
  level.shots.push({ ball, from, to, t0: performance.now(), dur, shot, shooter });
  if (shooter !== null && shot.hit?.kind === 'player') say(`${RIVALS[shooter].namn} sköt dig!`);
}

// Dammbollen har kommit fram: göm det som blev träffat.
function landShot(s) {
  const hit = s.shot.hit;
  const by = s.shooter === null ? 'Du' : RIVALS[s.shooter].namn;
  if (!hit) return;
  audio.hit();
  if (hit.kind === 'dog' && level.dog) {
    level.dying.push({ obj: level.dog, t0: performance.now() });
    level.dog = null;
    say(s.shooter === null ? 'Träff! Hunden Sixten sprang iväg.' : `${by} träffade hunden – den sprang iväg.`);
  } else if (hit.kind === 'rival') {
    const m = level.rivals[hit.id];
    if (m && !m.userData.gone) { m.userData.gone = true; level.dying.push({ obj: m, t0: performance.now() }); }
    const namn = RIVALS[hit.id].namn;
    say(s.shooter === null ? `Träff! ${namn} är ute.` : `${by} träffade ${namn} – ${namn} är ute.`);
  } else if (hit.kind === 'player') {
    say(`Träffad av ${by}! Du är ute.`);
    bump(0);
    document.getElementById('hit').classList.add('on');
    setTimeout(() => document.getElementById('hit').classList.remove('on'), 50);
  }
  updateHud();
}

function syncDirt() {
  for (const [i, g] of level.dirtMeshes) {
    const on = world.dirt[i] === 1;
    g.userData.target = on ? 1 : 0;
    if (on && !g.visible) { g.visible = true; g.scale.setScalar(.01); }
  }
}

// Det en modellbaserad agent skulle minnas: rutor den varit på och väggar den känt.
function remember() {
  const p = world.percept();
  level.known[world.idx(p.x, p.y)] = p.dirty ? 1 : 0;
  for (const d of ORDER) {
    const nx = p.x + DIRS[d][0], ny = p.y + DIRS[d][1];
    if (nx < 0 || ny < 0 || nx >= world.w || ny >= world.h) continue;
    const k = world.idx(nx, ny);
    if (p.bumps[d] && world.isWall(nx, ny)) level.known[k] = 2;
    else if (level.known[k] === -1) level.known[k] = 3;
  }
}

function finish() {
  if (level.result) return;
  level.over = true;
  queued.length = 0;
  const contest = world.rivals.length > 0;
  // Är du ute (batteriet slut eller träffad) spelas resten av stegen upp utan dig, precis som för agenterna.
  // I tävlingen kör motståndarna vidare – annars slutar omgången när du avbryter.
  while (world.t < STEPS && (world.bot.dead || world.bot.out)) world.step('VANTA', rivalActions());
  const steps = world.t;
  const mine = world.performance();
  let rows, title, text;
  if (contest) {
    // Prestandamåttet i tävlingen är din egen poäng: hur många smutsiga rutor du sög upp.
    rows = [{ namn: 'Du', val: world.bot.sucked, you: true, out: world.bot.out },
      ...world.rivals.map((r, k) => ({ namn: `${RIVALS[k].namn} (${RIVALS[k].typ})`, val: r.sucked, out: r.out, color: RIVALS[k].color }))];
    const max = Math.max(1, ...rows.map(r => r.val));
    rows.forEach(r => { r.perf = r.val / max; r.label = `${r.val}${r.out ? ' ✗' : ''}`; });
    rows.sort((a, b) => b.val - a.val || (a.out - b.out));
    title = world.bot.out ? 'Du blev träffad' : world.bot.dead ? 'Batteriet tog slut' : `Tävlingen är slut efter ${steps} steg`;
  } else {
    rows = Object.entries(AGENTS).map(([k, a]) => ({ namn: a.namn, perf: headless(k, cfg, seed, steps).perf }));
    rows.push({ namn: 'Du', perf: mine, you: true });
    rows.sort((a, b) => b.perf - a.perf);
    title = world.bot.dead && steps === STEPS ? 'Batteriet tog slut' : `Klart efter ${steps} steg`;
  }
  const place = rows.findIndex(r => r.you) + 1;
  if (contest) {
    const outs = rows.filter(r => r.out).length;
    text = `Du sög upp <b>${world.bot.sucked}</b> smutsiga rutor och kom på plats <b>${place} av ${rows.length}</b>.` +
      (cfg.shoot ? ` ${outs ? `${outs} av ${rows.length} dammsugare blev träffade (✗) och åkte ut.` : 'Ingen blev träffad.'}` : '') +
      ` Lägenheten var i snitt ${pct(mine)} ren.`;
  } else text = `Lägenheten var i snitt <b>${pct(mine)}</b> ren. Du kom på plats <b>${place} av ${rows.length}</b> mot agenterna i exakt samma rum och miljö.`;
  document.getElementById('end-title').textContent = title;
  document.getElementById('end-text').innerHTML = text;
  const box = document.getElementById('end-result');
  box.replaceChildren(...rows.map(r => el('div', { class: `r${r.you ? ' you' : ''}` },
    el('span', {}, r.color ? el('i', { class: 'dot', style: `background:${r.color}` }) : null, r.namn),
    el('div', { class: 'track' }, el('div', { class: 'fill', style: `width:${Math.round(r.perf * 100)}%${r.color ? `;background:${r.color}` : ''}` })),
    el('span', { class: 'v' }, r.label ?? pct(r.perf)))));
  document.getElementById('end-note').textContent = reflection();
  level.result = { rows, place, mine, steps, title };
  drawPanel();
  const lv = level;   // startar man om (t.ex. med VR-knapparna) innan rutan visas ska den inte dyka upp
  setTimeout(() => { if (level !== lv) return; document.getElementById('end').hidden = false; document.getElementById('again').focus(); }, 500);
}

function reflection() {
  if (cfg.rivals > 0 && cfg.shoot) return 'Fundera: Nu var miljön tävlande – de andra agenterna försökte aktivt slå ut dig. Vad behövde du veta om dem för att överleva? Varför räcker det inte med en enkel reflexregel som "skjut om någon står i linjen"?';
  if (cfg.rivals > 0) return 'Fundera: Nu var miljön en tävlande multiagentmiljö, och prestandamåttet var din egen poäng – inte hur ren lägenheten blev. Hur ändrade det hur du spelade? Vilken agent var svårast att slå, och varför?';
  if (cfg.observable === 'partial') return 'Fundera: Vad hade du i huvudet som robotens sensorer inte gav dig? Det minnet är skillnaden mellan en enkel reflexagent och en modellbaserad agent.';
  if (cfg.dynamic || cfg.dog) return 'Fundera: Hur planerade du när smuts dök upp medan du var på väg någon annanstans? Vilken agent gör likadant?';
  return 'Fundera: Du såg hela lägenheten. Vilken agent tänkte mest som du? Prova sedan med delvis observerbarhet.';
}

// ---------- HUD ----------
const perceptBox = document.getElementById('percept');
const statsBox = document.getElementById('stats');
const msg = document.getElementById('msg');
let msgTimer = null;
function say(t) {
  msg.textContent = t;
  msg.classList.add('show');
  vrMsg = t;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => { msg.classList.remove('show'); vrMsg = ''; drawPanel(); }, 1600);
}

const bumpEl = document.getElementById('bump');
const bumperEl = document.getElementById('bumper');
function bump(r) {
  const side = ['0 40px 60px -20px', '-40px 0 60px -20px', '0 -40px 60px -20px', '40px 0 60px -20px'][r];
  bumpEl.style.boxShadow = `inset ${side} rgba(242,117,107,.9)`;
  bumpEl.classList.add('on');
  if (r === 0) bumperEl.classList.add('hit');
  requestAnimationFrame(() => requestAnimationFrame(() => bumpEl.classList.remove('on')));
  setTimeout(() => bumperEl.classList.remove('hit'), 250);
  vrBump = r;
  buzz(1, 120);
  setTimeout(() => { vrBump = -1; drawPanel(); }, 300);
}

function updateHud() {
  const p = world.percept();
  const f = level.facing;
  const cell = (r) => { const d = turn(f, r); return `<span class="${p.bumps[d] ? 'wall' : ''}">${p.bumps[d] ? '▮' : ''}</span>`; };
  const bat = p.battery === null ? '' : `<div class="row"><span>Batteri</span><span class="lamp${p.battery <= 8 ? ' low' : ''}">${p.battery}/${p.capacity}</span></div>`;
  perceptBox.innerHTML = `<h2>Percept just nu</h2>
    <div class="row"><span>Smutsigt här?</span><span class="lamp${p.dirty ? ' on' : ''}">${p.dirty ? 'Ja' : 'Nej'}</span></div>
    <div class="row"><span>Position</span><b>(${p.x}, ${p.y})</b></div>
    ${bat}
    <div class="row" style="margin-top:6px"><span>Stötsensorer<br><small class="muted">pilen = din riktning</small></span>
      <div class="bumps"><span class="x"></span>${cell(0)}<span class="x"></span>${cell(3)}<span class="me">▲</span>${cell(1)}<span class="x"></span>${cell(2)}<span class="x"></span></div></div>
    <div class="row" style="margin-top:6px"><span>Hela kartan?</span><b>${p.full ? 'Ja' : 'Nej'}</b></div>`;
  if (world.rivals.length) {
    const line = (namn, color, v) => `<div class="row score${v.out ? ' out' : ''}"><span><i class="dot" style="background:${color}"></i>${namn}</span><b>${v.sucked}${v.out ? ' ✗' : ''}</b></div>`;
    statsBox.innerHTML = `<h2>Tävling · steg ${world.t}/${STEPS}</h2>` +
      line('Du', '#f5a23a', world.bot) + world.rivals.map((r, k) => line(RIVALS[k].namn, RIVALS[k].color, r)).join('') +
      (cfg.shoot ? `<div class="row" style="margin-top:6px"><span>Dammboll</span><span class="lamp${shotReady() ? ' on' : ''}">${shotState()}</span></div>` : '');
  } else {
    statsBox.innerHTML = `<h2>Prestanda</h2>Steg <b>${world.t}/${STEPS}</b><br>Renhet nu <b>${pct(world.cleanliness())}</b><br><span title="Genomsnittlig renhet över alla steg hittills">Snitt <b>${pct(world.performance())}</b></span>` +
      (cfg.shoot ? `<br>Dammboll <span class="lamp${shotReady() ? ' on' : ''}">${shotState()}</span>` : '');
  }
  document.getElementById('dirtglow').classList.toggle('on', p.dirty);
  drawMap();
  drawPanel();
}

const shotReady = () => world.t >= SHOT_GRACE && world.bot.cool === 0 && !world.bot.out;
const shotState = () => world.bot.out ? 'ute' : world.t < SHOT_GRACE ? `fred ${SHOT_GRACE - world.t}` : world.bot.cool ? `laddar ${world.bot.cool}` : 'redo (F)';

// Kartan: full observerbarhet = sanningen, delvis = ditt minne (som en modellbaserad agent).
const mapCanvas = document.getElementById('map');
const mapBox = document.getElementById('mapbox');
let mapOn = false;
function drawMap() {
  mapBox.hidden = !mapOn;
  if (!mapOn) return;
  const full = cfg.observable === 'full';
  document.getElementById('maptitle').textContent = full ? 'Kartan (hela sanningen)' : 'Ditt minne (M döljer)';
  const cs = Math.max(8, Math.min(16, Math.floor(200 / world.w)));
  mapCanvas.width = world.w * cs;
  mapCanvas.height = world.h * cs;
  paintMap(mapCanvas.getContext('2d'), cs);
}

function paintMap(g, cs) {
  const full = cfg.observable === 'full';
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    const i = world.idx(x, y);
    let c;
    if (full) c = world.isWall(x, y) ? '#4f5a6b' : world.isDirty(x, y) ? '#c08a55' : '#e8e2d6';
    else c = ['#141127', '#e8e2d6', '#c08a55', '#4f5a6b', '#5c5480'][level.known[i] + 1];
    g.fillStyle = c;
    g.fillRect(x * cs, y * cs, cs, cs);
  }
  g.fillStyle = '#16a34a';
  if (full || level.known[world.idx(world.charger.x, world.charger.y)] >= 0) g.fillRect(world.charger.x * cs + 2, world.charger.y * cs + 2, cs - 4, cs - 4);
  if (full && world.dog) { g.fillStyle = '#7a4a20'; g.beginPath(); g.arc((world.dog.x + .5) * cs, (world.dog.y + .5) * cs, cs * .35, 0, 7); g.fill(); }
  if (full) world.rivals.forEach((r, k) => {
    if (r.out) return;
    g.fillStyle = RIVALS[k].color;
    g.beginPath(); g.arc((r.x + .5) * cs, (r.y + .5) * cs, cs * .36, 0, 7); g.fill();
  });
  const bx = (world.bot.x + .5) * cs, by = (world.bot.y + .5) * cs, d = DIRS[level.facing];
  g.fillStyle = '#f5a23a';
  g.beginPath(); g.arc(bx, by, cs * .38, 0, 7); g.fill();
  g.strokeStyle = '#2a1800'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + d[0] * cs * .4, by + d[1] * cs * .4); g.stroke();
}

// ---------- ljud ----------
const audio = {
  ctx: null, on: true,
  resume() { if (!this.ctx) try { this.ctx = new AudioContext(); } catch { this.on = false; } this.ctx?.resume(); },
  tone(f, dur, type = 'sine', vol = .15, slide = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), v = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(v).connect(this.ctx.destination); o.start(t); o.stop(t + dur);
  },
  noise(dur, freq, vol) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, n = this.ctx.sampleRate * dur, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let k = 0; k < n; k++) d[k] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), v = this.ctx.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
    v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f).connect(v).connect(this.ctx.destination); s.start(t);
  },
  thud() { this.tone(90, .18, 'triangle', .35, .5); },
  suck(ok) { this.noise(.35, ok ? 1800 : 900, ok ? .25 : .12); if (ok) setTimeout(() => this.tone(880, .12, 'sine', .08, 1.5), 260); },
  pew() { this.noise(.12, 2400, .18); this.tone(520, .16, 'square', .06, .4); },
  hit() { this.noise(.3, 500, .3); this.tone(180, .3, 'sawtooth', .08, .3); },
};
const muteBtn = document.getElementById('mute');
muteBtn.addEventListener('click', () => {
  audio.on = !audio.on;
  muteBtn.textContent = audio.on ? 'Ljud på' : 'Ljud av';
  muteBtn.setAttribute('aria-pressed', String(!audio.on));
});

// ---------- animation ----------
const clock = new THREE.Clock();
function frame(now) {
  const dt = Math.min(clock.getDelta(), .1);
  const vr = inVR();
  if (vr) pollPads(now);
  if (level) {
    if (level.to) {
      const k = Math.min(1, (now - level.t0) / (TWEEN * 1000));
      const e = k * k * (3 - 2 * k);
      level.pos.lerpVectors(level.from, level.to, e);
      if (k >= 1) {
        level.to = null; busy = false;
        if (queued.length) act(queued.shift());
      }
    }
    // I VR vrids man direkt (mjuk vridning ger lätt åksjuka), annars glider vyn runt.
    level.yaw += (level.yawTo - level.yaw) * Math.min(1, dt * 16);
    if (vr || Math.abs(level.yawTo - level.yaw) < .002) level.yaw = level.yawTo;
    level.shake = Math.max(0, level.shake - dt);
    rig.position.set(level.pos.x, CAM_Y, level.pos.z);
    rig.rotation.y = level.yaw;
    rig.scale.setScalar(vr ? VR_SCALE : 1);
    if (!vr) {
      const sh = level.shake * .012;
      camera.position.set((Math.random() - .5) * sh, (Math.random() - .5) * sh, 0);
      camera.rotation.set(-.04, 0, 0, 'YXZ');
    }
    for (const g of level.dirtMeshes.values()) {
      if (!g.visible) continue;
      const s = g.scale.x + (g.userData.target - g.scale.x) * Math.min(1, dt * 10);
      g.scale.setScalar(s);
      if (g.userData.target === 0 && s < .03) g.visible = false;
    }
    if (level.dog) {
      level.dog.position.lerp(level.dog.userData.to, Math.min(1, dt * 9));
      level.dog.userData.tail.rotation.y = Math.sin(now / 90) * .6;
    }
    for (const m of level.rivals) {
      if (m.userData.gone) continue;
      m.position.lerp(m.userData.to, Math.min(1, dt * 9));
      m.rotation.y += (m.userData.yawTo - m.rotation.y) * Math.min(1, dt * 12);
    }
    // Dammbollar i luften. Träffen räknas när bollen kommer fram.
    level.shots = level.shots.filter((s) => {
      const k = Math.min(1, (now - s.t0) / (s.dur * 1000));
      s.ball.position.lerpVectors(s.from, s.to, k);
      s.ball.rotation.x += dt * 20;
      if (k < 1) return true;
      level.root.remove(s.ball);
      landShot(s);
      return false;
    });
    // Den som träffats snurrar, krymper och försvinner.
    level.dying = level.dying.filter((d) => {
      const k = Math.min(1, (now - d.t0) / 700);
      d.obj.rotation.y += dt * 14;
      d.obj.scale.setScalar(1 - k);
      d.obj.position.y = Math.sin(k * Math.PI) * .25;
      if (k < 1) return true;
      level.root.remove(d.obj);
      return false;
    });
  }
  renderer.render(scene, camera);
}

// ---------- VR ----------
// Sidans paneler syns inte i ett headset, så i VR ritas percept, prestanda och karta på en
// skylt som sitter fast i roboten, en bit framför och nedanför blicken.
const panelCanvas = document.createElement('canvas');
panelCanvas.width = 1024;
panelCanvas.height = 600;
const panelTex = new THREE.CanvasTexture(panelCanvas);
panelTex.colorSpace = THREE.SRGBColorSpace;
const panel = new THREE.Mesh(new THREE.PlaneGeometry(.64, .375),
  new THREE.MeshBasicMaterial({ map: panelTex, transparent: true, fog: false, depthTest: false }));
panel.renderOrder = 10;
panel.position.set(0, -.3, -.75);
panel.rotation.x = -.45;
panel.visible = false;
rig.add(panel);
let vrMsg = '';
let vrBump = -1;

function drawPanel() {
  if (!inVR() || !level) return;
  const g = panelCanvas.getContext('2d'), W = panelCanvas.width, H = panelCanvas.height;
  g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(12,10,30,.88)';
  g.strokeStyle = vrBump >= 0 ? '#f2756b' : '#3a3466';
  g.lineWidth = vrBump >= 0 ? 14 : 4;
  g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 28); g.fill(); g.stroke();
  g.textBaseline = 'middle';
  const text = (s, x, y, size = 30, color = '#ebe8ff', weight = 400, align = 'left') => {
    g.font = `${weight} ${size}px system-ui, sans-serif`; g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y);
  };

  if (level.result) {
    const { rows, place, mine, title } = level.result;
    text(`${title} – plats ${place} av ${rows.length}`, 40, 56, 40, '#fff', 700);
    text(world.rivals.length ? `Du sög upp ${world.bot.sucked} smutsiga rutor.` : `Lägenheten var i snitt ${pct(mine)} ren.`, 40, 106, 30, '#cdc7f0');
    rows.forEach((r, k) => {
      const y = 170 + k * 52;
      text(r.namn, 40, y, 28, r.you ? '#f5a23a' : '#ebe8ff', r.you ? 700 : 400);
      g.fillStyle = '#2a2457'; g.fillRect(420, y - 12, 440, 24);
      g.fillStyle = r.you ? '#f5a23a' : r.color || '#98a2b0'; g.fillRect(420, y - 12, 440 * r.perf, 24);
      text(r.label ?? pct(r.perf), W - 40, y, 28, '#fff', 600, 'right');
    });
    text('A/X: nytt rum   ·   B/Y: samma rum igen', W / 2, H - 44, 28, '#b3a6ff', 600, 'center');
    panelTex.needsUpdate = true;
    return;
  }

  const p = world.percept();
  text('PERCEPT JUST NU', 40, 50, 24, '#b3a6ff', 700);
  const lamp = (label, val, y, on, low) => {
    text(label, 40, y, 30);
    g.font = '700 28px system-ui, sans-serif';
    const w = g.measureText(val).width + 32;
    g.fillStyle = low ? '#f2756b' : on ? '#c08a55' : '#2a2457';
    g.beginPath(); g.roundRect(440 - w, y - 20, w, 40, 20); g.fill();
    text(val, 440 - w / 2, y, 28, on || low ? '#2a1800' : '#cdc7f0', 700, 'center');
  };
  lamp('Smutsigt här?', p.dirty ? 'Ja' : 'Nej', 100, p.dirty);
  lamp('Position', `(${p.x}, ${p.y})`, 150, false);
  let y = 200;
  if (p.battery !== null) { lamp('Batteri', `${p.battery}/${p.capacity}`, y, false, p.battery <= 8); y += 50; }
  lamp('Hela kartan?', p.full ? 'Ja' : 'Nej', y, false);
  // Stötsensorerna: ett kors runt roboten, framåt är uppåt.
  text('Stötsensorer', 40, y + 70, 30);
  const cx = 360, cy = y + 120, s = 40;
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy], r) => {
    const wall = p.bumps[turn(level.facing, r)];
    g.fillStyle = r === vrBump ? '#ffffff' : wall ? '#f2756b' : '#352e6e';
    g.fillRect(cx + dx * (s + 4) - s / 2, cy + dy * (s + 4) - s / 2, s, s);
  });
  g.fillStyle = '#f5a23a';
  g.beginPath(); g.arc(cx, cy, s / 2, 0, 7); g.fill();
  text('▲', cx, cy + 2, 22, '#2a1800', 700, 'center');

  if (world.rivals.length) {
    text(`TÄVLING · STEG ${world.t}/${STEPS}`, W - 40, 50, 24, '#b3a6ff', 700, 'right');
    const all = [['Du', '#f5a23a', world.bot], ...world.rivals.map((r, k) => [RIVALS[k].namn, RIVALS[k].color, r])];
    all.forEach(([namn, color, v], k) => text(`${namn} ${v.sucked}${v.out ? ' ✗' : ''}`, W - 40, 95 + k * 38, 28, v.out ? '#6d65a8' : color, 700, 'right'));
    if (cfg.shoot) text(`Dammboll: ${shotState()}`, W - 40, 95 + all.length * 38, 26, '#fff', 600, 'right');
  } else {
    text('PRESTANDA', W - 40, 50, 24, '#b3a6ff', 700, 'right');
    text(`Steg ${world.t}/${STEPS}`, W - 40, 100, 30, '#fff', 600, 'right');
    text(`Renhet nu ${pct(world.cleanliness())}`, W - 40, 145, 30, '#fff', 600, 'right');
    text(`Snitt ${pct(world.performance())}`, W - 40, 190, 30, '#fff', 600, 'right');
  }
  if (mapOn) {
    const cs = Math.floor(Math.min(400 / world.w, 250 / world.h));
    g.save();
    g.translate(W - 40 - world.w * cs, 230);
    paintMap(g, cs);
    g.restore();
  }
  if (vrMsg) text(vrMsg, W / 2, H - 92, 32, '#fff', 700, 'center');
  text(cfg.shoot ? 'Spak: kör och vrid · Avtryckare: sug · Grepp: vänta · B/Y: skjut · A/X: karta'
    : 'Spak: kör och vrid · Avtryckare: sug · Grepp: vänta · A/X: karta', W / 2, H - 40, 24, '#9d95d6', 400, 'center');
  panelTex.needsUpdate = true;
}

function buzz(strength, ms) {
  const s = renderer.xr.getSession();
  if (!s) return;
  for (const src of s.inputSources) {
    const gp = src.gamepad;
    try {
      if (gp?.hapticActuators?.[0]?.pulse) gp.hapticActuators[0].pulse(strength, ms);
      else gp?.vibrationActuator?.playEffect?.('dual-rumble', { duration: ms, strongMagnitude: strength });
    } catch { /* inga vibrationer */ }
  }
}

// Handkontrollerna läses av varje bildruta. Spaken ger fram/bak/vrid, knapparna resten.
const pads = new Map();
function pollPads(now) {
  const s = renderer.xr.getSession();
  if (!s) return;
  for (const src of s.inputSources) {
    const gp = src.gamepad;
    if (!gp) continue;
    let st = pads.get(src);
    if (!st) pads.set(src, st = { stick: null, t: 0, btn: [] });
    const x = gp.axes[2] ?? gp.axes[0] ?? 0, y = gp.axes[3] ?? gp.axes[1] ?? 0;
    const mag = Math.max(Math.abs(x), Math.abs(y));
    let dir = null;
    if (mag > .7) dir = Math.abs(y) > Math.abs(x) ? (y < 0 ? 'F' : 'B') : (x < 0 ? 'L' : 'R');
    else if (mag > .3) dir = st.stick;   // glapp, så att spaken inte fladdrar runt gränsen
    const repeat = (dir === 'F' || dir === 'B') && now - st.t > 380;   // håll inne för att köra vidare
    if (dir && (dir !== st.stick || repeat)) { act(dir); st.t = now; }
    st.stick = dir;
    gp.buttons.forEach((b, i) => {
      if (b.pressed && !st.btn[i]) vrButton(i);
      st.btn[i] = b.pressed;
    });
  }
}

function vrButton(i) {
  // xr-standard: 0 avtryckare, 1 grepp, 4 A/X, 5 B/Y
  if (level?.over) {
    if (i === 4) { seed = 1 + Math.floor(Math.random() * 1e6); start(); }
    if (i === 5) start();
    return;
  }
  if (i === 0) act('SUG');
  else if (i === 1) act('VANTA');
  else if (i === 5 && cfg.shoot) act('SKJUT');
  else if (i === 4 || i === 5) { mapOn = !mapOn; drawMap(); drawPanel(); }
}

const vrBtn = document.getElementById('vr');
navigator.xr?.isSessionSupported('immersive-vr').then((ok) => { vrBtn.hidden = !ok; }).catch(() => {});
vrBtn.addEventListener('click', async () => {
  if (inVR()) { renderer.xr.getSession().end(); return; }
  try {
    const session = await navigator.xr.requestSession('immersive-vr');
    await renderer.xr.setSession(session);
    session.addEventListener('end', () => {
      panel.visible = false;
      vrBtn.textContent = 'Spela i VR';
      pads.clear();
      resize();
    });
    vrBtn.textContent = 'Lämna VR';
    panel.visible = true;
    audio.resume();
    if (!startEl.hidden || level.over) start();
    drawPanel();
  } catch (err) {
    console.error(err);
    say('VR kunde inte startas.');
  }
});

// ---------- styrning ----------
const KEYS = { ArrowUp: 'F', KeyW: 'F', ArrowDown: 'B', KeyS: 'B', ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R', Space: 'SUG', Enter: 'SUG', KeyE: 'VANTA', KeyF: 'SKJUT', KeyX: 'SKJUT' };
window.addEventListener('keydown', (e) => {
  if (!document.getElementById('start').hidden || !document.getElementById('end').hidden) return;
  if (e.code === 'KeyM') { mapOn = !mapOn; drawMap(); return; }
  const a = KEYS[e.code];
  if (!a) return;
  e.preventDefault();
  act(a);
});
for (const b of document.querySelectorAll('.pad button, #shootbtn')) {
  b.addEventListener('click', () => act(b.dataset.a));
}

// ---------- start- och slutskärm ----------
const startEl = document.getElementById('start'), endEl = document.getElementById('end');
function buildOptions() {
  const opts = document.getElementById('opts');
  const mapSel = el('select', { 'aria-label': 'Karta' }, Object.entries(MAPS).filter(([k]) => k !== 'tvarum').map(([k, mp]) => el('option', { value: k, selected: k === cfg.map }, mp.namn)));
  mapSel.addEventListener('change', () => { cfg.map = mapSel.value; });
  opts.append(el('div', { class: 'switch' }, el('span', {}, 'Karta'), mapSel));
  for (const s of SWITCHES) {
    const btns = s.opts.map(([val, txt]) => el('button', { 'aria-pressed': String(cfg[s.k] === val), onclick: () => {
      cfg[s.k] = val; btns.forEach((b, j) => b.setAttribute('aria-pressed', String(s.opts[j][0] === val)));
    } }, txt));
    opts.append(el('div', { class: 'switch' }, el('span', {}, s.namn, el('small', {}, s.hint)), el('div', { class: 'seg' }, btns)));
  }
}
function start() {
  startEl.hidden = true;
  endEl.hidden = true;
  audio.resume();
  document.getElementById('shootbtn').hidden = !cfg.shoot;
  document.getElementById('keyshoot').hidden = !cfg.shoot;
  buildLevel();
  canvas.focus?.();
}
document.getElementById('go').addEventListener('click', start);
document.getElementById('again').addEventListener('click', start);
document.getElementById('new').addEventListener('click', () => { seed = 1 + Math.floor(Math.random() * 1e6); start(); });
document.getElementById('settings').addEventListener('click', () => { endEl.hidden = true; startEl.hidden = false; });
document.getElementById('quit').addEventListener('click', () => {
  if (level && !level.over && world.t > 0) finish();
});

buildOptions();
buildLevel();
resize();
renderer.setAnimationLoop(frame);
