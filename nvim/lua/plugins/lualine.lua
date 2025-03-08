local M = {
  "nvim-lualine/lualine.nvim",
}

function M.config()
  local icons = require "icons"
  local custom_theme = require "lualine.themes.auto"
  custom_theme.normal.b.bg = nil
  custom_theme.command.b.bg = nil
  custom_theme.insert.b.bg = nil
  custom_theme.visual.b.bg = nil

  require("lualine").setup {
    options = {
      theme = custom_theme,
      section_separators = { left = "", right = "" },
      component_separators = { left = "", right = "" },
      ignore_focus = { "NvimTree" },
      refresh = {
        statusline = 100,
        tabline = 100,
        winbar = 100,
      },
    },
    sections = {
      lualine_a = {},
      lualine_b = {
        {
          "harpoon2",
          indicators = { " 1 ", " 2 ", " 3 ", " 4 " },
          active_indicators = { "[1]", "[2]", "[3]", "[4]" },
          _separator = "",
          color = { fg = "#9399b2", bg = nil },
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
            modified = icons.ui.Modified,
            readonly = "[ReadOnly]",
            unnamed = "No Name",
            newfile = "New",
          },
          color = { fg = "#6c7086" },
          padding = 0,
        },
      },
      lualine_x = {
        {
          "diagnostics",
          sources = { "nvim_lsp" },
          symbols = {
            error = icons.diagnostics.Error,
            warn = icons.diagnostics.Warning,
            info = icons.diagnostics.Information,
            hint = icons.diagnostics.Hint,
          },
        },
        {
          function()
            local ok, conform = pcall(require, "conform")
            if not ok then
              return ""
            end

            -- lsp
            local buf_clients = vim.lsp.get_clients { bufnr = 0 }

            local lsp_names = {}
            for _, client in pairs(buf_clients) do
              table.insert(lsp_names, client.name)
            end
            local lsp_name = table.concat(lsp_names, ", ")

            local filetype = vim.bo.filetype
            local formatters = conform.formatters_by_ft[filetype] or {}

            if vim.islist(formatters) and #formatters > 0 then
              return "" .. lsp_name .. ":" .. table.concat(formatters, ",") .. ""
            end

            return ""
          end,
          color = { fg = "#585b70", bg = "#11111b" },
        },
      },
      lualine_y = {},
      lualine_z = {},
    },
    extensions = { "quickfix", "man", "fugitive" },
  }
end

return M
