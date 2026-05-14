vim.api.nvim_create_autocmd({ "BufWinEnter" }, {
  callback = function()
    vim.cmd "set formatoptions-=cro"
    -- fuck lualine
    vim.cmd "set laststatus=0"
  end,
})

vim.api.nvim_create_autocmd({ "FileType" }, {
  pattern = {
    "netrw",
    "Jaq",
    "qf",
    "git",
    "help",
    "man",
    "lspinfo",
    "oil",
    "spectre_panel",
    "lir",
    "DressingSelect",
    "tsplayground",
  },
  callback = function()
    vim.cmd [[
      nnoremap <silent> <buffer> q :close<CR>
      set nobuflisted
    ]]
  end,
})

vim.api.nvim_create_autocmd({ "CmdWinEnter" }, {
  callback = function()
    vim.cmd "quit"
  end,
})

vim.api.nvim_create_autocmd({ "VimResized" }, {
  callback = function()
    vim.cmd "tabdo wincmd ="
  end,
})

vim.api.nvim_create_autocmd({ "BufWinEnter" }, {
  pattern = { "*" },
  callback = function()
    vim.cmd "checktime"
  end,
})

vim.api.nvim_create_autocmd("TextYankPost", {
  group = vim.api.nvim_create_augroup("highlight_yank", { clear = true }),
  pattern = "*",
  desc = "Highlight selection on yank",
  callback = function()
    local reg_content = vim.fn.getreg "+"
    vim.fn.setreg("+", reg_content)
    vim.highlight.on_yank { timeout = 700, visual = true }
  end,
})

vim.api.nvim_create_autocmd("FileType", {
  group = vim.api.nvim_create_augroup("vertical_help", { clear = true }),
  pattern = "help",
  callback = function()
    vim.bo.bufhidden = "unload"
    vim.cmd.wincmd "L"
    vim.cmd.wincmd "="
  end,
})

vim.api.nvim_create_autocmd({ "FileType" }, {
  pattern = { "gitcommit", "markdown", "NeogitCommitMessage" },
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = false
  end,
})

local focus_group = vim.api.nvim_create_augroup("focus_colorscheme", { clear = true })

local transparent_groups = {
  "Normal",
  "NormalNC",
  "NormalFloat",
  "FloatBorder",
  "FloatTitle",
  "FloatFooter",
  "Pmenu",
  "PmenuSel",
  "PmenuSbar",
  "PmenuThumb",
  "PmenuKind",
  "PmenuKindSel",
  "PmenuExtra",
  "PmenuExtraSel",
  "SignColumn",
  "EndOfBuffer",
  "MsgArea",
  "WhichKey",
  "WhichKeyBorder",
  "WhichKeyFloat",
  "WhichKeyNormal",
  "WhichKeyDesc",
  "WhichKeyGroup",
  "WhichKeySeparator",
  "WhichKeyValue",
  "WhichKeyTitle",
  "NoiceCmdline",
  "NoiceCmdlinePopup",
  "NoiceCmdlinePopupBorder",
  "NoiceCmdlinePopupTitle",
  "NoicePopup",
  "NoicePopupBorder",
  "NoicePopupmenu",
  "NoicePopupmenuBorder",
  "NoiceMini",
  "BlinkCmpMenu",
  "BlinkCmpMenuBorder",
  "BlinkCmpDoc",
  "BlinkCmpDocBorder",
  "BlinkCmpDocSeparator",
  "BlinkCmpSignatureHelp",
  "BlinkCmpSignatureHelpBorder",
  "FidgetNormal",
  "FidgetTitle",
  "NotifyBackground",
  "NotifyERRORBody",
  "NotifyWARNBody",
  "NotifyINFOBody",
  "NotifyDEBUGBody",
  "NotifyTRACEBody",
  "SnacksNormal",
  "SnacksNormalNC",
  "SnacksWinBar",
  "SnacksBackdrop",
  "SnacksDashboardNormal",
  "SnacksPicker",
  "SnacksPickerBorder",
  "SnacksPickerInput",
  "SnacksPickerInputBorder",
  "SnacksPickerList",
  "SnacksPickerListBorder",
  "SnacksPickerPreview",
  "SnacksPickerPreviewBorder",
  "SnacksPickerPrompt",
  "SnacksPickerTitle",
  "SnacksIndent",
  "SnacksDimNormal",
  "MiniPickNormal",
  "MiniPickBorder",
  "MiniPickPrompt",
  "TelescopeNormal",
  "TelescopeBorder",
  "TelescopePromptNormal",
  "TelescopePromptBorder",
  "TelescopePromptTitle",
  "TelescopeResultsNormal",
  "TelescopeResultsBorder",
  "TelescopeResultsTitle",
  "TelescopePreviewNormal",
  "TelescopePreviewBorder",
  "TelescopePreviewTitle",
  "NeogitFloat",
  "NeogitPopupSectionTitle",
  "TreesitterContext",
  "TreesitterContextLineNumber",
  "TreesitterContextBottom",
  "AlphaNormal",
  "MasonNormal",
  "LazyNormal",
  "DiagnosticVirtualTextError",
  "DiagnosticVirtualTextWarn",
  "DiagnosticVirtualTextInfo",
  "DiagnosticVirtualTextHint",
}

