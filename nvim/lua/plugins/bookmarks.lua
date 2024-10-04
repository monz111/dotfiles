local M = {
  "MattesGroeger/vim-bookmarks",
  enabled = true,
  dependencies = {
    "tom-anders/telescope-vim-bookmarks.nvim",
  },
}

function M.config()
  vim.g.bookmark_sign = ""
  vim.g.bookmark_highlight_lines = 1
  vim.cmd [[
        highlight BookmarkSign guifg=#bc5090
        highlight BookmarkLine guibg=#4e6077
    ]]

  require("telescope").load_extension "vim_bookmarks"

  local keymap = vim.keymap

  keymap.set("n", "ma", '<cmd>lua require("telescope").extensions.vim_bookmarks.current_file()<cr>')
end

return M
