// A stand-in for the live tool-call feed, shaped like the real data: each session is one agent making
// several calls in order. `get_more_tools` only exists once the SDK is installed, and it is the only
// source of missing-capability reports.
const TOOLS = [
    'search_products',
    'get_product',
    'add_to_cart',
    'view_cart',
    'checkout',
    'get_order_status',
    'remove_from_cart',
]

const SESSIONS = [
    // The story of the talk: one customer, one errand, and it does not end well.
    [
        { tool: 'search_products', args: { query: 'hoodie' }, intent: 'Buy a medium hoodie for the team offsite and ship it to Brazil' },
        { tool: 'get_product', args: { product_id: 'prod_hoodie' }, intent: 'Check the hoodie comes in medium' },
        { tool: 'add_to_cart', args: { product_id: 'prod_hoodie', size: 'M' }, intent: 'Add a medium hoodie for the offsite', error: 'sold out in M' },
        { tool: 'add_to_cart', args: { product_id: 'prod_hoodie', size: 'L' }, intent: 'Take a large, since medium is sold out' },
        { tool: 'checkout', args: { shipping_country: 'Brazil' }, intent: 'Ship the hoodie to Brazil', error: 'country format' },
        { tool: 'checkout', args: { shipping_country: 'BR' }, intent: 'Ship the hoodie to Brazil', error: 'no shipping to Brazil' },
        { tool: 'get_more_tools', intent: 'Ship an order to Brazil', missing: 'shipping to Brazil' },
    ],
    [
        { tool: 'search_products', args: { query: 'hoodie' }, intent: 'Something warm to wear at a winter offsite' },
        { tool: 'get_product', args: { product_id: 'prod_hoodie' }, intent: 'Check whether the hoodie comes in medium' },
        { tool: 'add_to_cart', args: { product_id: 'prod_hoodie', quantity: 1, size: 'M' }, intent: 'Buy a hoodie in medium for the offsite', error: 'sold out in M' },
        { tool: 'get_more_tools', intent: 'Get told when the hoodie is back in medium', missing: 'restock alerts' },
    ],
    [
        { tool: 'search_products', intent: 'Kids size t-shirt for a six year old' },
        { tool: 'get_more_tools', intent: 'Buy a t-shirt in a kids size', missing: 'kids sizes' },
    ],
    [
        {
            tool: 'search_products',
            intent: 'A leaving present for a colleague of six years, ideally something she can keep on her desk',
        },
        { tool: 'add_to_cart', intent: 'Add the hedgehog mug as a leaving present' },
        { tool: 'get_more_tools', intent: 'Gift wrap the order and add a handwritten note', missing: 'gift wrap' },
        { tool: 'view_cart', intent: 'Double-check the total before paying' },
        { tool: 'get_more_tools', intent: 'Apply a discount code before paying', missing: 'discount codes' },
        { tool: 'checkout', intent: 'Send the present to her new address in Brazil', error: 'no shipping to Brazil' },
    ],
    [
        { tool: 'search_products', intent: 'A kids size hoodie for a niece' },
        { tool: 'get_more_tools', intent: 'Order a hoodie in a kids size', missing: 'kids sizes' },
    ],
]

function startStream(onEvent) {
    let session = 0
    let step = 0
    let timer
    const tick = () => {
        const calls = SESSIONS[session % SESSIONS.length]
        onEvent({ ...calls[step], session })
        step += 1
        const ended = step === calls.length
        if (ended) {
            session += 1
            step = 0
        }
        timer = setTimeout(tick, ended ? 6000 : 4200)
    }
    timer = setTimeout(tick, 800)
    return () => clearTimeout(timer)
}

// Plays the first two sessions as an example, so a stop has something to show before anyone sends a prompt.
// On the raw channel the calls carry no session or intent, and get_more_tools does not exist.
// The talk's own customer, for when no live agent is on hand: her calls arrive one at a time, as the
// SDK would record them. Each level of the talk shows what it can of the same calls.
function playExample(onEvent, onProgress) {
    const calls = SESSIONS[0].map((call) => ({
        ...call,
        session: 'ses_a3f1',
        client: 'claude-code',
        model: 'claude-sonnet-5-5',
        why: typeof call.error === 'string' ? call.error : undefined,
        user: 'Priya Raman',
    }))
    onProgress(0, calls.length)
    const timers = calls.map((call, i) =>
        setTimeout(() => {
            onEvent({ ...call, channel: 'instrumented', example: true, durationMs: 40 + Math.round(Math.random() * 160) })
            onProgress(i + 1, calls.length)
        }, 900 + i * 2600)
    )
    return () => timers.forEach(clearTimeout)
}
