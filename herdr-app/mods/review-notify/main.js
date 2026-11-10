import { View, div, image } from "gpui-kit";
import { v_flex, h_flex, TextView } from "gpui-base";
import { props, closeOverlay, theme, home, readTextFile, exec, shared, setShared, notify } from "herdr";

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
const RISKS = [["all", "All"], ["低", "Low"], ["中", "Medium"], ["高", "High"], ["none", "No risk"]];
const RISK_EN = { 低: "Low", 中: "Medium", 高: "High" };
const riskKey = (pr) => pr.risk ?? "none";
// 色を薄く敷く背景（mods/mods-hub/ui.js の tint と同じ）
const tint = (color, alpha = "24") => (/^#[0-9a-f]{6}$/i.test(color || "") ? color + alpha : color);
// 一覧の並び順。s キーかボタンで切り替える。先頭が既定（リポジトリごと・その中でリスクが低い順・レビュー依頼が古い順）
const RISK_RANK = { 低: 0, 中: 1, 高: 2 };  // 記載なしは最後
const byRisk = (a, b) => (RISK_RANK[a.risk] ?? 3) - (RISK_RANK[b.risk] ?? 3);
const requested = (pr) => pr.requested_at ?? pr.created_at;  // 古い board.json には requested_at がない
const byRequested = (a, b) => requested(a).localeCompare(requested(b));
const SORTS = [
  ["repo", "Repo", (a, b) => a.repo_name.localeCompare(b.repo_name) || byRisk(a, b) || byRequested(a, b)],
  ["risk", "Risk", (a, b) => byRisk(a, b) || byRequested(a, b)],
  ["oldest", "Oldest", byRequested],
  ["newest", "Newest", (a, b) => byRequested(b, a)],
];
// review-notify.py が日本語で出す値の、表示用の英語（中身の値は AI への指示でも使うので、表示のときだけ置き換える）
const EN = {
  // 対応待ち・対応済みは、自分がコメントか変更要求をして再レビューの依頼を待っている PR（review-notify.py の WAITING）
  reason: { チーム宛て: "Team", リポジトリ指定: "Watched repo", 対応待ち: "Waiting for author", 対応済み: "Author pushed" },  // 自分宛ては null、Ready for review はそのまま
  item: { 正しさ: "Correctness", 対応漏れ: "Missed changes", デプロイと互換性: "Deploy & compat",
    セキュリティと混入: "Security & leaks", コピー設置: "Copy deploy" },
  severity: { 重大: "Critical", 確認: "Check", 提案: "Suggestion" },
};
const en = (kind, v) => EN[kind][v] ?? v;
// AI の状態（board.json の ai）
const AI_LABELS = { ng: "Needs fixes", warn: "Needs check", ok: "No issues", pending: "Review pending", error: "AI failed", skip: "Skipped" };
const aiLabel = (pr) => (pr.ai === "pending" && pr.review ? "Re-review pending" : AI_LABELS[pr.ai] ?? pr.ai);
// AI レビューしない理由（review-notify.py の skip_reason()）
const SKIP_REASONS = {
  repo: "This repository is excluded from AI review (SKIP_REVIEW_REPOS).",
  sandbox: "Sandbox repository: only Medium / High risk PRs are reviewed, by council.",
  small: "Small change: 5 lines or fewer are not AI reviewed (SMALL_PR_LINES).",
};

// council の指摘の Accept・Drop は、Redline のレビュー画面と同じ記録に書く（mods/redline/diff.js の findingId・
// setFindingState）。Accept はその場で GitHub の行コメントとして投稿する（Redline の保留中のコメントは使わない）。
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
    this.text = undefined; this.data = { prs: [] }; this.at = 0; this.f = 0; this.risk = "all"; this.sort = 0;
    this.error = null; this.notes = new Map(); this.busy = null;  // notes: PR の URL → そのPRへの操作の結果 { text, ok }
    this.confirm = null; this.confirmPost = null; this.posting = false; this.approving = false; this.approved = new Set();
    this.handle.focus();
    cx.timer.after(300, () => this.handle.focus());
    this.load(cx);
    this.rebuild(cx);
    // review-notify.py は 1 分ごとに一覧を、AI レビューが 1 件終わるごとに結果を書き直す
    cx.timer.every(5000, (cx) => this.load(cx));
  }

  // 前回集めた一覧から board.json を作り直す（GitHub への問い合わせもレビューもしない）。
  // review-notify.py は平日 9〜17 時しか動かないので、Redline で開いて worktree ができた（Post・Drop が使える）、
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

  // リスクのタブで絞り、選んだ並び順で並べる
  rows() {
    return this.data.prs.filter((p) => this.risk === "all" || riskKey(p) === this.risk).sort(SORTS[this.sort][2]);
  }

  cycleSort(cx) {
    const url = this.current()?.url;
    this.sort = (this.sort + 1) % SORTS.length;
    this.at = Math.max(0, this.rows().findIndex((p) => p.url === url));
    this.disarm(); cx.notify();
  }

  current() { return this.rows()[this.at] ?? null; }

  // 選ぶ PR が変わるときは、押しかけの「Really …?」を戻す（戻ってきて 1 回押しただけで送らないように）
  disarm() { this.confirm = null; this.confirmPost = null; }

  move(step, cx) {
    const n = this.rows().length;
    if (n) { this.at = (this.at + step + n) % n; this.f = 0; this.disarm(); cx.notify(); }
  }

  // 選んだ PR の AI の指摘の中で、選ぶ指摘を移す
  moveFinding(step, cx) {
    const n = this.current()?.review?.findings?.length ?? 0;
    if (n) { this.f = (this.f + step + n) % n; this.confirmPost = null; cx.notify(); }
  }

  // 選んだ指摘と、その処理状態。Post・Drop・Undo のボタンを出す条件（council で worktree あり）と同じときだけ返す
  picked() {
    const pr = this.current(), rv = pr?.review, f = rv?.findings?.[this.f];
    if (!f || rv.source !== "council" || !rv.folder) return null;
    return { pr, rv, f, state: findingState(rv, f) };
  }

  // キーで Drop したあと、続けて片付けられるように次の未処理の指摘へ移る。
  // 残っていなければ（全部 Drop した、など）summary の見える一番上に戻す
  nextOpen(rv) {
    const n = rv.findings.length;
    for (let d = 1; d < n; d++) {
      const i = (this.f + d) % n;
      if (!findingState(rv, rv.findings[i])) { this.f = i; return; }
    }
    this.f = 0;
  }

  setRisk(key, cx) { this.risk = key; this.at = 0; this.f = 0; this.disarm(); cx.notify(); }

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
      this.notes.set(pr.url, { text: failed ?? (r.stderr || r.stdout || `exit ${r.code}`).trim() });
      cx.notify();
    });
  }

  // Post・Approve の結果は、PR の詳細の行に残し、気づけるようにトーストでも出す（toast mod がなければ行だけ）
  report(pr, title, text, ok) {
    this.notes.set(pr.url, { text, ok });
    const where = `${pr.repo_name} #${pr.number} · ${pr.title}`;
    try { notify({ title, body: ok ? where : `${where}\n${text}`, level: ok ? "success" : "error", timeout: ok ? 5000 : 12000 }); } catch { /* no toast mod */ }
  }

  setFindingState(rv, f, state) {
    setShared(findingsKey(rv), { ...(shared(findingsKey(rv)) ?? {}), [findingId(f)]: state });
  }

  // 削除行（old）は旧ファイルの行、それ以外は新ファイルの行へのコメントになる（GitHub の LEFT・RIGHT）。
  // 送り方は mods/redline/hosting.js の lineComment()・send() と同じ（本文は stdin で渡す）
  // 投稿は取り消せないので、Approve と同じく 2 回押して送る
  accept(pr, rv, f, cx) {
    if (this.busy) return;
    const key = `${pr.url} ${findingId(f)}`;
    if (this.confirmPost !== key) { this.confirmPost = key; cx.notify(); return; }
    this.confirmPost = null; this.busy = pr.url; this.posting = true; this.notes.delete(pr.url); cx.notify();
    const repo = pr.url.replace(/^https:\/\/github\.com\/|\/pull\/\d+$/g, "");
    const payload = { path: f.path, body: f.body, line: Number(f.line), side: f.side === "old" ? "LEFT" : "RIGHT", commit_id: rv.head };
    const script = 'export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"; printf "%s" "$1" | gh api -X POST --input - "$2"';
    cx.spawn(async (cx) => {
      let r = null, failed = null;
      try { r = await exec("sh", ["-c", script, "sh", JSON.stringify(payload), `repos/${repo}/pulls/${pr.number}/comments`], { timeout: 60000 }); }
      catch (e) { failed = String(e?.message ?? e); }
      this.busy = null; this.posting = false;
      if (r?.code === 0) {
        this.setFindingState(rv, f, "accepted");
        this.report(pr, "Comment posted", `Comment posted to #${pr.number}.`, true);
      } else this.report(pr, "Couldn't post the comment", `Couldn't post: ${failed ?? (r.stderr || r.stdout || `exit ${r.code}`).trim()}`, false);
      cx.notify();
    });
  }

  // Approve できるのは、今の head のレビュー結果があり、残っている指摘がないとき
  // （指摘なし、または council の指摘がすべて Drop 済み）。保留中のコメントがあれば Redline の Submit review で出す。
  approveBlocker(pr) {
    const rv = pr.review;
    if (this.approved.has(pr.url)) return "Approved";
    if (!rv || rv.error || rv.stale) return "No review for the current head";
    if ((shared(draftKey(pr)) ?? []).length) return "Pending comments (send with Submit review in Redline)";
    const left = rv.findings.filter((f) => !(rv.source === "council" && rv.folder && findingState(rv, f) === "dropped"));
    if (left.length && rv.source === "council" && !rv.folder) return `${left.length} findings (open in Redline to drop)`;
    return left.length ? `${left.length} findings not dropped` : null;
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
      if (r?.code === 0) { this.approved.add(pr.url); this.report(pr, "Approved", `Approved #${pr.number}.`, true); }
      else this.report(pr, "Couldn't approve", `Couldn't approve: ${(r?.stderr || r?.stdout || "gh not found").trim()}`, false);
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
      .on_click((e, cx) => { if (this.at !== i) { this.disarm(); this.f = 0; } this.at = i; cx.notify(); if (e.click_count > 1) this.openRedline(pr, cx); })
      .child(this.avatar(t, pr, 28))
      .child(v_flex().flex_1().min_w(0)
        .child(h_flex().gap(6).min_w(0)
          .child(div().flex_none().text_size(11.5).text_color(t.accent).child(`#${pr.number}`))
          .child(div().flex_1().min_w(0).truncate().text_size(12.5).text_color(t.foreground).child(pr.title)))
        .child(h_flex().gap(8).items_center().min_w(0).text_size(11).text_color(t.dim)
          .when(Boolean(pr.risk), (e) => e.child(this.riskPill(t, c, pr.risk)))
          .when(this.handled(pr).posted > 0, (e) => e.child(div().flex_none().text_color(t.ansi4).child(`💬 ${this.handled(pr).posted} posted`)))
          .child(div().flex_none().child(pr.author))
          .child(div().flex_1().min_w(0).truncate()
            .child(`${SORTS[this.sort][0] === "repo" ? "" : `${pr.repo_name} · `}${ago(requested(pr))}${pr.reason ? ` · ${en("reason", pr.reason)}` : ""}`))))
      .child(this.aiBadge(t, c, pr));
  }

  // リスクの色を薄く敷いた札
  riskPill(t, c, risk) {
    const color = c.risk[risk] ?? t.dim;
    return div().flex_none().px(8).py(1).rounded_full().bg(tint(color, "33")).text_color(color)
      .text_size(10.5).font_semibold().child(RISK_EN[risk] ?? "No risk");
  }

  // 指摘のうち Post・Drop した件数（記録は Redline の worktree ごとなので、council で worktree があるときだけ）
  handled(pr) {
    const rv = pr.review, n = { posted: 0, dropped: 0 };
    if (rv?.source !== "council" || !rv.folder) return n;
    for (const f of rv.findings) {
      const s = findingState(rv, f);
      if (s === "accepted") n.posted++; else if (s === "dropped") n.dropped++;
    }
    return n;
  }

  // 指摘があれば未処理の件数だけ。片付いたら、Post したものがあれば作者の対応待ち（Waiting）、なければ ✓。
  // AI 対象外は ⊘ だけ、それ以外は AI の状態のラベル
  aiBadge(t, c, pr) {
    if ((pr.ai === "ng" || pr.ai === "warn") && pr.count) {
      const color = c.ai[pr.ai], h = this.handled(pr), left = pr.count - h.posted - h.dropped;
      if (left <= 0) return h.posted ? this.badge(t, "Waiting", t.ansi4)
        : div().flex_none().w(20).text_center().text_size(13).font_bold().text_color(c.ai.ok).child("✓");
      return div().flex_none().min_w(20).h(18).px(6).rounded_full().bg(color).text_color(t.popover)
        .flex().items_center().justify_center().text_size(10.5).font_bold().child(String(left));
    }
    if (pr.ai === "skip") return div().flex_none().w(20).text_center().text_size(14).text_color(t.dim).child("⊘");
    return this.badge(t, aiLabel(pr), c.ai[pr.ai]);
  }

  list(t, c) {
    const rows = this.rows(), out = [];
    let repo = null;
    rows.forEach((pr, i) => {
      // リポジトリの見出しは Repo の並びのときだけ（ほかの並びでは同じリポジトリが離れるので、行にリポジトリ名を出す）
      const grouped = SORTS[this.sort][0] === "repo";
      // 行と行の間の区切り線（見出しの直後には入れない）
      if (i > 0 && !(grouped && pr.repo_name !== repo)) out.push(div().h(1).flex_none().mx(10).bg(t.border));
      if (!grouped) return out.push(this.listRow(t, c, pr, i));
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
    // Post・Drop は council の指摘だけ。記録先は Redline の worktree（まだなければ、Redline が作る予定の場所。
    // review-notify.py の redline_folder()）なので、Redline を開かなくても押せ、あとで Redline で開くとそのまま見える
    const council = rv.source === "council", can = council && Boolean(rv.folder);
    const state = can ? findingState(rv, f) : null;
    return v_flex().px(12).py(8).gap(4).rounded(8).border_1().border_color(i === this.f ? t.accent : t.border).bg(t.surface)
      .when(Boolean(state), (e) => e.opacity(0.5))
      .child(h_flex().gap(8).items_center().text_size(11)
        .child(this.badge(t, en("severity", f.severity) || "?", c.sev[f.severity]))
        .when(Boolean(f.item), (e) => e.child(div().flex_none().text_color(t.dim).child(en("item", f.item))))
        .child(div().id(`rn-loc-${i}`).flex_1().min_w(0).truncate().text_color(t.accent)
          .when(Boolean(f.url), (e) => e.cursor_pointer().on_click((_e, cx) => cx.open_url(f.url)))
          .child(f.loc))
        .when(Boolean(state), (e) => e.child(div().flex_none().text_color(t.dim).child(state)))
        // Drop は GitHub に何も送っていないので、取り消して未処理に戻せる（Post は投稿済みなので戻さない）
        .when(state === "dropped", (e) => e.child(this.button(t, `rn-undo-${i}`, "Undo",
          (cx) => { this.setFindingState(rv, f, null); cx.notify(); })))
        .when(can && !state, (e) => e
          .child(this.button(t, `rn-acc-${i}`, this.posting && this.busy === pr.url ? "Posting…"
            : this.confirmPost === `${pr.url} ${findingId(f)}` ? "Really post?" : "Post",
          (cx) => this.accept(pr, rv, f, cx), { primary: true, disabled: Boolean(this.busy) }))
          .child(this.button(t, `rn-drop-${i}`, "Drop", (cx) => { this.setFindingState(rv, f, "dropped"); cx.notify(); })))
        .when(council && !rv.folder, (e) => e.child(div().flex_none().text_color(t.dim).child("No worktree"))))
      // id は指摘ごとに変える（位置で付けると、指摘が入れ替わったとき前の本文のまま残るおそれがある）
      .child(div().text_size(12).child(TextView.markdown(`rn-f-${pr.repo_name}-${pr.number}-${rv.head}-${f.path}:${f.line}:${hash(f.body)}`,
        shown(f.body || " "))));
  }

  review(t, c, pr) {
    const rv = pr.review;
    if (!rv && pr.ai === "skip") return this.skipped(t, pr);
    if (!rv) return div().text_size(12).text_color(t.dim).child(aiLabel(pr));
    const marks = { ok: ["○", t.ansi2], warn: ["△", t.ansi3], ng: ["×", t.ansi1], na: ["−", t.dim] };
    return v_flex().gap(10)
      .when(Boolean(rv.error), (e) => e.child(div().text_size(12).text_color(t.ansi1).child(rv.error)))
      .when(Boolean(rv.summary) && !this.f, (e) => e.child(div().text_size(12.5).child(rv.summary)))
      .when(!rv.error, (e) => e
        .child(div().pt(4).text_size(11.5).font_semibold().text_color(rv.source === "council" ? t.ansi5 : t.muted)
          .child(`${rv.source === "council" ? "✦ Council findings" : "Findings"} · ${rv.findings.length}`))
        .when(this.f > 0, (e) => e.child(div().text_size(11.5).text_color(t.dim).child(`↑ ${this.f} earlier (k)`)))
        .children(rv.findings.map((f, i) => i < this.f ? null : this.finding(t, c, pr, rv, f, i)).filter(Boolean))
        .when(!rv.findings.length, (e) => e.child(div().text_size(12).text_color(t.dim).child("No findings"))))
      .when(Boolean(rv.checks?.length), (e) => e
        .child(div().pt(4).text_size(11.5).font_semibold().text_color(t.muted).child("Checks"))
        .children(rv.checks.map((ck) => h_flex().gap(8).items_start().text_size(12)
          .child(div().w(14).flex_none().text_color(marks[ck.status]?.[1] ?? t.dim).child(marks[ck.status]?.[0] ?? "?"))
          .child(div().w(130).flex_none().child(en("item", ck.item)))
          .child(div().flex_1().min_w(0).text_color(t.muted).child(ck.note)))));
  }

  // AI レビューしない PR。理由と、自分で見るときの手がかりを出す
  skipped(t, pr) {
    const fact = (label, value) => h_flex().gap(10).text_size(12)
      .child(div().w(90).flex_none().text_color(t.dim).child(label)).child(div().flex_1().min_w(0).child(value));
    return v_flex().gap(14).p(16).rounded(10).border_1().border_color(t.border).bg(t.surface)
      .child(h_flex().gap(12).items_center()
        .child(div().size(40).flex_none().rounded_full().bg(t.raised).flex().items_center().justify_center()
          .text_size(22).text_color(t.muted).child("⊘"))
        .child(v_flex().gap(2).min_w(0)
          .child(div().text_size(14).font_semibold().child("AI review skipped"))
          .child(div().text_size(12).text_color(t.muted).child(SKIP_REASONS[pr.skip_reason] ?? "This PR is not AI reviewed."))))
      .child(v_flex().gap(6).pt(10).border_t(1).border_color(t.border)
        .child(fact("Changes", h_flex().gap(8).items_center().child(this.stat(t, pr))
          .child(div().text_color(t.dim).child(`${pr.changed_files} files`))))
        .child(fact("Risk", RISK_EN[pr.risk] ?? "Not stated"))
        .child(fact("Requested", `${ago(requested(pr))}${pr.reason ? ` · ${en("reason", pr.reason)}` : ""}`)))
      .child(div().text_size(11.5).text_color(t.dim).child("Review it yourself: Open in Redline (⏎) or GitHub (o)."));
  }

  detail(t, c) {
    const pr = this.current();
    if (!pr) return div().flex_1();
    const blocker = this.approveBlocker(pr), rv = pr.review;
    // どのレビューの結果か。ヘッダーの PR の情報の横に出す
    const meta = !rv ? "" : rv.source === "council"
      ? `✦ Council · head ${rv.head.slice(0, 7)}`
      : `AI review · head ${rv.head.slice(0, 7)}${rv.stale ? " · previous head (re-review pending)" : ""}`;
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
          .child(this.button(t, "rn-redline", this.busy === pr.url && !this.posting && !this.approving ? "Opening…" : "Open in Redline ⏎", (cx) => this.openRedline(pr, cx),
            { primary: true, disabled: Boolean(this.busy) }))
          .child(this.button(t, "rn-github", "GitHub o", (cx) => cx.open_url(pr.url)))
          .child(this.button(t, "rn-approve", this.approving && this.busy === pr.url ? "Approving…"
            : this.confirm === pr.url ? "Really approve?" : blocker === "Approved" ? "✓ Approved" : "Approve",
          (cx) => this.approve(pr, cx), { primary: this.confirm === pr.url, disabled: Boolean(blocker) || Boolean(this.busy) }))
          .when(Boolean(blocker) && blocker !== "Approved", (e) => e.child(div().flex_1().min_w(0).truncate().text_size(11)
            .text_color(t.dim).child(blocker)))))
      // そのPRへの操作の結果だけを出す（別のPRに移ると、そのPRのものに変わる）
      .when(this.notes.has(pr.url), (e) => {
        const n = this.notes.get(pr.url), col = n.ok ? t.ansi2 : t.ansi1;
        return e.child(h_flex().mx(18).mt(8).px(12).py(8).gap(8).items_center().rounded(8)
          .border_1().border_color(col).bg(t.surface).text_size(12.5)
          .child(div().flex_none().font_semibold().text_color(col).child(n.ok ? "✓" : "✕"))
          .child(div().flex_1().min_w(0).text_color(n.ok ? t.foreground : col).child(n.text)));
      })
      // 普通のスクロール領域はコードから動かせないので、PR か選んだ指摘が変わったら id を変えて先頭に戻し、選んだ指摘より前は畳む
      .child(div().id(`rn-detail-${pr.url}-${this.f}`).flex_1().min_h(0).overflow_y_scrollbar().px(18).py(12).child(this.review(t, c, pr)));
  }

  render(cx) {
    const t = theme(), c = this.colors(t), prs = this.data.prs;
    if (this.at >= this.rows().length) this.at = Math.max(0, this.rows().length - 1);
    // 更新日時は JST で出す（UTC に 9 時間足して UTC として読む）
    const at = this.data.at ? new Date(Date.parse(this.data.at) + 9 * 3600 * 1000) : null;
    const pad = (n) => String(n).padStart(2, "0");
    return v_flex().id("rn-root").track_focus(this.handle).size_full().min_h(0)
      .bg(t.popover).text_size(13).text_color(t.foreground)
      .on_key_down((e, cx) => {
        const k = e.key, m = e.modifiers;
        if (k === "escape") return this.close();
        if (m.control || m.alt || m.platform) return;
        // shift-j/k は PR、j/k は AI の指摘を移す（shift 付きの key は "J" で来ることもある）
        const lk = k.toLowerCase();
        if (lk === "j" || k === "down") m.shift ? this.move(1, cx) : this.moveFinding(1, cx);
        else if (lk === "k" || k === "up") m.shift ? this.move(-1, cx) : this.moveFinding(-1, cx);
        else if (k === "p" || k === "d" || k === "u") {
          const s = this.picked();
          if (k === "p" && s && !s.state) this.accept(s.pr, s.rv, s.f, cx);
          else if (k === "d" && s && !s.state) { this.setFindingState(s.rv, s.f, "dropped"); this.nextOpen(s.rv); cx.notify(); }
          else if (k === "u" && s?.state === "dropped") { this.setFindingState(s.rv, s.f, null); cx.notify(); }
        } else if (k === "enter") this.openRedline(this.current(), cx);
        else if (k === "o" && this.current()) cx.open_url(this.current().url);
        else if (k === "tab") {
          const i = RISKS.findIndex(([key]) => key === this.risk);
          this.setRisk(RISKS[(i + (m.shift ? -1 : 1) + RISKS.length) % RISKS.length][0], cx);
        } else if (k === "s") this.cycleSort(cx);
        else if (k === "r") { this.text = undefined; this.rebuild(cx); }
        else return;
        cx.stop_propagation();
      })
      .child(h_flex().h(44).flex_none().px(16).gap(10).items_center().border_b(1).border_color(t.border).bg(t.chrome)
        .child(div().text_size(14).font_semibold().child("Monz Reviews"))
        .child(div().flex_1().truncate().text_size(12).text_color(t.muted)
          .child(`${prs.length} review request${prs.length === 1 ? "" : "s"}${at ? ` · Updated ${at.getUTCMonth() + 1}/${at.getUTCDate()} ${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())} JST` : ""}`))
        .child(div().text_size(11).text_color(t.dim).child("J/K PR · j/k Finding · p Post · d Drop · u Undo · ⏎ Redline · o GitHub · tab Risk · s Sort · r · Esc")))
      .child(h_flex().flex_none().px(12).py(8).gap(6).border_b(1).border_color(t.border)
        .children(RISKS.map(([key, label]) => {
          const n = key === "all" ? prs.length : prs.filter((p) => riskKey(p) === key).length, on = this.risk === key;
          return div().id(`rn-risk-${key}`).px(10).py(2).rounded(12).text_size(11.5).border_1()
            .border_color(on ? t.accent : t.border).text_color(on ? t.accent : n ? t.muted : t.dim)
            .when(Boolean(n) || key === "all", (e) => e.cursor_pointer().on_click((_e, cx) => this.setRisk(key, cx)))
            .child(`${label} ${n}`);
        }))
        .child(div().flex_1())
        .child(div().id("rn-sort").px(10).py(2).rounded(12).text_size(11.5).border_1().border_color(t.border).text_color(t.muted)
          .cursor_pointer().hover((s) => s.bg(t.hover)).on_click((_e, cx) => this.cycleSort(cx))
          .child(`Sort: ${SORTS[this.sort][1]} (s)`)))
      .when(Boolean(this.error), (e) => e.child(div().px(16).py(6).text_size(11.5).text_color(t.ansi1).child(this.error)))
      .child(h_flex().flex_1().min_h(0).items_start().child(this.list(t, c)).child(this.detail(t, c)));
  }
}
