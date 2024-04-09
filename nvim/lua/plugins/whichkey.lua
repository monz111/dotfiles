local M = {
  "folke/which-key.nvim",
}

function M.config()
  local mappings = {
    p = { "<cmd>lua require('telescope').extensions.projects.projects()<CR>", "Projects" },
    q = { "<cmd>confirm q<CR>", "Quit" },
    v = { "<cmd>vsplit<CR>", "Split" },
    c = { name = "Lab Code" },
    b = { name = "Buffers" },
    s = { name = "Sessions" },
    d = { name = "Debug" },
    f = { name = "Find" },
    g = { name = "Git" },
    l = { name = "LSP" },
    t = { name = "Test" },
    m = { name = "Markdown" },
    [";"] = { name = "Terminal" },
  }

  local which_key = require "which-key"
  which_key.setup {
    plugins = {
      marks = true,
      registers = true,
      spelling = {
        enabled = true,
        suggestions = 20,
      },
      presets = {
        operators = false,
        motions = false,
        text_objects = false,
        windows = false,
        nav = false,
        z = false,
        g = false,
      },
    },
    window = {
      border = "none",
      position = "bottom",
      padding = { 1, 1, 1, 1 },
      winblend = 0,
    },
    icons = {
      breadcrumb = "»", -- symbol used in the command line area that shows your active key combo
      separator = "-", -- symbol used between a key and it's label
      group = "󰉋 ", -- symbol prepended to a group
    },
    ignore_missing = true,
    show_help = false,
    show_keys = false,
    disable = {
      buftypes = {},
      filetypes = { "TelescopePrompt" },
    },
  }

  local opts = {
    mode = "n", -- NORMAL mode
    prefix = "<leader>",
  }

  which_key.register(mappings, opts)
end

return M
