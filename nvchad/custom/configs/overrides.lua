local M = {}

M.mason = {
  ensure_installed = {
    "rust-analyzer",
  },
}

M.nvimtree = {
  filters = { custom = { "^.git$", "^.github$" } },
  git = {
    enable = true,
  },
  renderer = {
    highlight_git = true,
    icons = {
      show = {
        git = true,
      },
      glyphs = {
        git = {
          unstaged = "",
          staged = "✓",
          unmerged = "",
          renamed = "➜",
          untracked = "★",
          deleted = "",
          ignored = "◌",
        },
      },
    },
  },
}

return M
