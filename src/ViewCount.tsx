import React, { useEffect, useState } from 'react'
import { fetchViewCount } from './views'

// Raise this to hide the count until there are enough views for it to mean something. A view is someone who watched for ten seconds.
const MIN_VIEWS_SHOWN = 1

export default function ViewCount(): JSX.Element | null {
    const [views, setViews] = useState<number | null>(null)

    useEffect(() => {
        void fetchViewCount().then(setViews)
    }, [])

    if (views === null || views < MIN_VIEWS_SHOWN) return null
    return (
        <>
            {' '}
            · {new Intl.NumberFormat('en').format(views)} {views === 1 ? 'view' : 'views'}
        </>
    )
}
