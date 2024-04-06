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
    d = { name = "Debug" },
    f = { name = "Find" },
    g = { name = "Git" },
    l = { name = "LSP" },
    t = { name = "Test" },
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
      border = "rounded",
      position = "bottom",
      padding = { 2, 2, 2, 2 },
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
