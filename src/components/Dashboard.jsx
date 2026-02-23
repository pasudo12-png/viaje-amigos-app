import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function ProgressBar({ percent }) {
  return (
    <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full progress-bar-fill"
        style={{
          width: `${Math.min(percent, 100)}%`,
          background: percent >= 100
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : 'linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)',
          boxShadow: '0 0 12px rgba(14, 165, 233, 0.4)',
        }}
      />
    </div>
  )
}

function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export default function Dashboard({ trip, travelers, contributions }) {
  if (!trip) return null

  const totalSaved = contributions.reduce((s, c) => s + Number(c.amount), 0)
  const percent = trip.target_amount ? (totalSaved / trip.target_amount) * 100 : 0

  const travelerTotals = travelers.map(t => {
    const total = contributions
      .filter(c => c.traveler_id === t.id)
      .reduce((s, c) => s + Number(c.amount), 0)
    return { ...t, total }
  }).sort((a, b) => b.total - a.total)

  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl text-zinc-100 mb-1">{trip.name}</h2>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <span>📍</span>
              <span>{trip.destination}</span>
              {trip.trip_date && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>🗓 {format(new Date(trip.trip_date), "d MMM yyyy", { locale: es })}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 rounded-full border border-zinc-700/40">
            <span className="text-xs text-zinc-500">Moneda</span>
            <span className="text-sm font-medium text-zinc-200">{trip.currency}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-800/40 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Total ahorrado</p>
            <p className="font-display text-xl text-ocean-400">{formatCurrency(totalSaved, trip.currency)}</p>
          </div>
          {trip.target_amount > 0 && (
            <div className="bg-zinc-800/40 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Meta</p>
              <p className="font-display text-xl text-zinc-200">{formatCurrency(trip.target_amount, trip.currency)}</p>
            </div>
          )}
          {trip.target_amount > 0 && (
            <div className="bg-zinc-800/40 rounded-xl p-4 col-span-2 md:col-span-1">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Progreso</p>
              <p className={`font-display text-xl ${percent >= 100 ? 'text-green-400' : 'text-sand-400'}`}>
                {percent.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {trip.target_amount > 0 && (
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>{formatCurrency(totalSaved, trip.currency)} ahorrados</span>
              <span>Meta: {formatCurrency(trip.target_amount, trip.currency)}</span>
            </div>
            <ProgressBar percent={percent} />
            {percent >= 100 && (
              <p className="text-center text-green-400 text-sm mt-3 animate-fade-in">
                🎉 ¡Meta alcanzada! ¡A empacar las maletas!
              </p>
            )}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/60">
          <h3 className="font-medium text-zinc-200">Participantes</h3>
        </div>
        {travelerTotals.length === 0 ? (
          <p className="text-zinc-500 text-sm px-6 py-8 text-center">Aún no hay viajeros registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/40">
                  <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">Viajero</th>
                  <th className="text-right px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">Total aportado</th>
                  <th className="text-right px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">% Part.</th>
                </tr>
              </thead>
              <tbody>
                {travelerTotals.map((t) => {
                  const participation = totalSaved > 0 ? (t.total / totalSaved) * 100 : 0
                  return (
                    <tr key={t.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-zinc-200">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ocean-500/30 to-sand-500/20 border border-zinc-700/50 flex items-center justify-center text-xs font-medium text-zinc-300">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          {t.name}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-medium text-ocean-400">
                        {formatCurrency(t.total, trip.currency)}
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm text-zinc-400">
                        {participation.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/60">
          <h3 className="font-medium text-zinc-200">Historial de abonos</h3>
        </div>
        {sortedContributions.length === 0 ? (
          <p className="text-zinc-500 text-sm px-6 py-8 text-center">Aún no hay abonos registrados.</p>
        ) : (
          <div className="divide-y divide-zinc-800/40">
            {sortedContributions.map(c => {
              const traveler = travelers.find(t => t.id === c.traveler_id)
              return (
                <div key={c.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-xs text-zinc-300">
                      {traveler?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">{traveler?.name ?? 'Desconocido'}</p>
                      {c.note && <p className="text-xs text-zinc-500">{c.note}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ocean-400">
                      +{formatCurrency(Number(c.amount), trip.currency)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(c.date + 'T12:00:00'), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { formatCurrency }