local M = {}

M.mason = {
  ensure_installed = {
    "lua-language-server",
    "stylua",
    "rust-analyzer",
    "css-lsp",
    "html-lsp",
    "prettier",
    "typescript-language-server",
    "deno",
    "emmet-ls",
    "json-lsp",
    "shfmt",
    "shellcheck",
    "intelephense",
  },
}

M.treesitter = {
  ensure_installed = {
    "vim",
    "lua",
    "rust",
    "html",
    "css",
    "scss",
    "sql",
    "markdown",
    "javascript",
    "typescript",
    "tsx",
    "json",
    "c",
    "yaml",
    "zig"
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
          unstaged = "",
          staged = "",
          unmerged = "",
          renamed = "",
          untracked = "",
          deleted = "",
          ignored = "",
        },
      },
    },
  },
}

M.gitsigns = {
  signs = {
    add = { text = "" },
    change = { text = "" },
    delete = { text = "󰍵" },
    topdelete = { text = "‾" },
    changedelete = { text = "~" },
    untracked = { text = "│" },
  },
}


return M
