import { colorsCss } from '@posthog/brand/colors/css'
import semiBoldUrl from '@posthog/brand/fonts/RoundHog-SemiBold.woff2?url'
import regularUrl from '@posthog/brand/fonts/RoundHog.woff2?url'

// RoundHog's weights follow PostHog's type scale: Regular is 400 and SemiBold is 700. Only these two faces load, which keeps the
// download to about 240 KB, and font-display: swap shows the fallback font until they arrive.
const face = (weight: number, url: string): string =>
    `@font-face{font-family:"RoundHog";font-style:normal;font-weight:${weight};font-display:swap;src:url("${url}") format("woff2")}`

// The palette comes from the brand package as --posthog-* custom properties, which index.css reads with a fallback.
export function injectBrand(): void {
    document.head.insertAdjacentHTML(
        'beforeend',
        `<style>${colorsCss}${face(400, regularUrl)}${face(700, semiBoldUrl)}</style>`
    )
}
