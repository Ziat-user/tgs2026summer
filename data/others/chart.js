/* =============================================================
   TyranoSimpleRhythm - chart.js
   配置先: data/others/chart.js

   ノーツ配置をここに記述する。
   rhythm.js が自動的に読み込む。

   ── フォーマット ─────────────────────────────────────────────
   各ノーツは以下のプロパティを持つオブジェクト:

     lane  : レーン番号 (0始まり。4レーンなら 0〜3)
     beat  : 曲開始からのビート数 (小数可)
             例: BPM=120 なら 1beat = 500ms
             例: beat:0 → 1拍目, beat:0.5 → 1拍目の裏拍
             ※ beat と ms のどちらかを指定する
     ms    : 曲開始からの時間(ミリ秒) ※ beat の代わりに使用可

   ── 小節・拍の目安 (BPM=120, 4/4拍子の場合) ─────────────────
     beat  0    = 1小節目 1拍
     beat  1    = 1小節目 2拍
     beat  2    = 1小節目 3拍
     beat  3    = 1小節目 4拍
     beat  4    = 2小節目 1拍
     beat  0.5  = 1小節目 1拍裏 (8分音符)
     beat  0.25 = 1小節目 1拍 (16分音符)
   ──────────────────────────────────────────────────────────── */

window._TSR_CHART = [

    /* === 1小節目 === */
    { lane: 0, beat:  0   },
    { lane: 2, beat:  0.5 },
    { lane: 1, beat:  1   },
    { lane: 3, beat:  1.5 },
    { lane: 0, beat:  2   },
    { lane: 1, beat:  2   },   /* 同時押し */
    { lane: 2, beat:  3   },
    { lane: 3, beat:  3.5 },

    /* === 2小節目 === */
    { lane: 1, beat:  4   },
    { lane: 2, beat:  4.5 },
    { lane: 0, beat:  5   },
    { lane: 3, beat:  5   },   /* 同時押し */
    { lane: 1, beat:  5.5 },
    { lane: 2, beat:  6   },
    { lane: 0, beat:  6.5 },
    { lane: 3, beat:  7   },
    { lane: 1, beat:  7.5 },

    /* === 3小節目 (16分音符トリル) === */
    { lane: 0, beat:  8    },
    { lane: 1, beat:  8.25 },
    { lane: 0, beat:  8.5  },
    { lane: 1, beat:  8.75 },
    { lane: 2, beat:  9    },
    { lane: 3, beat:  9.25 },
    { lane: 2, beat:  9.5  },
    { lane: 3, beat:  9.75 },
    { lane: 0, beat: 10    },
    { lane: 1, beat: 10    },
    { lane: 2, beat: 10    },
    { lane: 3, beat: 10    },   /* 全レーン同時押し */
    { lane: 1, beat: 11    },
    { lane: 2, beat: 11.5  },

    /* === 4小節目 (アウトロ) === */
    { lane: 3, beat: 12   },
    { lane: 2, beat: 12.5 },
    { lane: 1, beat: 13   },
    { lane: 0, beat: 13.5 },
    { lane: 0, beat: 14   },
    { lane: 1, beat: 14   },
    { lane: 2, beat: 14   },
    { lane: 3, beat: 14   },
    { lane: 1, beat: 15   },
    { lane: 2, beat: 15.5 }

];
