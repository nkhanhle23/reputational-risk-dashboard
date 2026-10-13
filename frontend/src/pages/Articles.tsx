import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, type ArticleListResponse } from '../api'

const PAGE_SIZE = 50

export default function Articles() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<ArticleListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPage(0)
  }, [category])

  useEffect(() => {
    setData(null)
    api
      .articles(category, PAGE_SIZE, page * PAGE_SIZE)
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [category, page])

  if (error) return <div className="error">Failed to load: {error}</div>
  if (!data) return <div className="loading">Loading...</div>

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  return (
    <div>
      <Link className="back-link" to="/">
        ← Back to overview
      </Link>
      <h1>Articles{category ? `: ${category}` : ''}</h1>
      <p>
        {data.total.toLocaleString()} article{data.total === 1 ? '' : 's'}
        {category ? ` classified as "${category}"` : ' in the corpus'}.
      </p>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Predicted category</th>
              <th>Ambiguous</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((a) => (
              <tr key={a.article_id}>
                <td>{new Date(a.published_date).toLocaleDateString()}</td>
                <td>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.title}
                  </a>
                </td>
                <td>{a.predicted_category ?? '—'}</td>
                <td>{a.is_ambiguous ? 'yes' : 'no'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button
            className="search-input"
            style={{ width: 'auto', margin: 0, cursor: page === 0 ? 'default' : 'pointer' }}
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ← Previous
          </button>
          <span className="label">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="search-input"
            style={{ width: 'auto', margin: 0, cursor: page + 1 >= totalPages ? 'default' : 'pointer' }}
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
