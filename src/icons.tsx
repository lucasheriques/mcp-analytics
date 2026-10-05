import React from 'react'

type IconProps = { className?: string }

const Svg = ({ className, children }: IconProps & { children: React.ReactNode }): JSX.Element => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        {children}
    </svg>
)

export const IconPlay = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M8 5v14l11-7z" />
    </Svg>
)

export const IconPause = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </Svg>
)

export const IconVolume = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
    </Svg>
)

export const IconVolumeMuted = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M3 9v6h4l5 5V4L7 9zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z" />
    </Svg>
)

export const IconFullscreen = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 0h2v5h-5v-2h3z" />
    </Svg>
)
