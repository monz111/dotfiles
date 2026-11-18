# herdr-appの知見

herdr-app（`~/.config/herdr-app`）のレイアウト、テーマ、modを作るときに得た知見。
herdrが起動のたびに書き直す`~/.config/herdr-app/AGENTS.md`と`*.d.ts`には書かれていない、試してわかったことを残す。

## このフォルダの扱い

- 自分で作ったレイアウト、テーマ、modはこのフォルダ（`~/dotfiles/herdr-app`）に置き、`~/.config/herdr-app`からシンボリックリンクを張る。リンクは`~/dotfiles/ln.sh`にまとめる。
- herdrに同梱のmod（`agents`、`spaces`、`pane`など）は直接編集しない。複製して名前を変え、レイアウトの`content.mod`を複製に向ける。複製には、元になったmodを冒頭のコメントに書く。herdrの更新で元のmodが変わっても複製には反映されないため。

## 変更の反映と確認

- シンボリックリンクの先のレイアウトのファイルを編集しても、herdrは読み直さない。`herdr-app do layout.switch --name main`で一度ほかのレイアウトに切り替えてから、元のレイアウトに戻す。
- herdrの起動後に張ったmodのシンボリックリンクは、リンクの先のファイルを編集しても、動いているmodが新しいコードに替わらないことがある（`~/Projects/mine/claude-chat`で確認。起動前からあるリンクとの違いが原因と推測しているが、未確認）。`herdr-app check`が通り、`herdr-app status`にエラーがなくても、古いコードのまま動き続ける。レイアウトを一度切り替えて戻すと、新しいコードで始め直す。新しいコードで動いているか怪しいときは、一時的にファイルへ値を書くコードを入れて確かめる。
- シンボリックリンクにしたmodのフォルダの中の画像（`svg("mods/<name>/x.svg")`）は表示されないことがある（`claude-chat`で確認）。アイコンは、herdrのhomeの実フォルダ（例：`~/.config/herdr-app/claude-chat-icons/`）に写して、そのパスで指す。`wtr-desk`も同じやり方。
  - `mods/`の外の画像は、同じ名前のファイルを上書きしても、herdrは一度読んだものを表示し続ける（`spaces-cards`で確認）。中身を変えたらファイル名も変える。
- `herdr-app shot`は最後に描いた画面を保存するだけ。herdrのウィンドウが後ろにあると描き直されず、古い画面が撮れることがある。撮る前に`osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`で、herdrが前にあるか確かめる。
- `herdr-app check <modのフォルダ>`は最初の描画しか試さない。Spacesの一覧のように後から描く部分で起きる実行時のエラーは見逃す。modを直したら、毎回`herdr-app shot`で撮った画面も見る。エラーは、そのブロックに「This view could not be rendered」と表示される。
- `herdr-app shot`はアプリの描画だけを撮る。ウィンドウの透過やブラーで後ろに見えるデスクトップは写らないため、透過の確認には使えない。
- 撮った画面の画素の色を読むときは、PILが入っていなくても、PNGを`zlib`で展開すれば読める（切り出し、拡大、画素の色の取得）。

## 背景と透過

- `settings.json`の`window_opacity`と`window_blur`は、テーマの色の名前（`canvas`、`chrome`、`surface`、`background`）で塗った背景にだけ効く。
- レイアウトやmodで`#rrggbb`やグラデーションを直接書いた背景は、書いたとおり不透明に塗られ、透過やブラーが消える。窓全体の背景やペインの背景は、テーマの色の名前で指定する。
- 色を付けたい場合は、`#rrggbbaa`の半透明の色にする（例：サイドバーのグラデーション`["#2a3f7a55", "#00000000"]`）。
- 同梱のサイドバーのmodは、自分の背景を`bg(t.chrome)`で塗っている。レイアウトのサイドバーに付けたグラデーションを見せたいなら、複製したmodからこの`bg`を外す。

## modの描画（GPUI）の制約

