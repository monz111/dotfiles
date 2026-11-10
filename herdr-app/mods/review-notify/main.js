import { View, div, image } from "gpui-kit";
import { v_flex, h_flex, TextView } from "gpui-base";
import { props, closeOverlay, theme, home, readTextFile, exec, shared, setShared } from "herdr";

// リポジトリのアイコンは、Repo Launcher（cmd-p）で設定した絵文字と色のタイル。
// mod は別の mod のファイルを import できないので、mods/repo-launcher の ui.js（PALETTE・hash・repoColor・
// hexHueLight・letterTile）と store.js（repoEmoji・repoTileColor）、scan.js（pathKey）から写した。向こうを変えたら合わせる。
const PALETTE = ["#22a99a", "#e3814f", "#5b8def", "#8b7cf6", "#3fae6a", "#d9649a"];
function hash(text) {
  let h = 2166136261;
  for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
const repoColor = (name) => PALETTE[hash(name.toLowerCase()) % PALETTE.length];
function lightness(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "");
  if (!m) return 0;
  const v = m.slice(1).map((x) => parseInt(x, 16) / 255);
  return Math.round(((Math.max(...v) + Math.min(...v)) / 2) * 100);
}
function letterTile(name, color, size, emoji = "") {
  const letter = ([...String(name).replace(/^[._-]+/, "")][0] ?? "?").toUpperCase();
  return h_flex().size(size).flex_none().rounded(Math.round(size * 0.28)).items_center().justify_center()
    .bg(color).text_color(lightness(color) > 70 ? "#1a1a1a" : "#ffffff").font_bold().text_size(Math.round(size * (emoji ? 0.56 : 0.44)))
    .child(emoji || letter);
}
// macOS では大文字・小文字を区別しないパスのキー
const launcherSetting = (field, path) => (shared("repo-launcher.settings")?.[field] ?? {})[path.replace(/\/+$/, "").toLowerCase()];

// review-notify のレビュー依頼の一覧を、cmd-r（keys.json "mod.open:review-notify"）のダイアログで見る。
// 一覧と AI レビュー・council の判定は ~/Projects/mine/review-notify/review-notify.py が作り、
// out/board.json に書く。この mod はそれを表示し、Redline のレビュー画面や GitHub を開くだけ。
const DIR = `${home()}/Projects/mine/review-notify`;
const BOARD = `${DIR}/out/board.json`;
const RISKS = [["all", "すべて"], ["低", "リスク 低"], ["中", "リスク 中"], ["高", "リスク 高"], ["none", "記載なし"]];
const riskKey = (pr) => pr.risk ?? "none";

// council の指摘の Accept・Drop は、Redline のレビュー画面と同じ記録に書く（mods/redline/diff.js の findingId・
// acceptFinding・setFindingState）。Accept は GitHub に出す前の保留中のコメントで、送るのは Redline の Submit review。
// 片方を変えたら、もう片方も合わせる。
const findingId = (f) => `${f.path}:${f.side === "old" ? "old" : "new"}:${Number(f.line)}:${String(f.body).slice(0, 80)}`;
const findingsKey = (rv) => `redline.findings.${rv.folder}`;
const draftKey = (pr) => `redline.drafts.${pr.url.replace(/^https:\/\/|\/pull\/\d+$/g, "")}#${pr.number}`;
const findingState = (rv, f) => (shared(findingsKey(rv)) ?? {})[findingId(f)] ?? null;
const shown = (body) => body.split("\n").filter((l) => !l.startsWith("🤖 Reviewed by")).join("\n");

function ago(iso) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (!(s >= 0)) return "";
  return s < 3600 ? `${Math.max(1, Math.round(s / 60))}分前` : s < 86400 ? `${Math.round(s / 3600)}時間前` : `${Math.round(s / 86400)}日前`;
}

export default class Reviews extends View {
  init(_props, cx) {
    this.handle = cx.focus_handle();
    this.text = undefined; this.data = { prs: [] }; this.at = 0; this.risk = "all";
    this.error = null; this.notes = new Map(); this.busy = null;  // notes: PR の URL → そのPRへの操作の結果の文
    this.confirm = null; this.approved = new Set();
    this.handle.focus();
    cx.timer.after(300, () => this.handle.focus());
    this.load(cx);
    this.rebuild(cx);
    // review-notify.py は 1 分ごとに一覧を、AI レビューが 1 件終わるごとに結果を書き直す
    cx.timer.every(5000, (cx) => this.load(cx));
  }

