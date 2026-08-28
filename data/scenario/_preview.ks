[_tb_system_call storage=system/_preview.ks ]

[mask time=10]
[mask_off time=10]
[iscript]
/* ============================================================
   TyranoSimpleRhythm v4 - iscript コンポーネント用エントリーポイント

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

    /* ────────────────────────────────────────────────────────
       ゲーム設定
       ── SE 設定 (v4 新設) ────────────────────────────────
         seVolume     : SE 全体音量 0.0〜1.0 (既定 0.8)
         sePerfect    : PERFECT 判定 SE ファイルパス
         seGood       : GOOD 判定 SE ファイルパス
         seMiss       : MISS 判定 SE ファイルパス
         seEmpty      : 空振り SE ファイルパス
         sePause      : ポーズ SE ファイルパス
         seResume     : 再開 SE ファイルパス
         seFullcombo  : フルコンボ達成 SE ファイルパス
         seAllperfect : AP 達成 SE ファイルパス

         ※ 各パスを空文字にすると Web Audio 合成音を使用。
            例: sePerfect: "data/sound/se_perfect.ogg"
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
        returnTarget:    "*rhythm_after",
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

    /* chart.js を先に読み込む */
    window._TSR_CHART = null;
    var chartReq = new XMLHttpRequest();
    chartReq.open("GET", "data/others/chart.js", false);
    chartReq.send(null);
    if (chartReq.status === 0 || chartReq.status === 200) {
        eval(chartReq.responseText); // jshint ignore:line
    }

    /* rhythm.js を読み込んで実行 */
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
