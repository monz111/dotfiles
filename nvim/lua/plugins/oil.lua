local M = {
  "stevearc/oil.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons", "refractalize/oil-git-status.nvim" },
}

function M.config()
  local keymap = vim.keymap.set
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
      signcolumn = "yes:2",
    },
    keymaps = {
      ["<ESC>"] = "actions.close",
    },
  }

  local icons = require "icons"
  require("oil-git-status").setup {
    show_ignored = true,
    symbols = {
      index = {
        ["!"] = icons.git.FileUnmerged,
        ["?"] = icons.git.FileUnstaged,
        ["A"] = icons.git.LineAdded,
        ["C"] = icons.ui.Clipboard,
        ["D"] = icons.git.FileDeleted,
        ["M"] = icons.git.LineModified,
        ["R"] = icons.git.FileRenamed,
        ["T"] = icons.git.FileUnstaged,
        ["U"] = icons.git.FileUnmerged,
        [" "] = " ",
      },
      working_tree = {
        ["!"] = icons.git.FileUnmerged,
        ["?"] = icons.git.FileUnstaged,
        ["A"] = icons.git.LineAdded,
        ["C"] = icons.ui.Clipboard,
        ["D"] = icons.git.FileDeleted,
        ["M"] = icons.git.LineModified,
        ["R"] = icons.git.FileRenamed,
        ["T"] = icons.git.FileUnstaged,
        ["U"] = icons.git.FileUnmerged,
        [" "] = " ",
      },
    },
  }
end

return M
