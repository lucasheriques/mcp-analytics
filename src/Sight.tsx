import React, { useState } from 'react'

// One real visit to a merch store MCP server, taken from the session the Demo Night talk replays, as it looks from the server
// at three levels of observability.
const QUESTIONS = [
    'Did anything go wrong?',
    'Who was it?',
    'What did they want, and did they get it?',
    'What did they want that you don’t have?',
]

type Row = { text: string; note?: string; failed?: boolean }

interface Level {
    name: string
    source: string
    rows: Row[]
    answers: (string | null)[]
    verdict: string
}

const call = (tool: string, note: string, failed = false): Row => ({ text: tool, note, failed })

const LEVELS: Level[] = [
    {
        name: 'No observability',
        source: 'tail -f access.log',
        rows: ['53ms', '168ms', '69ms', '161ms', '149ms'].map((took) => ({ text: 'POST /mcp', note: `${took}  200` })),
        answers: [null, null, null, null],
        verdict: 'Every request came back 200. Looks like a good day.',
    },
    {
        name: 'Traces and logs',
        source: 'traces · merch-mcp',
        rows: [
            call('search_products', 'user=priya.raman  ok'),
            call('get_product', 'user=priya.raman  ok'),
            call('add_to_cart', 'user=priya.raman  ok'),
            call('checkout', 'user=priya.raman  isError', true),
            call('checkout', 'user=priya.raman  isError', true),
        ],
        answers: ['Yes. checkout failed twice.', 'priya.raman@example.com', null, null],
        verdict: 'Checkout is failing, and it was Priya’s token. What did she want?',
    },
    {
        name: 'MCP Analytics',
        source: 'session · Priya Raman · claude-code',
        rows: [
            call('search_products', 'query=hoodie'),
            call('get_product', 'product_id=prod_hoodie'),
            call('add_to_cart', 'size=S, medium is sold out'),
            call('checkout', 'We do not ship to BR', true),
            call('checkout', 'We do not ship to BR', true),
            call('get_more_tools', '“shipping to Brazil”'),
        ],
        answers: [
            'Yes. checkout failed twice.',
            'Priya Raman, on Claude Code',
            'A medium hoodie for her team offsite, shipped to Brazil. No order, $75 left in the cart.',
            'Shipping to Brazil',
        ],
        verdict: 'Priya wanted to pay, and the store turned her away.',
    },
]

export default function Sight(): JSX.Element {
    const [at, setAt] = useState(0)
    const level = LEVELS[at]

    return (
        <section
            aria-label="One visit to an MCP server, seen at three levels"
            className="rounded-xl border-2 border-fg bg-surface shadow-[4px_4px_0_var(--fg)]"
        >
            <div role="group" aria-label="Level" className="flex flex-wrap gap-2 border-b-2 border-fg p-3">
                {LEVELS.map((each, i) => (
                    <button
                        key={each.name}
                        type="button"
                        aria-pressed={i === at}
                        onClick={() => setAt(i)}
                        className="min-h-10 rounded-lg border border-line px-3 text-sm font-bold transition-[color,background-color,border-color,scale] duration-150 ease-out hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg active:scale-[0.96] aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-surface"
                    >
                        <span className="mr-1.5 font-mono text-xs opacity-70">{i + 1}</span>
                        {each.name}
                    </button>
                ))}
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
                <div className="min-h-56 rounded-lg bg-[#12151f] p-3 font-mono text-[13px] leading-6 text-[#c9ccd3]">
                    <p className="mb-2 text-[#7d8494]">{level.source}</p>
                    <ol key={at} className="sight-in">
                        {level.rows.map((row, i) => (
                            <li key={i} className={`flex gap-3 ${row.failed ? 'text-[#ff9d7a]' : ''}`}>
                                <span className="shrink-0 font-bold text-white">{row.text}</span>
                                <span className="min-w-0 truncate">{row.note}</span>
                            </li>
                        ))}
                    </ol>
                </div>
                <dl className="flex flex-col gap-3 text-sm">
                    {QUESTIONS.map((question, i) => (
                        <div key={question}>
                            <dt className="text-muted-fg">{question}</dt>
                            <dd key={`${at}-${level.answers[i]}`} className="sight-in font-bold">
                                {level.answers[i] ?? (
                                    <span className="inline-block rounded border border-dashed border-hover px-1.5 font-normal text-muted-fg">
                                        Can’t tell.
                                    </span>
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
            <p className="border-t-2 border-fg px-4 py-3 font-bold">
                <span key={at} className="sight-in inline-block">
                    {level.verdict}
                </span>
            </p>
        </section>
    )
}
