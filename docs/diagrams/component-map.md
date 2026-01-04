# Component + responsibility map

```mermaid
graph LR
  subgraph React App
    A[App.jsx]
    B[useAudiusTrending hook]
    C[PlayerControls]
    D[HTMLAudioElement]
  end
  subgraph External
    E[Audius API]
  end

  A -->|invokes| B
  B -->|fetch trends| E
  E -->|returns tracks| B
  B -->|normalized data + state| A
  A -->|props: track, state setters| C
  C -->|events: onPlayPause, onNext, onPrev| A
  A -->|ref + commands| D
  D -->|timeupdate, ended| A
  A -->|progress + selection| UI[Now Playing + List]
```

**Legend**
- `App.jsx` orchestrates everything (state, refs, rendering list/current track).
- `useAudiusTrending` isolates data fetching and normalization.
- `PlayerControls` is a pure presentational component emitting events through props.
- `HTMLAudioElement` represents the DOM audio tag controlled via refs.
- `Audius API` is the only external dependency.
