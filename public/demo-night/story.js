// The talk, as stops laid over the live map. Copy and art follow Juliana's demo night deck.
// A `card` covers the map; a `caption` leaves the map in view and says what to watch for.
const STOPS = [
    {
        kind: 'card',
        kicker: 'Hogpatch · Thursday, Nov 19',
        notes: {
            lines: [
                ["SAY", "Thanks for coming. I'm Lucas, from PostHog."],
                ["SAY", "Tonight I'm going to show you one customer using an MCP server, three times. Each time we get to see a bit more of what happened."],
            ],
        },
        title: 'MCP Analytics *Demo Night*',
        sub: 'See what agents do when they call your MCP server.',
        art: 'art/robot.svg',
    },
    {
        kind: 'card',
        kicker: 'The question',
        notes: {
            lines: [
                ["SAY", "Think about the last agent that called your MCP server. Do you know why it called?"],
                ["SAY", "I didn't know that for ours either. We run PostHog's MCP server, and for a long time all we had was logs."],
            ],
        },
        title: '*Wtf* are agents doing when they call my MCP server?',
        art: 'art/doc-brown.svg',
    },
    {
        kind: 'card',
        kicker: 'Why now',
        notes: {
            lines: [
                ["SAY", "The official MCP registry opened 14 months ago. It has 67,000 servers now."],
                ["SAY", "Atlassian's MCP server was getting 5 million calls a day in July. In October it was over 15 million."],
                ["SAY", "And almost 1 in 3 of those calls is a write. Agents are changing things in your product, not only reading."],
                ["SAY", "Our own MCP server went from 1,200 people a month to 134,000 in a year."],
                ["SAY", "So a lot of your users don't open your UI anymore. They send an agent."],
                ["IF LATE", "One sentence per number."],
            ],
        },
        title: 'Your UI is no longer your *only interface*',
        steps: 4,
        stats: [
            // Counted from the registry's public API on Nov 18 2026 with scripts/count-registry.py.
            { value: '67,000', label: 'servers in the official MCP Registry, 14 months after it opened', series: [[0, 0], [14, 67261]] },
            // Nothing at launch in May 2025, then the two figures Atlassian has published.
            { value: '5M → 15M+', label: 'tool calls a day to Atlassian’s MCP server: launch, July, October', series: [[0, 0], [14, 5], [17, 15]] },
            { value: 'Nearly 1 in 3', label: 'of those calls are writes. Agents act, they don’t just read.', share: [1, 3] },
            {
                value: '1.2k → 134k',
                label: 'people a month calling PostHog’s MCP server, October to October',
                // Distinct persons with an MCP tool call, each month from Oct 2025 to Oct 2026.
                series: [1196, 1332, 2845, 5126, 9177, 18177, 29758, 36952, 49060, 68276, 81941, 98742, 133548],
            },
        ],
    },
    {
        kind: 'card',
        kicker: 'Tonight’s story',
        notes: {
            lines: [
                ["SAY", "Say you built an MCP server for your merch store. Agents can search products, add them to a cart, check out and track an order."],
                ["SAY", "On the map you're about to see, each place is one of those tools."],
            ],
        },
        title: 'You shipped an MCP server for your *merch store*',
        sub: 'An agent can search the catalogue, fill a cart, check out and track an order. On the map that follows, each place is one of these tools.',
        chips: TOOLS,
        art: 'art/explorer.svg',
    },
    {
        kind: 'caption',
        side: 'client',
        example: true,
        kicker: 'Your customer’s side',
        notes: {
            lines: [
                ["SAY", "This is Priya. She's on her laptop, talking to her agent, and she asks it for a hoodie in medium, shipped to Brazil."],
                ["SAY", "Medium was sold out, and we don't ship to Brazil. She didn't get her hoodie."],
                ["SAY", "Keep that in mind. Now I'll show you the same thing from my side, as the person who built the server."],
                ["NOTE", "Her session is saved, so it shows right away. Start over runs it again and takes about a minute."],
            ],
        },
        title: 'Priya asks her agent for a hoodie, shipped to Brazil.',
    },
    {
        kind: 'caption',
        kicker: 'Your side · level 1 · no observability',
        notes: {
            lines: [
                ["SAY", "This dashed line is the network. Everything on the other side is her machine, and I never see it."],
                ["SAY", "All I have is my access log. Every request came back 200."],
                ["SAY", "She just got told we don't ship to Brazil, and my server answered 200. In MCP, a tool that fails still returns 200."],
                ["SAY", "So from here I can't answer any of these four questions."],
            ],
        },
        level: 1,
        title: 'Every request came back 200. Looks like a good day.',
    },
    {
        kind: 'caption',
        kicker: 'Level 2 · traces and logs',
        notes: {
            lines: [
                ["SAY", "So I add traces. My server has auth, so I put the user on every span."],
                ["SAY", "Now I can see checkout failed twice, and I can see it was Priya's token. That's real. I couldn't see that a minute ago."],
                ["SAY", "But what was she trying to do? Did she end up getting it some other way? Was this one visit or three?"],
                ["TIP", "Pause here."],
                ["SAY", "I still can't tell. And this is where most of us stop."],
            ],
        },
        level: 2,
        title: 'Now you can see checkout failing, and whose token it was. Not what she wanted.',
    },
    {
        kind: 'card',
        kicker: 'One command',
        notes: {
            lines: [
                ["SAY", "This is all I change. I run the wizard, it finds my server and adds this one line. My tool handlers stay the same."],
                ["SAY", "What the SDK does is ask every agent why it's calling, and give it a way to tell me when it can't find what it needs."],
                ["BACKUP", "The reason comes from a context argument the SDK adds to each tool schema. It is saved as $mcp_intent and stripped before your handler runs. The wizard handles TypeScript and Python."],
            ],
        },
        title: 'Wrap your server',
        code: ['npx @posthog/wizard mcp-analytics', 'instrument(server, posthog)'],
        sub: 'The wizard finds your server and wraps it. No handler changes. The SDK asks each agent why it is calling.',
    },
    {
        kind: 'caption',
        kicker: 'Level 3 · MCP Analytics',
        notes: {
            lines: [
                ["SAY", "Same store, same request. Now I get it as one session."],
                ["SAY", "It was Priya, on Claude Code. She wanted a medium hoodie for her team offsite, shipped to Brazil."],
                ["SAY", "She didn't get it. There's no order, and 75 dollars are still sitting in her cart."],
                ["SAY", "And her agent told me what was missing: shipping to Brazil."],
                ["SAY", "She wanted to pay me and I turned her away. My traces called that a checkout error."],
            ],
        },
        level: 3,
        title: 'Priya wanted to pay you, and you turned her away.',
    },
    {
        kind: 'card',
        kicker: 'Now multiply her',
        notes: {
            lines: [
                ["SAY", "That was one customer, and I read her session by hand."],
                ["SAY", "PostHog's MCP server got 76 million calls from 134,000 people last month. Nobody is going to read that."],
                ["SAY", "But once every call has a reason, I can ask questions. What do people want that I don't have? Where do they give up? Who stopped coming back?"],
                ["IF LATE", "Read the title and move on."],
            ],
        },
        title: 'One Priya is a story. *134,000 of them* is a roadmap.',
        sub: 'That was one customer, read by hand. Nobody reads 76 million traces. With a reason on every call, you stop reading and start asking.',
        tiles: [
            ['What do they want that you don’t have?', 'Your roadmap, ranked by demand'],
            ['Where do they give up?', 'Revenue you are losing today'],
            ['Who stopped coming back?', 'Retention, before it shows up as churn'],
        ],
        foot: 'PostHog’s own MCP server took 76 million tool calls from 134,000 people last month.',
    },
    {
        kind: 'caption',
        kicker: 'Your side, as the developer',
        notes: {
            lines: [
                ["SAY", "This is my own agent, connected to the PostHog MCP. I'm asking it about my server, with the same data you just saw."],
                ["DO", "When it answers, read the first sentence and the orange line. Read the numbers from the screen, they change between runs."],
                ["SAY", "So I know what to build next, and I didn't have to guess."],
                ["IF LATE", "Skip the question. If an answer is already on screen from rehearsal, read that one."],
            ],
        },
        side: 'developer',
        title: 'Now ask it a question.',
    },
    {
        kind: 'card',
        kicker: 'It happened to us',
        notes: {
            lines: [
                ["SAY", "We had the same problem with PostHog's MCP. People who signed up through ChatGPT and Claude kept searching our docs and then leaving."],
                ["SAY", "The data showed why. They had no data in PostHog yet, and no way to install us from where they were. So we put the install wizard inside the MCP. Nobody filed a ticket for that."],
                ["SAY", "The second one: agents were building a funnel, couldn't save it, and told us. We turned those reports into a ranked list of fixes."],
                ["SAY", "The numbers at the bottom are error rates before and after. To be fair, traces give you an error rate too. What was different is how we found out what to fix."],
                ["NOTE", "No signup or retention figures. The survey tools number is validation errors only."],
            ],
        },
        title: 'We were blind too. Then agents told us *what to build*.',
        tiles: [
            [
                'The install wizard, inside the MCP',
                'People arriving from ChatGPT and Claude kept searching our docs, not querying. They had no data yet, and no way to install us.',
                [118855, 118853],
            ],
            [
                'A backlog written by agents',
                'Agents built a funnel and couldn’t save it. They said so, in their own words, and it became a ranked list of fixes.',
                [100939, 117317],
            ],
        ],
        // The tool fixes: error rate before and after, and the pull request in PostHog/posthog.
        fixes: [
            ['skill-get', '6.6% → 0.6%', 91107],
            ['inbox-reports-retrieve', '6.2% → 0.4%', 91264],
            ['read-data-schema', '2.1% → 0.9%', 93052],
            ['experiment tools', '4.6% → 2.1%', 100587],
            ['survey tools', '3.4% → 0.4%', 130437],
        ],
    },
    {
        kind: 'card',
        kicker: 'What changed',
        notes: {
            lines: [
                ["SAY", "Traces tell you how your server is doing. This tells you how your users are doing. You want both."],
                ["SAY", "And level 4 is what you just saw: you ask your own agent."],
                ["SAY", "My dashboard was green the whole time Priya was being turned away."],
            ],
        },
        title: 'Traces watch your server. MCP Analytics watches your *users*.',
        picture: 'art/brain-meme.jpg',
        ladder: [
            ['Level 1', 'No observability', 'Every request is a 200.'],
            ['Level 2', 'Traces and logs', 'Which tool ran, for whom, and whether it failed.'],
            ['Level 3', 'MCP Analytics', 'What they wanted, whether they got it, and what you don’t have.'],
            ['Level 4', 'Ask your own agent', 'The same answers through the PostHog MCP, from the agent you already use.'],
        ],
        foot: 'Your dashboard was green the whole time Priya was being turned away.',
    },
    {
        kind: 'card',
        kicker: 'Announcement',
        notes: {
            lines: [
                ["SAY", "Everything you saw tonight is in beta. On December 1, MCP Analytics goes GA."],
                ["SAY", "It's one command to start, and the team can help you wrap your server before you leave."],
                ["IF ASKED ABOUT PRICING", "GA pricing is being finalized. Point people to the docs and don't quote numbers tonight."],
            ],
        },
        title: 'MCP Analytics goes GA on *December 1*',
        sub: 'Out of beta, and ready for your production MCP server.',
        tiles: [
            ['December 1', 'Generally available'],
            ['One command', 'Wrap your server and go'],
            ['Ask anywhere', 'MCP client, PostHog AI or the API'],
        ],
        art: 'art/rocket.svg',
    },
    {
        kind: 'card',
        kicker: 'One thing to take home',
        notes: {
            lines: [
                ["SAY", "If you remember one thing from tonight: ask your agents why they're calling. You can do that without PostHog. We make it one line."],
                ["SAY", "The QR code goes to the docs. The talk itself is online too, at the address on screen, so you can click through it yourself."],
                ["SAY", "I lead the MCP Analytics team at PostHog, and the team is here tonight: Mike, Georgis and Marco. Grab any of us if you want help setting it up."],
                ["SAY", "Thanks for coming."],
            ],
        },
        title: 'Ask your agents *why*.',
        sub: 'The team is around tonight for setup help. Find Lucas, Mike, Georgis or Marco.',
        qrs: [{ src: 'art/qr-docs.svg', label: 'Read the docs', url: 'posthog.com/docs/mcp-analytics' }],
        foot: 'This talk is at lucasheriques.github.io/mcp-analytics',
        art: 'art/party.svg',
    },
]

