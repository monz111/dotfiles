// A pane's header, for layouts that frame their panes:
//   { "tab": "active", "pane": { "header": { "content": { "mod": "pane" } } } }
// Shows the program's icon (the app's program table), the agent's name or
// the terminal's title, the folder, and the agent's status; buttons split, zoom and close
// this pane. Props from the app: { pane, terminal }. Click: focus the pane.

import { View, div, svg, image } from "gpui-kit";
// Codee3-style glossy tile, measured from its screenshots: a 1px light rim on top, a
// smooth light-to-dark vertical gradient around the base color, a 1px dark rim at the
// bottom, slightly darker to the right. GPUI divs take only solid colors, so the
// gradient is painted 1px row by row. A layer's corner radius shrinks with its height,
// so the corner rows use tall rounded layers (bottom rows: anchored to the top, darkest
// first; top rows: anchored to the top row, ending where the middle starts), and the
// straight middle rows are plain strips laid over them.
function mix(hex, to, k) {
  const m = /^#([0-9a-f]{6})/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16), t = to === "white" ? 255 : 0;
  return "#" + [16, 8, 0].map((s) => Math.round(((n >> s) & 255) * (1 - k) + t * k).toString(16).padStart(2, "0")).join("");
}
// The "Needs You" badge color: a tone deeper than Codee3's measured #df5f4d, by request.
const NEEDS = "#cf4630";
const gloss = (base, size, r) => {
  const c = (y) => {
    const f = y / (size - 1);
    return f < 0.5 ? mix(base, "white", 0.16 * (1 - 2 * f)) : mix(base, "black", 0.13 * (2 * f - 1));
  };
  const at = () => div().absolute().left(0).right(0);
  // No drop shadow here, unlike spaces-cards/agents-cards: it read as a smudge under the pane header icons.
  const rows = [];
  for (let y = size - 1; y >= size - r; y--) rows.push(at().top(0).h(y + 1).rounded(r).bg(c(y)));
  for (let y = 0; y < r; y++) rows.push(at().top(y).bottom(r).rounded(r).bg(c(y)));
  for (let y = r; y < size - r; y++) rows.push(at().top(y).h(1).bg(c(y)));
  const full = () => div().absolute().top(0).bottom(0).right(0).rounded(r);
  return [
    ...rows,
    ...Array.from({ length: 4 }, (_, k) => full().left(Math.round(size * (0.3 + 0.17 * k))).bg("#00000007")),
    full().left(0).border_t(1).border_color(mix(base, "white", 0.45)),
    full().left(0).border_b(1).border_color(mix(base, "black", 0.35) + "b0"),
  ];
};

// A wide glossy badge ("Needs You"). gloss() can't round it: its corner layers are shorter
// than 2r when size < 3r, and a layer's radius shrinks to half its height. Here one full-height
// layer draws the rounded outline, and 1px rows inset to the curve paint the gradient over it.
const pill = (base, size, r) => {
  const c = (y) => {
    const f = y / (size - 1);
    return f < 0.5 ? mix(base, "white", 0.16 * (1 - 2 * f)) : mix(base, "black", 0.13 * (2 * f - 1));
  };
  const inset = (y) => {
    const d = r - Math.min(y + 0.5, size - y - 0.5);
    return d > 0 ? Math.ceil(r - Math.sqrt(r * r - d * d)) : 0;
  };
  const full = () => div().absolute().top(0).bottom(0).left(0).right(0).rounded(r);
  return [
    full().bg(c(size / 2)),
    ...Array.from({ length: size }, (_, y) => div().absolute().top(y).h(1).left(inset(y)).right(inset(y)).bg(c(y))),
    full().border_t(1).border_color(mix(base, "white", 0.45)),
    full().border_b(1).border_color(mix(base, "black", 0.35) + "b0"),
  ];
};

import { h_flex } from "gpui-base";
import { panes, props, run, theme, home, spaces, shared, terminals } from "herdr";

// Fallback when spaces-cards hasn't published a tile color: same palette and hash as agents-cards.
const TILES = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#14b8a6", "#ec4899", "#eab308"];
const tint = (key) => TILES[[...(key || "")].reduce((h, c) => h + c.codePointAt(0), 0) % TILES.length];

