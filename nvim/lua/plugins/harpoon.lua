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
  keymap("n", "<leader>1", function() harpoon:list():select(1)end)
  keymap("n", "<leader>2", function() harpoon:list():select(2)end)
  keymap("n", "<leader>3", function() harpoon:list():select(3)end)
  keymap("n", "<leader>4", function() harpoon:list():select(4)end)
  keymap("n", "<leader>5", function() harpoon:list():select(5)end)
  keymap("n", "<leader>6", function() harpoon:list():select(6)end)
  keymap("n", "<leader>7", function() harpoon:list():select(7)end)
  keymap("n", "<leader>8", function() harpoon:list():select(8)end)
  keymap("n", "<leader>9", function() harpoon:list():select(9)end)
  keymap("n", "<s-m>", function() harpoon:list():add() vim.notify "harpoon: marked" end)
  keymap("n", "{", function() harpoon:list():prev() end)
  keymap("n", "}", function() harpoon:list():next() end)
  keymap("n", "<TAB>", function()
    harpoon.ui:toggle_quick_menu(harpoon:list(), opts)
  end)
end

return M
