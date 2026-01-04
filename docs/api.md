# Audius API reference (project scope)

This app only needs two Audius HTTP endpoints. Both are public and work without an API key as long as you send the `app_name` parameter.

| Purpose | Method & URL | Required query params | Notes |
| --- | --- | --- | --- |
| Fetch trending tracks | `GET https://api.audius.co/v1/tracks/trending` | `app_name=lofi_crate_player`, `limit=15` (or any number you pass to the hook), `time=allTime` | Returns JSON with a `data` array. Each entry holds track + artist metadata. We pick artwork, duration, and user fields from here. |
| Stream audio from a specific track | `GET https://api.audius.co/v1/tracks/{trackId}/stream` | `app_name=lofi_crate_player` | Returns an audio stream (usually AAC/MP3). The `<audio>` tag can use the URL directly. |

## Response shape we rely on

For each track in the `data` array we read:

- `id` – used for the stream URL and React list keys.
- `title` – falls back to `'Untitled Audius track'` if missing.
- `duration` – seconds. We also support `mm:ss` strings.
- `artwork` or `user.profile_picture` – contains multiple resolutions; we prefer `480x480`.
- `permalink` – used to build `https://audius.co{permalink}` so users can open the track on Audius.
- `user.name` or `user.handle` – displayed under the track title.

If any field is missing the mapping helper inside `useAudiusTrending` supplies safe defaults, so the UI never breaks.

## Error handling rules

1. **Network or API errors** – caught inside `useAudiusTrending`. The hook sets `error` with `err.message` or a generic fallback (`"Failed to load songs from Audius..."`).
2. **Empty responses** – if `data` is empty the UI shows a friendly message (“Audius did not return any tracks…”).
3. **Artwork fallbacks** – if both artwork sources are missing we display the Audius brand cover `https://audius.co/img/cover-v3.jpg`.

## Testing the endpoints manually

```bash
# Trending (all-time favorites)
curl "https://api.audius.co/v1/tracks/trending?time=allTime&limit=3&app_name=lofi_crate_player"

# Stream preview for a specific track ID
curl -L "https://api.audius.co/v1/tracks/<TRACK_ID>/stream?app_name=lofi_crate_player" --output sample.mp3
```

Always keep the `app_name` value consistent with the one in `useAudiusTrending`. Audius uses it for basic rate tracking.
