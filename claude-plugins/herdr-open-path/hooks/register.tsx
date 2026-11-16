import type { Register } from 'claude-code'
import { linkify, isImage } from './linkify'

export const register: Register = (on) => {
  let home = ''
  let me: string | undefined
  // shortcut: the viewer pane is remembered in memory only, after a reload the old one stays open; move to $.state if that bothers.
  let viewerPane: string | undefined

  on('session.start', async ($, e, next) => {
    home = (await $.env.get('HOME')) ?? ''
    me = await $.env.get('HC_TERMINAL_ID')
    return next(e)
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (!me || e.surface !== 'terminal' || e.props.isSummary) return next(e)
    const { text, hrefs } = linkify(e.props.text, home)
    if (hrefs.length === 0) return next(e)

    const run = async (argv: string[]) => {
      const r = await $.process.run(argv)
      if (r.exitCode !== 0) throw new Error(`${argv.slice(0, 3).join(' ')}: ${r.stderr || r.stdout}`)
      return r.stdout
    }
    const herdr = (...args: string[]) => run(['herdr-app', 'do', ...args]).then(s => JSON.parse(s))
    const myTab = async () => {
      const ls = JSON.parse(await run(['herdr-app', 'ls']))
      for (const s of ls.spaces) for (const t of s.tabs)
        if (t.terminals.some((x: { terminal: string }) => x.terminal === me)) return t.terminals as { terminal: string; pane: string }[]
      throw new Error(`herdrに自分のターミナル（${me}）が見つからない`)
    }

    const open = async (path: string) => {
      const terms = await myTab()
      const i = terms.findIndex(x => x.terminal === me)
      const myPane = terms[i].pane
      if (isImage(path)) {
        let right = terms[i + 1]?.terminal
        if (!right) {
          const { pane } = await herdr('pane.split', '--direction', 'right', '--pane', myPane)
          for (let n = 0; n < 20 && !right; n++) {
            right = (await myTab()).find(x => x.pane === pane)?.terminal
            if (!right) await new Promise(r => setTimeout(r, 100))
          }
          if (!right) throw new Error('新しいペインのターミナルが見つからない')
        }
        // env -u: with HC_TERMINAL_ID set, hc wraps the text in <hc from=…> and the shell cannot run it.
        await run(['env', '-u', 'HC_TERMINAL_ID', 'hc', 'send', right, `cat '${path.replace(/'/g, `'\\''`)}'`])
      } else {
        if (viewerPane) await herdr('pane.close', '--pane', viewerPane).catch(() => {})
        viewerPane = (await herdr('pane.split', '--direction', 'right', '--pane', myPane, '--mod', 'file-view', '--props', JSON.stringify({ file: path }))).pane
      }
      await herdr('pane.focus', '--pane', myPane)
    }

    const { Box, Text, Markdown } = $.ui.resolve(e)
    return (
      <Box flexDirection="row">
        <Box width={2} flexShrink={0}><Text>{e.props.isFirstOfReply ? '●' : ' '}</Text></Box>
        <Box flexGrow={1} flexDirection="column">
          <Markdown
            key={`md-${hash(text)}`}
            text={text}
            pressableLinks={hrefs}
            onLinkPress={link => {
              const path = decodeURI(link.href.replace(/^file:\/\//, ''))
              open(path).catch(err => $.ui.toast(`開けない: ${err.message ?? err}`))
            }}
          />
        </Box>
      </Box>
    )
  })
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