  // 前回集めた一覧から board.json を作り直す（GitHub への問い合わせもレビューもしない）。
  // review-notify.py は平日 9〜17 時しか動かないので、Redline で開いて worktree ができた（Accept・Drop が使える）、
  // Redline で council を実行した、などを、開いたときにすぐ出すため
  rebuild(cx) {
    cx.spawn(async (cx) => {
      try { await exec("/usr/bin/python3", ["-I", `${DIR}/review-notify.py`, "--board"], { timeout: 60000 }); } catch { /* 前の一覧のまま */ }
      this.load(cx);
    });
  }

  close() { closeOverlay(props().overlay); }

  load(cx) {
    cx.spawn(async (cx) => {
      let text = null;
      try { text = await readTextFile(BOARD); } catch { text = null; }
      if (text === this.text) return;
      this.text = text;
      const selected = this.current()?.url;
      try {
        this.data = text ? JSON.parse(text) : { prs: [] };
        this.error = text ? null : `${BOARD} がありません。review-notify.py が一度動くとできます。`;
      } catch (e) { this.error = `board.json を読めません: ${e}`; }
      // 読み直しで PR が増減しても、選んでいた PR を選んだままにする
      const i = this.rows().findIndex((p) => p.url === selected);
      if (i >= 0) this.at = i;
      cx.notify();
    });
  }

  // リスクのタブで絞り、リポジトリごと・新しい PR から並べる
  rows() {
    return this.data.prs.filter((p) => this.risk === "all" || riskKey(p) === this.risk)
      .sort((a, b) => a.repo_name.localeCompare(b.repo_name) || b.number - a.number);
  }

  current() { return this.rows()[this.at] ?? null; }

  move(step, cx) {
    const n = this.rows().length;
    if (n) { this.at = (this.at + step + n) % n; cx.notify(); }
  }

  setRisk(key, cx) { this.risk = key; this.at = 0; cx.notify(); }

  // redline-open.py が Redline の Start review と同じ手順でレビュー画面を開く（もう開いていればそこへ移る）
  openRedline(pr, cx) {
    if (!pr || this.busy) return;
    this.busy = pr.url; this.notes.delete(pr.url); cx.notify();
    cx.spawn(async (cx) => {
      let r = null, failed = null;
      // 失敗（時間切れなど）で例外になっても busy を戻す。戻さないとボタンが押せないままになる
      try {
        r = await exec("/usr/bin/python3", ["-I", `${DIR}/redline-open.py`, `redline://review?url=${encodeURIComponent(pr.url)}`],
          { timeout: 120000 });
      } catch (e) { failed = String(e?.message ?? e); }
      this.busy = null;
      if (r?.code === 0) return this.close();
      this.notes.set(pr.url, failed ?? (r.stderr || r.stdout || `exit ${r.code}`).trim());
      cx.notify();
    });
  }

  setFindingState(rv, f, state) {
    setShared(findingsKey(rv), { ...(shared(findingsKey(rv)) ?? {}), [findingId(f)]: state });
  }

  // 削除行（old）は旧ファイルの行、それ以外は新ファイルの行へのコメントになる（GitHub の LEFT・RIGHT）
  accept(pr, rv, f, cx) {
    const anchor = f.side === "old" ? { path: f.path, kind: "-", old: Number(f.line), new: null }
      : { path: f.path, kind: "+", old: null, new: Number(f.line) };
    const draft = { id: `local-${Date.now()}`, local: true, body: f.body, anchor, head: rv.head };
    setShared(draftKey(pr), [...(shared(draftKey(pr)) ?? []), draft]);
    this.setFindingState(rv, f, "accepted");
    this.notes.set(pr.url, `#${pr.number} の保留中のコメントに追加しました。GitHub に送るのは Redline の Submit review です。`);
    cx.notify();
  }

