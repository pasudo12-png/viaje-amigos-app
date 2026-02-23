import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Dashboard, { formatCurrency } from '../components/Dashboard'
import TripForm from '../components/TripForm'
import ContributionForm from '../components/ContributionForm'
import Modal from '../components/Modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const [trip, setTrip] = useState(null)
  const [travelers, setTravelers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [showCreateTrip, setShowCreateTrip] = useState(false)
  const [showEditTrip, setShowEditTrip] = useState(false)
  const [showAddTraveler, setShowAddTraveler] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [editingContribution, setEditingContribution] = useState(null)
  const [deletingContribution, setDeletingContribution] = useState(null)
  const [newTravelerName, setNewTravelerName] = useState('')
  const [travelerLoading, setTravelerLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoadingData(true)
    const { data: tripData } = await supabase.from('trips').select('*').limit(1).maybeSingle()
    setTrip(tripData)

    if (tripData) {
      const [{ data: tData }, { data: cData }] = await Promise.all([
        supabase.from('travelers').select('*').eq('trip_id', tripData.id).order('created_at'),
        supabase.from('contributions').select('*').eq('trip_id', tripData.id).order('date', { ascending: false }),
      ])
      setTravelers(tData ?? [])
      setContributions(cData ?? [])
    }
    setLoadingData(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreateTrip = async (formData) => {
    const { error } = await supabase.from('trips').insert([formData])
    if (!error) { setShowCreateTrip(false); fetchAll() }
    return { error }
  }

  const handleUpdateTrip = async (formData) => {
    const { error } = await supabase.from('trips').update(formData).eq('id', trip.id)
    if (!error) { setShowEditTrip(false); fetchAll() }
    return { error }
  }

  const handleAddTraveler = async (e) => {
    e.preventDefault()
    if (!newTravelerName.trim()) return
    setTravelerLoading(true)
    await supabase.from('travelers').insert([{ name: newTravelerName.trim(), trip_id: trip.id }])
    setNewTravelerName('')
    setTravelerLoading(false)
    setShowAddTraveler(false)
    fetchAll()
  }

  const handleAddContribution = async (formData) => {
    const { error } = await supabase.from('contributions').insert([{ ...formData, trip_id: trip.id }])
    if (!error) { setShowAddContribution(false); fetchAll() }
    return { error }
  }

  const handleEditContribution = async (formData) => {
    const { error } = await supabase.from('contributions').update(formData).eq('id', editingContribution.id)
    if (!error) { setEditingContribution(null); fetchAll() }
    return { error }
  }

  const handleDeleteContribution = async () => {
    await supabase.from('contributions').delete().eq('id', deletingContribution.id)
    setDeletingContribution(null)
    fetchAll()
  }

  const exportCSV = () => {
    const rows = [['Viajero', 'Monto', 'Fecha', 'Nota']]
    contributions.forEach(c => {
      const traveler = travelers.find(t => t.id === c.traveler_id)
      rows.push([traveler?.name ?? '', c.amount, c.date, c.note ?? ''])
    })
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip?.name ?? 'viaje'}-abonos.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/viaje-publico/${trip?.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/60 backdrop-blur-sm sticky top-0 z-30 bg-zinc-950/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <span className="font-display text-zinc-100 text-sm hidden sm:block">Ahorro de Viaje</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="hidden sm:block">{user?.email}</span>
            <button onClick={signOut} className="text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        {!trip ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="font-display text-2xl text-zinc-100 mb-2">¡Bienvenida, administradora!</h2>
            <p className="text-zinc-500 mb-6">Crea tu viaje para comenzar a registrar ahorros.</p>
            <button className="btn-primary text-base px-8 py-3" onClick={() => setShowCreateTrip(true)}>
              Crear viaje
            </button>
            {showCreateTrip && (
              <Modal title="Crear viaje" onClose={() => setShowCreateTrip(false)}>
                <TripForm onSave={handleCreateTrip} onCancel={() => setShowCreateTrip(false)} />
              </Modal>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card p-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-zinc-500 mr-1 hidden sm:block">Acciones:</span>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setShowEditTrip(true)}>
                ✏️ Editar viaje
              </button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setShowAddTraveler(true)}>
                ➕ Viajero
              </button>
              <button
                className="btn-primary text-sm py-1.5 px-3"
                onClick={() => setShowAddContribution(true)}
                disabled={travelers.length === 0}
                title={travelers.length === 0 ? 'Agrega viajeros primero' : ''}
              >
                💰 Registrar abono
              </button>
              <div className="flex-1" />
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={exportCSV}>
                📥 Exportar CSV
              </button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={copyLink}>
                {copied ? '✅ Copiado!' : '🔗 Copiar enlace'}
              </button>
            </div>

            <Dashboard trip={trip} travelers={travelers} contributions={contributions} />

            {contributions.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800/60">
                  <h3 className="font-medium text-zinc-200">Gestionar abonos</h3>
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {[...contributions]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(c => {
                      const traveler = travelers.find(t => t.id === c.traveler_id)
                      return (
                        <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                          <div>
                            <span className="text-sm text-zinc-200 font-medium">{traveler?.name}</span>
                            <span className="text-zinc-500 mx-2">·</span>
                            <span className="text-sm text-ocean-400">{formatCurrency(Number(c.amount), trip.currency)}</span>
                            <span className="text-zinc-500 mx-2">·</span>
                            <span className="text-xs text-zinc-500">
                              {format(new Date(c.date + 'T12:00:00'), "d MMM yyyy", { locale: es })}
                            </span>
                            {c.note && <span className="text-xs text-zinc-600 ml-2">— {c.note}</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingContribution(c)}
                              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-700/50 transition-colors"
                            >Editar</button>
                            <button
                              onClick={() => setDeletingContribution(c)}
                              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-900/20 transition-colors"
                            >Eliminar</button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showEditTrip && (
        <Modal title="Editar viaje" onClose={() => setShowEditTrip(false)}>
          <TripForm trip={trip} onSave={handleUpdateTrip} onCancel={() => setShowEditTrip(false)} />
        </Modal>
      )}

      {showAddTraveler && (
        <Modal title="Agregar viajero" onClose={() => setShowAddTraveler(false)}>
          <form onSubmit={handleAddTraveler} className="space-y-4">
            <div>
              <label className="label">Nombre del viajero</label>
              <input className="input" placeholder="Ej: María" value={newTravelerName} onChange={e => setNewTravelerName(e.target.value)} required autoFocus />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={travelerLoading}>
                {travelerLoading ? 'Guardando...' : 'Agregar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddTraveler(false)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddContribution && (
        <Modal title="Registrar abono" onClose={() => setShowAddContribution(false)}>
          <ContributionForm travelers={travelers} onSave={handleAddContribution} onCancel={() => setShowAddContribution(false)} />
        </Modal>
      )}

      {editingContribution && (
        <Modal title="Editar abono" onClose={() => setEditingContribution(null)}>
          <ContributionForm
            travelers={travelers}
            contribution={editingContribution}
            onSave={handleEditContribution}
            onCancel={() => setEditingContribution(null)}
          />
        </Modal>
      )}

      {deletingContribution && (
        <Modal title="Eliminar abono" onClose={() => setDeletingContribution(null)}>
          <p className="text-zinc-400 mb-6">
            ¿Estás segura de que deseas eliminar este abono? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button className="btn-danger" onClick={handleDeleteContribution}>Sí, eliminar</button>
            <button className="btn-secondary" onClick={() => setDeletingContribution(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}