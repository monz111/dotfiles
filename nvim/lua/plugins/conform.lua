local M = {
  "stevearc/conform.nvim",
}

function M.config()
  local conform = require "conform"
  local wk = require "which-key"

  conform.setup {
    formatters_by_ft = {
      lua = { "stylua" },
      javascript = { { "prettierd", "prettier" } },
      typescript = { { "prettierd", "prettier" } },
      javascriptreact = { { "prettierd", "prettier" } },
      typescriptreact = { { "prettierd", "prettier" } },
      json = { { "prettierd", "prettier" } },
      markdown = { { "prettierd", "prettier" } },
      html = { "htmlbeautifier" },
      bash = { "beautysh" },
      rust = { "rustfmt" },
      yaml = { "yamlfix" },
      toml = { "taplo" },
      css = { { "prettierd", "prettier" } },
      scss = { { "prettierd", "prettier" } },
      sh = { { "shfmt" } },
      sql = { { "sql_formatter" } },
      mysql = { { "sql_formatter" } },
    },
  }
  -- dadbod
  vim.filetype.add {
    pattern = { [".*-query-[^%.]*"] = "sql" },
  }
  vim.keymap.set({ "n", "v" }, "<leader>=", function()
    conform.format {
      lsp_fallback = true,
      async = false,
      timeout_ms = 1000,
    }
  end, { desc = "Format file or range (in visual mode)" })
end

return M
