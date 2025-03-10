local M = {
  "stevearc/conform.nvim",
}

function M.config()
  local conform = require "conform"

  conform.setup {
    formatters_by_ft = {
      lua = { "stylua" },
      javascript = { "biome" },
      typescript = { "biome" },
      json = { "jq" },
      jsonc = { "biome" },
      javascriptreact = { "prettierd" },
      typescriptreact = { "prettier" },
      php = { "php_cs_fixer" },
      markdown = { "markdownlint" },
      html = { "htmlbeautifier" },
      bash = { "beautysh" },
      rust = { "rustfmt" },
      yaml = { "yamlfix" },
      toml = { "taplo" },
      css = { "prettierd" },
      scss = { "prettierd" },
      sh = { { "shfmt" } },
      sql = { { "sql_formatter" } },
      mysql = { { "sql_formatter" } },
      ["*"] = { "codespell" },
      ["_"] = { "trim_whitespace" },
    },
    formatters = {
      stylua = {
        prepend_args = { "--indent-type", "Spaces", "--indent-width", "2" },
      },
      biome = {
        args = function(ctx)
          local config_file = vim.fs.find({ "biome.json", ".biomerc.json" }, { upward = true, path = ctx.dirname })[1]
          local config_path = config_file and vim.fn.fnamemodify(config_file, ":p:h")
            or (os.getenv "HOME" .. "/dotfiles/biome/biome.json")
          local file_path = ctx.filename or "stdin.ts"

          return {
            "format",
            "--write",
            "--config-path=" .. config_path,
            "--stdin-file-path",
            file_path,
          }
        end,
      },
    },
  }
  -- dadbod
  vim.filetype.add {
    pattern = { [".*-query-[^%.]*"] = "sql" },
  }

  -- fidget
  local fidget = require "fidget"
  local function format_with_fidget()
    local format_args = { lsp_fallback = true, async = true, timeout_ms = 5000 }
    local formatters = conform.list_formatters()
    local fmt_names = {}

    if not vim.tbl_isempty(formatters) then
      fmt_names = vim.tbl_map(function(f)
        return f.name
      end, formatters)
    elseif conform.will_fallback_lsp(format_args) then
      fmt_names = { "lsp" }
    else
      vim.notify("No formatters available", vim.log.levels.WARN)
      return
    end

    local fmt_info = "fmt: " .. table.concat(fmt_names, ", ")
    local notif = fidget.notify("󰉼 " .. fmt_info, "info", { title = "Formatting", timeout = false })

    conform.format(format_args, function(err)
      if err then
        fidget.notify("Format Error: " .. err, "error", { title = "Formatting" })
        vim.notify("Format Error: " .. err, vim.log.levels.ERROR)
      else
        fidget.notify(" " .. fmt_info, "success", { title = "Formatting" })
      end
    end)
  end

  -- which-key
  local wk = require "which-key"
  wk.add {
    { "<leader>=", format_with_fidget, desc = "Formatting" },
  }
end

return M
