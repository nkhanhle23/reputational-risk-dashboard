import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api, type Overview as OverviewData } from '../api'

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.overview().then(setData).catch((e) => setError(String(e)))
  }, [])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!data) return <div className="loading">Loading...</div>

  const { summary } = data
  const categoryData = Object.entries(summary.full_dataset.category_distribution).map(
    ([category, count]) => ({ category, count }),
  )

  return (
    <div>
      <h1>Overview</h1>
      <p>
        Reputational-risk event classification and emotion/financial-impact pipeline over NYT
        articles (2008–2024), mapped against the MSCI World company universe.
      </p>

      <div className="card">
        <h2>Pipeline scale</h2>
        <div className="grid">
          <div className="stat">
            <span className="value">{data.n_articles.toLocaleString()}</span>
            <span className="label">Articles in corpus</span>
          </div>
          <div className="stat">
            <span className="value">{data.n_companies.toLocaleString()}</span>
            <span className="label">Companies matched</span>
          </div>
          <div className="stat">
            <span className="value">{data.n_peaks.toLocaleString()}</span>
            <span className="label">Emotion peaks detected</span>
          </div>
          <div className="stat">
            <span className="value">{data.n_event_studies.toLocaleString()}</span>
            <span className="label">Peaks with event-study data</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Category distribution</h2>
        <p>Click a bar to see the articles in that category.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis dataKey="category" stroke="#9aa5b8" />
            <YAxis stroke="#9aa5b8" />
            <Tooltip contentStyle={{ background: '#1a1f2b', border: '1px solid #2a3142' }} />
            <Bar
              dataKey="count"
              fill="#8ab4ff"
              cursor="pointer"
              onClick={(entry: { payload?: { category: string } }) => {
                if (entry.payload) {
                  navigate(`/articles?category=${encodeURIComponent(entry.payload.category)}`)
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
        <p>
          {summary.full_dataset.total_articles.toLocaleString()} articles classified (
          {summary.full_dataset.no_event_filtered_pct.toFixed(1)}% filtered as "No Event"),{' '}
          {summary.full_dataset.ambiguous_percentage.toFixed(1)}% flagged ambiguous.
        </p>
      </div>

      <div className="card">
        <h2>Methodology</h2>
        <p>{summary.methodology.description}</p>
        <table>
          <tbody>
            {Object.entries(summary.parameters).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Validation metrics</h2>
        <p>
          Measured on a {summary.validation_subset.total_articles}-article ground-truth subset.
          Note: raw accuracy is low by design — the classifier favors recall via a confidence
          threshold rather than precision (see methodology above).
        </p>
        <table>
          <tbody>
            {Object.entries(summary.validation_subset)
              .filter(([key]) => key !== 'total_articles')
              .map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{(value as number).toFixed(3)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
