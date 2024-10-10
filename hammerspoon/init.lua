hs.window.animationDuration = 0

local margin = 20
local screen = hs.screen.primaryScreen()
local screenFrame = screen:frame()

local function applyMargin(rect, isMain)
  local adjustedMargin = isMain and margin or (2 * margin)
  return {
    x = rect.x + margin / screenFrame.w,
    y = rect.y + margin / screenFrame.h,
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

local watchedApps = { "Arc", "kitty", "Slack" }
local lastVisibleApp = ""

local function arrangeAndToggleApps(activeAppName)
  local screen = hs.screen.primaryScreen()
  local windowLayout = {}
  local kittyApp = hs.application.find("kitty")
  local slackApp = hs.application.find("Slack")

  if activeAppName == "Arc" and (lastVisibleApp == "kitty" or lastVisibleApp == "Slack") then
    table.insert(windowLayout, { "Arc", nil, screen, layout.left70, nil, nil })
    table.insert(windowLayout, { lastVisibleApp, nil, screen, layout.right30, nil, nil })
  elseif activeAppName == "kitty" then
    kittyApp:unhide()
    table.insert(windowLayout, { "Arc", nil, screen, layout.left40, nil, nil })
    table.insert(windowLayout, { "kitty", nil, screen, layout.right60, nil, nil })
    slackApp:hide()
  elseif activeAppName == "Slack" then
    slackApp:unhide()
    table.insert(windowLayout, { "Arc", nil, screen, layout.left60, nil, nil })
    table.insert(windowLayout, { "Slack", nil, screen, layout.right40, nil, nil })
    kittyApp:hide()
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
