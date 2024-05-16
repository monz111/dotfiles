local M = {
  "nvimtools/none-ls.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
}

function M.config()
  local null_ls = require "null-ls"
  local wk = require "which-key"

  local formatting = null_ls.builtins.formatting
  local diagnostics = null_ls.builtins.diagnostics

  null_ls.setup {
    debug = true,
    sources = {
      formatting.stylua,
      formatting.prettier,
      formatting.prettier.with {
        extra_filetypes = { "toml" },
        extra_args = { "--no-semi", "--single-quote", "--jsx-single-quote" },
      },
      --formatting.eslint_d,
      --null_ls.builtins.diagnostics.flake8,
      --diagnostics.flake8,
      null_ls.builtins.completion.spell,
    },
  }

  wk.register {
    ["<Leader>="] = {
      "<cmd>lua vim.lsp.buf.format({async = true, filter = function(client) return client.name ~= 'typescript-tools' end})<cr>",
      "Format",
      mode = "v",
    },
  }
end

return M