function icon(p, size, color) {
  if (!p?.icon) return null;
  return p.tint ? svg(p.icon).size(size).flex_none().text_color(color) : image(p.icon).w(size).h(size).flex_none();
}

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class Pane extends View {
  init() { this.hovered = false; }

  me() {
    const p = panes().find((p) => p.pane === props()?.pane);
    if (p?.mod !== "claude-chat") return p;
    // A claude-chat Chat pane looks like the Claude Code terminal it shows (parked, so it has no pane).
    // claude-chat labels the terminal with its Chat pane once the pane has had focus; until then it shows as a plain mod.
    const t = terminals().find((x) => x.state === "live" && x.labels?.["claude-chat.pane"] === p.pane);
    return t ? { ...p, program: t.program, title: t.title, cwd: t.cwd, status: t.status, chatOf: t.address } : p;
  }

  button(t, id, icon, command, args) {
    return div()
      .id(id)
      .p(3)
      .rounded(4)
      .text_color(t.dim)
      .hover((s) => s.bg(t.hover).text_color(t.foreground))
      .on_click((_e, cx) => {
        cx.stop_propagation();
        run(command, args);
      })
      .child(svg(`mods/pane/${icon}.svg`).size(14));
  }

  // Claude Code の会話を claude-chat の Chat で出す: 右に Chat のペインを作り、ターミナルはペインから外す
  // （動いたまま。Chat のペインのヘッダーの Screen で戻す）。同じ手順が claude-chat の mod/main.js にもある
  chatButton(t, pane, terminal) {
    return this.textButton(t, `ph-c-${pane}`, "Chat", () => {
      run("pane.split", { pane, direction: "right", mod: "claude-chat", props: { terminal } });
      run("terminal.park", { terminal });
    });
  }

  // Chat のペインをターミナルに戻す：右にターミナルを戻し、出たのを確かめてから Chat のペインを閉じる
  // （先に閉じるとタブが空になって閉じる）。同じ手順が claude-chat の mod/main.js の toScreen にもある
  screenButton(t, pane, terminal) {
    return this.textButton(t, `ph-s-${pane}`, "Screen", (cx) => {
      run("pane.focus", { pane });
      run("terminal.keep", { terminal, place: "right" });
      cx.spawn(async (cx) => {
        for (let i = 0; i < 30 && !panes().some((p) => p.terminal === terminal); i++) await cx.sleep(100);
        if (panes().some((p) => p.terminal === terminal)) run("pane.close", { pane });
      });
    });
  }

  textButton(t, id, label, onClick) {
    return div().id(id).px(6).h(20).flex().items_center().rounded(4)
      .text_size(11).font_semibold().text_color(t.dim)
      .hover((s) => s.bg(t.hover).text_color(t.foreground))
      .on_click((_e, cx) => { cx.stop_propagation(); onClick(cx); })
      .child(label);
  }

  render(cx) {
    const t = theme();
    const p = this.me();
    if (!p) return div();
    const name = ((p.program?.agent || p.program?.shell) && p.program.name) || p.title || p.program?.name || "shell";
    const st = p.status;
    const pane = p.pane;
    // Codee3-style header: a colored tile with the program's icon, then name over folder.
    const space = spaces().find((s) => s.tabs.some((tab) => tab.id === p.tab));
    const tile = p.program?.agent ? shared("space.tileBg")?.[space?.id] ?? tint(space?.name || name) : t.raised;
    return h_flex()
      .id(`pane-head-${pane}`)
      .size_full()
      .px(12)
      .gap(10)
      .items_center()
      .bg(t.surface)
      .border_b(1)
      .border_color(t.border)
      .text_size(12)
      .on_hover((hovered, cx) => { this.hovered = hovered; cx.notify(); })
      .on_click(() => run("pane.focus", { pane }))
      .child(h_flex().size(24).flex_none().rounded(7).relative().children(gloss(tile, 24, 7)).items_center().justify_center()
        .child(icon(p.program, 14, "#ffffff") ?? div().text_size(11).font_bold().text_color("#ffffff").child([...name][0]?.toUpperCase() ?? "?")))
      .child(div().flex_1().min_w(0).flex().flex_col()
        .child(div().truncate().text_size(15).line_height("18px").font_semibold().text_color(t.foreground).child(name))
        .child(div().truncate().line_height("13px").text_size(10.5).text_color(t.dim).child(folder(p.cwd))))
      .when(st === "working", el => el.child(svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900)))
      .when(st === "blocked", el => el.child(h_flex().flex_none().relative().h(16).px(6).rounded(7).items_center().children(pill(NEEDS, 16, 7)).child(div().text_size(10).font_semibold().text_color("#ffffff").child("Needs You"))))
      .when(st === "done", el => el.child(div().size(7).flex_none().rounded(4).bg(t.done)))
      .when(this.hovered && p.app === "claude-code" && Boolean(p.terminal), el => el.child(this.chatButton(t, pane, p.terminal)))
      .when(this.hovered && Boolean(p.chatOf), el => el.child(this.screenButton(t, pane, p.chatOf)))
      .when(this.hovered, el => el
        .child(this.button(t, `ph-r-${pane}`, "split-right", "pane.split", { direction: "right", pane }))
        .child(this.button(t, `ph-d-${pane}`, "split-down", "pane.split", { direction: "down", pane }))
        .child(this.button(t, `ph-z-${pane}`, p.zoomed ? "unzoom" : "zoom", "pane.zoom", { pane }))
        .child(this.button(t, `ph-x-${pane}`, "close", "pane.close", { pane })));
  }
}
