local M = {
  "catppuccin/nvim",
  lazy = false,
  name = "catppuccin",
  priority = 1000,
  transparent_background = true,
  integrations = {
    cmp = true,
    gitsigns = true,
    nvimtree = true,
    treesitter = true,
    notify = true,
    mason = true,
    mini = {
      enabled = true,
      indentscope_color = "",
    },
    fidget = true,
    harpoon = false,
    leap = true,
    markdown = true,
    alpha = true,
  },
}

function M.config()
  local cat = require "catppuccin"
  cat.options.transparent_background = true
  cat.compile()
  vim.cmd.colorscheme "catppuccin-mocha"

  local keymap = vim.keymap.set
  keymap("n", "<leader>tb", function()
    local cat = require "catppuccin"
    cat.options.transparent_background = not cat.options.transparent_background
    cat.compile()
    vim.cmd.colorscheme(vim.g.colors_name)
  end)
end

return M
