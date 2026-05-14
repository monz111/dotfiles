local M = {
  "catppuccin/nvim",
  name = "catppuccin",
  priority = 1000,
}

function M.config()
  require("catppuccin").setup {
    flavour = "frappe", -- latte, frappe, macchiato, mocha
    background = { -- :h background
      light = "latte",
      dark = "mocha",
    },
    default_integrations = false,
    show_end_of_buffer = false, -- shows the '~' characters after the end of buffers
    term_colors = true, -- sets terminal colors (e.g. `g:terminal_color_1`)
    transparent_background = true, -- disables setting the background color.
    integrations = {
      alpha = true,
      cmp = false,
      blink_cmp = true,
      fidget = true,
      gitsigns = true,
      harpoon = true,
      hop = false,
      markdown = true,
      render_markdown = true,
      mini = {
        enabled = true,
        indentscope_color = "",
      },
      neogit = true,
      notify = true,
      nvimtree = true,
      telescope = {
        enabled = false,
      },
      treesitter = true,
      treesitter_context = true,
      ufo = true,
      which_key = true,
      snacks = {
        enabled = true,
        indent_scope_color = "", -- catppuccin color (eg. `lavender`) Default: text
      },
    },
  }

  vim.cmd.colorscheme "catppuccin"

  local wk = require "which-key"
  wk.add {
    {
      "<leader>tb",
      function()
        local cat = require "catppuccin"
        cat.options.transparent_background = not cat.options.transparent_background
        cat.compile()
        vim.cmd.colorscheme(vim.g.colors_name)
      end,
      desc = "Change background to solid color",
    },
  }
end

return M
