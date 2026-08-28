/* =============================================================
   TyranoSimpleRhythm - rhythm.js  v7
   配置先: data/others/rhythm.js

   v7 変更点 (v6 からの差分):
     - delaying フラグ / beginGame() / ブロック処理をすべて削除
     - startDelayMs は playMusic() の呼び出しを遅らせるだけ
       ゲーム本体 (ノーツ・入力・ポーズ) は START 直後から動作
   ============================================================= */
(function () {
    "use strict";

    if (window.TyranoSimpleRhythm && typeof window.TyranoSimpleRhythm.destroy === "function") {
        window.TyranoSimpleRhythm.destroy({ resume: false });
    }

    var kag = window._TSR_KAG || (window.TYRANO && window.TYRANO.kag ? window.TYRANO.kag : null);
    if (!kag) { console.error("TyranoSimpleRhythm: kag を取得できません。"); return; }

    /* ─── デフォルト CONFIG ──────────────────────────────────── */
    var CONFIG = {
        laneCount:       4,
        keys:            ["d", "f", "j", "k"],
        keyLabels:       ["D", "F", "J", "K"],
        noteColors:      ["#ff5c8a", "#56c8ff", "#ffd45c", "#9c7cff"],
        bpm:             80,
        beatCount:       48,
        beatsPerNote:    1,
        approachMs:      1800,
        judgeYPercent:   82,
        perfectMs:       80,
        goodMs:          150,
        missMs:          220,
        countdownMs:     1800,
        noteHeight:      24,
        scorePerfect:    1000,
        scoreGood:       500,
        enableMetronome: true,
        musicFile:       "",
        musicLoop:       true,
        bgImage:         "",
        returnStorage:   "",
        returnTarget:    "*rhythm_after",
        startDelayMs:    1800,
        seVolume:        0.8,
        sePerfect:       "",
        seGood:          "",
        seMiss:          "",
        seEmpty:         "",
        sePause:         "",
        seResume:        "",
        seFullcombo:     "",
        seAllperfect:    ""
    };

    var overrides = window._TSR_CONFIG || {};
    for (var _k in overrides) {
        if (Object.prototype.hasOwnProperty.call(overrides, _k)) CONFIG[_k] = overrides[_k];
    }

    /* ─── CSS リンク ─────────────────────────────────────────── */
    if (!document.getElementById("tsr-style-link")) {
        var lnk = document.createElement("link");
        lnk.id = "tsr-style-link"; lnk.rel = "stylesheet";
        lnk.href = "data/others/tsr-style.css";
        document.head.appendChild(lnk);
    }

    /* ─── CONFIG 正規化 ──────────────────────────────────────── */
    CONFIG.laneCount    = Math.max(1, Math.min(8, Math.floor(Number(CONFIG.laneCount)    || 4)));
    CONFIG.bpm          = Math.max(1,             Number(CONFIG.bpm)                      || 120);
    CONFIG.beatCount    = Math.max(1,             Number(CONFIG.beatCount)                || 48);
    CONFIG.beatsPerNote = Math.max(0.125,         Number(CONFIG.beatsPerNote)             || 1);
    CONFIG.approachMs   = Math.max(100,           Number(CONFIG.approachMs)               || 1800);
    CONFIG.perfectMs    = Math.max(0,             Number(CONFIG.perfectMs)                || 80);
    CONFIG.goodMs       = Math.max(CONFIG.perfectMs, Number(CONFIG.goodMs)               || 150);
    CONFIG.missMs       = Math.max(CONFIG.goodMs, Number(CONFIG.missMs)                  || 220);
    CONFIG.startDelayMs = Math.max(0,             Number(CONFIG.startDelayMs)            || 0);

    var beatMs = 60000 / CONFIG.bpm;

    /* ─── BGM ────────────────────────────────────────────────── */
    var audioEl = null;
    if (CONFIG.musicFile) {
        audioEl         = document.createElement("audio");
        audioEl.src     = String(CONFIG.musicFile);
        audioEl.loop    = !!CONFIG.musicLoop;
        audioEl.preload = "auto";
        audioEl.load();
    }
    var musicDelayId = 0;   /* startDelayMs 用タイマー ID */
    function playMusic() {
        if (audioEl) { audioEl.currentTime = 0; audioEl.play().catch(function () {}); }
    }
    function pauseMusic()  { if (audioEl) audioEl.pause(); }
    function resumeMusic() { if (audioEl) audioEl.play().catch(function () {}); }
    function stopMusic()   {
        clearTimeout(musicDelayId); musicDelayId = 0;
        if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
    }

    /* ─── SE ─────────────────────────────────────────────────── */
    var seVol = Math.min(1, Math.max(0, parseFloat(CONFIG.seVolume) || 0.8));
    var sePathMap = {
        perfect:    String(CONFIG.sePerfect    || ""),
        good:       String(CONFIG.seGood       || ""),
        miss:       String(CONFIG.seMiss       || ""),
        empty:      String(CONFIG.seEmpty      || ""),
        pause:      String(CONFIG.sePause      || ""),
        resume:     String(CONFIG.seResume     || ""),
        fullcombo:  String(CONFIG.seFullcombo  || ""),
        allperfect: String(CONFIG.seAllperfect || "")
    };
    var seAudioCache = {};
    (function () {
        var types = ["perfect", "good", "miss", "empty", "pause", "resume", "fullcombo", "allperfect"];
        for (var i = 0; i < types.length; i++) {
            var path = sePathMap[types[i]];
            if (path && !seAudioCache[path]) {
                var el = document.createElement("audio");
                el.src = path; el.preload = "auto"; el.load();
                seAudioCache[path] = el;
            }
        }
    }());
    function playFileSE(path) {
        if (!path || !seAudioCache[path]) return false;
        var clone = seAudioCache[path].cloneNode();
        clone.volume = seVol; clone.play().catch(function () {}); return true;
    }
    var audioCtx = null;
    function synthTone(freq, startOffset, dur, oscType, vol) {
        if (!audioCtx || audioCtx.state === "closed") return;
        var t = audioCtx.currentTime + startOffset;
        var osc = audioCtx.createOscillator(), g = audioCtx.createGain();
        osc.type = oscType || "sine"; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol * seVol, t + 0.010);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + dur + 0.025);
    }
    var SE_SYNTH = {
        perfect: function () {
            synthTone(1046.5, 0, 0.13, "sine", 0.28);
            synthTone(1318.5, 0.07, 0.13, "sine", 0.28);
        },
        good:  function () { synthTone(784, 0, 0.15, "sine", 0.24); },
        miss:  function () {
            if (!audioCtx || audioCtx.state === "closed") return;
            var t = audioCtx.currentTime;
            var osc = audioCtx.createOscillator(), g = audioCtx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.20);
            g.gain.setValueAtTime(0.20 * seVol, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.25);
        },
        empty:  function () { synthTone(300, 0, 0.04, "sine", 0.06); },
        pause:  function () {
            synthTone(659, 0, 0.09, "sine", 0.18);
            synthTone(523, 0.08, 0.09, "sine", 0.18);
        },
        resume: function () {
            synthTone(523, 0, 0.09, "sine", 0.18);
            synthTone(659, 0.08, 0.09, "sine", 0.20);
        },
        fullcombo: function () {
            var seq = [523.25, 659.25, 783.99, 1046.50];
            for (var i = 0; i < seq.length; i++) synthTone(seq[i], i * 0.085, 0.18, "sine", 0.30);
        },
        allperfect: function () {
            var seq = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            for (var i = 0; i < seq.length; i++) synthTone(seq[i], i * 0.075, 0.22, "triangle", 0.33);
        }
    };
    function playSE(type) {
        var path = sePathMap[type] || "";
        if (path && playFileSE(path)) return;
        if (SE_SYNTH[type]) SE_SYNTH[type]();
    }

    /* ─── DOM 構築 ───────────────────────────────────────────── */
    var root = document.createElement("div");
    root.id  = "tsr-root";
    if (CONFIG.bgImage) {
        root.style.backgroundImage    = "url(" + String(CONFIG.bgImage) + ")";
        root.style.backgroundSize     = "cover";
        root.style.backgroundPosition = "center";
        root.style.backgroundRepeat   = "no-repeat";
    }
    root.innerHTML =
        (CONFIG.bgImage ? '<div id="tsr-bg-dim"></div>' : "") +
        '<div id="tsr-hud">' +
            '<div>SCORE <span id="tsr-score">0</span></div>' +
            '<div>COMBO <span id="tsr-combo">0</span></div>' +
            '<div id="tsr-hud-btns">' +
                '<button id="tsr-pause-btn" class="tsr-ctrl-btn">|| PAUSE</button>' +
            '</div>' +
        '</div>' +
        '<div id="tsr-playfield"><div id="tsr-judge-line"></div></div>' +
        '<div id="tsr-judge"></div>' +
        '<div id="tsr-pause-overlay">' +
            '<div id="tsr-pause-panel">' +
                '<h2>PAUSED</h2>' +
                '<button id="tsr-resume-btn" class="tsr-button primary">RESUME</button>' +
                '<button id="tsr-quit-btn"   class="tsr-button danger">QUIT</button>' +
            '</div>' +
        '</div>' +
        '<div id="tsr-overlay"><div id="tsr-panel"></div></div>';
    document.body.appendChild(root);

    var playfield    = root.querySelector("#tsr-playfield");
    var overlay      = root.querySelector("#tsr-overlay");
    var panel        = root.querySelector("#tsr-panel");
    var scoreEl      = root.querySelector("#tsr-score");
    var comboEl      = root.querySelector("#tsr-combo");
    var judgeEl      = root.querySelector("#tsr-judge");
    var hudBtns      = root.querySelector("#tsr-hud-btns");
    var pauseOverlay = root.querySelector("#tsr-pause-overlay");

    var lanes          = [];
    var timeouts       = new Set();
    var normalizedKeys = CONFIG.keys.slice(0, CONFIG.laneCount).map(function (k) {
        return String(k).toLowerCase();
    });

    var notes      = [];
    var running    = false;
    var paused     = false;
    var destroyed  = false;
    var returning  = false;
    var quitEarly  = false;
    var startTime  = 0, pausedAt = 0;
    var animationId = 0, score = 0, combo = 0, maxCombo = 0;
    var perfect = 0, good = 0, miss = 0, nextClickBeat = 0;
    var judgeAnimation = null;
    var totalDuration  = 0;

    function later(fn, ms) {
        var id = window.setTimeout(function () { timeouts.delete(id); fn(); }, ms);
        timeouts.add(id); return id;
    }

    /* ─── 判定 ───────────────────────────────────────────────── */
    function hitLane(index) {
        if (!running || paused || destroyed) return;
        var lane = lanes[index];
        if (lane) {
            lane.classList.add("active");
            later(function () { lane.classList.remove("active"); }, 80);
        }
        var now = performance.now() - startTime;
        var target = null, smallest = Infinity;
        for (var _i = 0; _i < notes.length; _i++) {
            var n = notes[_i];
            if (n.judged || n.lane !== index) continue;
            var diff = Math.abs(now - n.time);
            if (diff < smallest) { smallest = diff; target = n; }
        }
        if (!target || smallest > CONFIG.missMs) {
            combo = 0; updateHud(); showJudge("EMPTY", "#aaa"); playSE("empty"); return;
        }
        applyJudge(target, smallest <= CONFIG.perfectMs ? "PERFECT" : "GOOD");
    }

    /* ─── レーン DOM ─────────────────────────────────────────── */
    for (var i = 0; i < CONFIG.laneCount; i++) {
        (function (idx) {
            var lane = document.createElement("div");
            lane.className = "tsr-lane";
            var keyDiv = document.createElement("div");
            keyDiv.className = "tsr-key";
            keyDiv.textContent = String(CONFIG.keyLabels[idx] || CONFIG.keys[idx] || idx + 1);
            lane.appendChild(keyDiv);
            lane.addEventListener("pointerdown", function (e) { e.preventDefault(); hitLane(idx); });
            playfield.appendChild(lane);
            lanes.push(lane);
        }(i));
    }

    /* ─── キーボード ─────────────────────────────────────────── */
    function keydown(e) {
        if (e.repeat) return;
        if (e.key === "Escape") {
            if (running && !paused) { e.preventDefault(); doPause();  return; }
            if (running &&  paused) { e.preventDefault(); doResume(); return; }
        }
        if (!running || paused) return;
        var index = normalizedKeys.indexOf(String(e.key || "").toLowerCase());
        if (index >= 0) { e.preventDefault(); e.stopPropagation(); hitLane(index); }
    }
    window.addEventListener("keydown", keydown, { passive: false, capture: true });

    /* ─── 譜面生成 ───────────────────────────────────────────── */
    function makeChart() {
        var rawChart = window._TSR_CHART;
        if (rawChart && rawChart.length > 0) {
            var chart = [];
            for (var _i = 0; _i < rawChart.length; _i++) {
                var entry = rawChart[_i];
                var lane  = Math.floor(Math.abs(Number(entry.lane) || 0)) % CONFIG.laneCount;
                var time;
                if (entry.beat !== undefined && entry.beat !== null) {
                    time = CONFIG.countdownMs + Number(entry.beat) * beatMs;
                } else if (entry.ms !== undefined && entry.ms !== null) {
                    time = CONFIG.countdownMs + Number(entry.ms);
                } else { continue; }
                chart.push({ lane: lane, time: time });
            }
            chart.sort(function (a, b) { return a.time - b.time; });
            totalDuration = chart.length > 0
                ? chart[chart.length - 1].time - CONFIG.countdownMs + beatMs * 4 : 0;
            return chart;
        }
        var autoChart = [], autoLane = 0;
        for (var beat = 0; beat < CONFIG.beatCount; beat += CONFIG.beatsPerNote) {
            autoLane = (autoLane + ((Math.round(beat / CONFIG.beatsPerNote) % 7 === 6) ? 2 : 1)) % CONFIG.laneCount;
            autoChart.push({ lane: autoLane, time: CONFIG.countdownMs + beat * beatMs });
        }
        totalDuration = CONFIG.beatCount * beatMs;
        return autoChart;
    }

    function clearNotes() {
        for (var _i = 0; _i < notes.length; _i++) { if (notes[_i].el) notes[_i].el.remove(); }
        notes = [];
    }
    function createNotes() {
        clearNotes(); var chart = makeChart(); notes = [];
        for (var _i = 0; _i < chart.length; _i++) {
            var data = chart[_i], el = document.createElement("div");
            var color = CONFIG.noteColors[data.lane % CONFIG.noteColors.length] || "#fff";
            el.className = "tsr-note"; el.style.background = color; el.style.color = color;
            lanes[data.lane].appendChild(el);
            notes.push({ lane: data.lane, time: data.time, judged: false, el: el });
        }
    }

    /* ─── HUD / 判定表示 ─────────────────────────────────────── */
    function updateHud() { scoreEl.textContent = String(score); comboEl.textContent = String(combo); }
    function showJudge(text, color) {
        judgeEl.textContent = text; judgeEl.style.color = color; judgeEl.style.opacity = "1";
        if (judgeAnimation) { try { judgeAnimation.cancel(); } catch (_) {} }
        if (judgeEl.animate) {
            judgeAnimation = judgeEl.animate([
                { transform: "translate(-50%,-50%) scale(1.18)", opacity: 1 },
                { transform: "translate(-50%,-50%) scale(1)",    opacity: 0 }
            ], { duration: 420, fill: "forwards" });
        } else {
            later(function () { judgeEl.style.opacity = "0"; }, 420);
        }
    }
    function applyJudge(note, type) {
        if (!note || note.judged) return;
        note.judged = true; if (note.el) note.el.remove();
        if (type === "PERFECT") {
            perfect++; combo++; score += CONFIG.scorePerfect; showJudge(type, "#ffe66d"); playSE("perfect");
        } else if (type === "GOOD") {
            good++; combo++; score += CONFIG.scoreGood; showJudge(type, "#65d8ff"); playSE("good");
        } else {
            miss++; combo = 0; showJudge("MISS", "#ff6688"); playSE("miss");
        }
        maxCombo = Math.max(maxCombo, combo); updateHud();
    }

    /* ─── メトロノーム ───────────────────────────────────────── */
    function clickSound(strong) {
        if (!CONFIG.enableMetronome || !audioCtx || audioCtx.state === "closed") return;
        var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.frequency.value = strong ? 880 : 660;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.045);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }
    var metronomeBeats = [];
    function buildMetronomeBeats() {
        metronomeBeats = []; var idx = 0;
        while (CONFIG.countdownMs + idx * beatMs < CONFIG.countdownMs + totalDuration + 500) {
            metronomeBeats.push(CONFIG.countdownMs + idx * beatMs); idx++;
        }
    }

    /* ─── メインループ ───────────────────────────────────────── */
    function frame() {
        if (!running || paused || destroyed) return;
        var now    = performance.now() - startTime;
        var judgeY = root.clientHeight * CONFIG.judgeYPercent / 100;
        var startY = -CONFIG.noteHeight - 10;
        while (nextClickBeat < metronomeBeats.length && now >= metronomeBeats[nextClickBeat]) {
            clickSound(nextClickBeat % 4 === 0); nextClickBeat++;
        }
        for (var _i = 0; _i < notes.length; _i++) {
            var note = notes[_i];
            if (note.judged) continue;
            var progress = 1 - ((note.time - now) / CONFIG.approachMs);
            note.el.style.transform = "translateY(" + (startY + (judgeY - startY) * progress) + "px)";
            if (now - note.time > CONFIG.missMs) applyJudge(note, "MISS");
        }
        if (now > CONFIG.countdownMs + totalDuration + CONFIG.missMs + 500) { finish(); return; }
        animationId = requestAnimationFrame(frame);
    }

    /* ─── ポーズ ─────────────────────────────────────────────── */
    function doPause() {
        if (!running || paused || destroyed) return;
        paused = true; pausedAt = performance.now();
        cancelAnimationFrame(animationId);
        pauseMusic(); playSE("pause");
        pauseOverlay.style.display = "flex";
    }
    function doResume() {
        if (!running || !paused || destroyed) return;
        paused = false;
        startTime += performance.now() - pausedAt;
        pauseOverlay.style.display = "none";
        playSE("resume"); resumeMusic();
        animationId = requestAnimationFrame(frame);
    }

    /* ─── START ──────────────────────────────────────────────── */
    function start() {
        if (running || destroyed) return;

        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC && (!audioCtx || audioCtx.state === "closed")) audioCtx = new AC();
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(function () {});

        score = combo = maxCombo = perfect = good = miss = nextClickBeat = 0;
        quitEarly = false;
        updateHud();
        createNotes(); buildMetronomeBeats();
        overlay.style.display      = "none";
        pauseOverlay.style.display = "none";
        hudBtns.style.display      = "flex";

        running   = true;
        startTime = performance.now();
        animationId = requestAnimationFrame(frame);

        /* 曲だけ startDelayMs 後に開始 */
        musicDelayId = window.setTimeout(playMusic, CONFIG.startDelayMs);
    }

    /* ─── 結果保存 ───────────────────────────────────────────── */
    function saveResult(rate) {
        var vars = kag.stat.f || kag.stat.fvars || (kag.variable && kag.variable.f);
        if (!vars) return;
        vars.rhythm_score      = score;
        vars.rhythm_rate       = rate;
        vars.rhythm_max_combo  = maxCombo;
        vars.rhythm_perfect    = perfect;
        vars.rhythm_good       = good;
        vars.rhythm_miss       = miss;
        vars.rhythm_fullcombo  = (miss === 0) ? 1 : 0;
        vars.rhythm_allperfect = (miss === 0 && good === 0) ? 1 : 0;
    }

    /* ─── リザルト ───────────────────────────────────────────── */
    function finish() {
        if (!running) return;
        running = false; paused = false;
        cancelAnimationFrame(animationId);
        stopMusic();
        hudBtns.style.display      = "none";
        pauseOverlay.style.display = "none";

        var maxScore = notes.length * CONFIG.scorePerfect;
        var rate     = maxScore ? Math.round(score / maxScore * 100) : 0;
        saveResult(rate);

        if (!quitEarly) {
            if (miss === 0 && good === 0) { later(function () { playSE("allperfect"); }, 350); }
            else if (miss === 0)          { later(function () { playSE("fullcombo");  }, 350); }
        }

        var bonusText = "";
        if (miss === 0 && good === 0) bonusText = "<br><b style=\"color:#ffe66d\">ALL PERFECT!!</b>";
        else if (miss === 0)          bonusText = "<br><b style=\"color:#65d8ff\">FULL COMBO!</b>";

        panel.innerHTML =
            "<h2>RESULT</h2>" +
            "<p>SCORE: <b>" + score + "</b> / RATE: <b>" + rate + "%</b>" + bonusText + "<br>" +
            "PERFECT " + perfect + "\u3000GOOD " + good + "\u3000MISS " + miss + "<br>" +
            "MAX COMBO: <b>" + maxCombo + "</b></p>" +
            "<button id=\"tsr-retry\" class=\"tsr-button\">\u3082\u3046\u4e00\u5ea6</button>" +
            "<button id=\"tsr-close\" class=\"tsr-button primary\">\u30b7\u30ca\u30ea\u30aa\u3078</button>";
        overlay.style.display = "flex";
        root.querySelector("#tsr-retry").onclick = function () { clearNotes(); start(); };
        root.querySelector("#tsr-close").onclick = returnToScenario;
    }

    /* ─── クリーンアップ ─────────────────────────────────────── */
    function cleanup() {
        running = false; paused = false;
        cancelAnimationFrame(animationId);
        window.removeEventListener("keydown", keydown, { capture: true });
        timeouts.forEach(function (id) { clearTimeout(id); }); timeouts.clear();
        clearNotes(); stopMusic();
        if (audioEl) { audioEl.src = ""; audioEl = null; }
        for (var p in seAudioCache) { if (seAudioCache[p]) seAudioCache[p].src = ""; }
        if (judgeAnimation) { try { judgeAnimation.cancel(); } catch (_) {} judgeAnimation = null; }
        var closePromise = (audioCtx && audioCtx.state !== "closed")
            ? audioCtx.close().catch(function () {}) : Promise.resolve();
        audioCtx = null;
        if (root.parentNode) root.remove();
        return closePromise;
    }

    function destroy(options) {
        if (destroyed) return Promise.resolve();
        destroyed = true;
        var resume = !!(options && options.resume);
        return cleanup().then(function () {
            window.TyranoSimpleRhythm = null;
            if (resume) jumpToReturn();
        });
    }

    function jumpToReturn() {
        kag.stat.is_strong_stop = false; kag.stat.is_stop = false;
        var storage = String(CONFIG.returnStorage || "");
        var target  = String(CONFIG.returnTarget  || "*rhythm_after");
        window.setTimeout(function () {
            if (kag.ftag && typeof kag.ftag.nextOrderWithLabel === "function") {
                kag.ftag.nextOrderWithLabel(target, storage);
            } else if (kag.ftag && typeof kag.ftag.startTag === "function") {
                kag.ftag.startTag("jump", { storage: storage, target: target });
            } else {
                console.error("TyranoSimpleRhythm: kag.ftag が見つかりません。");
            }
        }, 30);
    }

    function returnToScenario() {
        if (returning || destroyed) return;
        returning = true;
        var btn = root.querySelector("#tsr-close");
        if (btn) btn.disabled = true;
        destroy({ resume: true });
    }

    /* ─── ボタンイベント ─────────────────────────────────────── */
    root.querySelector("#tsr-pause-btn").onclick  = doPause;
    root.querySelector("#tsr-resume-btn").onclick = doResume;
    root.querySelector("#tsr-quit-btn").onclick   = function () {
        if (!running) return;
        quitEarly = true; paused = false;
        pauseOverlay.style.display = "none"; finish();
    };

    /* ─── タイトル画面 ───────────────────────────────────────── */
    var labelText = CONFIG.keyLabels.slice(0, CONFIG.laneCount).join(" / ");
    panel.innerHTML =
        "<h2>RHYTHM GAME</h2>" +
        "<p>\u30ce\u30fc\u30c8\u304c\u767d\u3044\u7dda\u306b\u91cd\u306a\u3063\u305f\u77ac\u9593\u306b\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002<br>" +
        "PC\u30ad\u30fc: <b>" + labelText + "</b><br>" +
        "Esc \u30ad\u30fc: \u30dd\u30fc\u30ba</p>" +
        "<button id=\"tsr-start\" class=\"tsr-button primary\">START</button>";
    root.querySelector("#tsr-start").onclick = start;

    window.TyranoSimpleRhythm = {
        start: start, pause: doPause, resume: doResume,
        finish: finish, destroy: destroy, config: CONFIG
    };
}());
