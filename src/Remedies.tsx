import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Remedies.css'

interface Remedy {
  id: string
  name: string
  manufacturer: string
  description: string
  category: string
  health_issues: string
  dosage?: string
  side_effects?: string
  warnings?: string
  interactions?: string
  price?: number
  stock_quantity?: number
}

function Remedies() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'Guest'
  const [healthIssue, setHealthIssue] = useState('')
  const [remedies, setRemedies] = useState<Remedy[]>([])
  const [remediesLoading, setRemediesLoading] = useState(false)
  const [remediesError, setRemediesError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const pills: Array<{ x: number; y: number; size: number; speed: number; angle: number; drift: number; color: string; name: string }> = []

    const palette = [
      'rgba(34,139,34,0.6)',
      'rgba(0,128,0,0.6)',
      'rgba(50,205,50,0.6)',
      'rgba(107,142,35,0.6)',
      'rgba(85,107,47,0.6)',
    ]

    const remedyNames = [
      'Ginger', 'Turmeric', 'Honey', 'Lemon', 'Garlic', 'Echinacea', 'Peppermint', 'Chamomile', 'Lavender', 'Aloe Vera',
      'Green Tea', 'Cinnamon', 'Apple Cider Vinegar', 'Coconut Oil', 'Olive Oil', 'Probiotics', 'Vitamin C', 'Vitamin D', 'Magnesium', 'Omega-3'
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
      const count = 150
      for (let i = 0; i < count; i += 1) {
        pills.push({
          x: random(0, window.innerWidth),
          y: random(-window.innerHeight, 0),
          size: random(15, 30),
          speed: random(1, 4),
          angle: random(0, Math.PI * 2),
          drift: random(-0.3, 0.3),
          color: palette[Math.floor(random(0, palette.length))],
          name: remedyNames[Math.floor(random(0, remedyNames.length))],
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
      ctx.restore()
    }

    const updatePills = () => {
      pills.forEach((pill) => {
        pill.y += pill.speed
        pill.angle += 0.02
        pill.x += pill.drift
        if (pill.y > window.innerHeight + pill.size) {
          pill.y = -pill.size
          pill.x = random(0, window.innerWidth)
        }
        if (pill.x < -pill.size || pill.x > window.innerWidth + pill.size) {
          pill.x = random(0, window.innerWidth)
        }
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      updatePills()
      pills.forEach(drawPill)
      animationId = requestAnimationFrame(animate)
    }

    resize()
    initPills()
    animate()

    window.addEventListener('resize', () => {
      resize()
      initPills()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleRemedies = async () => {
    if (!healthIssue.trim()) {
      setRemediesError('Please enter a health issue.')
      return
    }

    setRemediesLoading(true)
    setRemediesError('')
    setRemedies([])

    try {
      const response = await fetch('/api/medicine/remedies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: healthIssue })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No remedies found')
      }

      setRemedies(data.remedies)
      setRemediesError('')
    } catch (err) {
      setRemediesError(err instanceof Error ? err.message : 'Error finding remedies')
      setRemedies([])
    } finally {
      setRemediesLoading(false)
    }
  }

  return (
    <div className="remedies-container">
      <canvas ref={canvasRef} className="remedies-canvas" />
      <nav className="top-nav">
        <div className="nav-brand">MEDPROOF AI</div>
        <div className="nav-user">Signed in as: <strong>{userName}</strong></div>
        <button className="nav-auth-btn" onClick={() => navigate('/auth')}>
          Sign In / Login
        </button>
      </nav>
      <div className="app">
        <header className="header">
          <div className="ai-header-badge">🌿 Natural Health Solutions</div>
          <h1>Natural Remedies Database</h1>
          <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Natural Remedies" className="header-image" />
          <p>Discover evidence-based natural remedies and supplements for various health conditions.</p>
          <section className="remedies-health-summary">
            <h2>Natural Health Guide</h2>
            <p>Find natural alternatives and complementary treatments for common health issues.</p>
            <ul>
              <li>Search by health condition to find relevant remedies.</li>
              <li>Includes herbal, nutritional, and lifestyle recommendations.</li>
              <li>Always consult healthcare professionals before use.</li>
              <li>Remedies are based on traditional and scientific knowledge.</li>
            </ul>
          </section>
          <div className="ai-capabilities">
            <div className="capability">
              <span className="capability-icon">🌱</span>
              <span>Natural Solutions</span>
            </div>
            <div className="capability">
              <span className="capability-icon">🔬</span>
              <span>Evidence-Based</span>
            </div>
            <div className="capability">
              <span className="capability-icon">💊</span>
              <span>Supplement Info</span>
            </div>
            <div className="capability">
              <span className="capability-icon">📚</span>
              <span>Health Database</span>
            </div>
          </div>
        </header>
        <main className="main">
          <div className="remedies-section">
            <div className="upload-section">
              <div className="upload-header">
                <span className="upload-icon">🌿</span>
                <h3>Find Natural Remedies</h3>
                <p>Enter your health condition to discover natural treatment options</p>
              </div>
              <div className="upload-content">
                <div className="input-group">
                  <label htmlFor="health-issue">Describe your health issue:</label>
                  <input
                    id="health-issue"
                    type="text"
                    placeholder="e.g., headache, cold, pain, insomnia"
                    value={healthIssue}
                    onChange={(e) => setHealthIssue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRemedies()}
                    className="identifier-input"
                  />
                  <small>AI will suggest natural remedies and supplements</small>
                </div>
              </div>
            </div>

            <button onClick={handleRemedies} disabled={remediesLoading} className="remedies-btn">
              <span className="btn-icon">{remediesLoading ? '⏳' : '🌿'}</span>
              {remediesLoading ? 'Searching...' : 'Find Remedies'}
            </button>

            {remediesError && (
              <div className="result error">
                <div className="result-header">
                  <span className="result-icon">❌</span>
                  <h4>No Remedies Found</h4>
                </div>
                <p>{remediesError}</p>
              </div>
            )}

            {remedies.length > 0 && (
              <div className="result success">
                <div className="result-header">
                  <span className="result-icon">🌿</span>
                  <h4>Recommended Remedies</h4>
                </div>
                <div className="remedies-list">
                  {remedies.map((remedy) => (
                    <div key={remedy.id} className="remedy-card">
                      <div className="remedy-header">
                        <h5>{remedy.name} <span className="category">({remedy.category})</span></h5>
                        <div className="remedy-meta">
                          <span className="manufacturer">by {remedy.manufacturer}</span>
                          {remedy.price && <span className="price">${remedy.price.toFixed(2)}</span>}
                        </div>
                      </div>

                      <div className="remedy-content">
                        <p className="description"><strong>Description:</strong> {remedy.description}</p>
                        <p className="health-issues"><strong>Health Issues:</strong> {remedy.health_issues}</p>

                        {remedy.dosage && (
                          <p className="dosage"><strong>Dosage:</strong> {remedy.dosage}</p>
                        )}

                        {remedy.stock_quantity && (
                          <p className="availability">
                            <strong>Availability:</strong> {remedy.stock_quantity > 0 ? `${remedy.stock_quantity} units in stock` : 'Out of stock'}
                          </p>
                        )}

                        {(remedy.side_effects || remedy.warnings || remedy.interactions) && (
                          <div className="safety-section">
                            <h6>⚠️ Safety Information</h6>
                            {remedy.side_effects && (
                              <p className="side-effects"><strong>Side Effects:</strong> {remedy.side_effects}</p>
                            )}
                            {remedy.warnings && (
                              <p className="warnings"><strong>Warnings:</strong> {remedy.warnings}</p>
                            )}
                            {remedy.interactions && (
                              <p className="interactions"><strong>Interactions:</strong> {remedy.interactions}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="navigation">
            <Link to="/verify" className="verify-link">
              <span className="link-icon">🔍</span>
              Verify Medicine
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

export default Remedies