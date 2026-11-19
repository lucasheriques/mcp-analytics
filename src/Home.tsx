import React from 'react'
import { Logo } from '@posthog/brand/logo'
import InstallSection from './InstallSection'
import { IconGitHub } from './icons'
import {
    AUTHOR_URL,
    DEMO_NIGHT_PATH,
    ExternalLink,
    HOME_PATH,
    POSTHOG_HOME,
    POSTHOG_MCP_ANALYTICS,
    REPO_URL,
    TALE_PATH,
} from './links'
import Sight from './Sight'
import ThemeToggle from './ThemeToggle'

interface Page {
    href: string
    kind: string
    title: string
    about: string
    how: string
    open: string
    poster: string
    // Each page keeps the look of the thing it opens: the talk is drawn on paper, the tale is pixel art.
    look: 'paper' | 'pixel'
}

const PAGES: Page[] = [
    {
        href: DEMO_NIGHT_PATH,
        kind: 'Talk you can click through',
        title: 'One customer, three levels of sight',
        about: 'The talk I gave at MCP Analytics Demo Night. A real agent tries to buy a hoodie from a merch store MCP server, and you watch it with no observability, with traces, and with MCP Analytics.',
        how: '16 stops. Arrow keys or Space to move.',
        open: 'Open the talk',
        poster: `${HOME_PATH}home/demo-night.jpg`,
        look: 'paper',
    },
    {
        href: TALE_PATH,
        kind: 'Video, 4 minutes',
        title: 'MCP analytics: an 8-bit tale',
        about: 'A pixel-art story about product analytics for AI agents. There is no video file: every frame is drawn in your browser from code.',
        how: 'Sound on. It has a soundtrack.',
        open: 'Watch the tale',
        poster: `${HOME_PATH}og.png`,
        look: 'pixel',
    },
]

const LOOKS = {
    paper: {
        card: 'border-[#151b2e] bg-[#efe6d2] text-[#151b2e] shadow-[4px_4px_0_#151b2e]',
        title: 'font-serif',
        dim: 'text-[#151b2e]/70',
        poster: 'object-left-top',
    },
    pixel: {
        card: 'border-[#f4f3ee] bg-[#1d1f27] text-[#f4f3ee] shadow-[4px_4px_0_var(--brand)]',
        title: 'font-mono uppercase tracking-wide',
        dim: 'text-[#f4f3ee]/70',
        poster: '[image-rendering:pixelated]',
    },
}

function PageCard({ page }: { page: Page }): JSX.Element {
    const look = LOOKS[page.look]
    return (
        <article className={`flex flex-col overflow-hidden rounded-xl border-2 ${look.card}`}>
            <a href={page.href} tabIndex={-1} aria-hidden="true" className="block">
                <img
                    src={page.poster}
                    alt=""
                    width={1200}
                    height={630}
                    loading="lazy"
                    className={`aspect-[1200/630] w-full border-b-2 border-current object-cover ${look.poster}`}
                />
            </a>
            <div className="flex flex-1 flex-col gap-2 p-5">
                <p className={`text-xs font-bold uppercase tracking-widest ${look.dim}`}>{page.kind}</p>
                <h3 className={`text-balance text-2xl font-bold leading-tight ${look.title}`}>{page.title}</h3>
                <p className={look.dim}>{page.about}</p>
                <p className={`text-sm ${look.dim}`}>{page.how}</p>
                <a
                    href={page.href}
                    className="mt-auto inline-flex min-h-10 items-center self-start rounded-lg bg-brand px-4 font-bold text-on-brand transition-[background-color,scale] duration-150 ease-out hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current active:scale-[0.96]"
                >
                    {page.open}
                </a>
            </div>
        </article>
    )
}

export default function Home(): JSX.Element {
    return (
        <main className="mx-auto flex min-h-full max-w-5xl flex-col gap-14 px-4 py-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <ExternalLink href={POSTHOG_HOME} aria-label="PostHog" className="text-fg">
                    <Logo variant="gradient" size={112} className="dark:hidden" />
                    <Logo variant="mono" size={112} className="hidden dark:block" />
                </ExternalLink>
                <div className="flex items-center gap-2">
                    <ExternalLink
                        href={REPO_URL}
                        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                        <IconGitHub className="size-4" />
                        GitHub
                    </ExternalLink>
                    <ThemeToggle />
                </div>
            </header>

            <section className="flex flex-col gap-6">
                <div className="flex max-w-3xl flex-col gap-3">
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-fg">Notes on MCP Analytics</p>
                    <h1 className="text-balance text-4xl font-bold leading-[1.1] sm:text-5xl">
                        What are agents doing when they call your MCP server?
                    </h1>
                    <p className="text-lg text-muted-fg">
                        I’m{' '}
                        <ExternalLink href={AUTHOR_URL} className="underline hover:text-fg">
                            Lucas
                        </ExternalLink>
                        . I lead{' '}
                        <ExternalLink href={POSTHOG_MCP_ANALYTICS} className="underline hover:text-fg">
                            MCP Analytics
                        </ExternalLink>{' '}
                        at PostHog, and this is where I put what I learn building it.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-muted-fg">
                        Start here. This is one customer’s visit to a store’s MCP server. Raise the level and see what
                        the person who built the server can tell.
                    </p>
                    <Sight />
                    <p className="text-sm text-muted-fg">
                        It’s a real session from{' '}
                        <a href={DEMO_NIGHT_PATH} className="underline hover:text-fg">
                            the Demo Night talk
                        </a>
                        , where you can watch it happen on a map.
                    </p>
                </div>
            </section>

            <section aria-labelledby="pages-heading" className="flex flex-col gap-4">
                <h2 id="pages-heading" className="text-lg font-bold">
                    Pages
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {PAGES.map((page) => (
                        <PageCard key={page.href} page={page} />
                    ))}
                </div>
                <p className="text-sm text-muted-fg">I add a page when I learn something worth one.</p>
            </section>

            <InstallSection />

            <footer className="border-t border-line pt-6 text-sm text-muted-fg">
                <p>
                    Curious about the product? Read about{' '}
                    <ExternalLink href={POSTHOG_MCP_ANALYTICS} className="underline hover:text-fg">
                        PostHog MCP analytics
                    </ExternalLink>
                    . The{' '}
                    <ExternalLink href={REPO_URL} className="underline hover:text-fg">
                        code behind this site
                    </ExternalLink>{' '}
                    is on GitHub.
                </p>
            </footer>
        </main>
    )
}