function createStory(root, onChange) {
    const text = (tag, cls, value) => {
        const node = el(tag, cls)
        node.textContent = value
        return node
    }
    // `*word*` in a title becomes the highlighted phrase.
    const headline = (value) => {
        const h = el('h1')
        value.split('*').forEach((part, i) => {
            if (part) h.append(i % 2 ? text('mark', '', part) : part)
        })
        return h
    }

    // A number reads faster with its shape beside it: a share as filled counters, change over time as a line
    // ending in a dot at the latest reading.
    function picture(stat) {
        const box = el('div', 'pic')
        box.setAttribute('aria-hidden', 'true')
        if (stat.share) {
            const [on, of] = stat.share
            for (let i = 0; i < of; i++) box.append(el('i', i < on ? 'on' : ''))
            box.dataset.of = of
        } else {
            // A point is a value, or [months since the start, value] when the readings are not evenly spaced.
            const points = stat.series.map((point, i) => (Array.isArray(point) ? point : [i, point]))
            const span = points.at(-1)[0] || 1
            const top = Math.max(...points.map(([, value]) => value))
            const placed = points.map(([at, value]) => [(at / span) * 100, 94 - (value / top) * 88])
            const path = placed.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')
            box.classList.add('line')
            box.innerHTML =
                `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` +
                `<path class="area" d="M${path} L100,100 L0,100 Z" />` +
                `<path class="trace" d="M${path}" vector-effect="non-scaling-stroke" />` +
                `</svg>`
            const [x, y] = placed.at(-1)
            const end = el('i', 'end')
            end.style.left = `${x}%`
            end.style.top = `${y}%`
            box.append(end)
        }
        return box
    }

    // Our own drawing of a brain that lights up as the levels climb: plain at level 1, bright at
    // level 2, and throwing off rays at level 3.
    function brain(level) {
        const rays = []
        const count = level >= 4 ? 20 : level === 3 ? 14 : level === 2 ? 6 : 0
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2
            const near = level >= 3 ? 34 : 32
            const far = near + (level >= 4 ? (i % 2 ? 22 : 13) : level === 3 ? (i % 2 ? 16 : 10) : 6)
            const point = (r) => `${(32 + Math.cos(angle) * r * 1.15).toFixed(1)},${(24 + Math.sin(angle) * r * 0.9).toFixed(1)}`
            rays.push(`<path class="ray" d="M${point(near)} L${point(far)}" />`)
        }
        const box = el('div', `brain brain-${level}`)
        box.setAttribute('aria-hidden', 'true')
        box.innerHTML =
            `<svg viewBox="-22 -22 108 92">${rays.join('')}` +
            `<path class="lobe" d="M20 41c-8 0-14-5-14-12 0-5 3-8 6-10 0-7 6-12 13-11 3-4 10-5 14-1 6-2 13 2 13 9 4 2 6 6 6 10 0 8-6 14-14 14-3 2-8 2-11 0-4 2-9 2-13 1z" />` +
            `<path class="fold" d="M32 9v31M21 19c4 0 6 3 4 7M43 19c-4 0-6 3-4 7M17 29c4-1 7 1 7 5M47 29c-4-1-7 1-7 5" />` +
            `</svg>`
        return box
    }

    function render(stop) {
        const body = el('div', 'story-body')
        if (stop.kicker) body.append(text('p', 'kicker', stop.kicker))
        body.append(headline(stop.title))
        if (stop.code) {
            const pre = el('pre', 'code')
            stop.code.forEach((line, i) => pre.append(text('code', i ? 'alt' : '', line)))
            body.append(pre)
        }
        if (stop.quote) body.append(text('blockquote', 'quote', `“${stop.quote}”`))
        if (stop.sub) body.append(text('p', 'sub', stop.sub))
        if (stop.ladder) {
            const row = el('ol', 'ladder')
            stop.ladder.forEach(([rung, name, sees], i) => {
                const tile = el('li')
                tile.append(brain(i + 1), text('span', 'rung', rung), text('strong', '', name), text('span', '', sees))
                row.append(tile)
            })
            body.append(row)
        }
        if (stop.tiles) {
            const row = el('ol', 'tiles')
            for (const [title, detail, prs] of stop.tiles) {
                const tile = el('li')
                tile.append(text('strong', '', title))
                if (detail) tile.append(text('span', '', detail))
                if (prs) {
                    const links = el('p', 'prs')
                    for (const number of prs) {
                        const link = text('a', '', `#${number}`)
                        link.href = `https://github.com/PostHog/posthog/pull/${number}`
                        link.target = '_blank'
                        link.rel = 'noreferrer'
                        links.append(link)
                    }
                    tile.append(links)
                }
                row.append(tile)
            }
            body.append(row)
        }
        if (stop.chips) {
            const row = el('ul', 'chips')
            for (const chip of stop.chips) row.append(text('li', '', chip))
            body.append(row)
        }
        if (stop.fixes) {
            body.append(text('p', 'foot', 'And the tools they kept tripping on, fixed:'))
            const row = el('ul', 'fixes')
            for (const [tool, change, number] of stop.fixes) {
                const item = el('li')
                const link = text('a', '', `#${number}`)
                link.href = `https://github.com/PostHog/posthog/pull/${number}`
                link.target = '_blank'
                link.rel = 'noreferrer'
                item.append(text('strong', '', tool), text('span', '', change), link)
                row.append(item)
            }
            body.append(row)
        }
        if (stop.foot) body.append(text('p', 'foot', stop.foot))
        if (stop.stats) {
            const row = el('ol', stop.steps ? 'stats stepped' : 'stats')
            for (const stat of stop.stats) {
                const tile = el('li')
                tile.append(picture(stat), text('strong', '', stat.value), text('span', '', stat.label))
                if (stat.pr) {
                    const [number, month] = stat.pr
                    const link = text('a', 'pr', `#${number} · ${month}`)
                    link.href = `https://github.com/PostHog/posthog/pull/${number}`
                    link.target = '_blank'
                    link.rel = 'noreferrer'
                    tile.append(link)
                }
                row.append(tile)
            }
            body.append(row)
        }
        if (stop.qrs) {
            const row = el('div', 'qrs')
            for (const qr of stop.qrs) {
                const box = el('div', 'qr')
                const words = el('div')
                words.append(text('p', 'kicker', qr.label), text('p', 'url', qr.url))
                if (qr.src) {
                    const code = el('img')
                    code.src = qr.src
                    code.alt = 'QR code for ' + qr.url
                    box.append(code)
                }
                box.append(words)
                row.append(box)
            }
            body.append(row)
        }
        const frame = el('article', 'story-' + stop.kind)
        frame.append(body)
        if (stop.kind === 'card') {
            const logo = el('img', 'story-logo')
            logo.src = 'art/logo.svg'
            logo.alt = 'PostHog'
            frame.append(logo)
        }
        if (stop.picture) {
            // The picture stands in for the tiles, so the tiles stay out of sight unless it fails to load.
            const picture = el('img', 'story-art story-picture')
            picture.alt = ''
            frame.classList.add('with-picture')
            picture.addEventListener('error', () => {
                frame.classList.remove('with-picture')
                picture.remove()
            })
            picture.src = stop.picture
            frame.append(picture)
        }
        if (stop.art) {
            const art = el('img', 'story-art')
            art.src = stop.art
            art.alt = ''
            frame.append(art)
        }
        return frame
    }

    const counter = el('nav', 'story-nav')
    counter.setAttribute('aria-label', 'Talk stops')
    const prev = text('button', '', '←')
    prev.setAttribute('aria-label', 'Previous stop')
    const next = text('button', '', '→')
    next.setAttribute('aria-label', 'Next stop')
    const where = el('span')
    const cue = el('output', 'cue')
    counter.append(cue, prev, where, next)
    document.body.append(counter)

    let index = 0
    let step = 1

    // Speaker notes: what to say on each stop, in full sentences. A labelled line is a direction to
    // the presenter, not something to say. N shows them on this page, for rehearsing. S opens them
    // in a window of their own, which follows the deck and can drive it.
    const notes = el('aside', 'speaker')
    notes.hidden = true
    notes.setAttribute('aria-label', 'Speaker notes')
    document.body.append(notes)
    const deck = 'BroadcastChannel' in window ? new BroadcastChannel('merch-deck') : undefined
    const telling = () => {
        const stop = STOPS[index]
        const plain = (title) => (title ?? '').replace(/\*/g, '')
        return {
            at: index + 1,
            of: STOPS.length,
            step,
            steps: stop.steps,
            kicker: stop.kicker,
            title: plain(stop.title),
            next: plain(STOPS[index + 1]?.title),
            notes: stop.notes,
        }
    }
    function tell() {
        notes.replaceChildren(
            ...(STOPS[index].notes?.lines ?? []).map(([label, line]) => {
                const row = text('p', label === 'SAY' ? 'say' : 'aside', line)
                if (label !== 'SAY') row.prepend(text('b', '', label + ': '))
                return row
            })
        )
        deck?.postMessage(telling())
    }
    deck?.addEventListener('message', ({ data }) => {
        if (data === 'forward') forward()
        if (data === 'back') go(index - 1)
        if (data === 'hello') deck.postMessage(telling())
    })

    const count = () => {
        const steps = STOPS[index].steps
        where.textContent = `${index + 1} / ${STOPS.length}` + (steps ? ` · ${step} of ${steps}` : '')
    }
    // A stop with steps takes that many presses: each one reveals a little more before moving on.
    function forward() {
        const stop = STOPS[index]
        if (!stop.steps || step >= stop.steps) return go(index + 1)
        step += 1
        root.dataset.step = step
        count()
        tell()
        onChange(stop, step, () => {})
    }
    function go(to) {
        index = clamp(to, 0, STOPS.length - 1)
        step = 1
        const stop = STOPS[index]
        // The page decides when the stop is painted, so it can be part of a transition.
        const paint = () => {
            root.replaceChildren(render(stop))
            root.dataset.kind = stop.kind
            root.dataset.step = step
        }
        count()
        prev.disabled = index === 0
        next.disabled = index === STOPS.length - 1
        const url = new URL(location)
        url.searchParams.set('stop', index + 1)
        history.replaceState(null, '', url)
        tell()
        onChange(stop, step, paint)
    }
    prev.addEventListener('click', () => go(index - 1))
    next.addEventListener('click', forward)
    document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches?.('input, textarea')) return
        // Presentation clickers send Page Up and Page Down.
        if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
            e.preventDefault()
            forward()
        } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
            e.preventDefault()
            go(index - 1)
        } else if (e.key === 'n' || e.key === 'N') {
            notes.hidden = !notes.hidden
        } else if (e.key === 's' || e.key === 'S') {
            window.open('notes.html', 'merch-notes', 'width=720,height=820')
        }
    })
    // Pictures are fetched up front, so a stop never paints before its art has arrived.
    for (const stop of STOPS) for (const src of [stop.art, stop.picture]) if (src) new Image().src = src
    go((parseInt(new URLSearchParams(location.search).get('stop'), 10) || 1) - 1)
    // The cue tells the presenter whether the screen is still showing something or it is safe to move on.
    return {
        setCue(text, busy) {
            cue.textContent = text
            cue.toggleAttribute('data-busy', busy)
        },
    }
}
