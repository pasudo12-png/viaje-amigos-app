import { useState } from 'react'

const CURRENCIES = ['COP', 'USD', 'EUR', 'MXN', 'ARS', 'BRL', 'PEN', 'CLP']

export default function TripForm({ trip, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: trip?.name ?? '',
    destination: trip?.destination ?? '',
    currency: trip?.currency ?? 'COP',
    target_amount: trip?.target_amount ?? '',
    trip_date: trip?.trip_date ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.destination.trim()) {
      setError('El nombre y destino son obligatorios.')
      return
    }
    setLoading(true)
    const result = await onSave({
      ...form,
      target_amount: form.target_amount ? Number(form.target_amount) : null,
      trip_date: form.trip_date || null,
    })
    if (result?.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre del viaje *</label>
          <input className="input" placeholder="Ej: Viaje a Cartagena 2025" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Destino *</label>
          <input className="input" placeholder="Ej: Cartagena, Colombia" value={form.destination} onChange={e => set('destination', e.target.value)} required />
        </div>
        <div>
          <label className="label">Moneda</label>
          <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Meta total (opcional)</label>
          <input className="input" type="number" min="0" placeholder="Ej: 5000000" value={form.target_amount} onChange={e => set('target_amount', e.target.value)} />
        </div>
        <div>
          <label className="label">Fecha estimada (opcional)</label>
          <input className="input" type="date" value={form.trip_date} onChange={e => set('trip_date', e.target.value)} />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : trip ? 'Actualizar viaje' : 'Crear viaje'}
        </button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  )
}