  // Approve できるのは、今の head のレビュー結果があり、残っている指摘がないとき
  // （指摘なし、または council の指摘がすべて Drop 済み）。保留中のコメントがあれば Redline の Submit review で出す。
  approveBlocker(pr) {
    const rv = pr.review;
    if (this.approved.has(pr.url)) return "Approve 済み";
    if (!rv || rv.error || rv.stale) return "今の head のレビュー結果がありません";
    if ((shared(draftKey(pr)) ?? []).length) return "保留中のコメントがあります（Redline の Submit review で送る）";
    const left = rv.findings.filter((f) => !(rv.source === "council" && rv.folder && findingState(rv, f) === "dropped"));
    if (left.length && rv.source === "council" && !rv.folder) return `指摘が ${left.length} 件あります（Redline で開くと Drop できます）`;
    return left.length ? `Drop していない指摘が ${left.length} 件あります` : null;
  }

  // GitHub の承認は取り消せないので、2 回押して送る
  approve(pr, cx) {
    if (this.approveBlocker(pr) || this.busy) return;
    if (this.confirm !== pr.url) { this.confirm = pr.url; cx.notify(); return; }
    this.confirm = null; this.busy = pr.url; this.approving = true; this.notes.delete(pr.url); cx.notify();
    const repo = pr.url.replace(/^https:\/\/github\.com\/|\/pull\/\d+$/g, "");
    cx.spawn(async (cx) => {
      let r = null;
      // mods/redline/lib.js の cli() と同じく、起動できなかったときだけ次の場所を試す（送信を二重にしない）
      for (const gh of ["gh", "/opt/homebrew/bin/gh", "/usr/local/bin/gh"]) {
        try { r = await exec(gh, ["pr", "review", String(pr.number), "-R", repo, "--approve"], { timeout: 60000 }); } catch { r = null; continue; }
        if (r.code !== 127) break;
      }
      this.busy = null; this.approving = false;
      if (r?.code === 0) { this.approved.add(pr.url); this.notes.set(pr.url, `#${pr.number} を Approve しました。`); }
      else this.notes.set(pr.url, `Approve できませんでした: ${(r?.stderr || r?.stdout || "gh が見つかりません").trim()}`);
      cx.notify();
    });
  }

  // ---- drawing ----

  colors(t) {
    return {
      risk: { 低: t.ansi2, 中: t.ansi3, 高: t.ansi1 },
      ai: { ng: t.ansi1, warn: t.ansi3, ok: t.ansi2 },
      sev: { blocker: t.ansi1, major: t.blocked, minor: t.muted, nit: t.dim, 重大: t.ansi1, 確認: t.ansi3, 提案: t.muted },
    };
  }

  badge(t, text, color) {
    return div().flex_none().px(6).rounded(4).border_1().border_color(color ?? t.border).text_size(10.5)
      .text_color(color ?? t.muted).child(text);
  }

  button(t, id, label, onClick, { primary = false, disabled = false } = {}) {
    return div().id(id).flex_none().h(28).px(12).flex().items_center().rounded(6).text_size(12)
      .when(primary, (e) => e.bg(disabled ? t.raised : t.solid).text_color(disabled ? t.dim : t.solid_foreground))
      .when(!primary, (e) => e.border_1().border_color(t.border).text_color(disabled ? t.dim : t.foreground))
      .when(!disabled, (e) => e.cursor_pointer().hover((s) => s.opacity(0.85)).on_click((_e, cx) => onClick(cx)))
      .child(label);
  }

  // Repo Launcher と同じタイル。リポジトリは ~/Projects/<名前> のクローン
  repoTile(name, size) {
    const path = `${home()}/Projects/${name}`;
    return letterTile(name, launcherSetting("tileColors", path) ?? repoColor(name), size, launcherSetting("emojis", path) ?? "");
  }

  // review-notify.py が大きさ（AVATAR_SIZES: 28・18）ごとに縮めて作った、丸い SVG
  avatar(t, pr, size) {
    return pr.avatar ? image(`${pr.avatar}-${size}.svg`).w(size).h(size).flex_none()
      : div().size(size).flex_none().rounded_full().bg(t.raised);
  }

