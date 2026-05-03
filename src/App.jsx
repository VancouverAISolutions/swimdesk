import { useState, useMemo } from 'react'

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CLUBS = [
  { id: 'nsc', name: 'Northshore Swim Club' },
  { id: 'ra', name: 'Riverside Aquatics' },
  { id: 'bm', name: 'Bayview Masters' },
]

const COACHES = [
  { id: 'sk', name: 'Sarah K.', clubId: 'nsc' },
  { id: 'tr', name: 'Tom R.', clubId: 'ra' },
  { id: 'pm', name: 'Priya M.', clubId: 'bm' },
]

const SQUADS = [
  { id: 'bronze', name: 'Bronze', color: 'amber' },
  { id: 'silver', name: 'Silver', color: 'gray' },
  { id: 'gold', name: 'Gold', color: 'yellow' },
  { id: 'elite', name: 'Elite', color: 'blue' },
]

const AGE_GROUPS = ['8U', '10U', '12U', '14U', 'Senior']

const EVENTS = [
  '50m Free', '100m Free', '200m Free',
  '50m Back', '100m Back', '200m Back',
  '50m Breast', '100m Breast', '200m Breast',
  '50m Fly', '100m Fly',
  '200m IM', '400m IM',
]

const SWIMMERS_SEED = [
  { id: 1, name: 'Alex Chen',       ageGroup: '12U',    squadId: 'gold',   coachId: 'sk', clubId: 'nsc' },
  { id: 2, name: 'Maya Rodriguez',  ageGroup: '14U',    squadId: 'elite',  coachId: 'sk', clubId: 'nsc' },
  { id: 3, name: 'Liam Patel',      ageGroup: '10U',    squadId: 'silver', coachId: 'tr', clubId: 'ra'  },
  { id: 4, name: 'Sophie Nguyen',   ageGroup: 'Senior', squadId: 'elite',  coachId: 'pm', clubId: 'bm'  },
  { id: 5, name: 'Jake Williams',   ageGroup: '14U',    squadId: 'gold',   coachId: 'tr', clubId: 'ra'  },
  { id: 6, name: 'Aisha Thompson',  ageGroup: '8U',     squadId: 'bronze', coachId: 'pm', clubId: 'bm'  },
  { id: 7, name: 'Connor Davis',    ageGroup: 'Senior', squadId: 'elite',  coachId: 'sk', clubId: 'nsc' },
  { id: 8, name: 'Zoe Martinez',    ageGroup: '12U',    squadId: 'silver', coachId: 'tr', clubId: 'ra'  },
]

const MEETS_SEED = [
  { id: 1, name: 'Winter Invitational',  date: '2026-01-15', clubId: 'nsc' },
  { id: 2, name: 'Spring Championships', date: '2026-02-20', clubId: 'ra'  },
  { id: 3, name: 'Bay Area Classic',     date: '2026-03-05', clubId: 'bm'  },
  { id: 4, name: 'Junior Regionals',     date: '2026-03-22', clubId: 'nsc' },
  { id: 5, name: 'Masters Open',         date: '2026-04-10', clubId: 'bm'  },
  { id: 6, name: 'Summer Kick-Off',      date: '2026-04-28', clubId: 'ra'  },
  { id: 7, name: 'State Age Championships', date: '2026-06-14', clubId: 'nsc' },
  { id: 8, name: 'Pacific Coast Invite', date: '2026-07-19', clubId: 'bm'  },
]

// Parse "m:ss.cs" → milliseconds
function parseTime(str) {
  if (!str) return Infinity
  const [minPart, rest] = str.split(':')
  if (!rest) return Infinity
  const [secPart, csPart = '00'] = rest.split('.')
  return (
    parseInt(minPart, 10) * 60000 +
    parseInt(secPart, 10) * 1000 +
    parseInt(csPart.padEnd(2, '0').slice(0, 2), 10) * 10
  )
}

