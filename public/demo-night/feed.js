// The builder's side of the screen, at three levels of sight over the same traffic.
// Level 1 is a server with no observability: an access log where every request is a 200.
// Level 2 adds traces and logs: which tool ran, whose token called it, and whether it failed.
// Level 3 adds MCP Analytics: what they wanted, whether they got it, and what was missing.
// The board asks the same four questions at every level, and each level answers more of them.
function createFeed(root, colorOf, priceOf) {
    const span = (cls, value) => {
        const node = el('span', cls)
        node.textContent = value
        return node
    }

    const terminal = el('section', 'terminal')
    const bar = el('header')
    const source = span('', '')
    bar.append(el('i'), el('i'), el('i'), source)
    const lines = el('ol', 'record')
    terminal.append(bar, lines)

    // At level 3 the log gives way to the customer's session: one visit, its calls in order, and the
    // reason the agent gave for each. This is the view traces cannot assemble.
    const visit = el('section', 'visit')
    const visitHead = el('header')
    const visitor = span('visitor', '')
    const tally = span('tally', '')
    visitHead.append(span('', 'Session'), visitor, tally)
    const steps = el('ol', 'record')
    visit.append(visitHead, steps)

    const board = el('section', 'board')
    const heading = el('header')
    const mode = span('mode', '')
    heading.append(span('', 'What you can tell'), mode)
    const question = (text) => {
        const row = el('div', 'q')
        const answer = el('div', 'a')
        row.append(span('ask', text), answer)
        board.append(row)
        return answer
    }
    board.append(heading)
    const wrong = question('Did anything go wrong?')
    const who = question('Who was it?')
    const want = question('What did they want, and did they get it?')
    const lack = question('What did they want that you don’t have?')
    const rows = [wrong, who, want, lack].map((answer) => answer.parentElement)
    root.append(terminal, visit, board)
    // An entrance plays once. Left in place, the class would replay it every time the board came back
    // into view.
    root.addEventListener('animationend', (e) => e.target.classList.remove('enter', 'new'))

    const SOURCES = { 1: 'tail -f logs/access.log', 2: 'traces · merch-mcp', 3: 'traces · merch-mcp' }
    const MODES = { 1: 'from HTTP logs', 2: 'from traces and logs', 3: 'with MCP Analytics' }

    const sessions = new Map()
    const asked = []
    // What the board has already shown, so only a new answer makes an entrance.
    const shown = new Set()
    const entering = (node, key, order) => {
        if (shown.has(key)) return node
        shown.add(key)
        node.classList.add('enter')
        node.style.animationDelay = `${order * 70}ms`
        return node
    }
    // The calls as a server without analytics records them, and as the SDK records them.
    const plain = []
    const rich = []
    let calls = 0
    const failedAt = new Map()
    const callers = new Set()
    let level = 1

    function line(event) {
        const at = event.at ? new Date(event.at) : new Date()
        const stamp = at.toTimeString().slice(0, 8)
        // An MCP tool that fails still answers 200: the failure is inside the response body.
        if (level === 1) {
            const row = el('li')
            row.append(span('time', stamp), span('tool', 'POST /mcp'), span('args', `${event.durationMs ?? 0}ms`), span('result', '200'))
            return row
        }
        const row = el('li', event.error ? 'failed' : '')
        row.append(
            span('time', stamp),
            span('tool', event.tool),
            span('args', JSON.stringify(event.args ?? {})),
            span('result', event.error ? 'isError' : 'ok')
        )
        // An authenticated server knows whose token made the call, and a careful one puts it on the span.
        if (event.token) row.children[2].prepend(span('caller', `user=${event.token.split('@')[0]}`))
        return row
    }

    // Only a line that has just arrived is flashed, not the whole log each time it is redrawn.
    function renderLog(arrived) {
        source.textContent = SOURCES[level]
        terminal.hidden = level === 3
        visit.hidden = level !== 3
        if (level === 3) return renderVisit(arrived)
        const rows = plain.map(line)
        if (arrived) rows.at(-1)?.classList.add('new')
        lines.replaceChildren(...rows)
    }

    // What the customer's agent sent, in as few words as say it. Who they are is already in the header.
    const sent = (args = {}) =>
        Object.entries(args)
            .filter(([key]) => !['email', 'shipping_speed', 'quantity'].includes(key))
            .map(([key, value]) => `${key}=${value}`)
            .join(' ')

    function renderVisit(arrived) {
        const session = [...sessions.values()].at(-1)
        const calls = session?.steps ?? []
        const fails = calls.filter((step) => step.error).length
        const first = calls[0]
        const took = calls.length > 1 ? Math.max(1, Math.round((new Date(calls.at(-1).at) - new Date(first.at)) / 1000)) : 0
        visit.style.setProperty('--session', session ? `rgb(${session.color})` : 'transparent')
        visitor.textContent = first ? [first.user, first.client, first.model].filter(Boolean).join(' · ') : 'nobody yet'
        tally.textContent = calls.length ? [plural(calls.length, 'call'), fails && `${fails} failed`, took && `${took}s`].filter(Boolean).join(' · ') : ''
        const rows = calls.slice(-7).map((step, i) => {
            const asked = step.tool === 'get_more_tools'
            const row = el('li', step.error ? 'failed' : asked ? 'asked' : '')
            // A failed call says why it failed, a report says what was asked for, and the rest say
            // what was sent. The reason for each call is on the map, beside the customer's figure.
            const detail = step.error ? (step.why ?? 'failed') : asked ? (step.intent ?? '') : sent(step.args)
            row.append(
                span('n', String(calls.length - Math.min(calls.length, 7) + i + 1)),
                span('tool', step.tool),
                span('sent', detail),
                span('ms', `${step.durationMs ?? 0}ms`),
                span('mark', step.error ? '✕' : '✓')
            )
            return row
        })
        if (arrived) rows.at(-1)?.classList.add('new')
        steps.replaceChildren(...rows)
    }

    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
    const list = (items) => (items.length < 3 ? items.join(' and ') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`)

    // How a session stands, read off its calls: the thing a log line on its own cannot say.
    function outcome(steps) {
        const fails = steps.filter((step) => step.error).length
        if (steps.some((step) => step.tool === 'checkout' && !step.error)) {
            return fails ? ['good', `ordered, after ${plural(fails, 'failed call')}`] : ['good', 'ordered']
        }
        // What was in the cart when they gave up is the price of not knowing.
        const cart = steps
            .filter((step) => step.tool === 'add_to_cart' && !step.error)
            .reduce((sum, step) => sum + (priceOf(step.args?.product_id) ?? 0) * (step.args?.quantity ?? 1), 0)
        if (fails) return ['bad', cart ? `no order · $${cart} left in the cart` : `no order, ${plural(fails, 'failed call')}`]
        if (steps.at(-1).tool === 'get_more_tools') return ['lack', 'asked for something you lack']
        return ['open', 'asked, did not buy']
    }

    const unknown = (detail) => [span('unknown', 'Can’t tell.'), span('detail', detail)]

    // An answer that has just changed is tinted for a moment, so the eye goes from the new log line to
    // what it changed about what you know.
    const said = new Map()
    function render() {
        paint()
        for (const answer of [wrong, who, want, lack]) {
            const now = answer.textContent
            const moved = said.has(answer) && said.get(answer) !== now
            said.set(answer, now)
            if (!moved || matchMedia('(prefers-reduced-motion: reduce)').matches) continue
            answer.animate([{ backgroundColor: 'rgba(245, 78, 0, 0.2)' }, { backgroundColor: 'rgba(245, 78, 0, 0)' }], { duration: 700, easing: 'ease-out' })
        }
    }

    function paint() {
        mode.textContent = MODES[level]
        board.dataset.on = String(level === 3)
        const failed = [...failedAt.values()].reduce((sum, n) => sum + n, 0)

        if (level === 1) {
            wrong.replaceChildren(...unknown(calls ? `${plural(calls, 'request')}, every one a 200.` : ''))
        } else if (!calls) {
            wrong.replaceChildren(span('detail', 'Nothing yet.'))
        } else if (!failed) {
            wrong.replaceChildren(span('known', `None so far: ${plural(calls, 'call')}, none failed.`))
        } else {
            const where = [...failedAt].map(([tool, n]) => (n > 1 ? `${tool} ×${n}` : tool))
            wrong.replaceChildren(span('known', `Yes. ${plural(failed, 'call')} failed: ${list(where)}.`))
        }

        if (level < 3) {
            if (level === 2 && callers.size) {
                who.replaceChildren(span('known', list([...callers])), span('detail', 'From the token on each call. One visit or five? Can’t tell.'))
            } else {
                who.replaceChildren(...unknown(level === 2 && calls ? `${plural(calls, 'call')}, with no user on the span.` : ''))
            }
            want.replaceChildren(...unknown(''))
            lack.replaceChildren(...unknown(''))
            return
        }
        const names = [...sessions.values()].map((session) => session.steps.find((step) => step.user)?.user).filter(Boolean)
        const headcount = plural(sessions.size, 'customer')
        who.replaceChildren(
            span('known', !sessions.size ? 'Nobody yet.' : names.length ? `${headcount}: ${list(names.slice(-3))}` : headcount)
        )
        // Two customers with their goals in full read better than three cut short.
        const recent = [...sessions.values()].slice(-2)
        const earlier = sessions.size - recent.length
        want.replaceChildren(
            ...recent.map((session, order) => {
                const [kind, label] = outcome(session.steps)
                const row = el('div', 'agent')
                row.style.setProperty('--session', `rgb(${session.color})`)
                row.append(span('goal', session.steps[0].intent ?? session.steps[0].tool), span('end ' + kind, label))
                return entering(row, session, order)
            }),
            ...(earlier ? [span('more', `and ${plural(earlier, 'earlier customer')}`)] : [])
        )
        lack.replaceChildren(
            ...(asked.length
                ? asked.slice(-2).map((text, order) => entering(span('known wanted', text), text, recent.length + order))
                : [span('detail', 'Nothing reported yet.')])
        )
    }

    return {
        setLevel(value) {
            // Arriving at the answers is the reveal, so they come in again each time the level changes.
            if (value !== level) shown.clear()
            level = value
            renderLog()
            render()
        },
        // The talk can hold questions back and answer them one at a time.
        setReveal(count) {
            rows.forEach((row, i) => {
                const waiting = i >= count
                if (!waiting && row.hasAttribute('data-wait')) row.classList.add('enter')
                row.toggleAttribute('data-wait', waiting)
            })
        },
        // Forget what one server's calls have shown so far, so they can be told again one at a time.
        rewind(channel) {
            if (channel === 'instrumented') {
                rich.length = asked.length = 0
                sessions.clear()
            } else {
                plain.length = 0
                calls = 0
                failedAt.clear()
                callers.clear()
            }
            shown.clear()
            renderLog()
            render()
        },
        reset() {
            plain.length = rich.length = 0
            sessions.clear()
            asked.length = 0
            shown.clear()
            failedAt.clear()
            callers.clear()
            calls = 0
            renderLog()
            render()
        },
        add(event) {
            event.at ??= new Date().toISOString()
            if (event.channel === 'instrumented') {
                rich.push(event)
                if (rich.length > 6) rich.shift()
                if (event.session !== undefined) {
                    if (!sessions.has(event.session)) sessions.set(event.session, { steps: [], color: colorOf(event.session) })
                    sessions.get(event.session).steps.push(event)
                    if (event.tool === 'get_more_tools' && event.intent) asked.push(event.intent)
                }
            } else {
                plain.push(event)
                if (plain.length > 6) plain.shift()
                calls += 1
                if (event.token) callers.add(event.token)
                if (event.error) failedAt.set(event.tool, (failedAt.get(event.tool) ?? 0) + 1)
            }
            renderLog((event.channel === 'instrumented') === (level === 3))
            render()
        },
    }
}