  // 追加と削除の比率を表す 5 つの四角（HTML 版と同じ）
  blocks(t, pr) {
    return h_flex().gap(2).flex_none().children((pr.blocks ?? []).map((k) => div().size(9).rounded(2)
      .bg(k === "a" ? t.ansi2 : k === "d" ? t.ansi1 : t.raised)));
  }

  stat(t, pr) {
    return h_flex().gap(6).items_center().flex_none()
      .child(div().text_color(t.ansi2).child(`+${pr.additions}`))
      .child(div().text_color(t.ansi1).child(`−${pr.deletions}`))
      .child(this.blocks(t, pr));
  }

  listRow(t, c, pr, i) {
    const sel = i === this.at;
    return h_flex().id(`rn-row-${pr.repo_name}-${pr.number}`).h(52).flex_none().px(10).gap(10).items_center().rounded(7)
      .cursor_pointer().when(sel, (e) => e.bg(t.selected)).hover((s) => s.bg(t.hover))
      .on_click((e, cx) => { this.at = i; cx.notify(); if (e.click_count > 1) this.openRedline(pr, cx); })
      .child(this.avatar(t, pr, 28))
      .child(v_flex().flex_1().min_w(0)
        .child(h_flex().gap(6).min_w(0)
          .child(div().flex_none().text_size(11.5).text_color(t.accent).child(`#${pr.number}`))
          .child(div().flex_1().min_w(0).truncate().text_size(12.5).text_color(t.foreground).child(pr.title)))
        .child(h_flex().gap(8).items_center().min_w(0).text_size(11).text_color(t.dim)
          .child(div().flex_none().child(pr.author))
          .child(this.stat(t, pr))
          .child(div().flex_1().min_w(0).truncate().child(`${ago(pr.created_at)}${pr.reason ? ` · ${pr.reason}` : ""}`))))
      .when(Boolean(pr.risk), (e) => e.child(this.badge(t, `リスク ${pr.risk}`, c.risk[pr.risk])))
      .child(this.badge(t, pr.count ? `${pr.ai_label} ${pr.count}` : pr.ai_label, c.ai[pr.ai]));
  }

  list(t, c) {
    const rows = this.rows(), out = [];
    let repo = null;
    rows.forEach((pr, i) => {
      if (pr.repo_name !== repo) {
        repo = pr.repo_name;
        out.push(h_flex().px(8).pt(10).pb(4).gap(8).items_center().text_size(10.5).text_color(t.dim)
          .child(this.repoTile(repo, 18))
          .child(div().child(`${repo.toUpperCase()} · ${rows.filter((p) => p.repo_name === repo).length}`)));
      }
      out.push(this.listRow(t, c, pr, i));
    });
    return v_flex().id("rn-list").w(460).h_full().flex_none().min_h(0).border_r(1).border_color(t.border)
      .overflow_y_scrollbar().px(6).pb(8).gap(1)
      .children(out)
      .when(!rows.length && !this.error, (e) => e.child(div().p(12).text_color(t.dim).child("レビュー依頼はありません")));
  }

  finding(t, c, pr, rv, f, i) {
    // Accept・Drop は council の指摘だけ。記録先は Redline の worktree（まだなければ、Redline が作る予定の場所。
    // review-notify.py の redline_folder()）なので、Redline を開かなくても押せ、あとで Redline で開くとそのまま見える
    const council = rv.source === "council", can = council && Boolean(rv.folder);
    const state = can ? findingState(rv, f) : null;
    return v_flex().px(12).py(8).gap(4).rounded(8).border_1().border_color(t.border).bg(t.surface)
      .when(Boolean(state), (e) => e.opacity(0.5))
      .child(h_flex().gap(8).items_center().text_size(11)
        .child(this.badge(t, f.severity || "?", c.sev[f.severity]))
        .when(Boolean(f.item), (e) => e.child(div().flex_none().text_color(t.dim).child(f.item)))
        .child(div().id(`rn-loc-${i}`).flex_1().min_w(0).truncate().text_color(t.accent)
          .when(Boolean(f.url), (e) => e.cursor_pointer().on_click((_e, cx) => cx.open_url(f.url)))
          .child(f.loc))
        .when(Boolean(state), (e) => e.child(div().flex_none().text_color(t.dim).child(state)))
        .when(can && !state, (e) => e
          .child(this.button(t, `rn-acc-${i}`, "Accept", (cx) => this.accept(pr, rv, f, cx), { primary: true }))
          .child(this.button(t, `rn-drop-${i}`, "Drop", (cx) => { this.setFindingState(rv, f, "dropped"); cx.notify(); })))
        .when(council && !rv.folder, (e) => e.child(div().flex_none().text_color(t.dim).child("worktree なし"))))
      // id は指摘ごとに変える（位置で付けると、指摘が入れ替わったとき前の本文のまま残るおそれがある）
      .child(div().text_size(12).child(TextView.markdown(`rn-f-${pr.repo_name}-${pr.number}-${rv.head}-${f.path}:${f.line}:${hash(f.body)}`,
        shown(f.body || " "))));
  }

