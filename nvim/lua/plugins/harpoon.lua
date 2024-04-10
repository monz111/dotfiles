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
    title = "Harpoon",
    border = "rounded",
    title_pos = "center",
    ui_width_ratio = 0.40,
  }

  harpoon:setup()
  keymap("n", "<leader>1", function() harpoon:list():select(1)vim.notify "harpoon: 1" end)
  keymap("n", "<leader>2", function() harpoon:list():select(2)vim.notify "harpoon: 2" end)
  keymap("n", "<leader>3", function() harpoon:list():select(3)vim.notify "harpoon: 3"end)
  keymap("n", "<leader>4", function() harpoon:list():select(4)vim.notify "harpoon: 4"end)
  keymap("n", "<s-m>", function() harpoon:list():add() vim.notify "harpoon: marked" end)
  keymap("n", "<TAB>", function()
    harpoon.ui:toggle_quick_menu(harpoon:list(), opts)
  end)
end

return M
