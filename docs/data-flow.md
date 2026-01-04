# Data flow description

This file explains what data travels where. Prefer visuals? Jump to the [user + data flow chart](./diagrams/user-flow.md) for a mermaid diagram of the same steps.

## A. App load
1. Browser downloads the bundled JS/CSS from Vite.
2. React renders `App`.
3. `useAudiusTrending` fires a `GET /tracks/trending` request.
4. UI state is `loading=true`, so the “Loading…” message shows.
5. Response comes back → hook maps raw JSON to our track model → `tracks` state in `App` changes.
6. `App` now knows we have tracks, so it renders the now-playing card and track list.
7. First track URL is assigned to the `<audio>` tag. Because `isPlaying` defaults to `true`, the song starts as soon as the browser finishes buffering.

## B. Play / pause button
1. User presses the play button.
2. `PlayerControls` calls `onTogglePlay`.
3. `App` flips `isPlaying`.
4. Effect watching `[hasActiveTrack, isPlaying]` calls `audio.play()` or `audio.pause()` accordingly.
5. Progress bar keeps updating through the `timeupdate` listener.

## C. Next / previous buttons
1. User clicks skip.
2. `PlayerControls` triggers `onNext` or `onPrevious`.
3. `updateTrackIndex` computes the new bounded index, resets progress, and sets `isPlaying=true`.
4. The `currentTrack` effect pauses, loads, and resumes playback with the new audio source.
5. UI updates instantly because `currentTrack` changed.

## D. Scrubbing the progress slider
1. User drags the range input.
2. `handleSeek` reads the new value.
3. `<audio>.currentTime` is set to that value.
4. `progress.time` updates, so the timestamps rerender.
5. Audius stream keeps playing from the new position.

## E. Selecting a track in the list
1. User clicks a track row.
2. `selectTrack(index)` calls `updateTrackIndex(index)`.
3. Same flow as next/previous (reset progress → load new URL → play).

## F. Error or empty state
1. If the API fails, `useAudiusTrending` sets `error` and `loading=false`.
2. `App` sees `error` and shows the red error panel.
3. If `tracks.length === 0`, the “Audius did not return any tracks” message is shown instead of the player.

These flows cover every user-visible transition in the app.
