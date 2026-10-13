import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, type PeakSummary } from '../api'

export default function CrosstabDrilldown() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const emotion = searchParams.get('emotion') ?? ''
  const [peaks, setPeaks] = useState<PeakSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!category || !emotion) return
    setPeaks(null)
    api
      .crosstabDrilldown(category, emotion)
      .then(setPeaks)
      .catch((e) => setError(String(e)))
  }, [category, emotion])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!peaks) return <div className="loading">Loading...</div>

  return (
    <div>
      <Link className="back-link" to="/crosstab">
        ← Back to cross-tabulation
      </Link>
      <h1>
        {category} × {emotion}
      </h1>
      <p>
        {peaks.length} emotion peak{peaks.length === 1 ? '' : 's'} with this category and dominant
        emotion, each linking to its company and detail page.
      </p>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Company</th>
              <th>CAR</th>
            </tr>
          </thead>
          <tbody>
            {peaks.map((p) => (
              <tr key={p.peak_id} className="clickable" onClick={() => navigate(`/peaks/${p.peak_id}`)}>
                <td>{new Date(p.start_date).toLocaleDateString()}</td>
                <td>
                  {p.company_name} <span className="badge">{p.ticker}</span>
                </td>
                <td style={{ color: p.car < 0 ? '#e57373' : '#81c784' }}>{(p.car * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
