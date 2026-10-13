import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { api, type CompanyDetail as CompanyDetailData } from '../api'

const EMOTION_COLORS: Record<string, string> = {
  anger: '#e57373',
  sadness: '#64b5f6',
  fear: '#ba68c8',
  disgust: '#81c784',
}

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>()
  const [data, setData] = useState<CompanyDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!companyId) return
    setData(null)
    api
      .companyDetail(companyId)
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [companyId])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!data) return <div className="loading">Loading...</div>

  const { company, peaks, articles } = data

  const chartData = peaks.map((p) => ({
    x: new Date(p.start_date).getTime(),
    y: p.max_z,
    emotion: p.dominant_emotion,
    peak_id: p.peak_id,
    category: p.primary_category,
    car: p.event_study?.car ?? null,
  }))

  return (
    <div>
      <Link className="back-link" to="/companies">
        ← Back to companies
      </Link>
      <h1>
        {company.company_name} <span className="badge">{company.ticker}</span>
      </h1>
      <p>
        {company.sector} · {company.location} · {company.n_articles} articles ·{' '}
        {company.n_peaks} emotion peaks
      </p>

      <div className="card">
        <h2>Emotion peak timeline</h2>
        <p>Each point is a detected reputational-crisis episode. Height = max emotion z-score. Click a point for details.</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis
              dataKey="x"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(v) => new Date(v).getFullYear().toString()}
              stroke="#9aa5b8"
            />
            <YAxis dataKey="y" type="number" name="max z-score" stroke="#9aa5b8" />
            <ZAxis range={[60, 60]} />
            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload.length) return null
                const p = payload[0].payload
                return (
                  <div
                    style={{
                      background: '#1a1f2b',
                      border: '1px solid #2a3142',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                    }}
                  >
                    <div>{new Date(p.x).toLocaleDateString()}</div>
                    <div>
                      {p.emotion} peak, z={p.y.toFixed(2)}
                    </div>
                    <div>category: {p.category}</div>
                    {p.car !== null && <div>CAR: {(p.car * 100).toFixed(2)}%</div>}
                  </div>
                )
              }}
            />
            <Scatter
              data={chartData}
              fill="#8ab4ff"
              cursor="pointer"
              onClick={(point: { payload?: { peak_id?: string } }) => {
                if (point.payload?.peak_id) navigate(`/peaks/${point.payload.peak_id}`)
              }}
              shape={(props: { cx?: number; cy?: number; payload?: { emotion: string } }) => {
                const { cx, cy, payload } = props
                const color = EMOTION_COLORS[payload?.emotion ?? ''] ?? '#8ab4ff'
                return <circle cx={cx} cy={cy} r={5} fill={color} />
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Emotion peaks ({peaks.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Start</th>
              <th>Duration</th>
              <th>Dominant emotion</th>
              <th>Category</th>
              <th>Max z</th>
              <th>CAR</th>
            </tr>
          </thead>
          <tbody>
            {peaks.map((p) => (
              <tr key={p.peak_id} className="clickable" onClick={() => navigate(`/peaks/${p.peak_id}`)}>
                <td>{new Date(p.start_date).toLocaleDateString()}</td>
                <td>{p.duration_days}d</td>
                <td>{p.dominant_emotion}</td>
                <td>{p.primary_category}</td>
                <td>{p.max_z.toFixed(2)}</td>
                <td>{p.event_study ? `${(p.event_study.car * 100).toFixed(2)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Matched articles ({articles.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Predicted category</th>
            </tr>
          </thead>
          <tbody>
            {articles.slice(0, 100).map((a) => (
              <tr key={a.article_id}>
                <td>{new Date(a.published_date).toLocaleDateString()}</td>
                <td>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.title}
                  </a>
                </td>
                <td>{a.predicted_category ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length > 100 && <p>Showing first 100 of {articles.length} articles.</p>}
      </div>
    </div>
  )
}
