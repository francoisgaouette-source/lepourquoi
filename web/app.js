// Le Pourquoi : une notion expliquée en une minute, avec un dessin qui se construit étape par étape.
(() => {
const C = window.TT_CONFIG || {};
const DEMO = !C.supabaseUrl;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
const VOIX = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
if (VOIX) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; }
const SIMON = `<svg class="simon" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="22" fill="#f2c49b"/><g fill="#5a3a22"><circle cx="16" cy="22" r="8"/><circle cx="24" cy="14" r="9"/><circle cx="35" cy="12" r="9"/><circle cx="46" cy="17" r="8"/><circle cx="51" cy="26" r="6"/><circle cx="13" cy="30" r="5"/></g><circle cx="10.5" cy="37" r="4" fill="#f2c49b"/><circle cx="53.5" cy="37" r="4" fill="#f2c49b"/><g fill="none" stroke="#191714" stroke-width="2.4"><circle cx="24" cy="36" r="6.5"/><circle cx="40" cy="36" r="6.5"/><path d="M30.5 36h3"/></g><circle cx="24" cy="36.5" r="2" fill="#191714"/><circle cx="40" cy="36.5" r="2" fill="#191714"/><path d="M25 47q7 6 14 0" fill="none" stroke="#191714" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="45" r="2.6" fill="#e8462a" opacity=".35"/><circle cx="46" cy="45" r="2.6" fill="#e8462a" opacity=".35"/></svg>`;
const COL = {sun:'#f5b700',sky:'#5fb3e8',blue:'#2f6fd6',red:'#e23d3d',orange:'#f08a24',violet:'#7b4ddb',green:'#2e9d5b',brown:'#8a5a2b',gray:'#9a948a',pink:'#e0569b',coral:'#e8462a',ink:'currentColor'};
const CHIPS = ['le Wi-Fi','un frigo','l\'inflation','un vaccin à ARN','le GPS','un taux d\'intérêt'];
const POOL = window.TT_POOL || [];
const ls = {get(k,d){try{return JSON.parse(localStorage.getItem(k)) ?? d}catch(e){return d}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

const NIVEAUX = {simple:'Simple', pousse:'Poussé', avance:'Avancé'};
const niv = v => ({normal:'simple', pro:'avance'})[v] || (NIVEAUX[v] ? v : 'simple');
let niveau = niv(ls.get('lp-niveau', 'simple'));
let busy = false, cur = null, step = 0, timer = null, touched = false;


/* ---------- Questions ---------- */
$('chips').innerHTML = CHIPS.map(c => `<button class="chip" type="button" data-q="${esc(c)}">${esc(c)}</button>`).join('');
$('chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { $('q').value = b.dataset.q; ask(b.dataset.q); } });
$('q').addEventListener('input', () => $('err').textContent = '');
$('f').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('q').value.trim();
  if (!v) { $('err').textContent = 'Tape d\'abord une chose qui t\'intrigue, par exemple « le GPS ».'; $('q').focus(); return; }
  $('q').blur(); ask(v);
});
$('surp').addEventListener('click', () => {
  $('q').value = '';
  if (DEMO) { const d = window.TT_DEMO[Math.floor(Math.random()*window.TT_DEMO.length)]; touched = true; show({...d, level:'normal', kind:'surprise'}); return; }
  ask(POOL[Math.floor(Math.random()*POOL.length)], 'normal', 'surprise');
});

function findDemo(q) {
  const k = q.toLowerCase().replace(/^(un|une|le|la|les|l'|des)\s*/,'').trim();
  return window.TT_DEMO.find(d => d.q.toLowerCase().includes(k) || k.includes(d.q.toLowerCase().replace(/^(un|une|le|la|les|l')\s*/,'')));
}

async function callFiche(body) {
  const headers = {'Content-Type':'application/json', apikey: C.supabaseAnonKey};
  headers.Authorization = 'Bearer ' + C.supabaseAnonKey;
  const r = await fetch(`${C.supabaseUrl}/functions/v1/fiche`, {method:'POST', headers, body: JSON.stringify(body)});
  let data = {}; try { data = await r.json(); } catch (e) {}
  if (!r.ok) { const err = new Error(data.erreur || 'Erreur'); err.code = data.code || ('http_' + r.status); throw err; }
  return data.fiche;
}

function loadingCard(q, lbl) {
  $('card').innerHTML = `<div class="loading" aria-label="Préparation de la fiche"><div class="meta"><span class="qui">${SIMON}${lbl?`<span class="tag">${esc(lbl)}</span> `:''}${q ? `Simon dessine ta fiche sur « ${esc(q)} »…` : 'Simon prépare la surprise du jour…'}</span></div><div class="bar" style="width:50%;height:34px"></div><div class="bar" style="width:88%"></div><div class="bar" style="width:100%;height:220px;margin-top:8px;border-radius:18px"></div><div class="bar" style="width:70%"></div></div>`;
}

async function ask(q, level, kind) {
  if (kind !== 'daily' && typeof taire === 'function') taire();
  level = niv(level || niveau);
  const bg = kind === 'daily';
  if (busy && !bg) return;
  if (!bg) touched = true;
  $('note').textContent = '';
  if (DEMO) {
    const d = findDemo(q);
    if (d) { show({...d, level:'normal', kind:''}); return; }
    $('err').textContent = 'Mode démonstration : seules l\'arc-en-ciel, le frigo et le GPS sont disponibles. Branche Supabase pour tout le reste.';
    return;
  }
  if (!bg) { busy = true; $('go').disabled = $('surp').disabled = true; }
  const lbl = bg ? 'Surprise du jour' : kind === 'surprise' ? 'Surprise' : '';
  if (!bg || !touched) loadingCard(q, lbl);
  try {
    const d = await callFiche(bg ? {mode:'jour', date: today()} : {question:q, niveau: level});
    d.level = niv(d.level || level); d.kind = kind || '';
    if (bg) ls.set('tt-day', {date: today(), d});
    if (!bg || !touched) show(d);
    if (!bg) saveHist(d, q, d.level);
  } catch (e) {
    if (bg && touched) return;
    if (bg) { showDefault(); return; }
    const msg = e.code === 'limite' ? 'Tu as atteint la limite de fiches pour aujourd\'hui. Reviens demain !'
      : e.code === 'pause' ? 'Simon fait une pause : beaucoup de monde aujourd\'hui. Réessaie un peu plus tard.'
      : navigator.onLine === false ? 'Tu n\'es pas connecté à Internet.'
      : 'La fiche n\'a pas pu être préparée. Réessaie, ou reformule.';
    $('card').innerHTML = `<p style="margin:0 0 14px">${esc(msg)}</p><button class="btn" type="button" id="retry">Réessayer</button>`;
    $('retry').onclick = () => ask(q, level, kind);
  } finally {
    if (!bg) { busy = false; $('go').disabled = $('surp').disabled = false; }
  }
}

/* ---------- Dessin ---------- */
function drawScene(scene) {
  return (Array.isArray(scene) ? scene : []).slice(0, 40).map(e => {
    const c = COL[e.c] || COL.ink, s = num(e.step,0,9,0), cls = `class="el" data-s="${s}"`;
    switch (e.t) {
      case 'circle': return `<circle ${cls} cx="${num(e.x,0,400,200)}" cy="${num(e.y,0,260,130)}" r="${num(e.r,1,200,10)}" fill="${c}" fill-opacity="${e.c==='ink'?1:.28}" stroke="${c}" stroke-width="2.5"/>`;
      case 'ellipse': return `<ellipse ${cls} cx="${num(e.x,0,400,200)}" cy="${num(e.y,0,260,130)}" rx="${num(e.rx,1,200,20)}" ry="${num(e.ry,1,200,10)}" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width="2.5"/>`;
      case 'rect': return `<rect ${cls} x="${num(e.x,0,400,0)}" y="${num(e.y,0,260,0)}" width="${num(e.w,1,400,20)}" height="${num(e.h,1,260,20)}" rx="5" fill="${c}" fill-opacity="${e.c==='ink'?.85:.28}" stroke="${c}" stroke-width="2.5"/>`;
      case 'poly': { const p = (Array.isArray(e.pts)?e.pts:[]).slice(0,40).map(q => Array.isArray(q) ? `${num(q[0],0,400,0)},${num(q[1],0,260,0)}` : '').filter(Boolean).join(' ');
        return p ? `<polygon ${cls} points="${p}" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>` : ''; }
      case 'line': case 'arrow': return `<line ${cls} x1="${num(e.x1,0,400,0)}" y1="${num(e.y1,0,260,0)}" x2="${num(e.x2,0,400,0)}" y2="${num(e.y2,0,260,0)}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"${e.t==='arrow'?` marker-end="url(#ah-${e.c in COL?e.c:'ink'})"`:''}/>`;
      case 'text': return `<text class="el lab" data-s="${s}" x="${num(e.x,0,400,200)}" y="${num(e.y,0,260,130)}" text-anchor="middle" font-size="${num(e.size,10,20,13)}" fill="${e.c && e.c!=='ink' ? c : 'currentColor'}">${esc(String(e.s||'').slice(0,40))}</text>`;
      default: return '';
    }
  }).join('');
}
const markers = () => Object.keys(COL).map(k => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${COL[k]}"/></marker>`).join('');

/* ---------- Fiche ---------- */
function show(d) {
  cur = d; step = 0; $('err').textContent = '';
  const et = d.curseur.etats, mid = Math.floor((et.length-1)/2);
  const lbl = d.kind==='daily' ? 'Surprise du jour' : d.kind==='surprise' ? 'Surprise' : 'Niveau ' + NIVEAUX[niv(d.level)].toLowerCase();
  $('card').innerHTML = `
<div class="meta"><span>${lbl?`<span class="tag">${lbl}</span>`:'Fiche'}</span>
<span class="timer"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9" fill="none" stroke="var(--line)" stroke-width="3"/><circle id="ring" cx="11" cy="11" r="9" fill="none" stroke="var(--coral)" stroke-width="3" stroke-linecap="round" stroke-dasharray="56.5" stroke-dashoffset="0"/></svg><span id="tleft">1:00</span></span></div>
<h2>${esc(d.titre)}</h2>
<div class="dit">${SIMON}<div class="bulle"><small>Simon t'explique le concept</small><p>${esc(d.concept)}</p></div></div>
${VOIX ? `<button class="ecoute" type="button" id="ecoute" aria-pressed="false"><span class="ico" aria-hidden="true">▶</span><span class="lbl">Écouter Simon</span></button>` : ''}
<p class="lead">${esc(d.phrase)}</p>
<div class="stage"><svg id="scene" viewBox="0 0 400 260" role="img" aria-label="Schéma : ${esc(d.titre)}" style="color:var(--ink)"><defs>${markers()}</defs>${drawScene(d.scene)}</svg></div>
<div class="stepper">
  <div class="dots" id="dots">${d.etapes.map((s,i)=>`<button class="dot" type="button" data-i="${i}" aria-label="Étape ${i+1}"></button>`).join('')}</div>
  <p class="stepTitle" id="st"></p><p class="stepText" id="sx"></p>
  <div class="nav"><button class="btn" type="button" id="prev">Précédent</button><span class="count" id="cnt"></span><button class="btn primary" type="button" id="next">Suivant</button></div>
</div>
${d.analogie?`<div class="ana"><b>Imagine</b><span>${esc(d.analogie)}</span></div>`:''}
<h3 class="sec">${esc(d.curseur.question||'Et si…')}</h3>
<div class="box">
  <div class="sl"><span>${esc(et[0].label)}</span><input type="range" id="rg" min="0" max="${et.length-1}" step="1" value="${mid}" aria-label="${esc(d.curseur.variable||'Facteur')}"><span>${esc(et[et.length-1].label)}</span></div>
  <p class="state" id="sl"></p><p id="se"></p>
</div>
<h3 class="sec">Tu as compris&nbsp;?</h3>
<div class="box"><p style="font-weight:600">${esc(d.verif.question)}</p>
  <div class="opts" id="opts">${d.verif.choix.map((c,i)=>`<button class="opt" type="button" data-i="${i}">${esc(c)}</button>`).join('')}</div>
  <p class="why" id="why" hidden></p></div>
${!DEMO && Array.isArray(d.suites) && d.suites.length ? `<h3 class="sec">Pour aller plus loin</h3>
<div class="suites">${d.suites.map(x => `<button class="suite" type="button" data-q="${esc(x)}">${esc(x)}<span aria-hidden="true">›</span></button>`).join('')}</div>` : ''}
<div class="more">
  ${DEMO?'':Object.keys(NIVEAUX).filter(k => k !== niv(d.level)).map(k => `<button class="btn" type="button" data-l="${k}">Version ${({simple:'simple',pousse:'poussée',avance:'avancée'})[k]}</button>`).join('')}
  <button class="btn" type="button" id="again">Une autre surprise</button>
  ${navigator.share?'<button class="btn" type="button" id="share">Partager</button>':''}
</div>`;
  paintStep(); paintSlider();
  $('dots').onclick = e => { const b = e.target.closest('.dot'); if (b) { step = +b.dataset.i; paintStep(); } };
  $('prev').onclick = () => { if (step > 0) { step--; paintStep(); } };
  $('next').onclick = () => { if (step < cur.etapes.length-1) { step++; paintStep(); } else $('rg').focus(); };
  $('rg').oninput = paintSlider;
  $('opts').onclick = e => {
    const b = e.target.closest('.opt'); if (!b) return;
    const ok = +b.dataset.i === +cur.verif.bonne;
    [...$('opts').children].forEach(o => o.classList.remove('good','bad'));
    b.classList.add(ok ? 'good' : 'bad');
    const w = $('why'); w.hidden = false; w.textContent = ok ? 'Exact. ' + (cur.verif.pourquoi||'') : 'Pas tout à fait. Regarde le dessin et réessaie.';
  };
  $('card').querySelectorAll('[data-l]').forEach(b => b.onclick = () => ask(cur.q || cur.titre, b.dataset.l));
  $('card').querySelectorAll('.suite').forEach(b => b.onclick = () => { $('q').value = b.dataset.q; window.scrollTo({top:0, behavior:'smooth'}); ask(b.dataset.q); });
  $('again').onclick = () => $('surp').click();
  if ($('share')) $('share').onclick = () => navigator.share({title: d.titre, text: `${d.titre} : ${d.concept}`, url: location.origin}).catch(() => {});
  startTimer();
  if ($('ecoute')) $('ecoute').onclick = () => parle ? taire() : raconter();
  taire();
  if (VOIX && ls.get('lp-voix', false) && d.kind !== 'daily') setTimeout(raconter, 300);
}

/* ---------- Simon parle ---------- */
let parle = false, jeton = 0;
function voixFr() {
  const v = speechSynthesis.getVoices();
  return v.find(x => /fr[-_]CA/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang) && /natural|neural|premium|enhanced/i.test(x.name)) || v.find(x => /^fr/i.test(x.lang)) || null;
}
function dire(texte, id) {
  return new Promise(res => {
    if (!texte || id !== jeton) return res();
    const u = new SpeechSynthesisUtterance(texte);
    const v = voixFr(); if (v) u.voice = v; u.lang = v ? v.lang : 'fr-CA'; u.rate = 1.02; u.pitch = 1.05;
    u.onend = u.onerror = () => res();
    try { speechSynthesis.speak(u); } catch (e) { res(); }
  });
}
function etatVoix(on) {
  parle = on;
  const b = $('ecoute'); if (b) { b.setAttribute('aria-pressed', String(on)); b.querySelector('.ico').textContent = on ? '■' : '▶'; b.querySelector('.lbl').textContent = on ? 'Arrêter Simon' : 'Écouter Simon'; }
  document.querySelectorAll('.dit .simon').forEach(x => x.classList.toggle('parle', on));
}
function taire() { jeton++; if (VOIX) speechSynthesis.cancel(); etatVoix(false); }
async function raconter() {
  if (!VOIX || !cur) return;
  taire(); const id = jeton; const d = cur; etatVoix(true); ls.set('lp-voix', true);
  await dire(d.titre + '.', id);
  await dire(d.concept, id);
  await dire(d.phrase, id);
  for (let i = 0; i < d.etapes.length && id === jeton; i++) {
    step = i; paintStep();
    if (i === 0) $('scene').scrollIntoView({behavior:'smooth', block:'center'});
    await dire(`${d.etapes[i].titre}. ${d.etapes[i].texte}`, id);
  }
  if (d.analogie) await dire('Imagine : ' + d.analogie, id);
  if (d.verif && d.verif.question) await dire('À toi de jouer : ' + d.verif.question, id);
  if (id === jeton) etatVoix(false);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) taire(); });
function paintStep() {
  const s = cur.etapes[step], n = cur.etapes.length;
  $('st').textContent = s.titre || ''; $('sx').textContent = s.texte || ''; $('cnt').textContent = `Étape ${step+1} sur ${n}`;
  [...$('dots').children].forEach((d,i) => d.classList.toggle('on', i <= step));
  const maxS = Math.max(0, ...(cur.scene||[]).map(e => num(e.step,0,9,0)));
  const view = step === n-1 ? Math.max(step, maxS) : step;
  $('scene').querySelectorAll('.el').forEach(el => { const s = +el.dataset.s; el.classList.toggle('hide', s > view); el.classList.toggle('past', s < step && s > 0 && step !== n-1); });
  $('prev').style.visibility = step ? 'visible' : 'hidden';
  $('next').textContent = step < n-1 ? 'Suivant' : 'Et si…';
}
function paintSlider() { const s = cur.curseur.etats[+$('rg').value]; $('sl').textContent = s.label || ''; $('se').textContent = s.effet || ''; }
function startTimer() {
  clearInterval(timer); let t = 60;
  timer = setInterval(() => {
    t--; const r = $('ring'), l = $('tleft'); if (!r) { clearInterval(timer); return; }
    r.style.strokeDashoffset = String(56.5*(60-t)/60);
    l.textContent = t > 0 ? `0:${String(t).padStart(2,'0')}` : 'Compris ?';
    if (t <= 0) clearInterval(timer);
  }, 1000);
}
function showDefault() {
  const day = ls.get('tt-day', null);
  if (day && day.d) { show(day.d); return; }
  show({...window.TT_DEMO[0], level:'normal', kind:''});
  $('note').textContent = DEMO ? 'Mode démonstration : fiches d\'exemple.' : 'Fiche d\'exemple.';
}

/* ---------- Niveau ---------- */
function paintNiveau() { document.querySelectorAll('#niv button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.n === niveau))); }
$('niv').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; niveau = b.dataset.n; ls.set('lp-niveau', niveau); paintNiveau(); });
paintNiveau();

/* ---------- Historique (sur l'appareil) ---------- */
let hist = ls.get('lp-hist', []);
function saveHist(d, q, niveau) {
  hist = [{question: q, niveau, contenu: d}, ...hist.filter(x => !(x.question.toLowerCase() === q.toLowerCase() && x.niveau === niveau))].slice(0, 20);
  ls.set('lp-hist', hist); renderHist();
}
function renderHist() {
  $('hist').hidden = !hist.length;
  $('hl').innerHTML = hist.map((x,i) => `<button type="button" data-i="${i}">${esc(x.contenu?.titre || x.question)}${niv(x.niveau) !== 'simple' ? ' · ' + NIVEAUX[niv(x.niveau)].toLowerCase() : ''}</button>`).join('');
}
$('hl').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const x = hist[+b.dataset.i]; if (!x) return;
  touched = true; $('note').textContent = '';
  show({...x.contenu, q: x.question, level: x.niveau, kind:''});
  window.scrollTo({top:0, behavior:'smooth'});
});

/* ---------- Mise à jour automatique ---------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    const offer = w => { $('toast').hidden = false; $('upd').onclick = () => w.postMessage('activer'); };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
    });
    setInterval(() => reg.update().catch(() => {}), 60*60*1000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}

/* ---------- Démarrage ---------- */
renderHist();
if (DEMO) { showDefault(); }
else {
  const day = ls.get('tt-day', null);
  if (day && day.date === today() && day.d) show(day.d);
  else { showDefault(); ask('', 'normal', 'daily'); }
}
})();
