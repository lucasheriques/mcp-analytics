import React, { useEffect, useRef } from 'react'
import { renderFrame } from './engine'
import { formatTime } from './player'
import type { CHAPTERS } from './player'

interface ChapterCardProps {
    chapter: (typeof CHAPTERS)[number]
    active: boolean
    progress: number
    onSelect: (frame: number) => void
}

const ChapterCard = React.memo(function ChapterCard({ chapter, active, progress, onSelect }: ChapterCardProps) {
    const thumbnail = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (thumbnail.current) renderFrame(chapter.poster, thumbnail.current)
    }, [chapter])

    return (
        <button
            type="button"
            aria-current={active}
            onClick={() => onSelect(chapter.start)}
            className={`flex flex-col overflow-hidden rounded-lg border bg-surface text-left text-fg ${
                active ? 'border-brand' : 'border-line hover:border-hover'
            }`}
        >
            <span className="relative hidden @md:block">
                <canvas
                    ref={thumbnail}
                    width={320}
                    height={180}
                    className="aspect-video w-full [image-rendering:pixelated]"
                />
                <span className="absolute bottom-1 right-1 rounded-lg bg-black/70 px-1 text-xs tabular-nums text-white">
                    {formatTime(chapter.start)}
                </span>
            </span>
            <span className="flex items-baseline justify-between gap-2 px-2 py-1 @md:block">
                <span className="block min-w-0">
                    <span className="block text-xs uppercase tracking-wide text-muted-fg">
                        {chapter.label}
                        {progress === 100 && ' ★'}
                    </span>
                    <span className="block text-sm font-semibold leading-tight">{chapter.name}</span>
                </span>
                <span className="text-xs tabular-nums text-muted-fg @md:hidden">{formatTime(chapter.start)}</span>
            </span>
            <span className="mt-auto block h-1 bg-line">
                <span className="block h-full bg-brand" style={{ width: `${progress}%` }} />
            </span>
        </button>
    )
})

export default ChapterCard
