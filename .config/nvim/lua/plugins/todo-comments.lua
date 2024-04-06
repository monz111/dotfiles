local M = {
  "folke/todo-comments.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  event = "BufReadPost",
}

function M.config()
  local wk = require "which-key"
  wk.register {
    ["<leader>dq"] = { "<cmd>TodoQuickFix<cr>", "TodoQuickFix" },
    ["<leader>dt"] = { "<cmd>TodoTelescope<cr>", "TodoTelescope" },
  }

  require("todo-comments").setup {
    signs = false,
  }
end

return M
