[_tb_system_call storage=system/_test_scene.ks]

[iscript]
/* ============================================================
TyranoSimpleRhythm - iscript コンポーネント用エントリーポイント
【重要】このファイルの内容をそのまま iscript コンポーネントに貼る。
複雑なゲームロジックはすべて data/others/rhythm.js に分離済み。
ポイント: このファイルには [ ] バッククォート 日本語コードを
一切含まない。これが KSパーサー誤認識の防止策。
============================================================ */
(function () {
"use strict";
/* kag 参照を取得（ftag の存在は rhythm.js 側で使用直前にチェック）*/
var kag = window.TYRANO && window.TYRANO.kag ? window.TYRANO.kag : null;
if (!kag) { return; }
/* iscript 終了後に次へ進まないよう停止 */
kag.stat.is_strong_stop = true;
kag.stat.is_stop = true;
/* rhythm.js へ kag 参照を渡す */
window._TSR_KAG = kag;
/* ゲーム設定の上書き（配列設定は rhythm.js のデフォルト値を使用）*/
/* keys / keyLabels / noteColors を変えたい場合は rhythm.js を直接編集 */
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
returnStorage:   "",
returnTarget:    "*rhythm_after"
};
/* rhythm.js を XHR 同期読み込みして実行                    */
/* NW.js ローカルファイルでは status===0 が正常終了を意味する */
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

