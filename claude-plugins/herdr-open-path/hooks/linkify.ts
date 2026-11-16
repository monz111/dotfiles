// Turns local absolute paths in reply markdown into file: links, leaving code fences and other code alone.
const ROOTS = '(?:~|/(?:Users|private|tmp|var|opt|Volumes|etc|usr|Applications|Library))'
const BODY = '/[^\\s`"\'<>()\\[\\]、。，）」』]*'
const BARE = new RegExp(`(?<![\\w/:.~-])${ROOTS}${BODY}`, 'g')
const WHOLE = new RegExp(`^${ROOTS}${BODY}$`)
const IMAGE = /\.(png|jpe?g|gif|webp|bmp|tiff?|heic)$/i

export const isImage = (path: string) => IMAGE.test(path)

export function linkify(text: string, home: string): { text: string; hrefs: string[] } {
  const hrefs = new Set<string>()
  const link = (raw: string, code: boolean) => {
    const label = raw.replace(/[.,;:!?]+$/, '')
    const tail = raw.slice(label.length)
    const path = label.replace(/:\d+(?:-\d+)?(?::\d+)?$/, '')
    const abs = path.startsWith('~') ? home + path.slice(1) : path
    if (!abs.startsWith('/') || abs === '/') return raw
    const href = 'file://' + encodeURI(abs)
    hrefs.add(href)
    return `[${code ? '`' + label + '`' : label.replace(/([_*])/g, '\\$1')}](${href})${tail}`
  }
  const out = text.split(/(^```[\s\S]*?(?:^```|(?![\s\S])))/m).map((seg, i) => {
    if (i % 2) return seg
    return seg.split(/(`[^`\n]+`)/).map((part, j) => {
      if (j % 2) return WHOLE.test(part.slice(1, -1)) ? link(part.slice(1, -1), true) : part
      return part.replace(BARE, m => link(m, false))
    }).join('')
  }).join('')
  return { text: out, hrefs: [...hrefs] }
}
