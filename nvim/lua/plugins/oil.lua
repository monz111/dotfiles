local M = {
  "stevearc/oil.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
}

function M.config()
  local keymap = vim.keymap.set
  local wk = require "which-key"
  keymap("n", "-", "<CMD>Oil --float<CR>", { desc = "Open parent directory" })
  wk.register {
    ["<leader>e"] = { "<cmd>Oil --float<cr>", "Open parent directory" },
  }

  require("oil").setup {
    view_options = {
      show_hidden = true,
    },
    float = {
      max_height = 30,
      max_width = 60,
    },
    keymaps = {
      ["<ESC>"] = "actions.close",
    },
  }
end

return M
