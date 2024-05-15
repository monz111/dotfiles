local M = {
  "kawarimidoll/tuskk.vim",
}

function M.config()
  vim.cmd [[
  call tuskk#initialize({
  \ 'user_jisyo_path': '~/.eskk/SKK-JISYO.user',
  \ 'jisyo_list':  [
  \   { 'path': '~/.eskk/.skk-jisyo', 'encoding': 'utf-8' },
  \   { 'path': '~/.eskk/SKK-JISYO.neologd', 'encoding': 'utf-8' },
  \   { 'path': '~/.eskk/SKK-JISYO.notes', 'encoding': 'utf-8' },
  \   { 'path': '~/.eskk/SKK-JISYO.requested', 'encoding': 'utf-8' },
  \   { 'path': '~/.eskk/SKK-JISYO.L', 'encoding': 'euc-jp' },
  \   { 'path': '~/.eskk/SKK-JISYO.emoji', 'mark': '[E]' },
  \ ],
  \ 'kana_table': tuskk#opts#builtin_kana_table(),
  \ 'suggest_wait_ms': 200,
  \ 'suggest_sort_by': 'length',
  \ 'merge_tsu': v:true,
  \ 'trailing_n': v:true,
  \ 'kakutei_unique': v:true,
  \ })
  call tuskk#enable()
  ]]

  local keymap = vim.keymap.set
  keymap("n", "<leader><tab>", function()
    vim.cmd "call tuskk#toggle()"
  end)
end

return M
