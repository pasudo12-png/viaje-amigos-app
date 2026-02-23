import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Dashboard from '../components/Dashboard'

export default function PublicPage() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [travelers, setTravelers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!tripId) return
    const fetchData = async () => {
      const { data: tripData, error } = await supabase
        .from('trips').select('*').eq('id', tripId).maybeSingle()

      if (error || !tripData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setTrip(tripData)

      const [{ data: tData }, { data: cData }] = await Promise.all([
        supabase.from('travelers').select('*').eq('trip_id', tripId).order('created_at'),
        supabase.from('contributions').select('*').eq('trip_id', tripId),
      ])
      setTravelers(tData ?? [])
      setContributions(cData ?? [])
      setLoading(false)
    }
    fetchData()
  }, [tripId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="font-display text-2xl text-zinc-100 mb-2">Viaje no encontrado</h2>
        <p className="text-zinc-500">El enlace no es válido o el viaje fue eliminado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <span className="font-display text-zinc-100 text-sm">Ahorro de Viaje</span>
          </div>
          <span className="text-xs text-zinc-600 bg-zinc-800/60 px-3 py-1 rounded-full border border-zinc-700/40">
            Solo lectura
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-6 text-center">
          <p className="text-xs text-zinc-600 uppercase tracking-wider">Vista compartida</p>
        </div>
        <Dashboard trip={trip} travelers={travelers} contributions={contributions} />
      </main>
    </div>
  )
}