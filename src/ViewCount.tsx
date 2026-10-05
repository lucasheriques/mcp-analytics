import React, { useEffect, useState } from 'react'
import { fetchViewCount } from './views'

// A small number reads as an empty room, so the count appears once there are enough views for it to mean something.
const MIN_VIEWS_SHOWN = 25

export default function ViewCount(): JSX.Element | null {
    const [views, setViews] = useState<number | null>(null)

    useEffect(() => {
        void fetchViewCount().then(setViews)
    }, [])

    if (views === null || views < MIN_VIEWS_SHOWN) return null
    return <> · {new Intl.NumberFormat('en').format(views)} views</>
}
