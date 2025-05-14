vim.opt.backup = false -- creates a backup file
vim.opt.clipboard = "unnamedplus" -- allows neovim to access the system clipboard
vim.opt.cmdheight = 1 -- more space in the neovim command line for displaying messages
vim.opt.completeopt = { "menuone", "noselect" } -- mostly just for cmp
vim.opt.conceallevel = 0 -- so that `` is visible in markdown files
vim.opt.fileencoding = "utf-8" -- the encoding written to a file
vim.opt.hlsearch = true -- highlight all matches on previous search pattern
vim.opt.ignorecase = true -- ignore case in search patterns
vim.opt.mouse = "a" -- allow the mouse to be used in neovim
vim.opt.pumheight = 10 -- pop up menu height
vim.opt.pumblend = 0
vim.opt.winblend = 0
vim.opt.showmode = false -- we don't need to see things like -- INSERT -- anymore
vim.opt.showtabline = 1 -- always show tabs
vim.opt.smartcase = true -- smart case
vim.opt.smartindent = true -- make indenting smarter again
vim.opt.splitbelow = true -- force all horizontal splits to go below current window
vim.opt.splitright = true -- force all vertical splits to go to the right of current window
vim.opt.swapfile = false -- creates a swapfile
vim.opt.termguicolors = true -- set term gui colors (most terminals support this)
vim.opt.timeoutlen = 1000 -- time to wait for a mapped sequence to complete (in milliseconds)
vim.opt.undofile = true -- enable persistent undo
vim.opt.updatetime = 100 -- faster completion (4000ms default)
vim.opt.writebackup = false -- if a file is being edited by another program (or was written to file while editing with another program), it is not allowed to be edited
vim.opt.expandtab = true -- convert tabs to spaces
vim.opt.shiftwidth = 2 -- the number of spaces inserted for each indentation
vim.opt.spelllang = "en_us"
vim.opt.spell = false
vim.opt.tabstop = 2 -- insert 2 spaces for a tab
vim.opt.cursorline = true -- highlight the current line
vim.opt.cursorlineopt = "number"
vim.opt.guicursor = "i:ver25"
vim.opt.number = true -- set numbered lines
vim.opt.laststatus = 0
vim.opt.showcmd = false
vim.opt.ruler = false
vim.opt.relativenumber = false -- set relative numbered lines
vim.opt.numberwidth = 4 -- set number column width to 2 {default 4}
vim.opt.signcolumn = "yes" -- always show the sign column, otherwise it would shift the text each time
vim.opt.wrap = false -- display lines as one long line
vim.opt.scrolloff = 0
vim.opt.sidescrolloff = 8
vim.opt.guifont = "Hack Nerd Font" -- the font used in graphical neovim applications
vim.opt.title = false
vim.o.equalalways = false
vim.opt.fillchars = vim.opt.fillchars + "eob: "
vim.opt.fillchars:append {
  stl = " ",
}
vim.opt.sessionoptions = "buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"
vim.opt.shortmess:append "c"

vim.cmd "set whichwrap+=<,>,[,],h,l"
vim.cmd [[set iskeyword+=-]]

vim.g.netrw_banner = 0
vim.g.netrw_mouse = 2

vim.g.tpipeline_autoembed = 0
vim.g.tpipeline_clearstl = 1
vim.o.fcs = "stlnc:─,stl:─,vert:│"
vim.opt.fillchars:append { eob = " " }

vim.api.nvim_create_autocmd("FileType", {
  pattern = "*",
  callback = function()
    vim.bo.expandtab = true
    vim.bo.tabstop = 2
    vim.bo.shiftwidth = 2
    vim.bo.softtabstop = 2
  end,
})
vim.api.nvim_create_autocmd("FileType", {
  pattern = "php",
  command = "setlocal shiftwidth=4 softtabstop=4 expandtab tabstop=2",
})
vim.filetype.add {
  pattern = {
    [".env"] = "sh",
    [".env.*"] = "sh",
    ["*.env"] = "sh",
  },
}
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  pattern = "Config",
  command = "set filetype=toml",
})

-- Create custom commands for opening terminal in different positions
vim.api.nvim_create_user_command("Term", function(opts)
  vim.cmd("split | terminal " .. table.concat(opts.fargs, " "))
end, { nargs = "*" })

vim.api.nvim_create_user_command("VTerm", function(opts)
  vim.cmd("vsplit | terminal " .. table.concat(opts.fargs, " "))
end, { nargs = "*" })

vim.api.nvim_create_user_command("TTerm", function(opts)
  vim.cmd("tabnew | terminal " .. table.concat(opts.fargs, " "))
end, { nargs = "*" })
-- Automatically enter insert mode when opening terminal
vim.api.nvim_create_autocmd("TermOpen", {
  pattern = "*",
  callback = function()
    vim.cmd "startinsert"
  end,
})
-- Automatically close terminal buffer when process exits with success
vim.api.nvim_create_autocmd("TermClose", {
  pattern = "*",
  callback = function(args)
    if vim.v.event.status == 0 then
      pcall(function()
        local buf = args.buf
        if vim.api.nvim_buf_is_valid(buf) then
          vim.cmd("bdelete! " .. buf)
        end
      end)
    end
  end,
})
