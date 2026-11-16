import { expect, test } from 'claude-code/testing'
import { linkify } from './linkify'

test('links paths outside code, keeps fences and urls', () => {
  const src = 'see `/Users/a/b.ts:12` and /tmp/x.png.\n```\n/Users/a/c\n```\nhttps://e.com/Users/x and `cat /Users/a/d`'
  const { text, hrefs } = linkify(src, '/Users/a')
  expect(text).toBe('see [`/Users/a/b.ts:12`](file:///Users/a/b.ts) and [/tmp/x.png](file:///tmp/x.png).\n```\n/Users/a/c\n```\nhttps://e.com/Users/x and `cat /Users/a/d`')
  expect(hrefs).toEqual(['file:///Users/a/b.ts', 'file:///tmp/x.png'])
  expect(linkify('`~/n.md`', '/Users/a').hrefs).toEqual(['file:///Users/a/n.md'])
})
