[_tb_system_call storage=system/_title_screen.ks]


;==============================
; タイトル画面
;==============================


[hidemenubutton]

[tb_clear_images]

[tb_keyconfig  flag="0"  ]

;標準のメッセージレイヤを非表示


[tb_hide_message_window  ]

;タイトル表示


[bg  storage="Image.jpg"  ]
[tb_image_show  time="0"  storage="default/title.png"  width="408"  height="272"  x="477"  y="78"  _clickable_img=""  ]
*title

[glink  color="black"  text="はじめから"  x="75"  y="370"  size="20"  target="*start"  ]
[glink  color="black"  text="つづきから"  x="75"  y="470"  size="20"  target="*load"  ]
[s  ]

;-------ボタンが押されたときの処理


*start

[showmenubutton]

[cm  ]
[tb_keyconfig  flag="1"  ]
[tb_image_hide  time="0"  ]
[jump  storage="opening.ks"  target=""  ]
[s  ]

;--------ロードが押された時の処理


*load

[cm  ]
[showload]

[jump  target="*title"  storage="opening.ks"  ]
[s  ]
