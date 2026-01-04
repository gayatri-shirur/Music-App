# Low-level design (LLD)

This document zooms into each module so a junior dev can change behavior without guessing.

## 1. Modules & responsibilities

### `src/hooks/useAudiusTrending.js`
- **Inputs**: optional options object `{ limit = 15, time = 'allTime' }`.
- **Side effects**: Fetches `GET /v1/tracks/trending` with `axios` inside a `useEffect`.
- **Outputs**: `{ tracks, loading, error }`.
- **Helpers**:
  - `parseLength(raw)` – converts `number` or `mm:ss` string into seconds.
  - `formatTrack(track)` – builds the object the rest of the UI consumes.
- **Error path**: sets `error` state, still flips `loading` to `false`.

### `src/components/PlayerControls.jsx`
- Stateless component.
- **Props**:
  - `isPlaying` (`bool`)
  - `onTogglePlay` (`function`)
  - `onNext` (`function`)
  - `onPrevious` (`function`)
- Renders three buttons with icons from `react-icons/fi`.

### `src/App.jsx`
- Imports `useAudiusTrending`, `PlayerControls`, icons, and CSS.
- **Local state**:
  | State | Type | Purpose |
  | --- | --- | --- |
  | `currentIndex` | number | Index into the `tracks` array. Normalized before use. |
  | `isPlaying` | bool | Whether the `<audio>` element should be playing. |
  | `progress` | `{ time, duration }` | Keeps slider + timestamps in sync. |
- **Refs**: `audioRef` (points to `<audio>`), `isPlayingRef` (keeps latest flag for autoplay during track swaps).
- **Derived values**:
  - `hasTracks = tracks.length > 0`
  - `boundedIndex` (wraps around playlist)
  - `currentTrack = tracks[boundedIndex]` or `undefined`
  - `progressMax = progress.duration || currentTrack?.duration || 0`
- **Key callbacks**:
  - `updateTrackIndex(nextIndex)` – clamps index, resets progress, enables playback.
  - `handleNext` / `handlePrevious` – call `updateTrackIndex` with ±1.
  - `handleSeek(event)` – updates `<audio>.currentTime` and progress state.
  - `togglePlay()` – flips `isPlaying` if there is an active track.
  - `selectTrack(index)` – picks a specific track from the list.
- **Effects**:
  1. On `currentTrack` change: pause/load audio element, start playback if `isPlayingRef` was true.
  2. On `[hasActiveTrack, isPlaying]`: actually play/pause the `<audio>` element to match UI state.
  3. On `[currentTrack, handleNext]`: subscribe to `timeupdate`, `loadedmetadata`, and `ended` events for progress + auto-next.

### `src/App.css` / `src/index.css`
- Manage gradients, typography, responsive layout, and slider styling.
- No CSS modules. Class names are globally scoped.

## 2. Data models

```ts
// Track object produced by formatTrack
{
  id: string,
  title: string,
  artist: string,
  license: string, // optional Audius permalink
  availability: 'Streaming via Audius',
  duration: number | null, // seconds
  artwork: string, // url
  url: string // stream endpoint
}
```

## 3. Extension points

- **Changing the API filter**: pass `{ limit, time }` into `useAudiusTrending()` inside `App`.
- **Adding new controls**: extend `PlayerControls` with new buttons and update the props contract.
- **Persisting playback state**: add localStorage or URL params around the `currentIndex` and `progress` state.
- **Styling**: edit CSS files directly; there is no Tailwind or CSS-in-JS layer.

This LLD should give enough detail to implement small tweaks without reverse engineering every file.
