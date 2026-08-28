[_tb_system_call storage=system/_scene1.ks]

[iscript]
/* ============================================================
TyranoSimpleRhythm v2 - iscript コンポーネント用エントリーポイント
このファイルの内容をそのまま iscript コンポーネントに貼る。
ゲームロジックはすべて data/others/rhythm.js に分離済み。
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
CONFIG: このブロックの値を変更してゲームをカスタマイズ。
musicFile  : BGM ファイルパス (空文字で無音)
例 -> "data/bgm/bgm001.ogg"
musicLoop  : true=ループ / false=1回のみ
bgImage    : 背景画像パス (空文字でグラデーション背景)
例 -> "data/image/bg_rhythm.jpg"
returnTarget: 終了後にジャンプするラベル名
laneCount / bpm / beatCount 等は rhythm.js のデフォルト値を使用。
変更したい場合はここに追記する (例: bpm: 140)
──────────────────────────────────────────────────────── */
window._TSR_CONFIG = {
bpm:             120,
beatCount:       48,
beatsPerNote:    1,
approachMs:      1800,
judgeYPercent:   82,
perfectMs:       80,
goodMs:          150,
missMs:          220,
countdownMs:     1800,
scorePerfect:    1000,
scoreGood:       500,
enableMetronome: true,
musicFile:       "data/bgm/music.ogg",
musicLoop:       true,
bgImage:         "",
returnStorage:   "",
returnTarget:    "*rhythm_after"
};
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

