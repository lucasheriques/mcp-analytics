import React, { useEffect, useRef, useState } from 'react'
import ChapterCard from './ChapterCard'
import EndCard from './EndCard'
import LoadingScreen from './LoadingScreen'
import { renderFrame } from './engine'
import { IconFullscreen, IconPause, IconPlay, IconVolume, IconVolumeMuted } from './icons'
import PlayOverlay from './PlayOverlay'
import { CHAPTERS, INITIAL_STATE, Player, SPEEDS, chapterAt, formatTime } from './player'
import type { PlayerState, Speed } from './player'
import { loadSaved, resumeFrame, save } from './storage'
import { FPS, FRAMES } from './timeline'
import { recordWatched } from './views'

const SEEK_SECONDS = 5
const WATCHED_AFTER_SECONDS = 10
const VOLUME_STEP = 0.1

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
    const [resumedFrom, setResumedFrom] = useState<number | null>(null)
    const [hover, setHover] = useState<{ frame: number; left: number } | null>(null)
    const { frame, status, speed, muted, volume, loadProgress } = state

    useEffect(() => {
        if (!canvas.current) return
        const { frame: savedFrame, ...settings } = loadSaved()
        let restored = false
        let lastSaved = ''
        // Saves once per second of video, and whenever a setting changes. Nothing is saved until the restore below has run.
        const persist = ({ frame, status, volume, muted, speed }: PlayerState): void => {
            if (!restored) return
            const key = `${Math.floor(frame / FPS)}|${status === 'ended'}|${volume}|${muted}|${speed}`
            if (key === lastSaved) return
            lastSaved = key
            save({ frame: status === 'ended' ? 0 : frame, volume, muted, speed })
        }
        const p = new Player(
            canvas.current,
            (next) => {
                setState(next)
                persist(next)
            },
            settings
        )
        player.current = p
        const start = initialFrame || resumeFrame(savedFrame)
        if (start) p.seek(start)
        if (!initialFrame && start) setResumedFrom(start)
        restored = true
        return () => p.destroy()
    }, [])

    const chapterIndex = CHAPTERS.indexOf(chapterAt(frame))

    // Counts a watch after ten seconds of actual playback, however many pauses and seeks it takes.
    // The resume note is only for the first stretch after coming back, so it goes as soon as playback starts.
    useEffect(() => {
        if (status === 'playing') setResumedFrom(null)
    }, [status])

    const secondsPlayed = useRef(0)
    useEffect(() => {
        if (status !== 'playing') return
        const timer = setInterval(() => {
            secondsPlayed.current += 1
            if (secondsPlayed.current === WATCHED_AFTER_SECONDS) recordWatched()
        }, 1000)
        return () => clearInterval(timer)
    }, [status])

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

    // Page-wide, so the shortcuts work without clicking the player first. Text fields and the speed select keep their own keys,
    // a focused button keeps Space, and a focused slider keeps the arrow keys.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent): void => {
            const p = player.current
            const target = e.target as HTMLElement
            const onSlider = target instanceof HTMLInputElement && target.type === 'range'
            if (
                !p ||
                e.defaultPrevented ||
                e.metaKey ||
                e.ctrlKey ||
                e.altKey ||
                target.isContentEditable ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                (target instanceof HTMLInputElement && !onSlider)
            )
                return
            const arrow = e.code.startsWith('Arrow')
            if (arrow && onSlider) return
            if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
                p.seek(p.state.frame + (e.code === 'ArrowRight' ? 1 : -1) * SEEK_SECONDS * FPS)
            } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                p.setVolume(p.state.volume + (e.code === 'ArrowUp' ? 1 : -1) * VOLUME_STEP)
            } else if (e.code === 'Space' && target.tagName !== 'BUTTON') p.toggle()
            else if (e.code === 'KeyF') toggleFullscreen()
            else if (e.code === 'KeyM') p.setMuted(!p.state.muted)
            else if (e.code === 'Comma' || e.code === 'Period') p.step(e.code === 'Period' ? 1 : -1)
            else if (/^(Digit|Numpad)\d$/.test(e.code))
                p.seek(Math.round((Number(e.code.slice(-1)) / 10) * (FRAMES - 1)))
            else return
            e.preventDefault()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const filling = fill || fullscreen

    return (
        <div
            ref={root}
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
                {status === 'ended' ? (
                    <EndCard
                        onReplay={() => {
                            player.current?.seek(0)
                            void player.current?.play()
                        }}
                    />
                ) : status === 'loading' ? (
                    <LoadingScreen progress={loadProgress} />
                ) : (
                    status !== 'playing' && <PlayOverlay />
                )}
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
                        className="flex h-9 items-center gap-1.5 rounded bg-brand px-3 text-sm font-semibold text-on-brand hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    >
                        {status === 'playing' || status === 'loading' ? (
                            <IconPause className="size-4" />
                        ) : (
                            <IconPlay className="size-4" />
                        )}
                        {status === 'playing' || status === 'loading' ? 'Pause' : 'Play'}
                    </button>
                    <span className="text-sm tabular-nums text-muted-fg">
                        {formatTime(frame)} / {formatTime(FRAMES)}
                    </span>
                    {resumedFrom !== null && status !== 'playing' && (
                        <button
                            type="button"
                            onClick={() => {
                                player.current?.seek(0)
                                setResumedFrom(null)
                            }}
                            className="text-sm text-muted-fg underline hover:text-fg"
                        >
                            Resumed at {formatTime(resumedFrom)}. Start over
                        </button>
                    )}
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
                        <input
                            type="range"
                            aria-label="Volume"
                            title="Volume"
                            min={0}
                            max={1}
                            step={0.05}
                            value={muted ? 0 : volume}
                            onChange={(e) => player.current?.setVolume(Number(e.target.value))}
                            className="hidden h-9 w-20 accent-brand @md:block"
                        />
                        <button
                            type="button"
                            aria-label={muted ? 'Unmute' : 'Mute'}
                            title={muted ? 'Unmute (M)' : 'Mute (M)'}
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
