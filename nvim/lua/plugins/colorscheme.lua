local M = {
  "catppuccin/nvim",
  name = "catppuccin",
  priority = 1000,
}

function M.config()
  require("catppuccin").setup {
    flavour = "auto", -- latte, frappe, macchiato, mocha
    background = { -- :h background
      light = "latte",
      dark = "mocha",
    },
    default_integrations = false,
    show_end_of_buffer = true, -- shows the '~' characters after the end of buffers
    term_colors = true, -- sets terminal colors (e.g. `g:terminal_color_1`)
    transparent_background = true, -- disables setting the background color.
    integrations = {
      alpha = true,
      cmp = true,
      fidget = true,
      gitsigns = true,
      harpoon = true,
      hop = false,
      markdown = true,
      mini = {
        enabled = true,
        indentscope_color = "",
      },
      neogit = true,
      notify = true,
      nvimtree = true,
      telescope = {
        enabled = true,
      },
      treesitter = true,
      ufo = true,
      which_key = true,
    },
  }

  vim.cmd.colorscheme "catppuccin"

  local keymap = vim.keymap.set
  keymap("n", "<leader>tb", function()
    local cat = require "catppuccin"
    cat.options.transparent_background = not cat.options.transparent_background
    cat.compile()
    vim.cmd.colorscheme(vim.g.colors_name)
  end)
end

return M
