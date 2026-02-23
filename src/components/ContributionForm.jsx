import { useState, useEffect } from 'react'

export default function ContributionForm({ travelers, contribution, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    traveler_id: contribution?.traveler_id ?? (travelers[0]?.id ?? ''),
    amount: contribution?.amount ?? '',
    date: contribution?.date ?? today,
    note: contribution?.note ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!form.traveler_id && travelers.length > 0) {
      setForm(f => ({ ...f, traveler_id: travelers[0].id }))
    }
  }, [travelers])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.traveler_id || !form.amount || Number(form.amount) <= 0) {
      setError('Selecciona un viajero y un monto válido.')
      return
    }
    setLoading(true)
    const result = await onSave({
      ...form,
      amount: Number(form.amount),
    })
    if (result?.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Viajero *</label>
          <select className="input" value={form.traveler_id} onChange={e => set('traveler_id', e.target.value)} required>
            {travelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Monto *</label>
          <input className="input" type="number" min="1" step="any" placeholder="Ej: 200000" value={form.amount} onChange={e => set('amount', e.target.value)} required />
        </div>
        <div>
          <label className="label">Fecha</label>
          <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="label">Nota (opcional)</label>
          <input className="input" placeholder="Ej: Pago cuota 1" value={form.note} onChange={e => set('note', e.target.value)} />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : contribution ? 'Actualizar abono' : 'Registrar abono'}
        </button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  )
}