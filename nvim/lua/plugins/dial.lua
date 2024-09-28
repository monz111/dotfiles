local M = {
  "monaqa/dial.nvim",
}

M.config = function()
  local augend = require "dial.augend"
  require("dial.config").augends:register_group {
    default = {
      augend.integer.alias.decimal,
      augend.integer.alias.hex,
      augend.constant.alias.bool,
      augend.date.alias["%Y/%m/%d"],
      augend.date.alias["%Y-%m-%d"],
      augend.date.alias["%H:%M"],
      augend.date.alias["%Y年%-m月%-d日"],
      augend.date.alias["%Y年%-m月%-d日(%ja)"],
      augend.date.alias["%H:%M:%S"],
      augend.date.alias["%H:%M"],
      augend.constant.alias.ja_weekday,
      augend.constant.alias.ja_weekday_full,
    },
  }
  vim.keymap.set("n", "<C-a>", function()
    require("dial.map").manipulate("increment", "normal")
  end)
  vim.keymap.set("n", "<C-x>", function()
    require("dial.map").manipulate("decrement", "normal")
  end)
  vim.keymap.set("v", "<C-a>", function()
    require("dial.map").manipulate("increment", "visual")
  end)
  vim.keymap.set("v", "<C-x>", function()
    require("dial.map").manipulate("decrement", "visual")
  end)
end

return M
