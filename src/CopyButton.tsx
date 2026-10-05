import React, { useEffect, useState } from 'react'

// The clipboard API needs a secure page, focus, and permission, and some browsers and iframes refuse it, so fall back to the
// older copy command through a hidden textarea.
async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const field = Object.assign(document.createElement('textarea'), { value: text })
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.append(field)
        field.select()
        const copied = document.execCommand('copy')
        field.remove()
        return copied
    }
}

interface CopyButtonProps {
    text: string
    label: string
    className: string
}

export default function CopyButton({ text, label, className }: CopyButtonProps): JSX.Element {
    const [copied, setCopied] = useState<boolean | null>(null)

    useEffect(() => {
        if (copied === null) return
        const timer = setTimeout(() => setCopied(null), 2000)
        return () => clearTimeout(timer)
    }, [copied])

    return (
        <button type="button" onClick={() => void copyText(text).then(setCopied)} className={className}>
            {copied === null ? label : copied ? 'Copied' : 'Press Ctrl+C to copy'}
        </button>
    )
}
