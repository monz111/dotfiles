local M = {
  "stevearc/oil.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
}

function M.config()
  local wk = require "which-key"
  wk.register {
    ["<leader>e"] = { "<cmd>Oil --float<cr>", "Open parent directory" },
  }

  require("oil").setup {
    view_options = {
      show_hidden = true,
    },
    float = {
      max_height = 20,
      max_width = 60,
    },
    keymaps = {
      ["<leader>e"] = "actions.close",
    },
  }
end

return M
