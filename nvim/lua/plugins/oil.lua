local M = {
  "stevearc/oil.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
}

function M.config()
  local keymap = vim.keymap.set
  local wk = require "which-key"
  keymap("n", "-", "<CMD>Oil --float<CR>", { desc = "Open parent directory" })

  require("oil").setup {
    default_file_explorer = true,
    delete_to_trash = true,
    skip_confirm_for_simple_edits = true,
    view_options = {
      show_hidden = true,
      natural_order = true,
      is_always_hidden = function(name, _)
        return name == ".." or name == ".git"
      end,
    },
    float = {
      max_height = 30,
      max_width = 60,
    },
    win_options = {
      wrap = true,
      winblend = 0,
    },
    keymaps = {
      ["<ESC>"] = "actions.close",
    },
  }
end

return M
