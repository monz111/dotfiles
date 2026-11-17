// workspace-chrome（herdr同梱）のfooterを複製。Settingsはアイコンだけにし、Add machineは外した。
import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { theme, run, updates } from "herdr";

export default class SidebarFooter extends View {
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