local transparent_prefix_patterns = {
  "^Snacks",
  "^WhichKey",
  "^Noice",
  "^BlinkCmp",
  "^Fidget",
  "^Notify",
  "^MiniPick",
  "^Telescope",
  "^Neogit",
  "^TreesitterContext",
}

local function force_transparent(name)
  pcall(vim.cmd, string.format("highlight %s guibg=NONE ctermbg=NONE", name))
end

local function apply_transparent()
  for _, g in ipairs(transparent_groups) do
    force_transparent(g)
  end
  for _, name in ipairs(vim.fn.getcompletion("", "highlight")) do
    for _, pat in ipairs(transparent_prefix_patterns) do
      if name:match(pat) then
        force_transparent(name)
        break
      end
    end
  end
  local normal = vim.api.nvim_get_hl(0, { name = "Normal", link = false })
  normal.bg = "NONE"
  normal.ctermbg = "NONE"
  vim.api.nvim_set_hl(0, "Normal", normal)
  local normal_nc = vim.api.nvim_get_hl(0, { name = "NormalNC", link = false })
  normal_nc.bg = "NONE"
  normal_nc.ctermbg = "NONE"
  vim.api.nvim_set_hl(0, "NormalNC", normal_nc)
end

vim.api.nvim_create_autocmd("ColorScheme", {
  group = focus_group,
  pattern = "catppuccin*",
  callback = function()
    vim.schedule(apply_transparent)
  end,
})

vim.schedule(apply_transparent)

local dim_fg = "#6c7086"
local saved
local dimmed = false

local function dim_all()
  if dimmed then
    return
  end
  saved = {}
  local names = vim.fn.getcompletion("", "highlight")
  for _, name in ipairs(names) do
    saved[name] = vim.api.nvim_get_hl(0, { name = name })
    local resolved = vim.api.nvim_get_hl(0, { name = name, link = false })
    resolved.fg = dim_fg
    resolved.ctermfg = nil
    vim.api.nvim_set_hl(0, name, resolved)
  end
  vim.api.nvim_set_hl(0, "Normal", { fg = dim_fg, bg = "NONE", ctermbg = "NONE" })
  vim.api.nvim_set_hl(0, "NormalNC", { fg = dim_fg, bg = "NONE", ctermbg = "NONE" })
  dimmed = true
end

local function restore_all()
  if not dimmed or not saved then
    return
  end
  for name, hl in pairs(saved) do
    vim.api.nvim_set_hl(0, name, hl)
  end
  apply_transparent()
  dimmed = false
end

vim.api.nvim_create_autocmd("FocusLost", { group = focus_group, callback = dim_all })
vim.api.nvim_create_autocmd("FocusGained", { group = focus_group, callback = restore_all })

vim.api.nvim_create_autocmd({ "CursorHold" }, {
  callback = function()
    local status_ok, luasnip = pcall(require, "luasnip")
    if not status_ok then
      return
    end
    if luasnip.expand_or_jumpable() then
      -- ask maintainer for option to make this silent
      -- luasnip.unlink_current()
      vim.cmd [[silent! lua require("luasnip").unlink_current()]]
    end
  end,
})
