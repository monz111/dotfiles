local M = {
  "nvim-lualine/lualine.nvim",
}

function M.config()
  require("lualine").setup {
    options = {
      component_separators = { left = "", right = "" },
      section_separators = { left = "", right = "" },
      ignore_focus = { "NvimTree" },
    },
    sections = {
      lualine_a = {},
      lualine_b = {
        {
          "harpoon2",
          indicators = { " 1 ", " 2 ", " 3 ", " 4 " },
          active_indicators = { "[1]", "[2]", "[3]", "[4]" },
          _separator = "",
          color = { fg = "#f1f1f1" },
        },
      },
      lualine_c = {
        {
          "filetype",
          colored = false,
          icon_only = true,
          icon = { align = "right" },
          padding = { left = 1, right = 0 },
        },
        {
          "filename",
          file_status = true,
          path = 0,
          shorting_target = 40,
          symbols = {
            modified = "󰣕",
            readonly = "[ReadOnly]",
            unnamed = "No Name",
            newfile = "New",
          },
          color = { fg = "#888888" },
          padding = 0,
        },
      },
      lualine_x = { { "filename", path = 3, file_status = false, color = { fg = "#888888" } } },
      lualine_y = {},
      lualine_z = {},
    },
    extensions = { "quickfix", "man", "fugitive" },
  }
end

return M
