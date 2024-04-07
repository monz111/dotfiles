local M = {
  "ggandor/leap.nvim",
  keys = { "s" },
}

function M.config()
  local keymap = vim.keymap.set
  local opts = { noremap = true }
  keymap({ "n", "x", "o" }, "s", function()
    local current_window = vim.fn.win_getid()
    require("leap").leap { target_windows = { current_window } }
  end, opts)
end
return M