  review(t, c, pr) {
    const rv = pr.review;
    if (!rv) return div().text_size(12).text_color(t.dim).child(pr.ai_label);
    const marks = { ok: ["○", t.ansi2], warn: ["△", t.ansi3], ng: ["×", t.ansi1], na: ["−", t.dim] };
    return v_flex().gap(10)
      .when(Boolean(rv.error), (e) => e.child(div().text_size(12).text_color(t.ansi1).child(rv.error)))
      .when(Boolean(rv.summary), (e) => e.child(div().text_size(12.5).child(rv.summary)))
      .when(!rv.error, (e) => e
        .child(div().pt(4).text_size(11.5).font_semibold().text_color(rv.source === "council" ? t.ansi5 : t.muted)
          .child(`${rv.source === "council" ? "✦ Council findings" : "指摘"} · ${rv.findings.length}件`))
        .children(rv.findings.map((f, i) => this.finding(t, c, pr, rv, f, i)))
        .when(!rv.findings.length, (e) => e.child(div().text_size(12).text_color(t.dim).child("指摘はありません"))))
      .when(Boolean(rv.checks?.length), (e) => e
        .child(div().pt(4).text_size(11.5).font_semibold().text_color(t.muted).child("項目別の判定"))
        .children(rv.checks.map((ck) => h_flex().gap(8).items_start().text_size(12)
          .child(div().w(14).flex_none().text_color(marks[ck.status]?.[1] ?? t.dim).child(marks[ck.status]?.[0] ?? "?"))
          .child(div().w(130).flex_none().child(ck.item))
          .child(div().flex_1().min_w(0).text_color(t.muted).child(ck.note)))));
  }

  detail(t, c) {
    const pr = this.current();
    if (!pr) return div().flex_1();
    const blocker = this.approveBlocker(pr), rv = pr.review;
    // どのレビューの結果か。ヘッダーの PR の情報の横に出す
    const meta = !rv ? "" : rv.source === "council"
      ? `✦ Council · head ${rv.head.slice(0, 7)} · ${rv.where === "redline" ? "Redline で実行" : "review-notify で実行"}`
      : `AIレビュー · head ${rv.head.slice(0, 7)}${rv.stale ? " · 前回の head の結果（再レビュー待ち）" : ""}`;
    return v_flex().flex_1().min_w(0).h_full().min_h(0)
      .child(v_flex().px(18).pt(14).pb(10).gap(6).flex_none().border_b(1).border_color(t.border)
        .child(h_flex().gap(8).items_center()
          .child(this.repoTile(pr.repo_name, 22))
          .child(div().flex_none().text_size(13).text_color(t.accent).child(`#${pr.number}`))
          .child(div().flex_1().min_w(0).truncate().text_size(14).font_semibold().child(pr.title)))
        .child(h_flex().gap(10).items_center().text_size(11.5)
          .child(div().flex_none().text_color(t.dim).child(`${pr.repo_name} · ${pr.branch} · ${pr.changed_files} files`))
          .child(this.stat(t, pr))
          .child(h_flex().gap(6).items_center().flex_none().child(this.avatar(t, pr, 18)).child(div().text_color(t.dim).child(pr.author)))
          .when(Boolean(meta), (e) => e.child(div().flex_1().min_w(0).truncate()
            .text_color(rv.source === "council" ? t.ansi5 : t.muted).child(meta))))
        .child(h_flex().gap(8).pt(4)
          .child(this.button(t, "rn-redline", this.busy === pr.url ? "Opening…" : "Redline で開く ⏎", (cx) => this.openRedline(pr, cx),
            { primary: true, disabled: Boolean(this.busy) }))
          .child(this.button(t, "rn-github", "GitHub o", (cx) => cx.open_url(pr.url)))
          .child(this.button(t, "rn-approve", this.approving && this.busy === pr.url ? "Approving…"
            : this.confirm === pr.url ? "本当に Approve する？" : blocker === "Approve 済み" ? "✓ Approved" : "Approve",
          (cx) => this.approve(pr, cx), { primary: this.confirm === pr.url, disabled: Boolean(blocker) || Boolean(this.busy) }))
          .when(Boolean(blocker) && blocker !== "Approve 済み", (e) => e.child(div().flex_1().min_w(0).truncate().text_size(11)
            .text_color(t.dim).child(blocker)))))
      // そのPRへの操作の結果だけを出す（別のPRに移ると、そのPRのものに変わる）
      .when(this.notes.has(pr.url), (e) => e.child(div().px(18).py(6).text_size(11.5).text_color(t.ansi1).child(this.notes.get(pr.url))))
      .child(div().id("rn-detail").flex_1().min_h(0).overflow_y_scrollbar().px(18).py(12).child(this.review(t, c, pr)));
  }

