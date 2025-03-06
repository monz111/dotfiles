local M = {
  "MattesGroeger/vim-bookmarks",
  enabled = true,
}

function M.config()
  vim.g.bookmark_sign = ""
  vim.g.bookmark_highlight_lines = 1
  vim.cmd [[
        highlight BookmarkSign guifg=#bc5090
        highlight BookmarkLine guibg=#4e6077
    ]]
end

return M
