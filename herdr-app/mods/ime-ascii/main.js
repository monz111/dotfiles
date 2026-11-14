// フォーカスするターミナルが変わったら（ペイン移動・新しいターミナル）、入力ソースを英字（ABC）にする。
// Claude Code のペインだけは日本語にする。
// レイアウト my-main の高さ0のブロックに置いて常駐させる。macism（brew install laishulu/homebrew/macism）が要る。

import { View, div } from "gpui-kit";
import { exec, focused, panes } from "herdr";

const ABC = "com.apple.keylayout.ABC";
const JA = "com.apple.inputmethod.Kotoeri.RomajiTyping.Japanese";

export default class ImeAscii extends View {
  init(_props, cx) {
    let last = focused()?.terminal ?? null;
    // shortcut: 250msごとのポーリング。フォーカス変化のイベントがherdrに来たら置き換える
    cx.spawn(async (cx) => {
      for (;;) {
        await cx.sleep(250);
        const now = focused()?.terminal ?? null;
        if (now && now !== last) exec("macism", [panes().find((p) => p.terminal === now)?.app === "claude-code" ? JA : ABC]).catch(() => {}); // 未インストールでも落とさない
        last = now;
      }
    });
  }

  render() {
    return div();
  }
}
