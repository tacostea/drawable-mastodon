# drawable-mastodon
UserScript changes the left pane of mastodon drawable

# 一言で
左のカラムたためるやつ

# つかいかた
## キー操作
- M(Minimize)キー：縮小と展開のトグルキーです。
- N(New)キー：ドロワ縮小時に、ドロワを展開してToot入力欄にフォーカスします。
- S(Search)キー：ドロワ縮小時に、ドロワを展開して検索欄にフォーカスします。

## その他
- 自動ドロワ縮小機能
> チェックボックスにチェックを入れておくと、次回ページロード以降はCtrl+EnterでTootした時に自動でドロワが縮小されます。
- 縮小状態はリロードしても保持されます
> localstorageを使って縮小/展開状態を保存しているので、リロードしても大丈夫…なはず。
- 実は
> どこにフォーカスしていてもCtrl+Enterで縮小します。Mキー要らんくね？

# 注意
何か問題があったらissueやmastodon経由で教えてください。再現できる問題なら対応します。基本的にWindows上のChromeで動作確認してます。その他のブラウザでもWindows/Linuxで動作するものには適宜対応します。

# gist時代のリリースログ
```
v0.11: input/textareaにフォーカスしている時にはキー入力に反応しないようにしました。
v0.12: Toot内容の入力欄を監視することで、返信やDM送信をクリックした時に展開されるようにしました。少し重いかも。
v0.13: localstorageから状態値を読み込めていなかったので修正。
v0.14: keyupのリスナを暴走しづらくしました。
v0.15: TL等から返信等の操作をした時のフォーカスとtextareaの高さを調整しました。
v0.20: 自動ドロワ縮小機能を追加しました。
v0.21: しょーもないバグを修正しました。
v0.22: 前回のtoot内容を保持し続けないように修正しました。
v0.23: 縮小時に返信等で展開しないバグを修正しました。誰か作者の頭も直してください。
v0.24: 自動縮小後に展開される問題を修正しました。
```
