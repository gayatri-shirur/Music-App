import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import './App.css'
import { useAudiusTrending } from './hooks/useAudiusTrending'
import PlayerControls from './components/PlayerControls'

const formatTime = (value) => {
  if (!value || Number.isNaN(value)) {
    return '0:00'
  }

  const totalSeconds = Math.floor(value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function App() {
  const { tracks, loading, error } = useAudiusTrending()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState({ time: 0, duration: 0 })
  const audioRef = useRef(null)
  const isPlayingRef = useRef(isPlaying)
  const hasTracks = tracks.length > 0
  const boundedIndex = hasTracks ? ((currentIndex % tracks.length) + tracks.length) % tracks.length : 0
  const currentTrack = hasTracks ? tracks[boundedIndex] : undefined

  const updateTrackIndex = useCallback(
    (nextIndex) => {
      if (!hasTracks || !tracks.length) return
      const normalized = ((nextIndex % tracks.length) + tracks.length) % tracks.length
      setCurrentIndex(normalized)
      setProgress({ time: 0, duration: tracks[normalized]?.duration ?? 0 })
      setIsPlaying(true)
    },
    [hasTracks, tracks]
  )

  const handleNext = useCallback(() => {
    if (!hasTracks) return
    updateTrackIndex(boundedIndex + 1)
  }, [boundedIndex, hasTracks, updateTrackIndex])

  const handlePrevious = useCallback(() => {
    if (!hasTracks) return
    updateTrackIndex(boundedIndex - 1)
  }, [boundedIndex, hasTracks, updateTrackIndex])

  const hasActiveTrack = Boolean(currentTrack)

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.pause()
    audio.load()

    if (isPlayingRef.current) {
      audio
        .play()
        .then(() => {
          // autoplay succeeded
        })
        .catch(() => setIsPlaying(false))
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !hasActiveTrack) return

    if (isPlaying) {
      audio
        .play()
        .catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [hasActiveTrack, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    const updateProgress = () => {
      setProgress({ time: audio.currentTime, duration: audio.duration || currentTrack?.duration || 0 })
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateProgress)
    audio.addEventListener('ended', handleNext)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateProgress)
      audio.removeEventListener('ended', handleNext)
    }
  }, [currentTrack, handleNext])

  const progressMax = useMemo(() => progress.duration || currentTrack?.duration || 0, [progress.duration, currentTrack])

  const handleSeek = (event) => {
    const value = Number(event.target.value)
    if (!audioRef.current || Number.isNaN(value)) return
    audioRef.current.currentTime = value
    setProgress((prev) => ({ ...prev, time: value }))
  }

  const togglePlay = useCallback(() => {
    if (!hasTracks) return
    setIsPlaying((prev) => !prev)
  }, [hasTracks])

  const selectTrack = useCallback(
    (index) => {
      updateTrackIndex(index)
    },
    [updateTrackIndex]
  )

  const licenseLabel = useMemo(() => {
    if (!currentTrack) return 'Streaming via Audius'
    return currentTrack.availability || 'Streaming via Audius'
  }, [currentTrack])

  return (
    <div className="app-shell">
      <div className="player">
        <header className="player__header">
         
        </header>

        {loading && <div className="state">Loading a fresh stack of tracks…</div>}
        {!loading && error && <div className="state state--error">{error}</div>}

        {!loading && !error && !hasTracks && (
          <div className="state">Audius did not return any tracks. Please refresh to try again.</div>
        )}

        {hasTracks && currentTrack && (
          <section className="now-playing">
            <div className="now-playing__artwork">
              <img src={currentTrack.artwork} alt={`${currentTrack.title} artwork`} loading="lazy" />
            </div>
            <div className="now-playing__details">
              <p className="eyebrow">Now playing</p>
              <h2>{currentTrack.title}</h2>
              <p className="artist">{currentTrack.artist}</p>
              <div className="license">
                <span>{licenseLabel}</span>
                {currentTrack.license && (
                  <a href={currentTrack.license} target="_blank" rel="noreferrer">
                    View on Audius <FiExternalLink />
                  </a>
                )}
              </div>

              <div className="progress">
                <input
                  type="range"
                  min={0}
                  max={progressMax}
                  step="0.1"
                  value={progress.time}
                  onChange={handleSeek}
                />
                <div className="progress__times">
                  <span>{formatTime(progress.time)}</span>
                  <span>{formatTime(progressMax)}</span>
                </div>
              </div>

              <PlayerControls
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </div>
          </section>
        )}

        {hasTracks && (
          <section className="tracklist">
            <div className="tracklist__header">
              <h3>Audius discovery crate</h3>
              <p>Select any track to jump instantly. Everything streams from the Audius public API.</p>
            </div>
            <ul>
              {tracks.map((track, index) => (
                <li key={track.id}>
                  <button
                    type="button"
                    className={`track ${index === boundedIndex ? 'is-active' : ''}`}
                    onClick={() => selectTrack(index)}
                  >
                    <div className="track__artwork">
                      <img src={track.artwork} alt={track.title} loading="lazy" />
                    </div>
                    <div className="track__meta">
                      <p className="track__title">{track.title}</p>
                      <p className="track__artist">{track.artist}</p>
                    </div>
                    <span className="track__duration">{track.duration ? formatTime(track.duration) : '–:–'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <audio ref={audioRef} src={currentTrack?.url ?? ''} preload="metadata" />
      </div>
    </div>
  )
}

export default App
