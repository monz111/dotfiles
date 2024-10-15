local M = {
  "linrongbin16/gitlinker.nvim",
}

function M.config()
  require("gitlinker").setup()

  local wk = require "which-key"
  wk.add {
    { "<leader>gy", "<cmd>GitLink<cr>", desc = "Yank git link" },
    { "<leader>gY", "<cmd>GitLink!<cr>", desc = "Open git link" },
  }
end

return M
