import { useState, useEffect } from 'react'

// Fetches /projects.json on mount
// Returns { projects, loading, error }
export default function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch('/projects.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setProjects(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setProjects([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { projects, loading, error }
}
