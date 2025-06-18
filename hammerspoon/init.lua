---@diagnostic disable: undefined-global
hs.window.animationDuration = 0.1

local margin = 20
local screen = hs.screen.primaryScreen()
local screenFrame = screen:frame()

local function applyMargin(rect, isMain)
  local adjustedMargin = isMain and margin or (2 * margin)
  return {
    x = rect.x + margin / screenFrame.w,
    y = rect.y + (1 * margin) / screenFrame.h,
    w = rect.w - adjustedMargin / screenFrame.w,
    h = rect.h - (2 * margin) / screenFrame.h,
  }
end

local layout = {
  left30 = applyMargin({ x = 0, y = 0, w = 0.3, h = 1 }, true),
  right70 = applyMargin({ x = 0.3, y = 0, w = 0.7, h = 1 }),
  left70 = applyMargin({ x = 0, y = 0, w = 0.7, h = 1 }, true),
  right30 = applyMargin({ x = 0.7, y = 0, w = 0.3, h = 1 }),
  left40 = applyMargin({ x = 0, y = 0, w = 0.4, h = 1 }, true),
  right60 = applyMargin({ x = 0.4, y = 0, w = 0.6, h = 1 }),
  left60 = applyMargin({ x = 0, y = 0, w = 0.6, h = 1 }, true),
  right40 = applyMargin({ x = 0.6, y = 0, w = 0.4, h = 1 }),
}

local apps = {
  browser = "Zen",
  terminal = "Ghostty",
  chat = "Slack",
}
local watchedApps = { apps.browser, apps.terminal, apps.chat }
local lastVisibleApp = ""

local function arrangeAndToggleApps(activeAppName)
  local windowLayout = {}
  local screen = hs.screen.primaryScreen()
  local terminalApp = hs.application.find(apps.terminal)
  local chatApp = hs.application.find(apps.chat)
  local browserApp = hs.application.find(apps.browser)

  if activeAppName == apps.browser and (lastVisibleApp == apps.terminal or lastVisibleApp == apps.chat) then
    chatApp:hide()
    terminalApp:hide()
    browserApp:unhide()
    -- table.insert(windowLayout, { apps.browser, nil, screen, layout.left70, nil, nil })
    -- table.insert(windowLayout, { lastVisibleApp, nil, screen, layout.right30, nil, nil })
  elseif activeAppName == apps.terminal then
    chatApp:hide()
    browserApp:hide()
    terminalApp:unhide()
    -- table.insert(windowLayout, { apps.browser, nil, screen, layout.left40, nil, nil })
    -- table.insert(windowLayout, { apps.terminal, nil, screen, layout.right60, nil, nil })
  elseif activeAppName == apps.chat then
    terminalApp:hide()
    browserApp:hide()
    chatApp:unhide()
    -- table.insert(windowLayout, { apps.browser, nil, screen, layout.left60, nil, nil })
    -- table.insert(windowLayout, { apps.chat, nil, screen, layout.right40, nil, nil })
  end

  hs.layout.apply(windowLayout)
  lastVisibleApp = activeAppName
end

local function arrangeActiveWindow()
  local activeApp = hs.application.frontmostApplication()
  local activeAppName = activeApp:name()
  arrangeAndToggleApps(activeAppName)
end

local function applicationWatcher(appName, eventType, appObject)
  if eventType == hs.application.watcher.activated then
    if hs.fnutils.contains(watchedApps, appName) then
      arrangeAndToggleApps(appName)
    end
  end
end

appWatcher = hs.application.watcher.new(applicationWatcher)
appWatcher:start()

hs.hotkey.bind({ "cmd", "alt", "ctrl" }, "R", function()
  hs.reload()
end)

hs.alert.show("Hammerspoon config loaded")

-- Watches for the ESC key press and moves the mouse cursor to the left center of the screen
-- Ensures the default ESC behavior is not blocked
-- Uses hs.eventtap to capture key events without interfering with system shortcuts
eventtapWatcher = hs.eventtap.new({ hs.eventtap.event.types.keyDown }, function(event)
  local key = hs.keycodes.map[event:getKeyCode()]

  if key == "escape" then
    local screenFrame = hs.screen.primaryScreen():frame()
    hs.mouse.absolutePosition({ x = screenFrame.w / 2, y = screenFrame.h + 60 })

    return false
  end

  return false
end)

eventtapWatcher:start()
