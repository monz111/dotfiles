local M = {
  "akinsho/bufferline.nvim",
  dependencies = {
    { "nvim-tree/nvim-web-devicons" },
  },
}

function M.config()
  vim.opt.termguicolors = true

  local bufferline = require "bufferline"
  bufferline.setup {
    options = {
      indicator = {
        style = "none",
      },
      separator_style = { "│", "│" },
      style_preset = bufferline.style_preset.no_italic,
      color_icons = false,
      show_buffer_close_icons = false,
      show_close_icon = false,
      show_buffer_icons = false,
      tab_size = 0,
      diagnostics = "nvim_lsp",
      pick = {
        alphabet = "123456789",
      },
      name_formatter = function(buf)
        if buf.buftype == "terminal" or (buf.name and buf.name:match "zsh") then
          return "Terminal"
        end
        return buf.name
      end,
    },
    highlights = {
      background = {
        fg = nil,
        bg = nil,
      },
      buffer_selected = {
        fg = "#f1f1f1",
        bg = nil,
        bold = false,
        italic = false,
      },
      separator = {
        fg = "#555555",
        bg = nil,
      },
    },
  }

  local wk = require "which-key"
  wk.add {
    { "<leader><leader>", "<CMD>BufferLinePick<CR>", desc = "Buffer Pick" },
    { "<leader>bx", "<CMD>BufferLinePickClose<CR>", desc = "Buffer Pick Close" },
    { "<leader>bq", "<CMD>BufferLineCloseOthers<CR>", desc = "Buffer Pick Close" },
    { "<leader>bl", "<CMD>BufferLineMoveNext<CR>", desc = "Buffer Move Next" },
    { "<leader>bh", "<CMD>BufferLineMovePrev<CR>", desc = "Buffer Move Prev" },
    { "<leader>1", "<CMD>BufferLineGoToBuffer 1<CR>", desc = "Buffer 1", hidden = true },
    { "<leader>2", "<CMD>BufferLineGoToBuffer 2<CR>", desc = "Buffer 2", hidden = true },
    { "<leader>3", "<CMD>BufferLineGoToBuffer 3<CR>", desc = "Buffer 3", hidden = true },
    { "<leader>4", "<CMD>BufferLineGoToBuffer 4<CR>", desc = "Buffer 4", hidden = true },
    { "<leader>5", "<CMD>BufferLineGoToBuffer 5<CR>", desc = "Buffer 5", hidden = true },
    { "<leader>6", "<CMD>BufferLineGoToBuffer 6<CR>", desc = "Buffer 6", hidden = true },
    { "<leader>7", "<CMD>BufferLineGoToBuffer 7<CR>", desc = "Buffer 7", hidden = true },
    { "<leader>8", "<CMD>BufferLineGoToBuffer 8<CR>", desc = "Buffer 8", hidden = true },
    { "<leader>9", "<CMD>BufferLineGoToBuffer 9<CR>", desc = "Buffer 9", hidden = true },
  }
end

return M
