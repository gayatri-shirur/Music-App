# User + data flow chart

```mermaid
flowchart TD
  A[Page load] --> B{useAudiusTrending hook}
  B -->|GET /tracks/trending| C[Audius API]
  C -->|JSON track list| D[Track mapping]
  D --> E{Tracks available?}
  E -->|No| F[Show empty/error state]
  E -->|Yes| G[Populate state]
  G --> H[Render Now Playing card]
  G --> I[Render Track List]
  H --> J[Bind <audio> element]
  I --> K[User selects track]
  J --> L[Play/Pause Handler]
  L --> M[<audio> play()/pause()]
  J --> N[Progress Listener]
  N --> O[Update slider + timestamps]
  K --> P[updateTrackIndex]
  P --> J
```

**How to read it:**
- Blue rectangles show app steps.
- Diamonds (`E`) represent decisions.
- Lines labeled “Yes/No” clarify which path the app takes.
- Everything ultimately loops back into the `<audio>` element, because playback is the heart of the UI.