  render(cx) {
    const t = theme(), c = this.colors(t), prs = this.data.prs;
    if (this.at >= this.rows().length) this.at = Math.max(0, this.rows().length - 1);
    const at = this.data.at ? new Date(this.data.at) : null;
    return v_flex().id("rn-root").track_focus(this.handle).size_full().min_h(0)
      .bg(t.popover).text_size(13).text_color(t.foreground)
      .on_key_down((e, cx) => {
        const k = e.key, m = e.modifiers;
        if (k === "escape") return this.close();
        if (m.control || m.alt || m.platform) return;
        if (k === "j" || k === "down") this.move(1, cx);
        else if (k === "k" || k === "up") this.move(-1, cx);
        else if (k === "enter") this.openRedline(this.current(), cx);
        else if (k === "o" && this.current()) cx.open_url(this.current().url);
        else if (k === "tab") {
          const i = RISKS.findIndex(([key]) => key === this.risk);
          this.setRisk(RISKS[(i + (m.shift ? -1 : 1) + RISKS.length) % RISKS.length][0], cx);
        } else if (k === "r") { this.text = undefined; this.rebuild(cx); }
        else return;
        cx.stop_propagation();
      })
      .child(h_flex().h(44).flex_none().px(16).gap(10).items_center().border_b(1).border_color(t.border).bg(t.chrome)
        .child(div().text_size(14).font_semibold().child("Reviews"))
        .child(div().flex_1().truncate().text_size(12).text_color(t.muted)
          .child(`レビュー依頼 ${prs.length}件${at ? ` · ${at.getMonth() + 1}/${at.getDate()} ${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")} に更新` : ""}`))
        .child(div().text_size(11).text_color(t.dim).child("j/k ⏎ Redline · o GitHub · tab リスク · r · Esc")))
      .child(h_flex().flex_none().px(12).py(8).gap(6).border_b(1).border_color(t.border)
        .children(RISKS.map(([key, label]) => {
          const n = key === "all" ? prs.length : prs.filter((p) => riskKey(p) === key).length, on = this.risk === key;
          return div().id(`rn-risk-${key}`).px(10).py(2).rounded(12).text_size(11.5).border_1()
            .border_color(on ? t.accent : t.border).text_color(on ? t.accent : n ? t.muted : t.dim)
            .when(Boolean(n) || key === "all", (e) => e.cursor_pointer().on_click((_e, cx) => this.setRisk(key, cx)))
            .child(`${label} ${n}`);
        })))
      .when(Boolean(this.error), (e) => e.child(div().px(16).py(6).text_size(11.5).text_color(t.ansi1).child(this.error)))
      .child(h_flex().flex_1().min_h(0).items_start().child(this.list(t, c)).child(this.detail(t, c)));
  }
}
