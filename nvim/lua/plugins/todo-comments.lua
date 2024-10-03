local M = {
  "folke/todo-comments.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  event = "BufReadPost",
}

function M.config()
  -- local wk = require "which-key"
  -- wk.add {
  --   { "<leader>d", group = "Todo" },
  --   { "<leader>dq", "<cmd>TodoQuickFix<cr>", desc = "TodoQuickFix" },
  --   { "<leader>dt", "<cmd>TodoTelescope<cr>", desc = "TodoTelescope" },
  -- }

  require("todo-comments").setup {
    signs = false,
  }
end

return M
