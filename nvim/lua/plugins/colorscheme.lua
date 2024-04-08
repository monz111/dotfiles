local M = {
  "catppuccin/nvim",
  lazy = false,
  name = "catppuccin",
  priority = 1000,
  integrations = {
    cmp = true,
    gitsigns = true,
    nvimtree = true,
    treesitter = true,
    notify = true,
    mini = {
      enabled = true,
      indentscope_color = "",
    },
    fidget = false,
    harpoon = false,
    leap = false,
    markdown = true,
  }
}

function M.config()
  vim.cmd.colorscheme "catppuccin"
end

return M