const TIMES_SEED = [
  // Alex Chen (id:1) – freestyle & back
  { id:  1, swimmerId: 1, event: '100m Free',   timeStr: '1:08.45', meetId: 1, date: '2026-01-15' },
  { id:  2, swimmerId: 1, event: '100m Free',   timeStr: '1:07.20', meetId: 4, date: '2026-03-22' },
  { id:  3, swimmerId: 1, event: '50m Free',    timeStr: '0:29.80', meetId: 1, date: '2026-01-15' },
  { id:  4, swimmerId: 1, event: '50m Free',    timeStr: '0:29.10', meetId: 6, date: '2026-04-28' },
  { id:  5, swimmerId: 1, event: '100m Back',   timeStr: '1:18.30', meetId: 2, date: '2026-02-20' },
  { id:  6, swimmerId: 1, event: '100m Back',   timeStr: '1:16.80', meetId: 6, date: '2026-04-28' },
  // Maya Rodriguez (id:2)
  { id:  7, swimmerId: 2, event: '100m Back',   timeStr: '1:12.30', meetId: 1, date: '2026-01-15' },
  { id:  8, swimmerId: 2, event: '100m Back',   timeStr: '1:10.85', meetId: 4, date: '2026-03-22' },
  { id:  9, swimmerId: 2, event: '200m IM',     timeStr: '2:28.40', meetId: 2, date: '2026-02-20' },
  { id: 10, swimmerId: 2, event: '200m IM',     timeStr: '2:25.10', meetId: 6, date: '2026-04-28' },
  { id: 11, swimmerId: 2, event: '50m Back',    timeStr: '0:32.60', meetId: 3, date: '2026-03-05' },
  // Liam Patel (id:3)
  { id: 12, swimmerId: 3, event: '50m Free',    timeStr: '0:33.20', meetId: 2, date: '2026-02-20' },
  { id: 13, swimmerId: 3, event: '50m Free',    timeStr: '0:32.50', meetId: 6, date: '2026-04-28' },
  { id: 14, swimmerId: 3, event: '50m Breast',  timeStr: '0:42.10', meetId: 3, date: '2026-03-05' },
  { id: 15, swimmerId: 3, event: '50m Breast',  timeStr: '0:41.30', meetId: 5, date: '2026-04-10' },
  // Sophie Nguyen (id:4)
  { id: 16, swimmerId: 4, event: '100m Free',   timeStr: '0:58.90', meetId: 3, date: '2026-03-05' },
  { id: 17, swimmerId: 4, event: '100m Free',   timeStr: '0:57.40', meetId: 5, date: '2026-04-10' },
  { id: 18, swimmerId: 4, event: '200m Free',   timeStr: '2:10.30', meetId: 5, date: '2026-04-10' },
  { id: 19, swimmerId: 4, event: '200m Free',   timeStr: '2:08.70', meetId: 6, date: '2026-04-28' },
  // Jake Williams (id:5)
  { id: 20, swimmerId: 5, event: '100m Fly',    timeStr: '1:05.20', meetId: 2, date: '2026-02-20' },
  { id: 21, swimmerId: 5, event: '100m Fly',    timeStr: '1:03.80', meetId: 6, date: '2026-04-28' },
  { id: 22, swimmerId: 5, event: '50m Fly',     timeStr: '0:28.90', meetId: 4, date: '2026-03-22' },
  { id: 23, swimmerId: 5, event: '50m Fly',     timeStr: '0:28.20', meetId: 6, date: '2026-04-28' },
  // Aisha Thompson (id:6)
  { id: 24, swimmerId: 6, event: '50m Free',    timeStr: '0:38.50', meetId: 3, date: '2026-03-05' },
  { id: 25, swimmerId: 6, event: '50m Free',    timeStr: '0:37.20', meetId: 5, date: '2026-04-10' },
  { id: 26, swimmerId: 6, event: '50m Breast',  timeStr: '0:49.80', meetId: 5, date: '2026-04-10' },
  // Connor Davis (id:7)
  { id: 27, swimmerId: 7, event: '100m Free',   timeStr: '0:52.30', meetId: 1, date: '2026-01-15' },
  { id: 28, swimmerId: 7, event: '100m Free',   timeStr: '0:51.10', meetId: 4, date: '2026-03-22' },
  { id: 29, swimmerId: 7, event: '200m Free',   timeStr: '1:58.40', meetId: 5, date: '2026-04-10' },
  { id: 30, swimmerId: 7, event: '200m Free',   timeStr: '1:56.80', meetId: 6, date: '2026-04-28' },
  // Zoe Martinez (id:8)
  { id: 31, swimmerId: 8, event: '100m Breast', timeStr: '1:22.60', meetId: 2, date: '2026-02-20' },
  { id: 32, swimmerId: 8, event: '100m Breast', timeStr: '1:20.90', meetId: 6, date: '2026-04-28' },
  { id: 33, swimmerId: 8, event: '50m Breast',  timeStr: '0:38.80', meetId: 3, date: '2026-03-05' },
  { id: 34, swimmerId: 8, event: '50m Breast',  timeStr: '0:37.95', meetId: 5, date: '2026-04-10' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPBMap(swimmerId, times) {
  const pbs = {}
  times
    .filter(t => t.swimmerId === swimmerId)
    .forEach(t => {
      if (!pbs[t.event] || parseTime(t.timeStr) < parseTime(pbs[t.event].timeStr)) {
        pbs[t.event] = t
      }
    })
  return pbs
}

function isPB(t, times) {
  const pbs = getPBMap(t.swimmerId, times)
  return pbs[t.event]?.id === t.id
}

function getTrend(swimmerId, times) {
  const byEvent = {}
  times
    .filter(t => t.swimmerId === swimmerId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(t => { (byEvent[t.event] = byEvent[t.event] || []).push(t) })
  let up = 0, down = 0
  Object.values(byEvent).forEach(arr => {
    if (arr.length < 2) return
    const diff = parseTime(arr.at(-1).timeStr) - parseTime(arr.at(-2).timeStr)
    if (diff < 0) up++
    else if (diff > 0) down++
  })
  return up > down ? 'up' : down > up ? 'down' : 'neutral'
}

// ─── Small UI atoms ───────────────────────────────────────────────────────────

const BADGE_CLS = {
  blue:   'bg-blue-100 text-blue-800',
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  amber:  'bg-amber-100 text-amber-800',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-800',
  red:    'bg-red-100 text-red-700',
}

function Badge({ children, color = 'blue', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_CLS[color] || BADGE_CLS.blue} ${className}`}>
      {children}
    </span>
  )
}

function TrendArrow({ dir }) {
  if (dir === 'up')   return <span className="text-green-500 font-bold text-base">▲</span>
  if (dir === 'down') return <span className="text-red-500 font-bold text-base">▼</span>
  return <span className="text-gray-300 font-bold text-base">—</span>
}

function Avatar({ name, size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Tab 1: Swimmers ──────────────────────────────────────────────────────────

function SwimmersTab({ swimmers, setSwimmers, times }) {
  const [expanded,  setExpanded]  = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterClub, setFilterClub] = useState('all')
  const [blank, setBlank] = useState({ name: '', ageGroup: '12U', squadId: 'bronze', coachId: 'sk', clubId: 'nsc' })

  const visible = filterClub === 'all' ? swimmers : swimmers.filter(s => s.clubId === filterClub)

  function addSwimmer() {
    if (!blank.name.trim()) return
    const id = Math.max(0, ...swimmers.map(s => s.id)) + 1
    setSwimmers(prev => [...prev, { ...blank, id }])
    setShowModal(false)
    setBlank({ name: '', ageGroup: '12U', squadId: 'bronze', coachId: 'sk', clubId: 'nsc' })
  }

  const SQUAD_BADGE = { bronze: 'amber', silver: 'gray', gold: 'yellow', elite: 'blue' }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Swimmers</h2>
          <select
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filterClub} onChange={e => setFilterClub(e.target.value)}
          >
            <option value="all">All Clubs</option>
            {CLUBS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Swimmer
        </button>
      </div>

      {/* Swimmer list */}
      <div className="space-y-2">
        {visible.map(sw => {
          const squad = SQUADS.find(s => s.id === sw.squadId)
          const coach = COACHES.find(c => c.id === sw.coachId)
          const club  = CLUBS.find(c => c.id === sw.clubId)
          const trend = getTrend(sw.id, times)
          const pbs   = getPBMap(sw.id, times)
          const recentTimes = [...times]
            .filter(t => t.swimmerId === sw.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6)
          const open = expanded === sw.id

          return (
            <div key={sw.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(open ? null : sw.id)}
              >
                <Avatar name={sw.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{sw.name}</div>
                  <div className="text-xs text-gray-400 truncate">{club?.name} · {coach?.name}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge color={SQUAD_BADGE[sw.squadId] || 'gray'}>{squad?.name}</Badge>
                  <span className="text-xs text-gray-400 hidden sm:inline">{sw.ageGroup}</span>
                  <TrendArrow dir={trend} />
                  <span className="text-gray-300 text-xs ml-1">{open ? '▲' : '▼'}</span>
                </div>
              </div>

              {open && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal Bests</p>
                      {Object.keys(pbs).length === 0
                        ? <p className="text-sm text-gray-400 italic">No times recorded yet</p>
                        : <div className="space-y-1.5">
                            {Object.entries(pbs).map(([ev, t]) => (
                              <div key={ev} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{ev}</span>
                                <span className="font-mono font-bold text-blue-700">{t.timeStr}</span>
                              </div>
                            ))}
                          </div>
                      }
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Times</p>
                      {recentTimes.length === 0
                        ? <p className="text-sm text-gray-400 italic">No times recorded yet</p>
                        : <div className="space-y-1.5">
                            {recentTimes.map(t => (
                              <div key={t.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 truncate mr-2">{t.event}</span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="font-mono">{t.timeStr}</span>
                                  {isPB(t, times) && <Badge color="green">PB</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {visible.length === 0 && (
          <div className="text-center py-16 text-gray-400">No swimmers found for this club.</div>
        )}
      </div>

      {/* Add Swimmer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-bold text-gray-900">Add New Swimmer</h3>
              <p className="text-sm text-gray-400 mt-0.5">Fill in the swimmer's details below</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" placeholder="e.g. Jordan Smith" autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={blank.name} onChange={e => setBlank(b => ({ ...b, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={blank.ageGroup} onChange={e => setBlank(b => ({ ...b, ageGroup: e.target.value }))}>
                    {AGE_GROUPS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Squad</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={blank.squadId} onChange={e => setBlank(b => ({ ...b, squadId: e.target.value }))}>
                    {SQUADS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={blank.coachId} onChange={e => setBlank(b => ({ ...b, coachId: e.target.value }))}>
                    {COACHES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={blank.clubId} onChange={e => setBlank(b => ({ ...b, clubId: e.target.value }))}>
                    {CLUBS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={addSwimmer} disabled={!blank.name.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-40">
                Add Swimmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Times & Results ───────────────────────────────────────────────────

function TimesTab({ swimmers, times, setTimes }) {
  const [showForm, setShowForm] = useState(false)
  const [filterSwimmer, setFilterSwimmer] = useState('all')
  const [filterEvent,   setFilterEvent]   = useState('all')
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    swimmerId: swimmers[0]?.id ?? 1,
    event:     EVENTS[0],
    timeStr:   '',
    meetId:    MEETS_SEED[0]?.id ?? 1,
    date:      today,
  })

  const filtered = useMemo(() => {
    return [...times]
      .filter(t => filterSwimmer === 'all' || t.swimmerId === +filterSwimmer)
      .filter(t => filterEvent   === 'all' || t.event     === filterEvent)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [times, filterSwimmer, filterEvent])

  function logTime() {
    const id = Math.max(0, ...times.map(t => t.id)) + 1
    setTimes(prev => [...prev, { ...form, id, swimmerId: +form.swimmerId, meetId: +form.meetId }])
    setShowForm(false)
    setForm(f => ({ ...f, timeStr: '' }))
  }

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Times &amp; Results</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ Log Time'}
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">New Time Entry</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Swimmer</label>
              <select className={inputCls} value={form.swimmerId} onChange={e => setForm(f => ({ ...f, swimmerId: +e.target.value }))}>
                {swimmers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Event</label>
              <select className={inputCls} value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                {EVENTS.map(ev => <option key={ev}>{ev}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Time (m:ss.cs)</label>
              <input type="text" placeholder="0:58.34" className={`${inputCls} font-mono`}
                value={form.timeStr} onChange={e => setForm(f => ({ ...f, timeStr: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Meet</label>
              <select className={inputCls} value={form.meetId} onChange={e => setForm(f => ({ ...f, meetId: +e.target.value }))}>
                {MEETS_SEED.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <button onClick={logTime} disabled={!form.timeStr.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-40">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterSwimmer} onChange={e => setFilterSwimmer(e.target.value)}>
          <option value="all">All Swimmers</option>
          {swimmers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
          <option value="all">All Events</option>
          {EVENTS.map(ev => <option key={ev}>{ev}</option>)}
        </select>
        <span className="text-xs text-gray-400 self-center">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Swimmer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Event</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Meet</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => {
                const sw   = swimmers.find(s => s.id === t.swimmerId)
                const meet = MEETS_SEED.find(m => m.id === t.meetId)
                const pb   = isPB(t, times)
                return (
                  <tr key={t.id} className={pb ? 'bg-green-50' : 'hover:bg-gray-50/50 transition-colors'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{sw?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.event}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-gray-900">{t.timeStr}</span>
                        {pb && <Badge color="green">PB</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{meet?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{t.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No times match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: Squad Board ───────────────────────────────────────────────────────

const SQUAD_GRADIENT = {
  bronze: 'from-amber-50  to-amber-100  border-amber-200',
  silver: 'from-slate-50  to-slate-100  border-slate-200',
  gold:   'from-yellow-50 to-yellow-100 border-yellow-300',
  elite:  'from-blue-50   to-blue-100   border-blue-200',
}
const SQUAD_HEADER = {
  bronze: 'text-amber-700',
  silver: 'text-slate-600',
  gold:   'text-yellow-700',
  elite:  'text-blue-700',
}

function SquadBoardTab({ swimmers, setSwimmers, times }) {
  function improvementCount(squadId) {
    let n = 0
    swimmers.filter(s => s.squadId === squadId).forEach(sw => {
      const byEvent = {}
      times
        .filter(t => t.swimmerId === sw.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(t => { (byEvent[t.event] = byEvent[t.event] || []).push(t) })
      Object.values(byEvent).forEach(arr => {
        if (arr.length >= 2 && parseTime(arr.at(-1).timeStr) < parseTime(arr[0].timeStr)) n++
      })
    })
    return n
  }

  function moveSwimmer(swimmerId, newSquadId) {
    setSwimmers(prev => prev.map(s => s.id === swimmerId ? { ...s, squadId: newSquadId } : s))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Squad Board</h2>
        <p className="text-sm text-gray-400">Move swimmers between squads using the dropdown</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SQUADS.map(squad => {
          const members = swimmers.filter(s => s.squadId === squad.id)
          const improvements = improvementCount(squad.id)
          const coachIds = [...new Set(members.map(s => s.coachId))]
          const coachNames = coachIds.map(id => COACHES.find(c => c.id === id)?.name).filter(Boolean).join(', ')

          return (
            <div key={squad.id} className={`rounded-2xl border bg-gradient-to-br p-5 ${SQUAD_GRADIENT[squad.id]}`}>
              {/* Squad header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className={`text-lg font-bold ${SQUAD_HEADER[squad.id]}`}>{squad.name} Squad</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{coachNames ? `Coach: ${coachNames}` : 'No coach'}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-800 leading-none">{members.length}</div>
                  <div className="text-xs text-gray-400">swimmers</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium mb-4">
                <span>↑</span>
                <span>{improvements} event improvement{improvements !== 1 ? 's' : ''} logged</span>
              </div>

              {/* Swimmer rows */}
              <div className="space-y-2">
                {members.map(sw => {
                  const trend = getTrend(sw.id, times)
                  return (
                    <div key={sw.id} className="flex items-center gap-2 bg-white/70 backdrop-blur rounded-lg px-3 py-2">
                      <Avatar name={sw.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate block">{sw.name}</span>
                        <span className="text-xs text-gray-400">{sw.ageGroup}</span>
                      </div>
                      <TrendArrow dir={trend} />
                      <select
                        className="text-xs border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={sw.squadId}
                        onChange={e => moveSwimmer(sw.id, e.target.value)}
                      >
                        {SQUADS.map(sq => <option key={sq.id} value={sq.id}>{sq.name}</option>)}
                      </select>
                    </div>
                  )
                })}
                {members.length === 0 && (
                  <p className="text-center text-sm text-gray-400 italic py-3">No swimmers assigned</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tab 4: Dashboard ─────────────────────────────────────────────────────────

function DashboardTab({ swimmers, times }) {
  const [selectedClub, setSelectedClub] = useState('all')

  const clubSwimmers = selectedClub === 'all' ? swimmers : swimmers.filter(s => s.clubId === selectedClub)
  const clubMeets    = selectedClub === 'all' ? MEETS_SEED : MEETS_SEED.filter(m => m.clubId === selectedClub)
  const clubTimes    = times.filter(t => clubSwimmers.some(s => s.id === t.swimmerId))

  const topPerformers = useMemo(() => {
    return clubSwimmers
      .map(sw => ({
        sw,
        pbs: times.filter(t => t.swimmerId === sw.id && isPB(t, times)).length,
      }))
      .sort((a, b) => b.pbs - a.pbs)
      .slice(0, 5)
  }, [clubSwimmers, times])

  const upcomingMeets = [...MEETS_SEED]
    .filter(m => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  const stats = [
    { label: 'Swimmers',      value: clubSwimmers.length, icon: '🏊', color: 'bg-blue-50   text-blue-700'   },
    { label: 'Squads',        value: SQUADS.length,       icon: '🏅', color: 'bg-purple-50 text-purple-700' },
    { label: 'Meets Logged',  value: clubMeets.length,    icon: '📋', color: 'bg-green-50  text-green-700'  },
    { label: 'Times Logged',  value: clubTimes.length,    icon: '⏱️', color: 'bg-amber-50  text-amber-700'  },
  ]

  const rankColors = ['bg-yellow-100 text-yellow-700', 'bg-slate-100 text-slate-600', 'bg-amber-100 text-amber-700']

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Club view:</span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedClub} onChange={e => setSelectedClub(e.target.value)}
          >
            <option value="all">All Clubs</option>
            {CLUBS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <div className="text-3xl font-extrabold text-gray-900 leading-none">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top performers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">🏆 Top Performers (All-time PBs)</h3>
          {topPerformers.length === 0
            ? <p className="text-sm text-gray-400 italic">No data yet</p>
            : <div className="space-y-3">
                {topPerformers.map(({ sw, pbs }, i) => (
                  <div key={sw.id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankColors[i] || 'bg-blue-50 text-blue-600'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800">{sw.name}</div>
                      <div className="text-xs text-gray-400">{sw.ageGroup} · {CLUBS.find(c => c.id === sw.clubId)?.name}</div>
                    </div>
                    <Badge color="green">{pbs} PB{pbs !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Upcoming meets */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">📅 Upcoming Meets</h3>
          {upcomingMeets.length === 0
            ? <p className="text-sm text-gray-400 italic">No upcoming meets scheduled</p>
            : <div className="space-y-3">
                {upcomingMeets.map(m => {
                  const club = CLUBS.find(c => c.id === m.clubId)
                  const daysUntil = Math.ceil((new Date(m.date) - new Date()) / 86400000)
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{m.name}</div>
                        <div className="text-xs text-gray-400">{club?.name} · {m.date}</div>
                      </div>
                      <Badge color={daysUntil <= 14 ? 'green' : daysUntil <= 45 ? 'yellow' : 'gray'}>
                        {daysUntil}d
                      </Badge>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>

      {/* Multi-club banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center gap-4">
        <span className="text-3xl">🌐</span>
        <div className="flex-1">
          <div className="font-bold text-lg">Multi-Club SaaS Ready</div>
          <div className="text-blue-100 text-sm mt-0.5">
            Centralising performance data across {CLUBS.length} clubs — one platform, unified analytics, per-club subscriptions.
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-3xl font-extrabold">{CLUBS.length}</div>
          <div className="text-blue-200 text-xs">clubs active</div>
        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Dashboard',       icon: '📊' },
  { id: 'swimmers',  label: 'Swimmers',         icon: '🏊' },
  { id: 'times',     label: 'Times & Results',  icon: '⏱️' },
  { id: 'squads',    label: 'Squad Board',      icon: '🏅' },
]

export default function SwimDesk() {
  const [tab,       setTab]      = useState('dashboard')
  const [swimmers, setSwimmers] = useState(SWIMMERS_SEED)
  const [times,    setTimes]    = useState(TIMES_SEED)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-sm">🏊</div>
            <div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight">SwimDesk</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2">Swim Academy Performance Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-gray-400">Multi-Club SaaS</span>
            <Badge color="blue">Beta</Badge>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-[57px] z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'dashboard' && <DashboardTab swimmers={swimmers} times={times} />}
        {tab === 'lwimmers'  && <SwimmersTab  swimmers={swimmers} setSwimmers={setSwimmers} times={times} />}
              {tab === 'times'     && <TimesTab     swimmers={swimmers} times={times} setTimes={setTimes} />}
        {tab === 'squads'    && <SquadBoardTab swimmers={swimmers} setSwimmers={setSwimmers} times={times} />}
      </main>
    </div>
  )
}
