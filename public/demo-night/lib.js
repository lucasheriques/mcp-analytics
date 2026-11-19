const TAU = Math.PI * 2
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

function el(tag, cls) {
    const node = document.createElement(tag)
    if (cls) node.className = cls
    return node
}

function rng(seed) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function vnoise(seed) {
    const hash = (x, y) => {
        let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695)
        n = Math.imul(n ^ (n >>> 13), 1274126177)
        return ((n ^ (n >>> 16)) >>> 0) / 4294967296
    }
    const smooth = (t) => t * t * (3 - 2 * t)
    const one = (x, y) => {
        const xi = Math.floor(x)
        const yi = Math.floor(y)
        const xf = smooth(x - xi)
        const yf = smooth(y - yi)
        const a = hash(xi, yi)
        const b = hash(xi + 1, yi)
        const c = hash(xi, yi + 1)
        const d = hash(xi + 1, yi + 1)
        return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
    }
    return (x, y) => one(x, y) * 0.6 + one(x * 2.1, y * 2.1) * 0.28 + one(x * 4.3, y * 4.3) * 0.12
}

function dab(ctx, x, y, len, th, ang, c, a) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(ang)
    ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
    ctx.beginPath()
    ctx.roundRect(-len / 2, -th / 2, len, th, th / 2)
    ctx.fill()
    ctx.restore()
}

// Covers the canvas with jittered dabs; `fn` picks the paint for each spot, or null to leave paper showing.
function wash(ctx, W, H, step, rnd, fn) {
    // Underpaint first so no canvas shows between the dabs.
    for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
            const s = fn(x + step / 2, y + step / 2)
            if (!s) continue
            ctx.fillStyle = `rgb(${s.c[0] | 0},${s.c[1] | 0},${s.c[2] | 0})`
            ctx.fillRect(x, y, step + 1, step + 1)
        }
    }
    for (let y = -step; y < H + step; y += step) {
        for (let x = -step; x < W + step; x += step) {
            const px = x + (rnd() - 0.5) * step * 1.3
            const py = y + (rnd() - 0.5) * step * 1.3
            const s = fn(px, py)
            if (!s) continue
            const j = (rnd() - 0.5) * (s.jit ?? 20)
            dab(
                ctx,
                px,
                py,
                s.len * (0.7 + rnd() * 0.6),
                s.th * (0.7 + rnd() * 0.6),
                s.ang + (rnd() - 0.5) * 0.3,
                [s.c[0] + j, s.c[1] + j, s.c[2] + j * 0.8],
                s.a ?? 0.92
            )
        }
    }
}

function glow(ctx, x, y, r, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${rgb},${a})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

function path(pts) {
    const d = [0]
    for (let i = 1; i < pts.length; i++) {
        d[i] = d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    }
    const L = d[d.length - 1] || 1
    const at = (u) => {
        const s = clamp(u) * L
        let i = 1
        while (i < pts.length - 1 && d[i] < s) i++
        const t = (s - d[i - 1]) / (d[i] - d[i - 1] || 1)
        return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]
    }
    const ang = (u) => {
        const a = at(u - 0.004)
        const b = at(u + 0.004)
        return Math.atan2(b[1] - a[1], b[0] - a[0])
    }
    return { pts, L, at, ang }
}

