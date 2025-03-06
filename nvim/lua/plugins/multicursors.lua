local M = {
  "jake-stewart/multicursor.nvim",
  branch = "1.0",
  config = function()
    local mc = require "multicursor-nvim"
    mc.setup()

    vim.keymap.set({ "n", "v" }, "<c-n>", function()
      mc.addCursor "*"
    end)
    -- Delete the main cursor.
    -- vim.keymap.set({ "n", "v" }, "<leader>x", mc.deleteCursor)

    vim.keymap.set("n", "<esc>", function()
      if not mc.cursorsEnabled() then
        mc.enableCursors()
      elseif mc.hasCursors() then
        mc.clearCursors()
      else
        -- Default <esc> handler.
      end
    end)

    -- Customize how cursoggrs look.
    vim.api.nvim_set_hl(0, "MultiCursorCursor", { link = "Cursor" })
    vim.api.nvim_set_hl(0, "MultiCursorVisual", { link = "Visual" })
    vim.api.nvim_set_hl(0, "MultiCursorDisabledCursor", { link = "Visual" })
    vim.api.nvim_set_hl(0, "MultiCursorDisabledVisual", { link = "Visual" })
  end,
}

return M
