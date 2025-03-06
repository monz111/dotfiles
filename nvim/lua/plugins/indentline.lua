local M = {
  "lukas-reineke/indent-blankline.nvim",
  main = "ibl",
  ---@module "ibl"
  ---@type ibl.config
  opts = {},
}

function M.config()
  vim.opt.list = true
  vim.opt.listchars = {
    -- space = "⋅",
    -- eol = "󱞱",
    -- eol = "",
    tab = " ",
  }
  local highlight = {
    "IndentBlanklineIndent1",
    "IndentBlanklineIndent2",
    "IndentBlanklineIndent3",
    "IndentBlanklineIndent4",
    "IndentBlanklineIndent5",
  }

  local hooks = require "ibl.hooks"
  hooks.register(hooks.type.HIGHLIGHT_SETUP, function()
    vim.api.nvim_set_hl(0, "IndentBlanklineIndent1", { fg = "#576574" })
    vim.api.nvim_set_hl(0, "IndentBlanklineIndent2", { fg = "#686868" })
    vim.api.nvim_set_hl(0, "IndentBlanklineIndent3", { fg = "#868686" })
    vim.api.nvim_set_hl(0, "IndentBlanklineIndent4", { fg = "#A4A4A4" })
    vim.api.nvim_set_hl(0, "IndentBlanklineIndent5", { fg = "#C2C2C2" })
  end)

  require("ibl").setup {
    indent = { char = "" }, --│
    scope = { enabled = false, show_start = false, highlight = highlight },
  }
end

return M
