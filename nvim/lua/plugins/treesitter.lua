local M = {
  "nvim-treesitter/nvim-treesitter",
  dependencies = {
    "windwp/nvim-ts-autotag",
    -- "nvim-treesitter/nvim-treesitter-context",
  },
  event = { "BufReadPost", "BufNewFile" },
  build = ":TSUpdate",
}

function M.config()
  require("nvim-treesitter.configs").setup {
    ensure_installed = {
      "lua",
      "html",
      "markdown",
      "markdown_inline",
      "bash",
      "vim",
      "vimdoc",
      "rust",
      "typescript",
      "javascript",
      "toml",
    },
    highlight = { enable = true },
    indent = { enable = true },
  }
  require("nvim-ts-autotag").setup {
    aliases = {
      ["html"] = "html",
      ["javascript"] = "html",
      ["jsx"] = "html",
      ["markdown"] = "html",
      ["php"] = "html",
      ["tsx"] = "html",
      ["typescript"] = "html",
      ["xml"] = "html",
    },
  }
  -- require("treesitter-context").setup {
  --   enable = true, -- Enable this plugin (Can be enabled/disabled later via commands)
  --   max_lines = 1, -- How many lines the window should span. Values <= 0 mean no limit.
  --   min_window_height = 0, -- Minimum editor window height to enable context. Values <= 0 mean no limit.
  --   line_numbers = false,
  --   multiline_threshold = 20, -- Maximum number of lines to show for a single context
  --   trim_scope = "outer", -- Which context lines to discard if `max_lines` is exceeded. Choices: 'inner', 'outer'
  --   mode = "cursor", -- Line used to calculate context. Choices: 'cursor', 'topline'
  --   -- Separator between context and content. Should be a single character string, like '-'.
  --   -- When separator is set, the context will only show up when there are at least 2 lines above cursorline.
  --   separator = nil,
  --   zindex = 20, -- The Z-index of the context window
  --   on_attach = nil, -- (fun(buf: integer): boolean) return false to disable attaching
  -- }
  local catpuccin = require "catppuccin.palettes.mocha"
  vim.api.nvim_set_hl(0, "TreesitterContextBottom", { bg = catpuccin.base, underline = false })
end

return M
