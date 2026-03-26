import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Verification.css'

interface Medicine {
  id: string
  name: string
  manufacturer: string
  batch: string
  verified: boolean
  confidence: number
  expiry_date?: string
  barcode?: string
  description?: string
  category?: string
  dosage?: string
  side_effects?: string
  warnings?: string
  interactions?: string
  price?: number
  stock_quantity?: number
}

function Verification() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'Guest'
  const apiBaseUrl = window.location.hostname === 'localhost' ? '/api' : '/_/backend/api'
  const [medicineName, setMedicineName] = useState('')
  const [medicineResult, setMedicineResult] = useState<Medicine | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [browseMedicines, setBrowseMedicines] = useState<Medicine[]>([])
  const [browseLoading, setBrowseLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const pills: Array<{ x: number; y: number; size: number; speed: number; angle: number; drift: number; color: string; name: string }> = []

    const palette = [
      'rgba(0,0,0,0.8)',
      'rgba(25,25,112,0.8)',
      'rgba(75,0,130,0.8)',
      'rgba(139,69,19,0.8)',
      'rgba(47,79,79,0.8)',
    ]

    const medicineNames = [
      'Aspirin', 'Ibuprofen', 'Paracetamol', 'Amoxicillin', 'Metformin', 'Lisinopril', 'Amlodipine', 'Metoprolol', 'Omeprazole', 'Simvastatin',
      'Losartan', 'Albuterol', 'Gabapentin', 'Sertraline', 'Furosemide', 'Prednisone', 'Warfarin', 'Fluoxetine', 'Tramadol', 'Citalopram',
      'Trazodone', 'Bupropion', 'Duloxetine', 'Venlafaxine', 'Escitalopram', 'Clonazepam', 'Lorazepam', 'Alprazolam', 'Zolpidem', 'Hydrocodone',
      'Oxycodone', 'Morphine', 'Codeine', 'Fentanyl', 'Methadone', 'Buprenorphine', 'Naloxone', 'Acetaminophen', 'Caffeine', 'Diphenhydramine',
      'Pseudoephedrine', 'Guaifenesin', 'Dextromethorphan', 'Chlorpheniramine', 'Loratadine', 'Cetirizine', 'Fexofenadine', 'Montelukast', 'Fluticasone'
    ]

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const random = (min: number, max: number) => Math.random() * (max - min) + min

    const initPills = () => {
      pills.length = 0
      const count = 200
      for (let i = 0; i < count; i += 1) {
        pills.push({
          x: random(0, window.innerWidth),
          y: random(-window.innerHeight, 0),
          size: random(20, 40),
          speed: random(1, 6),
          angle: random(0, Math.PI * 2),
          drift: random(-0.5, 0.5),
          color: palette[Math.floor(random(0, palette.length))],
          name: medicineNames[Math.floor(random(0, medicineNames.length))],
        })
      }
    }

    const drawPill = (pill: typeof pills[number]) => {
      ctx.save()
      ctx.translate(pill.x, pill.y)
      ctx.rotate(pill.angle)
      const gradient = ctx.createLinearGradient(0, -pill.size, 0, pill.size)
      gradient.addColorStop(0, pill.color)
      gradient.addColorStop(1, 'rgba(255,255,255,0.8)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(0, 0, pill.size * 0.9, pill.size * 0.45, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = 'white'
      ctx.font = `${pill.size * 0.3}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(pill.name, 0, 0)
      ctx.restore()
    }

    const animate = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      pills.forEach((pill) => {
        pill.y += pill.speed
        pill.x += pill.drift
        pill.angle += 0.001

        if (pill.y > height + 40) {
          pill.y = -random(20, 60)
          pill.x = random(0, width)
        }
        if (pill.x < -60) pill.x = width + random(20, 60)
        if (pill.x > width + 60) pill.x = -random(20, 60)

        drawPill(pill)
      })

      animationId = window.requestAnimationFrame(animate)
    }

    resize()
    initPills()
    animate()

    const handleResize = () => {
      resize()
      initPills()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(animationId)
    }
  }, [])

  const handleVerify = async () => {
    if (!medicineName.trim()) {
      setError('Please enter a medicine name or identifier.')
      setMedicineResult(null)
      return
    }

    setLoading(true)
    setError('')
    setMedicineResult(null)

    try {
      const response = await fetch(`${apiBaseUrl}/medicine/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: medicineName, category: selectedCategory || undefined })
      })

      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Empty response from backend')
      }

      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error('Invalid JSON response from backend')
      }

      if (!response.ok) {
        const message = data?.error || 'Tablet not found in database'
        throw new Error(message)
      }

      setMedicineResult({
        ...data,
        id: String(data.id),
      })
      setError('')
    } catch (err) {
      console.error('Verify error:', err)
      setError(err instanceof Error ? err.message : 'Error verifying tablet')
      setMedicineResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBrowseMedicines = async () => {
    setBrowseLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/medicine/browse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, limit: 10 })
      })

      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Empty response from backend')
      }

      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error('Invalid JSON response from backend')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to browse medicines')
      }

      setBrowseMedicines(data.medicines || [])
    } catch (err) {
      console.error('Browse error:', err)
    } finally {
      setBrowseLoading(false)
    }
  }

  return (
    <div className="verification-container">
      <canvas ref={canvasRef} className="verification-canvas" />
      <nav className="top-nav">
        <div className="nav-brand">MEDPROOF AI</div>
        <div className="nav-user">Signed in as: <strong>{userName}</strong></div>
        <button className="nav-auth-btn" onClick={() => navigate('/auth')}>
          Sign In / Login
        </button>
      </nav>
      <div className="app">
      <header className="header">
        <div className="ai-header-badge">🧠 AI-Powered Analysis</div>
        <h1>Medicine Verification</h1>
        <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Medicine Pills" className="header-image" />
        <p>Advanced AI-powered platform for authenticating medicines through our comprehensive database.</p>
        <section className="verification-health-summary">
          <h2>Verification Guide</h2>
          <p>Use this tool to verify the authenticity of medicines and ensure patient safety.</p>
          <ul>
            <li>Enter tablet name, batch number, or identifier for verification.</li>
            <li>AI cross-references with authenticated pharmaceutical databases.</li>
            <li>Receive confidence scores and authenticity status.</li>
            <li>Consult healthcare professionals for medical advice.</li>
          </ul>
        </section>
        <div className="ai-capabilities">
          <div className="capability">
            <span className="capability-icon">🔍</span>
            <span>Database Lookup</span>
          </div>
          <div className="capability">
            <span className="capability-icon">🎯</span>
            <span>Pattern Matching</span>
          </div>
          <div className="capability">
            <span className="capability-icon">🛡️</span>
            <span>Authenticity Check</span>
          </div>
          <div className="capability">
            <span className="capability-icon">📊</span>
            <span>Verification Score</span>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="verification-section">
        <div className="upload-section">
          <div className="upload-header">
            <h3>Search Tablet Database</h3>
            <p>Enter tablet name or identifier to verify authenticity</p>
          </div>
          <div className="upload-visual">
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Medicine Search" className="upload-image" />
            <div className="identifier-input-group">
              <input
                type="text"
                placeholder="Enter tablet name, batch number, or identifier..."
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                className="identifier-input"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                <option value="natural">Natural Supplements</option>
                <option value="pharmaceutical">Pharmaceuticals</option>
              </select>
              <small>AI will search our authenticated tablet database</small>
            </div>
          </div>
        </div>

        <button onClick={handleVerify} disabled={loading} className="verify-btn">
          <span className="btn-icon">{loading ? '⏳' : '🚀'}</span>
          {loading ? 'Verifying...' : 'Verify Tablet'}
        </button>

        {error && (
          <div className="result" style={{ background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)', border: '2px solid #f5404d' }}>
            <div className="result-header">
              <span className="result-icon">❌</span>
              <h4>Verification Failed</h4>
            </div>
            <p>{error}</p>
          </div>
        )}

        {medicineResult && (
          <div className="result">
            <div className="result-header">
              <span className="result-icon">✅</span>
              <h4>Medicine Verified</h4>
            </div>
            <div className="medicine-details">
              <div className="detail-section">
                <h5>Basic Information</h5>
                <p><strong>Tablet Name:</strong> {medicineResult.name}</p>
                <p><strong>Manufacturer:</strong> {medicineResult.manufacturer}</p>
                <p><strong>Batch Number:</strong> {medicineResult.batch}</p>
                <p><strong>Barcode:</strong> {medicineResult.barcode}</p>
                <p><strong>Category:</strong> {medicineResult.category}</p>
                <p><strong>Status:</strong> {medicineResult.verified ? '✅ Authentic' : '⚠️ Needs Review'}</p>
                <p><strong>Confidence Score:</strong> {medicineResult.confidence}%</p>
              </div>

              {medicineResult.description && (
                <div className="detail-section">
                  <h5>Description</h5>
                  <p>{medicineResult.description}</p>
                </div>
              )}

              {medicineResult.dosage && (
                <div className="detail-section">
                  <h5>Dosage Information</h5>
                  <p>{medicineResult.dosage}</p>
                </div>
              )}

              {medicineResult.expiry_date && (
                <div className="detail-section">
                  <h5>Expiry Information</h5>
                  <p><strong>Expiry Date:</strong> {new Date(medicineResult.expiry_date).toLocaleDateString()}</p>
                  {new Date(medicineResult.expiry_date) < new Date() && (
                    <p className="warning-text">⚠️ This medicine has expired!</p>
                  )}
                </div>
              )}

              {medicineResult.price && (
                <div className="detail-section">
                  <h5>Pricing & Availability</h5>
                  <p><strong>Price:</strong> ${medicineResult.price.toFixed(2)}</p>
                  <p><strong>Stock Available:</strong> {medicineResult.stock_quantity} units</p>
                </div>
              )}

              {(medicineResult.side_effects || medicineResult.warnings || medicineResult.interactions) && (
                <div className="detail-section safety-info">
                  <h5>⚠️ Safety Information</h5>
                  {medicineResult.side_effects && (
                    <div className="safety-item">
                      <h6>Side Effects:</h6>
                      <p>{medicineResult.side_effects}</p>
                    </div>
                  )}
                  {medicineResult.warnings && (
                    <div className="safety-item">
                      <h6>Warnings:</h6>
                      <p>{medicineResult.warnings}</p>
                    </div>
                  )}
                  {medicineResult.interactions && (
                    <div className="safety-item">
                      <h6>Drug Interactions:</h6>
                      <p>{medicineResult.interactions}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="detail-section disclaimer">
                <p className="disclaimer-text">
                  <strong>⚕️ Medical Disclaimer:</strong> This information is for educational purposes only.
                  Always consult with a healthcare professional before using any medication.
                  Do not rely solely on this verification for medical decisions.
                </p>
              </div>
            </div>
          </div>
        )}

        </div>

        <div className="browse-section">
          <div className="upload-section">
            <div className="upload-header">
              <h3>Browse Medicine Database</h3>
              <p>Explore our comprehensive medicine catalog</p>
            </div>
            <div className="browse-controls">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                <option value="natural">Natural Supplements</option>
                <option value="pharmaceutical">Pharmaceuticals</option>
              </select>
              <button onClick={handleBrowseMedicines} disabled={browseLoading} className="browse-btn">
                <span className="btn-icon">{browseLoading ? '⏳' : '📋'}</span>
                {browseLoading ? 'Loading...' : 'Browse Medicines'}
              </button>
            </div>
          </div>

          {browseMedicines.length > 0 && (
            <div className="browse-results">
              <h4>Available Medicines ({browseMedicines.length})</h4>
              <div className="medicine-grid">
                {browseMedicines.map((medicine) => (
                  <div key={medicine.id} className="medicine-item" onClick={() => setMedicineName(medicine.name)}>
                    <div className="medicine-item-header">
                      <h5>{medicine.name}</h5>
                      <span className={`category-badge ${medicine.category}`}>{medicine.category}</span>
                    </div>
                    <p className="manufacturer">{medicine.manufacturer}</p>
                    {medicine.price && <p className="price">${medicine.price.toFixed(2)}</p>}
                    <p className="stock">Stock: {medicine.stock_quantity} units</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="navigation">
          <Link to="/remedies" className="remedies-link">
            <span className="link-icon">🌿</span>
            Natural Remedies
          </Link>
          <Link to="/review" className="review-link">
            <span className="link-icon">📋</span>
            View Project Details
          </Link>
        </div>
      </main>
    </div>
  </div>
  )
}

export default Verification