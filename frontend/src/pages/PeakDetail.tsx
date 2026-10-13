import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts'
import { api, type PeakDetail as PeakDetailData } from '../api'

const CATEGORY_COLORS: Record<string, string> = {
  Communication: '#8ab4ff',
  Governance: '#e57373',
  'IT/Data': '#81c784',
  Legal: '#ffb74d',
  Personnel: '#ba68c8',
  Processes: '#64b5f6',
  Products: '#f06292',
}

export default function PeakDetail() {
  const { peakId } = useParams<{ peakId: string }>()
  const [data, setData] = useState<PeakDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!peakId) return
    setData(null)
    api
      .peakDetail(peakId)
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [peakId])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!data) return <div className="loading">Loading...</div>

  const evolutionData = data.category_evolution.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString(),
  }))

  const arData = data.event_study
    ? [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        day: `Day ${day}`,
        ar: data.event_study![`ar_day_${day}` as keyof typeof data.event_study] as number,
      }))
    : []

  return (
    <div>
      {data.company_id ? (
        <Link className="back-link" to={`/companies/${data.company_id}`}>
          ← Back to {data.company_name}
        </Link>
      ) : (
        <Link className="back-link" to="/companies">
          ← Back to companies
        </Link>
      )}
      <h1>
        {data.company_name} <span className="badge">{data.ticker}</span>
      </h1>
      <p>
        {new Date(data.start_date).toLocaleDateString()} – {new Date(data.end_date).toLocaleDateString()} ·{' '}
        {data.duration_days} day{data.duration_days === 1 ? '' : 's'} · dominant emotion:{' '}
        <strong>{data.dominant_emotion}</strong> · primary category: <strong>{data.primary_category}</strong> ·
        max z-score: {data.max_z.toFixed(2)}
      </p>

      <div className="card">
        <h2>Category evolution</h2>
        <p>Per-category classification score over the course of this emotion peak.</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis dataKey="date" stroke="#9aa5b8" />
            <YAxis stroke="#9aa5b8" />
            <Tooltip contentStyle={{ background: '#1a1f2b', border: '1px solid #2a3142' }} />
            <Legend />
            {Object.keys(CATEGORY_COLORS).map((category) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={CATEGORY_COLORS[category]}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.event_study && (
        <div className="card">
          <h2>Event study</h2>
          <div className="grid">
            <div className="stat">
              <span className="value">{(data.event_study.car * 100).toFixed(2)}%</span>
              <span className="label">CAR (cumulative abnormal return)</span>
            </div>
            <div className="stat">
              <span className="value">{data.event_study.scar.toFixed(2)}</span>
              <span className="label">SCAR (standardized)</span>
            </div>
            <div className="stat">
              <span className="value">{data.event_study.alpha.toFixed(4)}</span>
              <span className="label">Alpha</span>
            </div>
            <div className="stat">
              <span className="value">{data.event_study.beta.toFixed(3)}</span>
              <span className="label">Beta</span>
            </div>
          </div>
          <h3>Daily abnormal return</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={arData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
              <XAxis dataKey="day" stroke="#9aa5b8" />
              <YAxis stroke="#9aa5b8" tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <Tooltip
                contentStyle={{ background: '#1a1f2b', border: '1px solid #2a3142' }}
                formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`}
              />
              <Bar dataKey="ar">
                {arData.map((entry, i) => (
                  <Cell key={i} fill={entry.ar < 0 ? '#e57373' : '#81c784'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
