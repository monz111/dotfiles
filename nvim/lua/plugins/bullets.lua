local M = {
  "bullets-vim/bullets.vim",
}

-- NOTE: enable the plugin only for specific filetypes, if you don't do this,
-- and you use the new snacks picker by folke, you won't be able to select a
-- file with <CR> when in insert mode, only in normal mode
-- https://github.com/folke/snacks.nvim/issues/812
--
-- This didn't work, added vim.g.bullets_enable_in_empty_buffers = 0 to
-- ~/github/dotfiles-latest/neovim/neobean/init.lua
-- ft = { "markdown", "text", "gitcommit", "scratch" },
function M.config()
  -- Disable deleting the last empty bullet when pressing <cr> or 'o'
  -- default = 1
  vim.g.bullets_delete_last_bullet_if_empty = 1

  -- (Optional) Add other configurations here
  -- For example, enabling/disabling mappings
  -- vim.g.bullets_set_mappings = 1

  -- <leader>D で挿入する日付見出しの書式（os.date の書式指定子が使える）
  local date_heading_format = "## %Y/%m/%d"

  -- bullets.vim は [ ] <-> [x] の切替しかできないので、[ ] 自体の付け外しを補う
  local function toggle_marker(line)
    if line:match "^%s*[-*+] %[.%] " then
      -- チェックボックスを外す
      return (line:gsub("^(%s*[-*+] )%[.%] ", "%1"))
    elseif line:match "^%s*[-*+] " then
      -- 箇条書き -> チェックボックス
      return (line:gsub("^(%s*[-*+] )", "%1[ ] "))
    else
      -- 通常行 -> チェックボックス
      return (line:gsub("^(%s*)", "%1- [ ] ", 1))
    end
  end

  vim.api.nvim_create_user_command("ToggleCheckboxMarker", function(opts)
    for lnum = opts.line1, opts.line2 do
      vim.fn.setline(lnum, toggle_marker(vim.fn.getline(lnum)))
    end
  end, { range = true })

  vim.api.nvim_create_autocmd("FileType", {
    pattern = vim.g.bullets_enabled_file_types or { "markdown", "text", "gitcommit" },
    callback = function(ev)
      local opts = { buffer = ev.buf, desc = "Toggle checkbox marker" }
      vim.keymap.set("n", "<leader>X", "<cmd>ToggleCheckboxMarker<cr>", opts)
      vim.keymap.set("x", "<leader>X", ":ToggleCheckboxMarker<cr>", opts)

      vim.keymap.set("n", "<leader>D", function()
        local line = os.date(date_heading_format)
        if vim.api.nvim_get_current_line() == "" then
          vim.api.nvim_set_current_line(line)
        else
          vim.api.nvim_put({ line }, "l", true, true)
        end
      end, { buffer = ev.buf, desc = "Insert date heading" })
    end,
  })
end

return M
