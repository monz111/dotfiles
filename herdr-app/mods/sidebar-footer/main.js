// workspace-chrome（herdr同梱）のfooterを複製。Settingsはアイコンだけにし、Add machineは外した。
import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { theme, run, updates, exec, appHome, watchFolder } from "herdr";

export default class SidebarFooter extends View {
  // mods/ の中のシンボリックリンクの mod は、herdr がリンクの先の保存に気づかず読み込み直さない。
  // リンクの先を見張り、保存されたらリンク自体の時刻を変えて（touch -h）読み込み直させる。どのレイアウトにもあるこの mod で受け持つ。
  // herdr が書き出す型定義（.d.ts・jsconfig.json）と隠しファイルは除く（書き出しのたびに読み込み直すと止まらない）。
  // cx.notify() は、読み込み直したあとに古い版の見張りを終わらせるため（古い版は次に cx を使ったところで止まる）。
  // shortcut: 見張るリンクは起動時と、この mod を読み込み直したときに数える。リンクを足したら、この mod を保存し直す
  init(_props, cx) {
    cx.spawn(async (cx) => {
      const r = await exec("sh", ["-c", 'for l in "$1"/*; do [ -L "$l" ] && [ -d "$l" ] && printf "%s\t%s\n" "$l" "$(cd "$l" && pwd -P)"; done; true', "sh", `${appHome()}/mods`]).catch(() => null);
      for (const line of (r?.stdout ?? "").split("\n").filter(Boolean)) {
        const [link, dir] = line.split("\t");
        cx.spawn(async (cx) => {
          for (;;) {
            const paths = await watchFolder(dir);
            cx.notify();
            if (paths.some((p) => p === dir || !/(\.d\.ts|jsconfig\.json)$|\/\./.test(p))) await exec("touch", ["-h", link]).catch(() => {});
          }
        });
      }
    });
  }

  render() {
    const t = theme();
    const ready = div().size(6).rounded_full().bg(t.accent).absolute().top(5).right(6);
    return h_flex().size_full().bg(t.chrome).border_t(1).border_color(t.border).px(8).items_center()
      .child(h_flex().id("settings").relative().size(28).justify_center().items_center().rounded(8).tooltip("Settings")
        .text_color(t.muted).hover(s => s.bg(t.hover).text_color(t.foreground)).cursor_pointer()
        .on_click(() => run("app.settings")).child(svg("mods/workspace-chrome/settings.svg").size(14))
        .when(Boolean(updates().app.ready), el => el.child(ready)));
  }
}
