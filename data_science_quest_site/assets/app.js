const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

const LS = {
  get(key, fallback=null){
    try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
  del(key){ localStorage.removeItem(key); }
};

const state = {
  curriculum: null,
  editor: null,
  py: { ready:false, loading:false, instance:null },
  route: { name:"home", params:{} }
};

const keys = {
  progress: "dsq_progress_v1", // { completed: {lessonId:true}, xp:number }
  codePrefix: "dsq_code_v1_",   // per-lesson code
};

function getProgress(){ return LS.get(keys.progress, { completed:{}, xp:0 }); }
function saveProgress(p){ LS.set(keys.progress, p); }

function setCompleted(lessonId, xpAward){
  const p = getProgress();
  if(!p.completed[lessonId]){
    p.completed[lessonId] = true;
    p.xp += (xpAward || 0);
    saveProgress(p);
  }
}

function isCompleted(lessonId){ return !!getProgress().completed[lessonId]; }

function chapterCompletion(ch){
  const total = ch.lessons.length;
  const done = ch.lessons.filter(l=>isCompleted(l.id)).length;
  return {done, total, pct: total ? Math.round(done/total*100) : 0};
}

function levelFromXP(xp){ return Math.floor(xp/100) + 1; }

function currentRoute(){
  const h = location.hash.replace(/^#/, "") || "/";
  const parts = h.split("/").filter(Boolean);
  if(parts.length === 0) return {name:"home", params:{}};
  if(parts[0] === "dashboard") return {name:"dashboard", params:{}};
  if(parts[0] === "profile") return {name:"profile", params:{}};
  if(parts[0] === "about") return {name:"about", params:{}};
  if(parts[0] === "chapter" && parts[1]) return {name:"chapter", params:{id:parts[1]}};
  if(parts[0] === "lesson" && parts[1]) return {name:"lesson", params:{id:parts[1]}};
  return {name:"home", params:{}};
}

function setActiveNav(routeName){
  $$(".nav a").forEach(a=>{
    const r = a.getAttribute("data-route");
    if(r === routeName) a.classList.add("active");
    else a.classList.remove("active");
  });
}

async function loadCurriculum(){
  const res = await fetch("./assets/curriculum.json");
  if(!res.ok) throw new Error("Failed to load curriculum.json");
  state.curriculum = await res.json();
}

function renderHero(){
  const p = getProgress();
  const level = levelFromXP(p.xp);
  const completedCount = Object.keys(p.completed).length;

  return `
  <section class="hero">
    <div class="card">
      <div class="card-body">
        <h1 class="h1">Your Data Science adventure — in browser.</h1>
        <p class="p">
          Learn like a game: small lessons ➜ code challenges ➜ XP ➜ bosses.
          No accounts, no paywalls. Your progress is saved locally in this browser.
        </p>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
          <a class="btn primary" href="#/dashboard">Continue</a>
          <a class="btn" href="#/">Open Map</a>
          <button class="btn danger" id="resetProgressBtn" title="Clears local progress in this browser">Reset Progress</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="h2">Player Stats</div>
        <span class="badge">Local Save</span>
      </div>
      <div class="card-body">
        <div class="grid">
          <div class="callout">
            <b>Level:</b> ${level}<br/>
            <b>Total XP:</b> ${p.xp}<br/>
            <b>Lessons Completed:</b> ${completedCount}
          </div>
          <div class="callout">
            <b>Tip:</b> Export all your lesson code as a ZIP and commit it to GitHub.
            Go to <a href="#/profile" style="text-decoration:underline;">Profile → Export</a>.
          </div>
        </div>
      </div>
    </div>
  </section>
  `;
}

function renderMap(){
  const c = state.curriculum;
  const tiles = c.chapters.map(ch=>{
    const comp = chapterCompletion(ch);
    return `
      <a class="card map-tile" href="#/chapter/${ch.id}">
        <div class="card-header">
          <div class="h2">${ch.emoji} ${ch.title}</div>
          <span class="badge">${comp.done}/${comp.total} • ${comp.pct}%</span>
        </div>
        <div class="card-body">
          <p class="map-meta">${ch.blurb}</p>
          <div class="progressbar" style="margin-top:12px;"><div style="width:${comp.pct}%"></div></div>
        </div>
      </a>
    `;
  }).join("");

  return `
    ${renderHero()}
    <div style="height:16px"></div>
    <div class="grid cols-2">
      ${tiles}
    </div>
    <div class="footer">Tip: this whole site is static. Host it on GitHub Pages.</div>
  `;
}

function chapterById(id){ return state.curriculum.chapters.find(c=>c.id===id); }

function lessonById(lessonId){
  for(const ch of state.curriculum.chapters){
    const l = ch.lessons.find(x=>x.id===lessonId);
    if(l) return {chapter:ch, lesson:l};
  }
  return null;
}

function nextPrevLesson(lessonId){
  const flat = [];
  for(const ch of state.curriculum.chapters){
    for(const l of ch.lessons) flat.push({ch, l});
  }
  const idx = flat.findIndex(x=>x.l.id===lessonId);
  return {
    prev: idx>0 ? flat[idx-1].l : null,
    next: (idx>=0 && idx<flat.length-1) ? flat[idx+1].l : null
  };
}

function renderChapterPage(chId){
  const ch = chapterById(chId);
  if(!ch) return `<div class="card"><div class="card-body">Chapter not found.</div></div>`;

  const comp = chapterCompletion(ch);
  const list = ch.lessons.map((l,i)=>{
    const done = isCompleted(l.id);
    const tag = done ? "✅ Completed" : `+${l.xp} XP`;
    return `
      <a class="card" href="#/lesson/${l.id}">
        <div class="card-header">
          <div class="h2">${i+1}. ${l.title}</div>
          <span class="badge">${tag}</span>
        </div>
        <div class="card-body">
          <div class="progressbar"><div style="width:${done?100:0}%"></div></div>
        </div>
      </a>
    `;
  }).join("");

  return `
    <div class="card">
      <div class="card-header">
        <div class="h2">${ch.emoji} ${ch.title}</div>
        <span class="badge">${comp.done}/${comp.total} • ${comp.pct}%</span>
      </div>
      <div class="card-body">
        <p class="p">${ch.blurb}</p>
        <div style="margin-top:12px" class="progressbar"><div style="width:${comp.pct}%"></div></div>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <a class="btn" href="#/">← Back to Map</a>
          <a class="btn primary" href="#/dashboard">Continue</a>
        </div>
      </div>
    </div>

    <div style="height:14px"></div>
    <div class="grid cols-2">
      ${list}
    </div>
  `;
}

async function fetchText(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Failed to fetch ${path}`);
  return await res.text();
}

function getSavedCode(lessonId, fallback){
  const v = LS.get(keys.codePrefix + lessonId, null);
  return (v && typeof v === "string") ? v : (fallback || "");
}
function saveCode(lessonId, code){ LS.set(keys.codePrefix + lessonId, code); }

function terminalWrite(text){
  const pre = $("#terminalOut");
  if(pre) pre.textContent = text;
}

async function ensurePyodide(){
  if(state.py.ready) return state.py.instance;
  if(state.py.loading) return null;

  state.py.loading = true;
  terminalWrite("Loading Python engine (Pyodide)… first run can take a moment.\n");

  await new Promise((resolve, reject)=>{
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  state.py.instance = await loadPyodide({});
  terminalWrite("Python ready. Loading packages (pandas)…\n");
  await state.py.instance.loadPackage(["pandas"]);

  state.py.ready = true;
  state.py.loading = false;
  terminalWrite("Ready ✅\n");
  return state.py.instance;
}

function normalizeOut(s){ return (s || "").trim().replace(/\r\n/g, "\n"); }

function runTests(output, tests){
  const out = normalizeOut(output);
  if(!tests || tests.length === 0) return {ok:true, msg:"No tests."};

  for(const t of tests){
    if(t.type === "stdout_equals"){
      if(out !== normalizeOut(t.expected)) return {ok:false, msg:`Expected exact output:\n${t.expected}\n\nGot:\n${out}`};
    }
    if(t.type === "stdout_contains"){
      for(const frag of t.expected){
        if(frag === "") continue;
        if(!out.includes(frag)) return {ok:false, msg:`Expected output to contain:\n${frag}\n\nGot:\n${out}`};
      }
    }
  }
  return {ok:true, msg:"All checks passed ✅"};
}

async function runPython(code, tests){
  terminalWrite("");
  const py = await ensurePyodide();
  if(!py) return;

  let buffer = "";
  const wrapped = `
import sys, io, traceback
_buf = io.StringIO()
_oldout, _olderr = sys.stdout, sys.stderr
sys.stdout = _buf
sys.stderr = _buf
try:
${code.split("\n").map(l=>"    "+l).join("\n")}
except Exception:
    traceback.print_exc()
finally:
    sys.stdout = _oldout
    sys.stderr = _olderr
_buf.getvalue()
`;
  try{
    const out = await py.runPythonAsync(wrapped);
    buffer = String(out || "");
  }catch(e){
    buffer = String(e);
  }
  terminalWrite(buffer);

  const result = runTests(buffer, tests);
  return {output: buffer, ...result};
}

function downloadTextFile(filename, content){
  const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

function slugify(s){
  return (s||"").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0,50);
}

async function exportAllZip(){
  const zip = new JSZip();
  const p = getProgress();

  zip.file("README_EXPORT.txt",
`This ZIP was exported from Data Science Quest.
It contains your saved lesson code files.
Completed lessons: ${Object.keys(p.completed).length}
Total XP: ${p.xp}
`);

  for(const ch of state.curriculum.chapters){
    const folder = zip.folder(`${ch.id}_${slugify(ch.title)}`);
    for(const l of ch.lessons){
      const code = getSavedCode(l.id, l.starter || "");
      folder.file(`${l.id}_${slugify(l.title)}.py`, code);
    }
  }

  const blob = await zip.generateAsync({type:"blob"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dsquest_my_code.zip";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

async function renderLessonPage(lessonId){
  const found = lessonById(lessonId);
  if(!found) return `<div class="card"><div class="card-body">Lesson not found.</div></div>`;
  const {chapter, lesson} = found;

  const mdText = await fetchText("./" + lesson.md);
  const lessonHTML = marked.parse(mdText);

  const saved = getSavedCode(lesson.id, lesson.starter || "");
  const done = isCompleted(lesson.id);
  const nav = nextPrevLesson(lesson.id);

  const html = `
    <div class="split">
      <div class="card">
        <div class="card-header">
          <div class="h2">${chapter.emoji} ${lesson.title}</div>
          <span class="badge">${done ? "✅ Completed" : `+${lesson.xp} XP`}</span>
        </div>
        <div class="lesson-content" id="lessonContent">${lessonHTML}</div>
        <div class="card-body" style="padding-top:0;">
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <a class="btn" href="#/chapter/${chapter.id}">← Chapter</a>
            ${nav.prev ? `<a class="btn" href="#/lesson/${nav.prev.id}">← Prev</a>` : ``}
            ${nav.next ? `<a class="btn" href="#/lesson/${nav.next.id}">Next →</a>` : ``}
          </div>
        </div>
      </div>

      <div class="card workspace">
        <div class="toolbar">
          <span class="badge mono">Python</span>
          <span class="status" id="runStatus">Ready</span>
          <div class="spacer"></div>
          <button class="btn small" id="downloadBtn">Download .py</button>
          <button class="btn small" id="resetCodeBtn">Reset code</button>
          <button class="btn primary" id="runBtn">Run ▶</button>
          <button class="btn" id="checkBtn">Check ✓</button>
        </div>

        <textarea id="editor"></textarea>

        <div class="terminal">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;">
            <span class="badge">Terminal</span>
            <button class="btn small" id="clearTermBtn">Clear</button>
          </div>
          <pre id="terminalOut"></pre>
        </div>

        <div class="card-body" style="padding-top:12px;">
          <div class="callout" id="checkResult">
            Write code, run it, then click <b>Check ✓</b> to earn XP.
          </div>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(()=> {
    if(state.editor){
      state.editor.toTextArea();
      state.editor = null;
    }
    state.editor = CodeMirror.fromTextArea($("#editor"), {
      mode: "python",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      viewportMargin: Infinity
    });
    state.editor.setValue(saved);

    const setStatus = (t)=>{ const el=$("#runStatus"); if(el) el.textContent=t; };

    state.editor.on("change", ()=> saveCode(lesson.id, state.editor.getValue()));
    $("#clearTermBtn").addEventListener("click", ()=> terminalWrite(""));

    $("#resetCodeBtn").addEventListener("click", ()=>{
      const yes = confirm("Reset code for this lesson back to the starter code?");
      if(!yes) return;
      const starter = lesson.starter || "";
      state.editor.setValue(starter);
      saveCode(lesson.id, starter);
      terminalWrite("");
      $("#checkResult").innerHTML = `Write code, run it, then click <b>Check ✓</b> to earn XP.`;
    });

    $("#downloadBtn").addEventListener("click", ()=>{
      const code = state.editor.getValue();
      downloadTextFile(`${lesson.id}_${slugify(lesson.title)}.py`, code);
    });

    $("#runBtn").addEventListener("click", async ()=>{
      setStatus("Running…");
      const code = state.editor.getValue();
      const res = await runPython(code, lesson.tests || []);
      setStatus("Ready");
      if(res && res.ok){
        $("#checkResult").innerHTML = `Run finished ✅ (Click <b>Check ✓</b> to record completion.)`;
      }else{
        $("#checkResult").innerHTML = `<b>Run finished</b> — output didn't match the checks yet.`;
      }
    });

    $("#checkBtn").addEventListener("click", async ()=>{
      setStatus("Checking…");
      const code = state.editor.getValue();
      const res = await runPython(code, lesson.tests || []);
      setStatus("Ready");

      if(res && res.ok){
        setCompleted(lesson.id, lesson.xp);
        $("#checkResult").innerHTML = `<b>✅ Passed!</b> You earned <b>${lesson.xp} XP</b>.`;
      }else if(res){
        $("#checkResult").innerHTML = `<b>Not yet.</b><br/><pre style="white-space:pre-wrap;margin:10px 0 0;">${escapeHtml(res.msg)}</pre>`;
      }
    });
  });

  return html;
}

function renderDashboard(){
  const p = getProgress();
  const level = levelFromXP(p.xp);
  const flat = [];
  for(const ch of state.curriculum.chapters){ for(const l of ch.lessons) flat.push({ch, l}); }
  const next = flat.find(x=>!isCompleted(x.l.id)) || flat[flat.length-1];

  const cards = state.curriculum.chapters.map(ch=>{
    const comp = chapterCompletion(ch);
    const firstIncomplete = ch.lessons.find(l=>!isCompleted(l.id)) || ch.lessons[ch.lessons.length-1];
    return `
      <div class="card">
        <div class="card-header">
          <div class="h2">${ch.emoji} ${ch.title}</div>
          <span class="badge">${comp.pct}%</span>
        </div>
        <div class="card-body">
          <p class="p">${ch.blurb}</p>
          <div style="margin-top:10px" class="progressbar"><div style="width:${comp.pct}%"></div></div>
          <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
            <a class="btn primary" href="#/lesson/${firstIncomplete.id}">Continue</a>
            <a class="btn" href="#/chapter/${ch.id}">Open chapter</a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="grid cols-2">
      <div class="card">
        <div class="card-header">
          <div class="h2">Continue</div>
          <span class="badge">Level ${level} • ${p.xp} XP</span>
        </div>
        <div class="card-body">
          <p class="p">Next up:</p>
          <div class="callout" style="margin-top:10px">
            <b>${next.ch.emoji} ${next.l.title}</b><br/>
            <span style="color:var(--muted)">${next.ch.title}</span>
          </div>
          <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
            <a class="btn primary" href="#/lesson/${next.l.id}">Start</a>
            <a class="btn" href="#/">Map</a>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="h2">How this saves</div>
          <span class="badge">No accounts</span>
        </div>
        <div class="card-body">
          <div class="callout">
            Your XP, completions, and code are stored in <b>localStorage</b> in this browser.
            Use <b>Profile → Export</b> to download your code as a ZIP to commit to GitHub.
          </div>
        </div>
      </div>
    </div>

    <div style="height:14px"></div>
    <div class="grid cols-2">
      ${cards}
    </div>
  `;
}

function renderProfile(){
  const p = getProgress();
  const level = levelFromXP(p.xp);
  const completed = Object.keys(p.completed).length;

  const badges = [];
  for(const ch of state.curriculum.chapters){
    const comp = chapterCompletion(ch);
    if(comp.done === comp.total) badges.push(`${ch.emoji} ${ch.title} — Cleared`);
  }
  if(p.xp >= 300) badges.push("🏅 XP Milestone — 300+");
  if(p.xp >= 600) badges.push("🏆 XP Milestone — 600+");

  const badgeHTML = badges.length
    ? `<ul>${badges.map(b=>`<li style="color:var(--muted);line-height:1.6;">${b}</li>`).join("")}</ul>`
    : `<div class="callout">No badges yet — clear a chapter to earn your first.</div>`;

  return `
    <div class="grid cols-2">
      <div class="card">
        <div class="card-header">
          <div class="h2">Profile</div>
          <span class="badge">Local Save</span>
        </div>
        <div class="card-body">
          <div class="callout">
            <b>Level:</b> ${level}<br/>
            <b>Total XP:</b> ${p.xp}<br/>
            <b>Lessons Completed:</b> ${completed}
          </div>

          <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn primary" id="exportZipBtn">Export all code (ZIP)</button>
            <button class="btn danger" id="wipeBtn">Reset progress</button>
          </div>

          <div style="margin-top:12px" class="callout">
            <b>GitHub idea:</b> export the ZIP, unzip into your repo under <span class="mono">my_solutions/</span>,
            commit, and you’ll have a learning history.
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="h2">Badges</div>
          <span class="badge">${badges.length}</span>
        </div>
        <div class="card-body">
          ${badgeHTML}
        </div>
      </div>
    </div>
  `;
}

function renderAbout(){
  return `
    <div class="card">
      <div class="card-header">
        <div class="h2">About</div>
        <span class="badge">Static site</span>
      </div>
      <div class="card-body">
        <p class="p">
          This is a Codédex-style learning game, but made to be hosted as a simple GitHub Pages site.
          It uses:
        </p>
        <ul>
          <li style="color:var(--muted);line-height:1.7;">Markdown lessons (<span class="mono">assets/lessons/*.md</span>)</li>
          <li style="color:var(--muted);line-height:1.7;">A JSON curriculum (<span class="mono">assets/curriculum.json</span>)</li>
          <li style="color:var(--muted);line-height:1.7;">CodeMirror editor + Pyodide for Python runs in the browser</li>
          <li style="color:var(--muted);line-height:1.7;">localStorage for progress + code</li>
        </ul>

        <div class="callout">
          Extend it by editing <span class="mono">assets/curriculum.json</span> (add quests, items, bosses, gates).
        </div>
      </div>
    </div>
  `;
}

function wireHomeButtons(){
  const btn = $("#resetProgressBtn");
  if(btn){
    btn.addEventListener("click", ()=>{
      const yes = confirm("Reset all progress AND saved code in this browser?");
      if(!yes) return;
      for(const ch of state.curriculum.chapters){
        for(const l of ch.lessons){ LS.del(keys.codePrefix + l.id); }
      }
      saveProgress({completed:{}, xp:0});
      location.hash = "#/";
      render();
    });
  }
}

function wireProfileButtons(){
  const exp = $("#exportZipBtn");
  if(exp){ exp.addEventListener("click", exportAllZip); }
  const wipe = $("#wipeBtn");
  if(wipe){
    wipe.addEventListener("click", ()=>{
      const yes = confirm("Reset all progress AND saved code in this browser?");
      if(!yes) return;
      for(const ch of state.curriculum.chapters){
        for(const l of ch.lessons){ LS.del(keys.codePrefix + l.id); }
      }
      saveProgress({completed:{}, xp:0});
      render();
    });
  }
}

async function render(){
  state.route = currentRoute();
  setActiveNav(state.route.name === "chapter" || state.route.name === "lesson" ? "home" : state.route.name);

  const app = $("#app");
  if(!app) return;

  if(state.route.name === "home"){
    app.innerHTML = renderMap();
    wireHomeButtons();
    return;
  }
  if(state.route.name === "chapter"){ app.innerHTML = renderChapterPage(state.route.params.id); return; }
  if(state.route.name === "lesson"){
    app.innerHTML = `<div class="card"><div class="card-body">Loading lesson…</div></div>`;
    app.innerHTML = await renderLessonPage(state.route.params.id);
    return;
  }
  if(state.route.name === "dashboard"){ app.innerHTML = renderDashboard(); return; }
  if(state.route.name === "profile"){ app.innerHTML = renderProfile(); wireProfileButtons(); return; }
  if(state.route.name === "about"){ app.innerHTML = renderAbout(); return; }

  app.innerHTML = renderMap();
}

async function boot(){
  await loadCurriculum();
  window.addEventListener("hashchange", render);
  await render();
}

boot().catch(err=>{
  console.error(err);
  const app = document.getElementById("app");
  if(app){
    app.innerHTML = `<div class="card"><div class="card-body">
      <b>Boot error:</b> ${escapeHtml(String(err))}<br/><br/>
      If you're opening this file directly, use GitHub Pages or a local server.
    </div></div>`;
  }
});
