import dracula.draw

config.load_autoconfig()
config.set('auto_save.session', True)

c.aliases = {
    'o': 'open -t',
    'q': 'close',
    'ow': 'open',
    'cs': 'config-source',
    'bd': 'bookmark-del',
    'dd': 'download-delete',
    'dev': 'devtools',
    'log': 'messages',
    'bit': 'spawn --userscript qute-bitwarden.js',
    'bitu': 'spawn --userscript qute-bitwarden.js --username-only',
    'bitp': 'spawn --userscript qute-bitwarden.js --password-only',
    'bitc': 'spawn --userscript qute-bitwarden.js --custom-fields-only',
    'yts': 'spawn --userscript set-youtube-speed.js',
}
config.bind("yo", "yank inline [[{url}][{title}]]")
config.bind('<Meta-t>', 'open -t')
config.bind("<Meta-w>", ":tab-close")
config.bind('<Meta-f>', ':set-cmd-text /')
config.bind('<Meta-p>', ':tab-pin')
config.bind('<Meta-Shift-t>', 'undo')
config.bind('<Meta-l>', ':cmd-set-text :open {url:pretty}')
config.bind('o', 'cmd-set-text -s :open -t')
config.bind(',v', 'cmd-set-text -s :yts')
config.bind('go', 'cmd-set-text -s :quickmark-load -t')
config.bind('gO', 'cmd-set-text -s :quickmark-load')
config.bind('[', ':tab-prev')
config.bind(']', ':tab-next')
config.bind('{', ':tab-move -')
config.bind('}', ':tab-move +')
config.bind('h', ':back')
config.bind('l', ':forward')
config.bind('b', 'bookmark-add')
config.bind('<Shift-b>', 'bookmark-del')
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

dracula.draw.blood(c, {
    'spacing': {
        'vertical': 6,
        'horizontal': 8
    }
})

c.auto_save.session = True
c.content.pdfjs = True
c.fonts.default_family = "HackGen"
c.fonts.default_size = "18pt"
c.fonts.web.size.default = 16
c.url.default_page = 'https://start.duckduckgo.com/'
c.url.start_pages = 'https://start.duckduckgo.com/'
c.scrolling.bar = "always"

# hints
c.hints.chars = 'qweasdzxciopjklnm'
c.hints.uppercase = True
c.colors.hints.fg = '#222222'
c.fonts.keyhint = '18pt HackGen'
c.fonts.hints = 'normal 12pt HackGen'
c.hints.padding = {'top': 0, 'bottom': 0, 'left': 1, 'right': 1}
c.colors.hints.bg = 'qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1, stop: 0 rgba(255, 247, 133, 204), stop: 1 rgba(255, 197, 66, 204))'
c.hints.border = '1px solid #E3BE23'

# tabs
c.tabs.indicator.width = 0
c.tabs.title.format = " {current_title}"
c.tabs.favicons.scale = 2
c.tabs.favicons.show = "always"
c.new_instance_open_target = "tab"
c.new_instance_open_target_window = 'last-focused'
c.tabs.new_position.unrelated = 'next'
c.fonts.tabs.selected = '14pt HackGen'
c.fonts.tabs.unselected = '14pt HackGen'
c.window.transparent = True
c.window.hide_decoration = True
c.tabs.position = "left"
c.tabs.width = 280
c.tabs.padding = {'top': 15, 'bottom': 15, 'left': 8, 'right': 5}

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
    'label.tocitem',
    'i.button-icon',
    '.clickable',
    '.expando-button'
    '.list-item',
]
