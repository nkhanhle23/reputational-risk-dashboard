import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type CrosstabRow } from '../api'

export default function CrossTab() {
  const [rows, setRows] = useState<CrosstabRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.crosstab().then(setRows).catch((e) => setError(String(e)))
  }, [])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!rows) return <div className="loading">Loading...</div>

  const sorted = [...rows].sort((a, b) => a['Mean CAR'] - b['Mean CAR'])

  return (
    <div>
      <h1>Category × Emotion cross-tabulation</h1>
      <p>
        Mean cumulative abnormal return (CAR) by event category and dominant emotion, used for the
        SCCT (Situational Crisis Communication Theory) attribution test. Significance markers:
        * p&lt;0.10, ** p&lt;0.05, *** p&lt;0.01 (raw and FDR-corrected Wilcoxon test).
      </p>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Emotion</th>
              <th>n</th>
              <th>Mean CAR</th>
              <th>% Negative</th>
              <th>Wilcoxon</th>
              <th>t-test</th>
              <th>FDR sig</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={i}
                className="clickable"
                onClick={() =>
                  navigate(
                    `/crosstab/drilldown?category=${encodeURIComponent(row.Category)}&emotion=${encodeURIComponent(row.Emotion)}`,
                  )
                }
              >
                <td>{row.Category}</td>
                <td>{row.Emotion}</td>
                <td>{row.n}</td>
                <td style={{ color: row['Mean CAR'] < 0 ? '#e57373' : '#81c784' }}>
                  {row['Mean CAR %']}
                </td>
                <td>{row['% Negative']}</td>
                <td>{row.Wilcoxon}</td>
                <td>{row['t-test']}</td>
                <td>{row['FDR sig'] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
