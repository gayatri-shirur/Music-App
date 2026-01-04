import { useEffect, useState } from 'react'
import axios from 'axios'

const AUDIUS_APP_NAME = 'lofi_crate_player'
const TRENDING_ENDPOINT = 'https://api.audius.co/v1/tracks/trending'

const parseLength = (raw) => {
  if (!raw) return null
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    if (raw.includes(':')) {
      const [minutes, seconds] = raw.split(':').map(Number)
      if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
        return minutes * 60 + seconds
      }
    }
    const floatValue = parseFloat(raw)
    return Number.isNaN(floatValue) ? null : floatValue
  }
  return null
}

const formatTrack = (track) => {
  const pickArtwork = (artwork) => artwork?.['480x480'] || artwork?.['150x150'] || null
  const artworkUrl =
    pickArtwork(track.artwork) || pickArtwork(track.user?.profile_picture) || 'https://audius.co/img/cover-v3.jpg'

  return {
    id: track.id,
    title: track.title || 'Untitled Audius track',
    artist: track.user?.name || track.user?.handle || 'Audius artist',
    license: track.permalink ? `https://audius.co${track.permalink}` : '',
    availability: 'Streaming via Audius',
    duration: parseLength(track.duration),
    artwork: artworkUrl,
    url: `https://api.audius.co/v1/tracks/${track.id}/stream?app_name=${AUDIUS_APP_NAME}`,
  }
}

export function useAudiusTrending({ limit = 15, time = 'allTime' } = {}) {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    const fetchTracks = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get(TRENDING_ENDPOINT, {
          params: {
            app_name: AUDIUS_APP_NAME,
            limit,
            time,
          },
        })

        if (!isCancelled) {
          const resolvedTracks = (data?.data || []).map(formatTrack)
          setTracks(resolvedTracks)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Failed to load songs from Audius. Please try again later.')
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    fetchTracks()

    return () => {
      isCancelled = true
    }
  }, [limit, time])

  return { tracks, loading, error }
}
