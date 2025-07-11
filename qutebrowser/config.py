import catppuccin

config.load_autoconfig()
config.set('auto_save.session', True)

import os
os.environ['DISPLAY'] = ':0'  # zenity

c.aliases = {
    'o': 'open -t',
    'q': 'close',
    'ow': 'open',
    'cs': 'config-source',
    'bd': 'bookmark-del',
    'dd': 'download-delete',
    'dev': 'devtools',
    'log': 'messages',
    'qa': 'cmd-set-text -s :quickmark-add {url}',
    'qd': 'quickmark-del',
    'bit': 'spawn --userscript qute-bitwarden-mac.js',
    'hello': 'spawn --userscript qute-bitwarden-rs --debug',
    'yts': 'spawn --userscript set-youtube-speed.js',
    'gr': 'greasemonkey-reload',
    'go': 'cmd-set-text -s :quickmark-load -t',
    'gO': 'cmd-set-text -s :quickmark-load'
}

config.bind('f', 'mode-leave', mode='hint')
config.bind('<Meta-s>', 'config-cycle tabs.show always never')
config.bind("yo", "yank inline [[{url}][{title}]]")
config.bind('<Meta-t>', 'open -t')
config.bind("<Meta-w>", ":tab-close")
config.bind('<Meta-f>', ':set-cmd-text /')
config.bind('<Meta-p>', ':tab-pin')
config.bind('<Meta-Shift-t>', 'undo')
config.bind('<Meta-Shift-i>', 'dev')
config.bind('<Meta-l>', ':cmd-set-text :open {url:pretty}')
config.bind('<Meta-t>', ':cmd-set-text -s :open -t')
config.bind('<Shift-o>', 'go')
config.bind('<Shift-c>', 'cs')
config.bind('o', ':cmd-set-text -s :open -t')
config.bind(',v', 'cmd-set-text -s :yts')
config.bind('go', 'go')
config.bind('gO', 'gO')
config.bind('[', ':tab-prev')
config.bind(']', ':tab-next')
config.bind('{', ':tab-move -')
config.bind('}', ':tab-move +')
config.bind('h', ':back')
config.bind('l', ':forward')
config.bind('b', 'qa')
config.bind('<Shift-m>', 'qd')
config.bind('<Ctrl+b>', 'bookmark-list -t')
config.bind('<Meta+1>', 'tab-focus 1')
config.bind('<Meta+2>', 'tab-focus 2')
config.bind('<Meta+3>', 'tab-focus 3')
config.bind('<Meta+4>', 'tab-focus 4')
config.bind('<Meta+5>', 'tab-focus 5')
config.bind('<Meta+6>', 'tab-focus 6')
config.bind('<Meta+7>', 'tab-focus 7')
config.bind('<Meta+8>', 'tab-focus 8')
config.bind('<Meta+9>', 'tab-focus 9')
config.bind('<Meta+b>', 'bit')
config.bind('<Meta+x>', 'hello')

catppuccin.setup(c, 'mocha', True)

c.auto_save.session = True
c.content.pdfjs = True
c.fonts.default_family = 'HackGen'
c.fonts.default_size = '12pt'
c.fonts.web.size.default = 14
c.url.default_page = 'https://start.duckduckgo.com/'
c.url.start_pages = 'https://start.duckduckgo.com/'
c.scrolling.bar = "always"
c.scrolling.smooth = False

c.completion.height = '20%'
c.completion.shrink = True
c.completion.use_best_match = True

# hints
c.hints.chars = 'qweasdzxciopjklnm'
c.hints.uppercase = True
c.colors.hints.fg = '#222222'
c.fonts.keyhint = '14pt HackGen'
c.fonts.hints = 'normal 15pt HackGen'
c.hints.padding = {'top': 0, 'bottom': 0, 'left': 2, 'right': 2}
c.colors.hints.bg = 'qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1, stop: 0 rgba(255, 247, 133, 204), stop: 1 rgba(255, 197, 66, 204))'
c.hints.border = '1px solid #E3BE23'
c.fonts.prompts = "normal 15pt HackGen"

# tabs
c.tabs.indicator.width = 0
c.tabs.title.format = "{current_title}"
c.tabs.favicons.scale = 1.5
c.tabs.favicons.show = "always"
c.new_instance_open_target = "tab"
c.new_instance_open_target_window = 'last-focused'
c.tabs.new_position.unrelated = 'next'
c.fonts.tabs.selected = '13pt HackGen'
c.fonts.tabs.unselected = '13pt HackGen'
c.window.transparent = True
c.window.hide_decoration = True
c.tabs.position = "right"
c.tabs.width = 180
c.tabs.padding = {'top': 5, 'bottom': 5, 'left': 5, 'right': 5}
c.tabs.show = "always"
c.colors.statusbar.insert.bg = "darkgreen"
c.colors.statusbar.insert.fg = "lime"
c.colors.tabs.odd.bg = "#181825"
c.colors.tabs.even.bg = "#181825"
c.colors.tabs.selected.odd.bg = "#45475a"
c.colors.tabs.selected.odd.fg = "#cdd6f4"
c.colors.tabs.selected.even.bg = "#45475a"
c.colors.tabs.selected.even.fg = "#cdd6f4"

# adblock
c.content.blocking.enabled = True
c.content.blocking.method = 'both'  # adblock & hosts
c.content.blocking.adblock.lists = [
    "https://easylist.to/easylist/easylist.txt",
    "https://easylist.to/easylist/easyprivacy.txt",
    "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt",
    "https://easylist.to/easylist/fanboy-annoyance.txt",
    "https://secure.fanboy.co.nz/fanboy-annoyance.txt",
    "https://github.com/uBlockOrigin/uAssets/raw/master/filters/annoyances.txt",
    "https://github.com/uBlockOrigin/uAssets/raw/master/filters/filters.txt",
    "https://github.com/uBlockOrigin/uAssets/raw/master/filters/privacy.txt",
    "https://github.com/uBlockOrigin/uAssets/raw/master/filters/unbreak.txt",
    "https://github.com/uBlockOrigin/uAssets/raw/master/filters/resource-abuse.txt",
    "https://raw.githubusercontent.com/Ewpratten/youtube_ad_blocklist/master/blocklist.txt",
]
c.content.blocking.hosts.lists = [
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext",
]
c.url.searchengines = {
    "DEFAULT": 'https://duckduckgo.com/?q={}',
    "e": 'https://edge.esa.io/posts?q={}',
    'd': 'https://drive.google.com/drive/search?q={}',
    "y": 'https://www.youtube.com/results?search_query={}',
}
# Elements that commonly miss hints
c.hints.selectors['all'] += [
    'div[onclick]',
    'span[onclick]',
    '[role=link]',
    '[role=button]',
    '[role=tab]',
    '[role=menuitem]',
    '[aria-haspopup]',
    '[event-type=click]',
    'label.tocitem',
    'i.button-icon',
    '.next-btn',
    '.pre-btn',
    '.clickable',
    '.expando-button'
    '.cursor-pointer',
    '.side-navi .list-item',
]
