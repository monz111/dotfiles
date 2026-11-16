// Read-only viewer for one file, opened beside a pane: pane.split {direction, mod: "file-view", props: { file }}.
import { View, div } from "gpui-kit";
import { v_flex, h_flex, Editor, EditorState } from "gpui-base";
import { props, readTextFile, theme, settings } from "herdr";

const LANG = { ts: "js", tsx: "js", mts: "js", cts: "js", jsx: "js", mjs: "js", toml: "yaml", jsonc: "json", svelte: "html", vue: "html" };

export default class FileView extends View {
  init(_props, cx) {
    this.file = props()?.file;
    if (!this.file) { this.error = "ファイルの指定がありません"; return; }
    cx.spawn(async cx => {
      try {
        const text = await readTextFile(this.file);
        if (text === null) this.error = "ファイルがありません";
        else if (text.includes("\0")) this.error = "バイナリファイルは表示できません";
        else {
          const t = theme(), name = this.file.split("/").pop(), ext = name.includes(".") ? name.split(".").pop() : "txt";
          this.code = EditorState.new({ language: LANG[ext] ?? ext, readonly: true,
            value: text.length > 400000 ? text.slice(0, 400000) + "\n… (以降は省略)" : text,
            font_family: settings().font_family, font_size: 12,
            syntax: { keyword: t.ansi5, string: t.ansi2, comment: t.dim, function: t.ansi4, type: t.ansi3, number: t.ansi1, constant: t.ansi6 } });
        }
      } catch { this.error = "読み込めません（大きすぎる、または読み取り不可）"; }
      finally { cx.notify(); }
    });
  }

  close() { this.code?.release(); }

  render(cx) {
    const t = theme();
    return v_flex().id("file-view").size_full().min_h(0).rounded(10).overflow_hidden().bg(t.background).border_1().border_color(t.border).text_color(t.foreground).text_size(13)
      .child(h_flex().h(36).flex_none().px(12).gap(8).items_center().border_b(1).border_color(t.border)
        .child(div().font_semibold().flex_none().child(this.file?.split("/").pop() ?? ""))
        .child(div().flex_1().min_w(0).truncate().text_right().text_size(11).text_color(t.dim).child(this.file ?? "")))
      .child(this.code ? Editor.new(this.code).flex_1().min_h(0) : div().p(12).text_color(t.dim).child(this.error || "読み込み中…"));
  }
}