const curve = (fn, n = 80) => path(Array.from({ length: n + 1 }, (_, i) => fn(i / n)))
const sub = (p, from, to, n = 40) => Array.from({ length: n + 1 }, (_, i) => p.at(lerp(from, to, i / n)))
const bezier = (a, c, b) => (u) => [
    (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
    (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
]

// Queues one paint step every `every` pixels along a path, so the line is laid stroke by stroke.
function lay(queue, p, every, draw, from = 0, to = 1) {
    const n = Math.max(1, Math.round((p.L * (to - from)) / every))
    for (let i = 0; i <= n; i++) {
        const u = lerp(from, to, i / n)
        queue.push(() => draw(p.at(u), p.ang(u), i))
    }
}

function listNote(title, max = 4) {
    const box = el('section', 'list')
    const heading = el('h3')
    heading.textContent = title
    const ul = el('ul')
    box.append(heading, ul)
    box.hidden = true
    const counts = new Map()
    const row = (text, count, cls) => {
        const li = el('li', cls)
        const span = el('span')
        span.textContent = text
        li.append(span)
        if (count) {
            const b = el('b')
            b.textContent = count
            li.append(b)
        }
        return li
    }
    return {
        el: box,
        bump(key) {
            counts.set(key, (counts.get(key) || 0) + 1)
            box.hidden = false
            const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, max)
            ul.replaceChildren(...top.map(([k, c]) => row(k, c)))
        },
        push(text) {
            box.hidden = false
            ul.prepend(row(text, 0, 'enter'))
            while (ul.children.length > max) ul.lastChild.remove()
        },
    }
}

function pin(parent, node, x, y, cls) {
    const holder = el('div', 'pin ' + (cls || ''))
    holder.style.left = x + 'px'
    holder.style.top = y + 'px'
    holder.append(node)
    parent.append(holder)
    return holder
}

function createScene(stage, spec) {
    const W = stage.clientWidth
    const H = stage.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const layer = (cls, before) => {
        const canvas = el('canvas', 'layer ' + cls)
        canvas.width = W * dpr
        canvas.height = H * dpr
        stage.insertBefore(canvas, before || null)
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        return ctx
    }
    // Before and after each keep their own drawing layer and labels, so switching between them
    // (stepping back and forth through the talk) hides one and shows the other without losing either.
    const base = layer('base')
    const before = layer('before')
    const over = layer('over')
    const fx = layer('fx')
    const beforeNotes = el('div', 'notes notes-before')
    const notes = el('div', 'notes notes-after')
    stage.append(beforeNotes, notes)
    const pulses = []
    const pulse = (x, y, rgb) => reduced || pulses.push({ x, y, rgb, born: performance.now() })

    const rnd = rng(spec.seed)
    const world = spec.build({ W, H, rnd, base, before, over, beforeNotes, notes, reduced, layer, pulse })
    const fog = Array.from({ length: world.fog.n }, () => ({
        x: rnd() * W,
        y: lerp(world.fog.y0, world.fog.y1, rnd()) * H,
        r: (0.16 + rnd() * 0.2) * W,
        v: (rnd() - 0.5) * 9,
    }))

    let installed = false
    let charted = false
    let queue = []
    let cursor = 0
    let perSecond = 0
    let owed = 0
    let pending = []
    let releaseAt = 0
    let agents = []
    let fogAmount = 1
    let alive = true
    let last = performance.now()

    function setInstalled(value) {
        installed = value
        stage.toggleAttribute('data-installed', value)
        for (const agent of agents) agent.el?.remove()
        agents = []
        pending = []
        if (!value || charted) return
        charted = true
        queue = world.chart()
        cursor = 0
        perSecond = queue.length / (world.drawSeconds ?? 3.2)
        owed = reduced ? queue.length : 0
    }

    function onEvent(event) {
        // A walker that set off while the map was still being drawn would have its trail painted over,
        // so journeys wait for the drawing to finish and then set off one at a time.
        if (installed && event.channel !== 'raw' && cursor < queue.length) {
            pending.push(event)
            return
        }
        // A plain call carries no session or intent. Its tick is always marked on the plain view, even
        // while the analytics view is the one showing, so stepping back finds it there.
        const route = installed && event.channel !== 'raw' ? world.route(event) : world.wild(event)
        if (!route || (installed && event.channel === 'raw')) {
            event.arrived?.()
            return
        }
        const agent = { ...route, u: reduced ? (route.hold?.u ?? 1) : 0, held: 0, out: 0, age: 0, arrived: false }
        // Whoever sent the event can ask to be told when its figure gets to the tool.
        if (event.arrived) {
            agent.arrive = (self) => {
                route.arrive?.(self)
                event.arrived()
            }
        }
        // A session is one walker: its next call takes over from wherever the last one stopped.
        for (const earlier of agents) {
            if (route.session === undefined || earlier.session !== route.session) continue
            if (!earlier.arrived) earlier.arrive?.(earlier)
            earlier.arrived = true
            // The newcomer starts where this one stood, so swapping them is not seen. It also keeps
            // the spoken intent, so a session making calls in quick succession does not flash a new
            // label at every tool: the label travels with the figure and stays long enough to read.
            agent.el = earlier.el
            earlier.el = undefined
            earlier.out = 1
        }
        agents.push(agent)
    }

    function step(agent, dt) {
        agent.age += dt
        const holdAt = agent.hold ? agent.hold.u : 2
        if (!agent.arrived && agent.u >= holdAt) {
            agent.arrived = true
            agent.arrive?.(agent)
            // The intent is shown on arrival only, so a busy line stays readable.
            if (agent.label) {
                const tag = agent.el ?? (agent.el = el('div', 'tag'))
                if (tag.textContent !== agent.label) tag.textContent = agent.label
                if (!tag.isConnected) notes.append(tag)
                requestAnimationFrame(() => tag.setAttribute('data-on', ''))
            }
        }
        if (agent.arrived && agent.held < agent.hold.ms) agent.held += dt * 1000
        else if (agent.u < 1) agent.u += (agent.speed * dt) / agent.p.L
        else if (!agent.stays) agent.out += dt * 2.5
        // A figure that stays keeps its place at the tool until its session calls again; only its
        // spoken intent fades.
        else if (agent.el) agent.el.removeAttribute('data-on')

        const [x, y] = agent.p.at(agent.u)
        const k = agent.size ? agent.size(agent.u) : 1
        const alpha = clamp(agent.age * 3) * (1 - clamp(agent.out))
        if (installed && agent.stays && world.figure) {
            world.figure(fx, x, y, agent, alpha)
        } else if (installed) {
            glow(fx, x, y, agent.r * 2.6 * k, agent.c.join(','), 0.5 * alpha)
            glow(fx, x, y, agent.r * 0.7 * k, agent.core.join(','), alpha)
        } else {
            glow(fx, x, y, agent.r * 5 * k, agent.c.join(','), 0.26 * alpha)
        }
        if (agent.trail && !agent.arrived) {
            agent.walked = (agent.walked || 0) + agent.speed * dt
            if (agent.walked > 7) {
                agent.walked = 0
                agent.trail(x, y, agent.p.ang(agent.u))
            }
        }
        if (agent.el) {
            const lx = clamp(x, 150, W - 150)
            agent.el.style.transform = `translate(${lx}px,${y - 16 * k - 12}px) translate(-50%,-100%)`
            if (agent.out > 0) agent.el.removeAttribute('data-on')
        }
        return agent.out < 1
    }

    function frame(now) {
        if (!alive) return
        const elapsed = (now - last) / 1000
        const dt = Math.min(0.25, elapsed)
        last = now
        // The drawing keeps to the clock even when frames are slow; only motion is capped.
        owed += perSecond * elapsed
        while (owed >= 1 && cursor < queue.length) {
            queue[cursor++]()
            owed -= 1
        }

        if (pending.length && cursor >= queue.length && now >= releaseAt) {
            releaseAt = now + 1200
            onEvent(pending.shift())
        }

        fx.clearRect(0, 0, W, H)
        world.light?.(fx, now / 1000, installed)
        agents = agents.filter((agent) => {
            const keep = step(agent, dt)
            if (!keep) agent.el?.remove()
            return keep
        })
        // A ring opens at the tool when a call lands: the session's colour for success, red for failure.
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i]
            const age = (now - p.born) / 1100
            if (age >= 1) {
                pulses.splice(i, 1)
                continue
            }
            const eased = 1 - (1 - age) ** 3
            fx.strokeStyle = `rgba(${p.rgb},${1 - age})`
            fx.lineWidth = (4 - 2.5 * age) * (W / 1600)
            fx.beginPath()
            fx.arc(p.x, p.y, lerp(10, 46, eased) * (W / 1600), 0, TAU)
            fx.stroke()
        }
        fogAmount = reduced
            ? installed
                ? world.fog.thin
                : 1
            : lerp(fogAmount, installed ? world.fog.thin : 1, 1 - Math.exp(-dt * 1.1))
        for (const blob of fog) {
            if (!reduced) blob.x = ((blob.x + blob.v * dt + W * 1.5) % (W * 1.5)) - W * 0.25
            glow(fx, blob.x, blob.y, blob.r, world.fog.c, world.fog.a * fogAmount)
        }
        requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)

    return {
        setInstalled,
        onEvent,
        busy: () => cursor < queue.length || pending.length > 0 || agents.some((agent) => !agent.arrived),
        destroy() {
            alive = false
        },
    }
}
