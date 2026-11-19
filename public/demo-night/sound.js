// Two sounds, kept for the two moments where the room should feel something and not just read it.
// Level 1 is silent, so the knock of each failed call at level 2 is the first the room hears that
// anything went wrong. The stamp is analytics going on. Nothing else in the talk makes a sound.
// The recordings in sfx/ are from Epidemic Sound.
function createSound() {
    let muted = false
    const recorded = (name, volume) => {
        const clip = new Audio(`sfx/${name}.mp3`)
        clip.preload = 'auto'
        return () => {
            if (muted) return
            const voice = clip.cloneNode()
            voice.volume = volume
            // A sound that cannot play is never worth breaking the talk for.
            voice.play().catch(() => {})
        }
    }
    return {
        fail: recorded('fail', 0.8),
        stamp: recorded('stamp', 1),
        toggle() {
            muted = !muted
            return muted
        },
    }
}
