local M = {}

local function lsp_keymaps(bufnr)
  local keymap = vim.api.nvim_buf_set_keymap
  keymap(bufnr, "n", "gD", "<cmd>lua vim.lsp.buf.declaration()<CR>",
    { noremap = true, silent = true, desc = "declaration" })
  keymap(bufnr, "n", "gd", "<cmd>lua vim.lsp.buf.definition()<CR>",
    { noremap = true, silent = true, desc = "definition" })
  keymap(bufnr, "n", "gk", "<cmd>lua vim.lsp.buf.hover()<CR>", { noremap = true, silent = true, desc = "hover" })
  keymap(bufnr, "n", "gI", "<cmd>lua vim.lsp.buf.implementation()<CR>",
    { noremap = true, silent = true, desc = "implementation" })
  keymap(bufnr, "n", "gr", "<cmd>lua vim.lsp.buf.references()<CR>",
    { noremap = true, silent = true, desc = "references" })
  keymap(bufnr, "n", "gl", "<cmd>lua vim.diagnostic.open_float()<CR>",
    { noremap = true, silent = true, desc = "open_float" })
end

local function YankDiagnostic()
  local diagnostics = vim.diagnostic.get(0, { lnum = vim.fn.line "." - 1 })
  if #diagnostics > 0 then
    local message = diagnostics[1].message
    vim.fn.setreg("+", message)
    print("Yanked diagnostic: " .. message)
  else
    print "No diagnostic found on this line."
  end
end

local wk = require "which-key"
wk.add {
  { "<leader>yd", YankDiagnostic,                             desc = "Yank Diagnostic" },
  { "<leader>la", "<cmd>lua vim.lsp.buf.code_action()<cr>",   desc = "Code Action" },
  { "<leader>li", "<cmd>LspInfo<cr>",                         desc = "Info" },
  { "<leader>lj", "<cmd>lua vim.diagnostic.goto_next()<cr>",  desc = "Next Diagnostic" },
  { "<leader>lk", "<cmd>lua vim.diagnostic.goto_prev()<cr>",  desc = "Prev Diagnostic" },
  { "<leader>ll", "<cmd>lua vim.lsp.codelens.run()<cr>",      desc = "CodeLens Action" },
  { "<leader>lq", "<cmd>lua vim.diagnostic.setloclist()<cr>", desc = "Quickfix" },
  { "<leader>lr", "<cmd>lua vim.lsp.buf.rename()<cr>",        desc = "Rename" },
  {
    "<leader>lf",
    "<cmd>lua vim.lsp.buf.format({async = true, filter = function(client) return client.name ~= 'typescript-tools' end})<cr>",
    desc = "Format",
  },
}

local icons = require "icons"
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
  print "on_attach"
  lsp_keymaps(bufnr)

  if client.supports_method "textDocument/inlayHint" then
    vim.lsp.inlay_hint.enable(true, { bufnr = bufnr })
  end
end

M.capabilities = common_capabilities()

return M
