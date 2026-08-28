[_tb_system_call storage=system/_scene1.ks]

[iscript]
/* ============================================================
   TyranoSimpleRhythm v3 - iscript コンポーネント用エントリーポイント

   このファイルの内容をそのまま iscript コンポーネントに貼る。
   【重要】このファイルに [ ] バッククォート 日本語コードを
           追加しないこと (KSパーサーの誤認識防止)。
   ============================================================ */
(function () {
    "use strict";

    var kag = window.TYRANO && window.TYRANO.kag ? window.TYRANO.kag : null;
    if (!kag) { return; }

    kag.stat.is_strong_stop = true;
    kag.stat.is_stop = true;
    window._TSR_KAG = kag;

    /* ── ゲーム設定 ─────────────────────────────────────────
       keys / keyLabels / noteColors など配列設定は
       rhythm.js のデフォルト値を使用。
       変更したい場合は rhythm.js の CONFIG を直接編集する。
    ──────────────────────────────────────────────────────── */
    window._TSR_CONFIG = {
        bpm:             120,
        approachMs:      1800,
        judgeYPercent:   82,
        perfectMs:       80,
        goodMs:          150,
        missMs:          220,
        countdownMs:     1800,
        scorePerfect:    1000,
        scoreGood:       500,
        enableMetronome: true,
        musicFile:       "",
        musicLoop:       true,
        bgImage:         "",
        returnStorage:   "",
        returnTarget:    "*rhythm_after"
    };

    /* ── chart.js を先に読み込む (ノーツ配置定義) ──────────
       chart.js が存在しない場合は自動生成モードで動作する。
    ──────────────────────────────────────────────────────── */
    window._TSR_CHART = null;
    var chartReq = new XMLHttpRequest();
    chartReq.open("GET", "data/others/chart.js", false);
    chartReq.send(null);
    if (chartReq.status === 0 || chartReq.status === 200) {
        eval(chartReq.responseText); // jshint ignore:line
    }

    /* ── rhythm.js を読み込んで実行 ─────────────────────── */
    var req = new XMLHttpRequest();
    req.open("GET", "data/others/rhythm.js", false);
    req.send(null);
    if (req.status === 0 || req.status === 200) {
        eval(req.responseText); // jshint ignore:line
    } else {
        console.error("TyranoSimpleRhythm: rhythm.js load failed, status=" + req.status);
    }
}());

[endscript]

*rhythm_after

[jump  storage="scene1.ks"  target="*rhythm_after"  ]
