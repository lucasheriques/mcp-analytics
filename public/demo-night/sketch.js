// Sketchbook: the survey map redrawn by hand. Four dry tools on toothy paper: graphite for the underdrawing,
// soft pastel for the ground, coloured pencil for hatching and trails, wax crayon for the accents.
// Before install only the pencil survey exists; installing colours the land in and lets journeys leave trails.
const sketchbook = {
    name: 'Sketchbook',
    cls: 'light drawn',
    mount: (stage) =>
        createScene(stage, {
            seed: 91,
            build({ W, H, rnd, base, before, over, beforeNotes, notes, layer, pulse }) {
                const S = W / 1600
                const n = vnoise(5)
                const n2 = vnoise(17)
                const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

                const PAPER = [244, 235, 216]
                const GRAPHITE = [74, 70, 80]
                const SAGE = [156, 194, 150]
                const LIME = [212, 216, 136]
                const PEACH = [248, 196, 162]
                const TEAL = [70, 148, 130]
                const VIRIDIAN = [36, 94, 98]
                const LAVENDER = [146, 128, 190]
                const CERULEAN = [88, 166, 218]
                const ICE = [206, 234, 242]
                const VERMILION = [232, 84, 54]
                const YELLOW = [248, 206, 96]
                const PINK = [238, 142, 160]
                const UMBER = [126, 90, 70]

                // Pigment only catches on the peaks of the paper, so every drawn layer is masked by its tooth.
                function tooth(holes) {
                    const canvas = el('canvas')
                    canvas.width = canvas.height = 256
                    const ctx = canvas.getContext('2d')
                    const image = ctx.createImageData(256, 256)
                    const r = rng(99)
                    for (let i = 0; i < 256 * 256; i++) image.data[i * 4 + 3] = r() < holes ? 20 + r() * 70 : 175 + r() * 80
                    ctx.putImageData(image, 0, 0)
                    return `url(${canvas.toDataURL()})`
                }
                function onPaper(ctx, holes) {
                    const style = ctx.canvas.style
                    style.maskImage = style.webkitMaskImage = tooth(holes)
                    style.maskSize = style.webkitMaskSize = '256px 256px'
                }
                const under = layer('under', before.canvas)
                onPaper(under, 0.14)
                onPaper(before, 0.14)
                onPaper(over, 0.24)

                // One hand-made mark: the line drifts a little and the pressure rises and falls along it.
                function mark(ctx, pts, { c, w = 1.2, a = 0.7, wob = 1 }) {
                    if (pts.length < 2) return
                    ctx.strokeStyle = rgb(c)
                    ctx.lineCap = 'round'
                    const phase = rnd() * 6
                    let drift = 0
                    let aim = 0
                    let prev = pts[0]
                    for (let i = 1; i < pts.length; i++) {
                        if (i % 5 === 1) aim = (rnd() - 0.5) * wob * 2 * S
                        drift += (aim - drift) * 0.3
                        const p = [pts[i][0] + drift, pts[i][1] + drift * 0.7]
                        const t = i / (pts.length - 1)
                        const press = Math.min(1, t * 6 + 0.3, (1 - t) * 6 + 0.3) * (0.72 + 0.28 * Math.sin(i * 0.45 + phase))
                        ctx.globalAlpha = a * (0.45 + 0.55 * press)
                        ctx.lineWidth = w * S * (0.55 + 0.6 * press)
                        ctx.beginPath()
                        ctx.moveTo(prev[0], prev[1])
                        ctx.lineTo(p[0], p[1])
                        ctx.stroke()
                        prev = p
                    }
                    ctx.globalAlpha = 1
                }
                // The side of a pastel stick: one wide, soft, slightly curved pass.
                function rub(ctx, a, b, { c, w, alpha }) {
                    const bow = (rnd() - 0.5) * 0.3
                    ctx.strokeStyle = rgb(c, alpha)
                    ctx.lineWidth = w * S
                    ctx.lineCap = 'round'
                    ctx.beginPath()
                    ctx.moveTo(a[0], a[1])
                    ctx.quadraticCurveTo((a[0] + b[0]) / 2 - (b[1] - a[1]) * bow, (a[1] + b[1]) / 2 + (b[0] - a[0]) * bow, b[0], b[1])
                    ctx.stroke()
                }
                const seg = (a, b, step = 5) => {
                    const count = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (step * S)))
                    return Array.from({ length: count + 1 }, (_, i) => [lerp(a[0], b[0], i / count), lerp(a[1], b[1], i / count)])
                }
                const ring = (x, y, r, from = 0, to = TAU, shrink = 0) => {
                    const count = Math.max(6, Math.round((Math.abs(to - from) * r) / (3 * S)))
                    return Array.from({ length: count + 1 }, (_, i) => {
                        const t = i / count
                        const a = lerp(from, to, t)
                        const rr = r * (1 - shrink * t) * (0.94 + 0.12 * rnd())
                        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]
                    })
                }

                const at = (fx, fy) => [W * fx, H * fy]
                const places = {
                    search_products: at(0.16, 0.52),
                    get_product: at(0.32, 0.28),
                    add_to_cart: at(0.45, 0.63),
                    view_cart: at(0.49, 0.47),
                    checkout: at(0.79, 0.62),
                    get_order_status: at(0.84, 0.47),
                    remove_from_cart: at(0.36, 0.5),
                }
                const ROOFS = [VERMILION, YELLOW, PINK, TEAL, VERMILION, LAVENDER, CERULEAN]
                const entrance = at(-0.02, 0.57)
                const edge = at(0.9, 0.21)
                const riverX = (y) => W * (0.62 + 0.07 * Math.sin((y / H) * 4 + 0.5) + 0.02 * Math.sin((y / H) * 11))
                const riverW = (y) => W * (0.016 + 0.009 * n2(y / (90 * S), 3))
                const bridge = [riverX(H * 0.57), H * 0.57]
                const river = (x, y) => Math.abs(x - riverX(y)) < riverW(y)
                const unmapped = (x, y) => Math.hypot(x - W, y) < W * 0.27 * (0.85 + 0.3 * n2(x / (120 * S), y / (120 * S)))
                const cleared = (x, y) =>
                    [...Object.values(places), bridge].some((p) => Math.hypot(x - p[0], y - p[1]) < 52 * S)
                const forest = (x, y) =>
                    n(x / (260 * S), y / (260 * S)) > 0.55 && !river(x, y) && !unmapped(x, y) && !cleared(x, y)
                const meadow = (x, y) => !forest(x, y) && !river(x, y) && !unmapped(x, y)

                const scatter = (step, keep) => {
                    const out = []
                    for (let y = step / 2; y < H; y += step) {
                        for (let x = step / 2; x < W; x += step) {
                            const p = [x + (rnd() - 0.5) * step * 0.9, y + (rnd() - 0.5) * step * 0.9]
                            if (keep(p[0], p[1])) out.push(p)
                        }
                    }
                    return out.sort((a, b) => a[0] + a[1] * 0.3 - b[0] - b[1] * 0.3)
                }
                const trees = scatter(25 * S, forest).map(([x, y]) => ({ x, y, r: (8 + rnd() * 7) * S }))

                function hatch(ang, gap, inside) {
                    const strokes = []
                    const ca = Math.cos(ang)
                    const sa = Math.sin(ang)
                    const reach = Math.hypot(W, H) / 2
                    for (let o = -reach; o < reach; o += gap * S * (0.75 + rnd() * 0.5)) {
                        let run = []
                        const flush = () => {
                            while (run.length > 3) strokes.push(run.splice(0, 8 + Math.floor(rnd() * 12)))
                            run = []
                        }
                        for (let s = -reach; s < reach; s += 5 * S) {
                            const x = W / 2 + ca * s - sa * o
                            const y = H / 2 + sa * s + ca * o
                            if (x > 0 && x < W && y > 0 && y < H && inside(x, y)) run.push([x, y])
                            else flush()
                        }
                        flush()
                    }
                    return strokes
                }

                // Paper: warm stock with mottling, fibres and darker edges.
                base.fillStyle = rgb(PAPER)
                base.fillRect(0, 0, W, H)
                for (let i = 0; i < 70; i++) {
                    glow(base, rnd() * W, rnd() * H, (120 + rnd() * 260) * S, rnd() < 0.5 ? '226,210,182' : '252,246,232', 0.22)
                }
                for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) glow(base, x, y, W * 0.42, '196,176,146', 0.3)
                for (let i = 0; i < 2600; i++) {
                    const x = rnd() * W
                    const y = rnd() * H
                    const a = rnd() * TAU
                    const len = (2 + rnd() * 7) * S
                    base.strokeStyle = rgb(rnd() < 0.5 ? [150, 130, 104] : [255, 252, 244], 0.1 + rnd() * 0.14)
                    base.lineWidth = 0.6
                    base.beginPath()
                    base.moveTo(x, y)
                    base.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
                    base.stroke()
                }

                // Graphite survey: what you know before any analytics. Land, river, where the tools stand.
                const pencil = { c: GRAPHITE, w: 1.1, a: 0.5, wob: 1.2 }
                for (const inset of [16, 24]) {
                    const m = inset * S
                    const corners = [[m, m], [W - m, m], [W - m, H - m], [m, H - m], [m, m]]
                    for (let i = 0; i < 4; i++) mark(under, seg(corners[i], corners[i + 1], 9), { ...pencil, a: 0.4, wob: 0.7 })
                }
                for (const side of [-1, 1]) {
                    const bank = []
                    for (let y = -10; y < H + 10; y += 6 * S) bank.push([riverX(y) + side * riverW(y), y])
                    mark(under, bank, { ...pencil, a: 0.55 })
                }
                for (const t of trees) mark(under, ring(t.x, t.y, t.r, rnd() * TAU, rnd() * TAU + TAU * 1.15), { ...pencil, w: 0.9, a: 0.3 })
                for (let k = 0; k < 6; k++) {
                    let run = []
                    for (let x = 0; x < W; x += 8 * S) {
                        const y = H * (0.12 + 0.15 * k) + 60 * S * Math.sin(x / (300 * S) + k * 1.7)
                        if (meadow(x, y)) run.push([x, y])
                        else {
                            mark(under, run, { ...pencil, w: 0.8, a: 0.2, wob: 2 })
                            run = []
                        }
                    }
                    mark(under, run, { ...pencil, w: 0.8, a: 0.2, wob: 2 })
                }
                for (let a = Math.PI * 0.52; a < Math.PI * 0.98; a += 0.05) {
                    mark(under, ring(W, 0, W * 0.275, a, a + 0.028), { ...pencil, a: 0.45 })
                }
                const rose = at(0.93, 0.8)
                mark(under, ring(rose[0], rose[1], 26 * S), { ...pencil, a: 0.45 })
                for (let i = 0; i < 4; i++) {
                    const a = (i * TAU) / 4 - Math.PI / 2
                    const tip = [rose[0] + Math.cos(a) * 38 * S, rose[1] + Math.sin(a) * 38 * S]
                    for (const side of [-1, 1]) {
                        const wing = [rose[0] + Math.cos(a + side * 1.2) * 7 * S, rose[1] + Math.sin(a + side * 1.2) * 7 * S]
                        mark(under, seg(wing, tip, 4), { ...pencil, a: 0.5, wob: 0.4 })
                    }
                }
                mark(under, seg([rose[0], rose[1] - 8 * S], [rose[0], rose[1] - 38 * S], 3), { c: VERMILION, w: 2.6, a: 0.7, wob: 0.3 })
                Object.values(places).forEach(([x, y]) => {
                    // A surveyor's point, not a cross: crosses on this map mean a call that failed.
                    mark(under, ring(x, y, 4 * S, 0, TAU * 2.2, 0.7), { ...pencil, w: 2.4, a: 0.85, wob: 0.3 })
                    mark(under, ring(x, y, 15 * S), { ...pencil, w: 0.9, a: 0.35 })
                })

                const wander = (a, b, bend) => {
                    const pts = curve(
                        bezier(a, [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.2 * bend, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.2 * bend], b),
                        40
                    ).pts
                    return pts.map(([x, y], i) => {
                        const sway = Math.sin((i / 40) * Math.PI) * 50 * S
                        return [
                            x + (n2(x / (80 * S) + bend * 9, y / (80 * S)) - 0.5) * sway,
                            y + (n2(x / (80 * S), y / (80 * S) + bend * 9) - 0.5) * sway,
                        ]
                    })
                }
                const sessions = new Map()
                const seen = {}
                const landed = {}
                const fails = {}
                let missing

                function nameTag(tool, faint) {
                    const [x, y] = places[tool]
                    const name = el('span', faint ? 'name faint' : 'name')
                    name.textContent = tool
                    name.style.rotate = ((rnd() - 0.5) * 4).toFixed(1) + 'deg'
                    if (!faint) name.append(fails[tool].el)
                    pin(faint ? beforeNotes : notes, name, x, y + 24 * S, 'below')
                }
                function house(tool, i) {
                    const [x, y] = places[tool]
                    const u = 9 * S
                    for (let k = 0; k < 5; k++) rub(over, [x - 16 * S, y - 10 * S + k * 6 * S], [x + 16 * S, y - 8 * S + k * 6 * S], { c: PEACH, w: 9, alpha: 0.4 })
                    const wall = [[x - u, y + u], [x - u, y - u * 0.3], [x + u, y - u * 0.3], [x + u, y + u], [x - u, y + u]]
                    for (let k = 0; k < 4; k++) mark(over, seg(wall[k], wall[k + 1], 3), { c: GRAPHITE, w: 1.3, a: 0.85, wob: 0.5 })
                    for (let k = 0; k < 6; k++) {
                        const t = k / 5
                        mark(over, seg([x - u * 1.3 * (1 - t), y - u * 0.3 - u * 1.1 * t], [x + u * 1.3 * (1 - t), y - u * 0.3 - u * 1.1 * t], 3), { c: ROOFS[i], w: 3.2, a: 0.9, wob: 0.5 })
                    }
                    mark(over, seg([x, y + u], [x, y + u * 0.25], 2), { c: UMBER, w: 3, a: 0.8, wob: 0.2 })
                }

                for (const tool of TOOLS) {
                    seen[tool] = 0
                    nameTag(tool, true)
                }

                return {
                    fog: { n: 0 },
                    drawSeconds: 4,
                    chart() {
                        const queue = []
                        for (const tool of TOOLS) {
                            fails[tool] = { count: 0, el: el('span', 'fail') }
                            landed[tool] = 0
                        }
                        for (const [x, y] of scatter(44 * S, meadow)) {
                            const ang = n(x / (220 * S), y / (220 * S)) * Math.PI
                            const len = (50 + rnd() * 60) * S
                            const tone = n2(x / (300 * S), y / (300 * S))
                            const c = tone > 0.66 ? PEACH : mix(SAGE, LIME, clamp((tone - 0.25) * 2.4))
                            const a = [x - Math.cos(ang) * len, y - Math.sin(ang) * len]
                            const b = [x + Math.cos(ang) * len, y + Math.sin(ang) * len]
                            queue.push(() => {
                                rub(over, a, b, { c, w: 30, alpha: 0.2 })
                                rub(over, [a[0] + 6 * S, a[1] + 9 * S], [b[0] + 6 * S, b[1] + 9 * S], { c, w: 18, alpha: 0.18 })
                            })
                        }
                        for (let y = -20; y < H + 20; y += 22 * S) {
                            const off = (rnd() - 0.5) * riverW(y) * 0.8
                            queue.push(() => {
                                rub(over, [riverX(y) + off, y - 26 * S], [riverX(y + 30 * S) + off, y + 30 * S], { c: CERULEAN, w: riverW(y) / S * 1.3, alpha: 0.34 })
                                mark(over, seg([riverX(y) - riverW(y) * 0.5, y], [riverX(y) + riverW(y) * 0.3, y + 3 * S], 3), { c: ICE, w: 2.4, a: 0.85, wob: 1.4 })
                            })
                        }
                        for (const stroke of hatch(-0.6, 5, (x, y) => river(x, y) && x < riverX(y))) {
                            queue.push(() => mark(over, stroke, { c: LAVENDER, w: 1, a: 0.45, wob: 0.6 }))
                        }
                        for (const t of trees) {
                            queue.push(() => {
                                const start = rnd() * TAU
                                mark(over, ring(t.x, t.y, t.r, start, start + TAU * 2.4, 0.85), { c: mix(TEAL, SAGE, rnd() * 0.5), w: 4.2, a: 0.62, wob: 1 })
                                mark(over, ring(t.x + t.r * 0.15, t.y + t.r * 0.2, t.r * 0.7, -0.3, 2.3), { c: VIRIDIAN, w: 2.2, a: 0.55, wob: 0.8 })
                                mark(over, ring(t.x - t.r * 0.25, t.y - t.r * 0.3, t.r * 0.45, 3.4, 4.9), { c: YELLOW, w: 2, a: 0.5, wob: 0.5 })
                                for (let k = 0; k < 3; k++) {
                                    const sx = t.x + t.r * (0.5 + k * 0.28)
                                    mark(over, seg([sx, t.y + t.r * 0.9], [sx + 5 * S, t.y + t.r * 1.35], 2), { c: LAVENDER, w: 1.3, a: 0.5, wob: 0.4 })
                                }
                            })
                        }
                        const shade = (x, y) => meadow(x, y) && n2(x / (300 * S) + 4, y / (300 * S)) > 0.56
                        for (const stroke of hatch(-0.62, 8, shade)) {
                            queue.push(() => mark(over, stroke, { c: TEAL, w: 1, a: 0.3, wob: 0.8 }))
                        }
                        for (const [x, y] of scatter(58 * S, meadow)) {
                            queue.push(() => {
                                if (rnd() < 0.45) {
                                    mark(over, seg([x, y], [x + 2 * S, y + 1.5 * S], 1), { c: rnd() < 0.5 ? PINK : YELLOW, w: 4, a: 0.9, wob: 0 })
                                    return
                                }
                                for (const lean of [-0.5, 0, 0.5]) {
                                    mark(over, seg([x + lean * 4 * S, y], [x + lean * 9 * S, y - (7 + rnd() * 4) * S], 2), { c: VIRIDIAN, w: 1.1, a: 0.55, wob: 0.3 })
                                }
                            })
                        }
                        queue.push(() => {
                            const half = riverW(bridge[1]) + 12 * S
                            for (let k = -4; k <= 4; k++) {
                                const px = bridge[0] + (k / 4) * half
                                mark(over, seg([px, bridge[1] - 9 * S], [px + S, bridge[1] + 9 * S], 2), { c: UMBER, w: 3.4, a: 0.9, wob: 0.4 })
                            }
                            for (const d of [-9, 9]) {
                                mark(over, seg([bridge[0] - half, bridge[1] + d * S], [bridge[0] + half, bridge[1] + d * S], 3), { c: GRAPHITE, w: 1.3, a: 0.85, wob: 0.6 })
                            }
                        })
                        TOOLS.forEach((tool, i) =>
                            queue.push(() => {
                                house(tool, i)
                                nameTag(tool, false)
                            })
                        )
                        // The SDK adds one tool of its own: a signpost at the edge of the map where agents
                        // say what they came for and could not find.
                        queue.push(() => {
                            const [x, y] = edge
                            mark(over, seg([x, y + 16 * S], [x, y - 20 * S], 2), { c: UMBER, w: 3, a: 0.9, wob: 0.3 })
                            for (let k = 0; k < 4; k++) {
                                mark(over, seg([x - 15 * S, y - 20 * S + k * 3.4 * S], [x + 17 * S, y - 21 * S + k * 3.4 * S], 3), { c: YELLOW, w: 3.4, a: 0.9, wob: 0.4 })
                            }
                            const name = el('span', 'name')
                            name.textContent = 'get_more_tools'
                            pin(notes, name, x, y + 22 * S, 'below')
                            missing = listNote('Asked for, not on the map', 3)
                            pin(notes, missing.el, x - 86 * S, y + 14 * S, 'below-left')
                        })
                        return queue
                    },
                    route(event) {
                        const dest = event.tool === 'get_more_tools' ? edge : places[event.tool]
                        if (!dest) return null
                        const from = sessions.get(event.session) || entrance
                        sessions.set(event.session, dest)
                        const bend = TOOLS.indexOf(event.tool) % 2 ? 0.7 : -0.6
                        const again = Math.hypot(from[0] - dest[0], from[1] - dest[1]) < 4
                        const crosses = from[0] < bridge[0] !== dest[0] < bridge[0]
                        const pts = again
                            ? ring(dest[0] + 20 * S, dest[1], 20 * S, Math.PI, Math.PI * 3)
                            : crosses
                              ? [...wander(from, bridge, bend), ...wander(bridge, dest, -bend)]
                              : wander(from, dest, bend)
                        // Each session keeps one colour, on the map and in the sessions panel.
                        const ink = event.color ?? VERMILION
                        const p = path(pts)
                        return {
                            session: event.session,
                            p,
                            // Every leg takes about a second and a half, however far: slow enough to
                            // follow, quick enough that the figure reaches the tool soon after its call.
                            speed: Math.max(W * 0.12, p.L / 1.5),
                            stays: true,
                            badge: event.badge,
                            slot: event.slot ?? 0,
                            hold: { u: 1, ms: 8000 },
                            c: ink,
                            core: ink,
                            r: 5,
                            label: event.intent,
                            trail: (x, y, a) => {
                                const ox = (rnd() - 0.5) * 7 * S
                                const oy = (rnd() - 0.5) * 7 * S
                                const tip = [x + ox + Math.cos(a) * 8 * S, y + oy + Math.sin(a) * 8 * S]
                                rub(over, [x + ox, y + oy], tip, { c: YELLOW, w: 8, alpha: 0.14 })
                                mark(over, seg([x + ox, y + oy], tip, 2), { c: ink, w: 1.9, a: 0.75, wob: 0.5 })
                            },
                            arrive: () => {
                                pulse(dest[0], dest[1], event.error ? VERMILION : ink)
                                if (event.missing) missing?.bump(event.missing)
                                if (!places[event.tool]) return
                                if (!event.error) {
                                    // A crayon tick per call that went through, in the session's colour.
                                    const k = landed[event.tool]++
                                    if (k >= 8) return
                                    const [x, y] = places[event.tool]
                                    const cx = x - (22 + k * 9) * S
                                    const cy = y - 20 * S
                                    mark(over, seg([cx - 4 * S, cy], [cx - S, cy + 4 * S], 2), { c: ink, w: 2.2, a: 0.9, wob: 0.2 })
                                    mark(over, seg([cx - S, cy + 4 * S], [cx + 5 * S, cy - 5 * S], 2), { c: ink, w: 2.2, a: 0.9, wob: 0.2 })
                                    return
                                }
                                const f = fails[event.tool]
                                f.count += 1
                                f.el.textContent = ` ${f.count} turned back`
                                const [x, y] = places[event.tool]
                                const cx = x + (20 + f.count * 9) * S
                                const cy = y - 20 * S
                                for (const d of [-1, 1]) {
                                    mark(over, seg([cx - 4 * S, cy - 4 * S * d], [cx + 4 * S, cy + 4 * S * d], 2), { c: VERMILION, w: 2.2, a: 0.9, wob: 0.3 })
                                }
                            },
                        }
                    },
                    // One small figure per session, in its colour and carrying its number, so a journey
                    // has someone making it. Figures sharing a tool stand side by side.
                    figure(fx, x, y, agent, alpha) {
                        const cx = x + ((agent.slot % 3) - 1) * 17 * S
                        fx.globalAlpha = alpha
                        fx.fillStyle = 'rgba(40, 36, 48, 0.2)'
                        fx.beginPath()
                        fx.ellipse(cx, y + 2 * S, 9 * S, 3.5 * S, 0, 0, TAU)
                        fx.fill()
                        fx.fillStyle = rgb(agent.c)
                        fx.strokeStyle = rgb(GRAPHITE)
                        fx.lineWidth = 1.5 * S
                        fx.lineJoin = 'round'
                        fx.beginPath()
                        fx.moveTo(cx - 8 * S, y)
                        fx.lineTo(cx + 8 * S, y)
                        fx.lineTo(cx + 3.5 * S, y - 15 * S)
                        fx.lineTo(cx - 3.5 * S, y - 15 * S)
                        fx.closePath()
                        fx.fill()
                        fx.stroke()
                        fx.beginPath()
                        fx.arc(cx, y - 22 * S, 8.5 * S, 0, TAU)
                        fx.fill()
                        fx.stroke()
                        if (agent.badge) {
                            fx.fillStyle = '#fff'
                            fx.font = `700 ${(agent.badge.length > 1 ? 8.5 : 11) * S}px RoundHog, system-ui, sans-serif`
                            fx.textAlign = 'center'
                            fx.textBaseline = 'middle'
                            fx.fillText(agent.badge, cx, y - 21.5 * S)
                        }
                        fx.globalAlpha = 1
                    },
                    // Without analytics the logs still say which tool was called, when, and whether it failed.
                    // So a call is one smudge at its tool, red if it failed: no journey, no reason.
                    wild(event) {
                        const spot = places[event.tool]
                        if (!spot) return null
                        const x = spot[0] + (rnd() - 0.5) * 30 * S
                        const y = spot[1] + (rnd() - 0.5) * 30 * S
                        const c = event.error ? VERMILION : GRAPHITE
                        pulse(spot[0], spot[1], c)
                        // Logs can count: a pencil tick per call at its tool, a red cross per failure.
                        const k = seen[event.tool]++
                        const tx = spot[0] + (22 + (k % 10) * 6) * S
                        const ty = spot[1] - (20 + Math.floor(k / 10) * 13) * S
                        if (event.error) {
                            for (const d of [-1, 1]) {
                                mark(before, seg([tx - 3 * S, ty - 4 * S * d], [tx + 3 * S, ty + 4 * S * d], 2), { c: VERMILION, w: 2, a: 0.9, wob: 0.3 })
                            }
                        } else {
                            mark(before, seg([tx, ty - 5 * S], [tx + S, ty + 5 * S], 2), { c: GRAPHITE, w: 1.5, a: 0.8, wob: 0.3 })
                        }
                        return { p: path([[x, y], [x + 6 * S, y + 3 * S]]), speed: 4 * S, hold: { u: 1, ms: 2400 }, c, core: c, r: 7 * S }
                    },
                }
            },
        }),
}
