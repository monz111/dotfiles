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

  local function addToLayout(appName, layoutPosition)
    table.insert(windowLayout, { appName, nil, screen, layoutPosition, nil, nil })
  end

  local function setWindowLayout()
    if activeAppName == "Arc" then
      addToLayout("Arc", layout.left70)
      addToLayout(lastVisibleApp, layout.right30)
    elseif activeAppName == "Slack" then
      addToLayout("Arc", layout.left60)
      addToLayout("Slack", layout.right40)
    else
      addToLayout("Arc", layout.left40)
      addToLayout("kitty", layout.right60)
    end
  end

  local function showOrHideApp(appName, shouldShow)
    local app = hs.application.find(appName)
    if app then
      if shouldShow then
        app:unhide()
      else
        app:hide()
      end
    end
  end

  local function updateLastVisibleApp()
    if activeAppName == "Slack" or activeAppName == "kitty" then
      lastVisibleApp = activeAppName
    elseif activeAppName == "Arc" and lastVisibleApp ~= "kitty" and lastVisibleApp ~= "Slack" then
      lastVisibleApp = "kitty"
    end
  end

  setWindowLayout()
  hs.layout.apply(windowLayout)
  showOrHideApp("Arc", true)

  if activeAppName == "Arc" then
    showOrHideApp(lastVisibleApp, true)
  else
    showOrHideApp("Slack", activeAppName == "Slack")
    showOrHideApp("kitty", activeAppName == "kitty")
  end

  updateLastVisibleApp()
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
