// cmd-w (keys.json "mod.open:close-guard") の代わりの pane.close。
// フォーカス中のペインが Claude Code なら、確認してから閉じる。それ以外はすぐ閉じる。
// pane.close には確認のオプションがないため、mod を挟む。

import { View, div, svg, image } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { run, props, closeOverlay, focused, panes, theme } from "herdr";

const tint = (color, alpha) => (/^#[0-9a-f]{6}$/i.test(color || "") ? color + alpha : color);
const HOME = /^\/Users\/[^/]+/;

export default class CloseGuard extends View {
  init(_props, cx) {
    const id = props()?.overlay;
    if (!id) return; // mod.open 以外（herdr-app check など）で読み込まれたときは何もしない
    const pane = focused()?.pane;
    this.info = pane && panes().find((p) => p.pane === pane);
    if (this.info?.app !== "claude-code") {
      closeOverlay(id);
      return run("pane.close", pane ? { pane } : {}); // pane がないのはレイアウトのターミナルブロックなど。もとの cmd-w と同じ動き
    }
    this.handle = cx.focus_handle();
    this.handle.focus();
  }

  // close という名前は herdr が overlay を閉じるときの後片付けフックとして cx 付きで呼ぶので使わない
  decide(yes) {
    closeOverlay(props().overlay);
    if (yes) run("pane.close", { pane: this.info.pane });
  }

  render() {
    if (!this.info) return div();
    const t = theme(), p = this.info, prog = p.program;
    const working = p.status === "working";
    const glyph = !prog?.icon ? div() : prog.tint ? svg(prog.icon).size(24).text_color(prog.color ?? "#ffffff") : image(prog.icon).size(24);
    const kbd = (label, fg) => div().px(6).py(1).rounded(5).border_1().border_color(tint(fg, "40")).text_size(11).text_color(tint(fg, "b0")).child(label);
    const button = (id, label, key, bg, fg, border, yes) => h_flex().id(id).h(34).px(14).gap(10).items_center().rounded(9)
      .bg(bg).border_1().border_color(border).text_color(fg).font_semibold().cursor_pointer()
      .hover((s) => s.opacity(0.85)).on_click(() => this.decide(yes)).child(label).child(kbd(key, fg));
    const where = [(p.cwd ?? "").replace(HOME, "~"), p.branch].filter(Boolean).join("  ·  ");
    return v_flex().id("close-guard").track_focus(this.handle)
      .on_key_down((e, cx) => {
        // Enter で閉じない: 入力中の Enter が確定に化けると、誤って閉じるのを防ぐという目的が崩れる
        if (e.key === "y") this.decide(true);
        else if (e.key === "escape" || e.key === "enter") this.decide(false);
        else return;
        cx.stop_propagation();
      })
      .size_full().p(20).gap(16).rounded(14).bg(t.popover).border_1().border_color(tint(t.foreground, "1a")).shadow_2xl().text_size(13)
      .child(h_flex().gap(14).items_center()
        .child(h_flex().size(44).flex_none().rounded(12).items_center().justify_center().bg(prog?.tile ?? t.raised).border_1().border_color(tint("#ffffff", "14")).child(glyph))
        .child(v_flex().flex_1().min_w(0).gap(4)
          .child(div().text_size(15).font_semibold().text_color(t.foreground).child("Claude Code を閉じますか？"))
          .child(div().text_size(12).text_color(t.dim).truncate().child(where || p.title))))
      .child(h_flex().gap(8).items_center().px(12).py(8).rounded(9).bg(tint(working ? t.ansi3 : t.ansi1, "1c"))
        .child(div().size(6).rounded(3).bg(working ? t.ansi3 : t.ansi1))
        .child(div().text_size(12).text_color(t.muted).child(working ? "作業中です。閉じると止まり、会話も終わります。" : "閉じるとセッションが終わります。")))
      .child(h_flex().justify_end().gap(8).text_size(12)
        .child(button("no", "やめる", "Esc / ↵", "#00000000", t.foreground, tint(t.foreground, "26"), false))
        .child(button("yes", "閉じる", "Y", t.ansi1, "#ffffff", t.ansi1, true)));
  }
}
