local M = {}
local icons = require "icons"

local function YankDiagnostic()
  local diagnostics = vim.diagnostic.get(0, { lnum = vim.fn.line "." - 1 })
  if #diagnostics > 0 then
    local message = diagnostics[1].message
    vim.fn.setreg("+", message)
    print(icons.ui.Clipboard .. message)
  else
    print "LSP: No diagnostic found on this line."
  end
end

local wk = require "which-key"
wk.add {
  { "g",          "",                                          desc = "LSP" },
  { "gg",         "gg",                                        desc = "Move Top" },
  { "gd",         "<cmd>lua vim.lsp.buf.definition()<CR>",     desc = "Go to Definition" },
  { "gD",         "<cmd>lua vim.lsp.buf.declaration()<CR>",    desc = "Go to Declaration" },
  { "gk",         "<cmd>lua vim.lsp.buf.hover()<CR>",          desc = "Show Hover" },
  { "gl",         "<cmd>lua vim.diagnostic.open_float()<CR>",  desc = "Show Diagnostics" },
  { "gr",         "<cmd>lua vim.lsp.buf.references()<CR>",     desc = "Find References" },
  { "gi",         "<cmd>lua vim.lsp.buf.code_action()<CR>",    desc = "Code Action (e.g., Auto Import)" },
  { "gI",         "<cmd>lua vim.lsp.buf.implementation()<CR>", desc = "Go to Implementation" },
  { "gq",         "<cmd>lua vim.diagnostic.setloclist()<cr>",  desc = "Quickfix" },
  { "gy",         YankDiagnostic,                              desc = "Yank Diagnostic" },
  { "<leader>la", "<cmd>lua vim.lsp.buf.code_action()<cr>",    desc = "Code Action" },
  { "<leader>li", "<cmd>LspInfo<cr>",                          desc = "Info" },
  { "<leader>lr", "<cmd>lua vim.lsp.buf.rename()<cr>",         desc = "Rename" },
  { "<leader>lj", "<cmd>lua vim.diagnostic.goto_next()<cr>",   desc = "Next Diagnostic" },
  { "<leader>lk", "<cmd>lua vim.diagnostic.goto_prev()<cr>",   desc = "Prev Diagnostic" },
  { "<leader>ll", "<cmd>lua vim.lsp.codelens.run()<cr>",       desc = "CodeLens Action" },
  {
    "<leader>lq",
    function()
      vim.diagnostic.setqflist { severity = { min = vim.diagnostic.severity.HINT } }
    end,
    desc = "CodeLens Action",
  },
  {
    "<leader>lf",
    "<cmd>lua vim.lsp.buf.format({async = true, filter = function(client) return client.name ~= 'typescript-tools' end})<cr>",
    desc = "Format",
  },
}

local default_diagnostic_config = {
  signs = {
    active = true,
    values = {
      { name = "DiagnosticSignError", text = icons.diagnostics.Error },
      { name = "DiagnosticSignWarn",  text = icons.diagnostics.Warning },
      { name = "DiagnosticSignHint",  text = icons.diagnostics.Hint },
      { name = "DiagnosticSignInfo",  text = icons.diagnostics.Information },
    },
  },
  virtual_text = true,
  update_in_insert = false,
  underline = true,
  severity_sort = true,
  float = {
    focusable = true,
    style = "minimal",
    border = "rounded",
    source = "always",
    header = "",
    prefix = "",
  },
}

vim.diagnostic.config(default_diagnostic_config)

local config = vim.diagnostic.config() or {}
local signs = vim.tbl_get(config, "signs", "values") or {}
for _, sign in ipairs(signs) do
  vim.fn.sign_define(sign.name, { texthl = sign.name, text = sign.text, numhl = sign.name })
end

local function common_capabilities()
  local capabilities = vim.lsp.protocol.make_client_capabilities()
  capabilities.textDocument.completion.completionItem.snippetSupport = true
  return capabilities
end

M.on_attach = function(client, bufnr)
  if client.supports_method "textDocument/inlayHint" then
    vim.lsp.inlay_hint.enable(true, { bufnr = bufnr })
  end
end

M.capabilities = common_capabilities()

return M
