local M = {
  "romgrk/barbar.nvim",
  dependencies = {
    "lewis6991/gitsigns.nvim",
    "nvim-tree/nvim-web-devicons",
  },
}

M.config = function()
  require("barbar").setup {
    animation = false,
    auto_hide = false,
    icons = {
      button = " ",
      gitsigns = {
        added = { enabled = false, icon = "+" },
        changed = { enabled = false, icon = "~" },
        deleted = { enabled = false, icon = "-" },
      },
      modified = { button = "●" },
    },
  }

  local map = vim.api.nvim_set_keymap
  local opts = { noremap = true, silent = true }

  -- Move to previous/next
  map("n", "{", "<Cmd>BufferPrevious<CR>", opts)
  map("n", "}", "<Cmd>BufferNext<CR>", opts)
  -- Re-order to previous/next
  map("n", "<C-[>", "<Cmd>BufferMovePrevious<CR>", opts)
  map("n", "<C-]>", "<Cmd>BufferMoveNext<CR>", opts)
  -- Goto buffer in position...
  map("n", "1", "<Cmd>BufferGoto 1<CR>", opts)
  map("n", "2", "<Cmd>BufferGoto 2<CR>", opts)
  map("n", "3", "<Cmd>BufferGoto 3<CR>", opts)
  map("n", "4", "<Cmd>BufferGoto 4<CR>", opts)
  map("n", "5", "<Cmd>BufferGoto 5<CR>", opts)
  map("n", "6", "<Cmd>BufferGoto 6<CR>", opts)
  map("n", "7", "<Cmd>BufferGoto 7<CR>", opts)
  map("n", "8", "<Cmd>BufferGoto 8<CR>", opts)
  map("n", "9", "<Cmd>BufferGoto 9<CR>", opts)
  map("n", "0", "<Cmd>BufferLast<CR>", opts)
  -- Pin/unpin buffer
  map("n", "<C-P>", "<Cmd>BufferPin<CR>", opts)
  -- Goto pinned/unpinned buffer
  --                 :BufferGotoPinned
  --                 :BufferGotoUnpinned
  -- Close buffer
  map("n", "<C-w>", "<Cmd>BufferClose<CR>", opts)
  map("n", "<C-c>", "<Cmd>BufferCloseBuffersRight<CR>", opts)
  -- Wipeout buffer
  --                 :BufferWipeout
  -- Close commands
  --                 :BufferCloseAllButCurrent
  --                 :BufferCloseAllButPinned
  --                 :BufferCloseAllButCurrentOrPinned
  --                 :BufferCloseBuffersLeft
  --                 :BufferCloseBuffersRight
  -- Magic buffer-picking mode
  -- map("n", "<C-p>", "<Cmd>BufferPick<CR>", opts)
end

return M
