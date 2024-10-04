local M = {
  "folke/which-key.nvim",
}

function M.config()
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
    win = {
      border = "none",
      padding = { 1, 0, 1, 1 },
      wo = {
        winblend = 0,
      },
    },
    icons = {
      breadcrumb = "»", -- symbol used in the command line area that shows your active key combo
      separator = "-", -- symbol used between a key and it's label
      group = "󰉋 ", -- symbol prepended to a group
    },
    show_help = false,
    show_keys = false,
    disable = {
      buftypes = {},
      filetypes = { "TelescopePrompt" },
    },
  }

  which_key.add({
    { "<leader>p", "<cmd>lua require('telescope').extensions.projects.projects()<CR>", desc = "Projects"},
    { "<leader>q", "<cmd>confirm q<CR>", desc = "Quit" },
    { "<leader>v", "<cmd>vsplit<CR>", desc = "Split"},
    { "<leader>c", group = "Lab Code" },
    { "<leader>b", group = "Buffers" },
    { "<leader>s", group = "Sessions" },
    { "<leader>d", group = "Debug" },
    { "<leader>f", group = "Find" },
    { "<leader>g", group = "Git" },
    { "<leader>l", group = "LSP" },
    { "<leader>t", group = "Test" },
    { "<leader>w", group = "Window" },
    { "<leader>;", group = "Terminal" },
  })

end

return M
