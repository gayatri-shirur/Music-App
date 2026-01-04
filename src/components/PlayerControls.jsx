import { FiPause, FiPlay, FiSkipBack, FiSkipForward } from 'react-icons/fi'

function PlayerControls({ isPlaying, onTogglePlay, onNext, onPrevious }) {
  return (
    <div className="controls">
      <button type="button" onClick={onPrevious} aria-label="Previous track">
        <FiSkipBack />
      </button>
      <button type="button" className="play" onClick={onTogglePlay} aria-label="Play or pause">
        {isPlaying ? <FiPause /> : <FiPlay />}
      </button>
      <button type="button" onClick={onNext} aria-label="Next track">
        <FiSkipForward />
      </button>
    </div>
  )
}

export default PlayerControls
