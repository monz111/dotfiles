local M = {
  "iamcco/markdown-preview.nvim",
  cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
  ft = { "markdown" },
  build = function()
    vim.fn["mkdp#util#install"]()
  end,
}

function M.config()
  local wk = require "which-key"
  wk.register {
    ["<leader>mp"] = { "<Plug>MarkdownPreview<cr>", "MarkdownPreview" },
    ["<leader>mt"] = { "<Plug>MarkdownPreviewToggle<cr>", "MarkdownPreviewToggle" },
    ["<leader>ms"] = { "<Plug>MarkdownPreviewStop<cr>", "MarkdownPreviewStop" },
  }

end

return M
