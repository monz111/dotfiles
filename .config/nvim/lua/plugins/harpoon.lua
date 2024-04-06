local M = {
  "ThePrimeagen/harpoon",
  event = "VeryLazy",
  branch = "harpoon2",
  dependencies = {
    { "nvim-lua/plenary.nvim" },
  },
}

function M.config()
  local harpoon = require "harpoon"
  local keymap = vim.keymap.set
  local opts = {
    title = "🖕🤪🖕",
    border = "rounded",
    title_pos = "center",
    ui_width_ratio = 0.40,
  }

  harpoon:setup()

  keymap("n", "<s-m>", function() harpoon:list():add() vim.notify "  marked file" end)
  keymap("n", "<TAB>", function()
    harpoon.ui:toggle_quick_menu(harpoon:list(), opts)
  end)
end

return M
