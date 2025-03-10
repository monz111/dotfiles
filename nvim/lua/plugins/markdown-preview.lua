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

  wk.add {
    { "<leader>mp", "<Plug>MarkdownPreview<cr>", desc = "MarkdownPreview" },
    { "<leader>ms", "<Plug>MarkdownPreviewStop<cr>", desc = "MarkdownPreviewStop" },
    { "<leader>mt", "<Plug>MarkdownPreviewToggle<cr>", desc = "MarkdownPreviewToggle" },
  }

end

return M