- `div().bg()`は単色しか受け付けない。`gpui-kit.d.ts`には`Background.linear_gradient`があるが、`bg()`に渡すと実行時に「unsupported argument type; expected null, boolean, number, string or function」となる。
- 行の高さを自分で測る`list`は、`track_scroll`が効かず、コードからスクロールさせられない（`scroll_to_bottom`を呼んでも動かない）。チャットのように一番下へ送りたい一覧は、高さを渡す`v_virtual_list`にし、まだ測っていない行を見えない層（`invisible()`）で描いて`on_size_change`で高さを測ってから、`scroll_to_bottom`を呼ぶ（`checksheet-review`と`claude-chat`のmod）。
- 影は`shadow_sm`、`shadow_md`、`shadow_lg`などのプリセットだけ。影の大きさや色は自由に決められない。
- 角丸の半径は、要素の高さの半分までに縮む。高さ1pxの帯に`rounded(8)`を付けても、角はほぼ四角になる。
- 絵文字は、文字の枠を縦横中央にそろえても、絵が左に約1px、上に約0.5pxずれる（16pxの絵文字で測った）。アイコンの中央に置くときは、絵文字を`div().ml(2).mt(1)`で包んでずらす（`spaces-cards`）。

## 立体感のあるアイコン（Codee3風）の作り方

実装は`mods/spaces-cards`、`mods/agents-cards`、`mods/pane-cards`、`mods/repo-launcher`（`ui.js`）の`gloss()`。
4つのmodに同じ関数を複製して持たせている。直すときは4つとも直す。ただし`pane-cards`だけは、ペインの見出しのアイコンの下が汚れて見えたため、影を描かない。横長の「Needs You」の印は、`gloss()`では高さが角丸の3倍に満たず上の角が小さくなるため、`agents-cards`と`pane-cards`の`pill()`で描く。

Codee3（https://www.codee3.dev）のアイコンを画素単位で測ると、次の作りになっていた（30pxの緑のアイコンの場合）。

- 上の縁の1px：明るいハイライト
- 本体：元の色を白に約16%寄せた色から、黒に約13%寄せた色へ、上から下になめらかに変わる
- 下の縁の1px：暗い線
- 右へ行くほど、全体が1割弱暗くなる
- 下に4px程度の影。すぐ下が背景より約12%暗く、4pxで消える
- 角丸の半径は、アイコンの大きさの約30%（30pxなら9px）

`bg()`でグラデーションを塗れないため、1pxごとに色を変えた板（絶対配置の`div`）を重ねて描く。
ただし角丸の半径は板の高さの半分までに縮むので、小さい板を角の部分に使うと角が四角くなる。
そこで、行の位置で3通りに描き分ける（`size`はアイコンの大きさ、`r`は角丸の半径）。

1. 下の角の`r`行：上端から各行までの高い板を、暗い色（下の行）から順に重ねる。どの板も背が高いので角丸が保たれ、下の角は最初の板の角になる。
2. 上の角の`r`行：各行から「下端の`r`行手前」までの板を、上の行から順に重ねる。上の角は最初の板の角になる。
3. 真ん中の行：高さ1pxの角丸なしの帯を重ねる。左右はまっすぐな辺なので角の問題はない。

板の角の切り欠きから下の板の色がのぞくが、隣の行の色なので見分けがつかない。
そのほかの効果も、同じく板を重ねて付ける。

- 上下の縁：アイコンと同じ大きさの透明な板に、`border_t(1)`や`border_b(1)`だけを付けて重ねる。要素の`border`は子要素の下に描かれ、色の板に隠れてしまうため。
- 右へ行くほど暗くする：右端にそろえた半透明の黒（`#00000007`）の板を、左端の位置をずらして4枚重ねる。重なった枚数ぶん暗くなる。
- 影：半透明の黒（`#00000009`）の角丸の板を、1px〜4px下にずらして4枚、色の板より先に重ねる。アイコンの外にはみ出した部分だけが影として見える。下ほど重なる枚数が減るので、外へ向かって薄くなる。

アイコン1つにつき約40個の`div`を描く。数個のアイコンなら問題ない見込み（測ってはいない）。
長い一覧の各行に使うなら、重さを確かめる。

## 色をmodの間でそろえる

- mod同士は互いのコードを読めない。値をそろえるときは、共有の状態（`shared()` / `setShared()`）を使う。
- 例：`spaces-cards`が、Cmd+P（repo-launcher）で設定したスペースの色を`space.tileBg`（スペースのIDから色への対応）に書き、`agents-cards`と`pane-cards`がそれを読む。
- Cmd+Pで設定した絵文字と色は、`shared("repo-launcher.settings")`の`emojis`と`tileColors`にある。キーはリポジトリのパスで、Linux以外では小文字にする。読み方は`spaces-tiles`の`launcherTile()`を参照。
