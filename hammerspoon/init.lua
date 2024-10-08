hs.window.animationDuration = 0

local layout = {
  left30 = { x = 0, y = 0, w = 0.3, h = 1 },
  right70 = { x = 0.3, y = 0, w = 0.7, h = 1 },
  left70 = { x = 0, y = 0, w = 0.7, h = 1 },
  right30 = { x = 0.7, y = 0, w = 0.3, h = 1 },
  left40 = { x = 0, y = 0, w = 0.4, h = 1 },
  right60 = { x = 0.4, y = 0, w = 0.6, h = 1 },
  left60 = { x = 0, y = 0, w = 0.6, h = 1 },
  right40 = { x = 0.6, y = 0, w = 0.4, h = 1 },
}

local watchedApps = { "Arc", "kitty", "Slack" }
local lastVisibleApp = "kitty"

local function arrangeAndToggleApps(activeAppName)
  local screen = hs.screen.primaryScreen()
  local windowLayout = {}
  local kittyApp = hs.application.find("kitty")
  local slackApp = hs.application.find("Slack")

  if activeAppName == "Arc" then
    table.insert(windowLayout, { "Arc", nil, screen, layout.left70, nil, nil })
    table.insert(windowLayout, { lastVisibleApp, nil, screen, layout.right30, nil, nil })
  elseif activeAppName == "kitty" then
    table.insert(windowLayout, { "Arc", nil, screen, layout.left40, nil, nil })
    table.insert(windowLayout, { "kitty", nil, screen, layout.right60, nil, nil })
    slackApp:hide()
    lastVisibleApp = "kitty"
  elseif activeAppName == "Slack" then
    table.insert(windowLayout, { "Arc", nil, screen, layout.left60, nil, nil })
    table.insert(windowLayout, { "Slack", nil, screen, layout.right40, nil, nil })
    table.insert(windowLayout, { "kitty", nil, screen, layout.right40, nil, nil })
    lastVisibleApp = "Slack"
  end
  hs.layout.apply(windowLayout)
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
