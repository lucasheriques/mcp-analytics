import React, { useEffect, useRef, useState } from 'react'
import { capture } from './analytics'
import ChapterCard from './ChapterCard'
import { renderFrame } from './engine'
import { IconFullscreen, IconPause, IconPlay, IconVolume, IconVolumeMuted } from './icons'
import PlayOverlay from './PlayOverlay'
import { CHAPTERS, INITIAL_STATE, Player, SPEEDS, chapterAt, formatTime } from './player'
import type { PlayerState, Speed } from './player'
import { FPS, FRAMES } from './timeline'

const SEEK_SECONDS = 5
const VIDEO = {
    video_source: 'canvas',
    video_id: 'mcp-analytics-8-bit-tale',
    video_title: 'MCP analytics: an 8-bit tale',
}

const iconButton =
    'flex size-9 items-center justify-center rounded border border-line text-fg hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand'

interface VideoProps {
    initialFrame?: number
    // Fill the parent instead of keeping 16:9, and hide the chapter cards. Used for the iframe embed.
    fill?: boolean
}

export default function Video({ initialFrame = 0, fill = false }: VideoProps): JSX.Element {
    const root = useRef<HTMLDivElement>(null)
    const canvas = useRef<HTMLCanvasElement>(null)
    const previewCanvas = useRef<HTMLCanvasElement>(null)
    const player = useRef<Player>()
    const clickTimer = useRef<ReturnType<typeof setTimeout>>()
    const [state, setState] = useState<PlayerState>(INITIAL_STATE)
    const [fullscreen, setFullscreen] = useState(false)
    const [hover, setHover] = useState<{ frame: number; left: number } | null>(null)
    const { frame, status, speed, muted } = state

    useEffect(() => {
        if (!canvas.current) return
        const p = new Player(canvas.current, setState)
        player.current = p
        if (initialFrame) p.seek(initialFrame)
        return () => p.destroy()
    }, [])

    const played = useRef(false)
    const chaptersReached = useRef(new Set<number>())
    const chapterIndex = CHAPTERS.indexOf(chapterAt(frame))

    useEffect(() => {
        if (status === 'ended') capture('Completed video', VIDEO)
        if (status !== 'playing' || played.current) return
        played.current = true
        capture('Played video', VIDEO)
    }, [status])

    useEffect(() => {
        if (status !== 'playing' || chaptersReached.current.has(chapterIndex)) return
        chaptersReached.current.add(chapterIndex)
        capture('Video chapter reached', {
            ...VIDEO,
            chapter_index: chapterIndex,
            chapter_name: CHAPTERS[chapterIndex].name,
        })
    }, [status, chapterIndex])

    useEffect(() => {
        const sync = (): void => setFullscreen(document.fullscreenElement === root.current)
        document.addEventListener('fullscreenchange', sync)
        return () => document.removeEventListener('fullscreenchange', sync)
    }, [])

    useEffect(() => {
        if (hover && previewCanvas.current) renderFrame(hover.frame, previewCanvas.current)
    }, [hover?.frame])

    useEffect(() => () => clearTimeout(clickTimer.current), [])

    const toggleFullscreen = (): void => {
        if (!document.fullscreenEnabled) return
        if (document.fullscreenElement) void document.exitFullscreen()
        else root.current?.requestFullscreen().catch(() => undefined)
    }

    // One click toggles play; a double click goes fullscreen instead, so the single click waits to see if a second follows.
    const onCanvasClick = (): void => {
        clearTimeout(clickTimer.current)
        clickTimer.current = setTimeout(() => player.current?.toggle(), 250)
    }
    const onCanvasDoubleClick = (): void => {
        clearTimeout(clickTimer.current)
        toggleFullscreen()
    }

    const onScrubberMove = (e: React.MouseEvent<HTMLDivElement>): void => {
        const { left, width } = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - left
        setHover({
            frame: Math.round(Math.max(0, Math.min(1, x / width)) * (FRAMES - 1)),
            left: Math.max(128, Math.min(width - 128, x)),
        })
    }

    // Only for events from inside the player, and not from the speed select, which keeps its own keys.
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        const p = player.current
        const target = e.target as HTMLElement
        if (
            !p ||
            e.defaultPrevented ||
            e.metaKey ||
            e.ctrlKey ||
            e.altKey ||
            !e.currentTarget.contains(target) ||
            target.tagName === 'SELECT'
        )
            return
        if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
            p.seek(p.state.frame + (e.code === 'ArrowRight' ? 1 : -1) * SEEK_SECONDS * FPS)
        } else if (e.code === 'Space' && target.tagName !== 'BUTTON') p.toggle()
        else if (e.code === 'KeyF') toggleFullscreen()
        else if (e.code === 'Comma' || e.code === 'Period') p.step(e.code === 'Period' ? 1 : -1)
        else return
        e.preventDefault()
    }

    const filling = fill || fullscreen

    return (
        <div
            ref={root}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className={`@container flex flex-col rounded border border-line bg-surface text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                filling ? 'h-full' : ''
            }`}
        >
            <div className={`relative bg-black ${filling ? 'min-h-0 flex-1' : 'aspect-video'}`}>
                <canvas
                    ref={canvas}
                    width={1920}
                    height={1080}
                    onClick={onCanvasClick}
                    onDoubleClick={onCanvasDoubleClick}
                    role="img"
                    aria-label="MCP analytics: an 8-bit tale, an animated video"
                    className="size-full cursor-pointer object-contain [image-rendering:pixelated]"
                />
                {status !== 'playing' && <PlayOverlay />}
            </div>
            <div className="flex flex-col gap-2 p-2">
                <div>
                    <div className="relative" onMouseMove={onScrubberMove} onMouseLeave={() => setHover(null)}>
                        {hover && (
                            <div
                                className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 border-2 border-line bg-surface p-1"
                                style={{ left: hover.left }}
                            >
                                <canvas
                                    ref={previewCanvas}
                                    width={640}
                                    height={360}
                                    className="block w-64 [image-rendering:pixelated]"
                                />
                                <div className="whitespace-nowrap pt-1 text-xs">
                                    {formatTime(hover.frame)} · {chapterAt(hover.frame).name}
                                </div>
                            </div>
                        )}
                        <input
                            type="range"
                            aria-label="Seek"
                            aria-valuetext={formatTime(frame)}
                            min={0}
                            max={FRAMES - 1}
                            step={1}
                            value={frame}
                            onChange={(e) => player.current?.seek(Number(e.target.value))}
                            className="block w-full accent-brand"
                        />
                    </div>
                    <div className="relative h-2">
                        {CHAPTERS.slice(1).map((c) => (
                            <div
                                key={c.start}
                                className="absolute top-0 h-2 w-0.5 bg-line"
                                style={{ left: `${(c.start / (FRAMES - 1)) * 100}%` }}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => player.current?.toggle()}
                        className="flex h-9 items-center gap-1.5 rounded bg-brand px-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    >
                        {status === 'playing' ? <IconPause className="size-4" /> : <IconPlay className="size-4" />}
                        {status === 'playing' ? 'Pause' : status === 'loading' ? 'Loading…' : 'Play'}
                    </button>
                    <span className="text-sm tabular-nums text-muted-fg">
                        {formatTime(frame)} / {formatTime(FRAMES)}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        <select
                            aria-label="Playback speed"
                            value={speed}
                            onChange={(e) => player.current?.setSpeed(Number(e.target.value) as Speed)}
                            className="h-9 rounded border border-line bg-surface px-2 text-sm text-fg hover:border-hover"
                        >
                            {SPEEDS.map((s) => (
                                <option key={s} value={s}>
                                    {s}x
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            aria-label={muted ? 'Unmute' : 'Mute'}
                            title={muted ? 'Unmute' : 'Mute'}
                            onClick={() => player.current?.setMuted(!muted)}
                            className={iconButton}
                        >
                            {muted ? <IconVolumeMuted className="size-5" /> : <IconVolume className="size-5" />}
                        </button>
                        {document.fullscreenEnabled && (
                            <button
                                type="button"
                                aria-label="Fullscreen"
                                title="Fullscreen (F)"
                                onClick={toggleFullscreen}
                                className={iconButton}
                            >
                                <IconFullscreen className="size-5" />
                            </button>
                        )}
                    </div>
                </div>
                {!filling && (
                    <div className="grid grid-cols-2 gap-2 @md:grid-cols-4 @2xl:grid-cols-7">
                        {CHAPTERS.map((c, i) => (
                            <ChapterCard
                                key={c.start}
                                chapter={c}
                                active={i === chapterIndex}
                                progress={Math.round(
                                    Math.max(0, Math.min(1, (frame - c.start) / (c.end - c.start))) * 100
                                )}
                                onSelect={(start) => player.current?.seek(start)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
