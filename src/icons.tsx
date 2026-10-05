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

export const IconGitHub = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </Svg>
)

export const IconSun = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM4.2 5.6 5.6 4.2l2.1 2.1-1.4 1.4zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1z" />
    </Svg>
)

export const IconMoon = (props: IconProps): JSX.Element => (
    <Svg {...props}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
)
