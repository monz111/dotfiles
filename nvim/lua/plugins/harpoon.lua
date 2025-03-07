local M = {
  "ThePrimeagen/harpoon",
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
  keymap("n", "<s-m>", function() harpoon:list():add() vim.notify "harpoon: marked" end)
  keymap("n", "<TAB>", function()
    harpoon.ui:toggle_quick_menu(harpoon:list(), opts)
  end)
  local wk = require "which-key"
  wk.add {
    { "<leader>1", function() harpoon:list():select(1)end, hidden = true },
    { "<leader>2", function() harpoon:list():select(2)end, hidden = true },
    { "<leader>3", function() harpoon:list():select(3)end, hidden = true },
    { "<leader>4", function() harpoon:list():select(4)end, hidden = true },
    { "<leader>5", function() harpoon:list():select(5)end, hidden = true },
    { "<leader>6", function() harpoon:list():select(6)end, hidden = true },
    { "<leader>7", function() harpoon:list():select(7)end, hidden = true },
    { "<leader>8", function() harpoon:list():select(8)end, hidden = true },
    { "<leader>9", function() harpoon:list():select(9)end, hidden = true },
  }
end

return M
