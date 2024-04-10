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
          color = function(section)
            return {
              fg = vim.bo.modified and "#bdc3c7" or "#FFFFFF",
              gui = vim.bo.modified and "reverse" or "bold",
            }
          end,
        },
      },
      lualine_c = {},
      lualine_x = { { "filename", path = 3, file_status = true } },
      lualine_y = { "diagnostics", "branch" },
      lualine_z = {},
    },
    extensions = { "quickfix", "man", "fugitive" },
  }
end

return M
