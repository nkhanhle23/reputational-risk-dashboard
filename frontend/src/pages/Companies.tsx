import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Company } from '../api'

export default function Companies() {
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.companies().then(setCompanies).catch((e) => setError(String(e)))
  }, [])

  const filtered = useMemo(() => {
    if (!companies) return []
    const q = query.trim().toLowerCase()
    if (!q) return companies
    return companies.filter(
      (c) => c.ticker.toLowerCase().includes(q) || c.company_name.toLowerCase().includes(q),
    )
  }, [companies, query])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!companies) return <div className="loading">Loading...</div>

  return (
    <div>
      <h1>Companies</h1>
      <input
        className="search-input"
        placeholder="Search by ticker or company name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Company</th>
              <th>Sector</th>
              <th>Location</th>
              <th>Articles</th>
              <th>Emotion peaks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.company_id}
                className="clickable"
                onClick={() => navigate(`/companies/${c.company_id}`)}
              >
                <td>{c.ticker}</td>
                <td>{c.company_name}</td>
                <td>{c.sector}</td>
                <td>{c.location}</td>
                <td>{c.n_articles}</td>
                <td>{c.n_peaks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
