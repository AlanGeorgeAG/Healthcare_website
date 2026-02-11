import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8002'

function App() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('height')
  const [order, setOrder] = useState('asc')
  const [patientId, setPatientId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)

  const stats = useMemo(() => {
    if (!patients.length) {
      return { total: 0, avgBmi: 0, obese: 0 }
    }

    const obese = patients.filter((p) => p.verdict === 'Obese').length
    const avgBmi =
      patients.reduce((sum, p) => sum + Number(p.bmi || 0), 0) / patients.length

    return { total: patients.length, avgBmi, obese }
  }, [patients])

  async function fetchSortedPatients(field = sortBy, sortOrder = order) {
    setLoading(true)
    setError('')
    setSelectedPatient(null)

    try {
      const response = await fetch(
        `${API_BASE}/sort?sort_by=${field}&order=${sortOrder}`
      )
      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.detail || 'Failed to load patient data')
      }
      const data = await response.json()
      setPatients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOnePatient(event) {
    event.preventDefault()
    if (!patientId.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/patient/${patientId.trim()}`)
      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.detail || 'Patient not found')
      }
      const data = await response.json()
      setSelectedPatient({ id: patientId.trim().toUpperCase(), ...data })
    } catch (err) {
      setSelectedPatient(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSortedPatients()
  }, [])

  function onApplySort(event) {
    event.preventDefault()
    fetchSortedPatients(sortBy, order)
  }

  const displayedPatients = selectedPatient ? [selectedPatient] : patients

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Patient Monitoring Console</p>
        <h1>Health Records Dashboard</h1>
        <p className="subtitle">
          Review, sort, and inspect patient records from your FastAPI backend.
        </p>
      </header>

      <section className="stats">
        <article>
          <h3>Total Patients</h3>
          <p>{stats.total}</p>
        </article>
        <article>
          <h3>Average BMI</h3>
          <p>{stats.avgBmi.toFixed(2)}</p>
        </article>
        <article>
          <h3>Obese Cases</h3>
          <p>{stats.obese}</p>
        </article>
      </section>

      <section className="controls">
        <form onSubmit={onApplySort} className="panel">
          <h2>Sort Patients</h2>
          <div className="row">
            <label>
              Sort By
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="height">Height</option>
                <option value="weight">Weight</option>
                <option value="bmi">BMI</option>
              </select>
            </label>
            <label>
              Order
              <select value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
          <button type="submit">Apply Sort</button>
        </form>

        <form onSubmit={fetchOnePatient} className="panel">
          <h2>Find One Patient</h2>
          <div className="row">
            <label className="full">
              Patient ID
              <input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="P001"
              />
            </label>
          </div>
          <div className="actions">
            <button type="submit">Search</button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setPatientId('')
                setSelectedPatient(null)
                fetchSortedPatients(sortBy, order)
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading data...</p>}

      <section className="grid">
        {!loading &&
          !error &&
          displayedPatients.map((patient) => (
            <article key={patient.id} className="card">
              <div className="card-head">
                <h3>{patient.name}</h3>
                <span>{patient.id}</span>
              </div>
              <p>
                {patient.city} · {patient.gender}, {patient.age} years
              </p>
              <div className="metrics">
                <span>Height: {patient.height} m</span>
                <span>Weight: {patient.weight} kg</span>
                <span>BMI: {patient.bmi}</span>
              </div>
              <strong className={`tag ${patient.verdict.toLowerCase()}`}>
                {patient.verdict}
              </strong>
            </article>
          ))}
      </section>
    </div>
  )
}

export default App
