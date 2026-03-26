import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()
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
        pill.angle += 0.005

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

  return (
    <div className="landing-container">
      <div className="landing-background">
        <canvas ref={canvasRef} className="landing-canvas" />
        <div className="landing-overlay" />
        <div className="landing-orb orb-1" />
        <div className="landing-orb orb-2" />
        <div className="landing-orb orb-3" />
      </div>

      <header className="landing-header">
        <h1>MEDPROOF AI</h1>
      </header>

      <div className="landing-content">
        <p className="landing-subtitle">
          AI-powered medicine verification system ensuring every dose you take is genuine and safe.
        </p>

        <div className="landing-actions">
          <button className="primary-btn" onClick={() => navigate('/auth')}>
            Get Started
          </button>
          <div className="auth-buttons">
            <button className="nav-btn" onClick={() => navigate('/auth')}>
              Login
            </button>
            <button className="nav-btn primary" onClick={() => navigate('/auth')}>
              Signup
            </button>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <div>
              <h3>Real-time Analysis</h3>
              <p>Scan medicine and receive instant authenticity feedback.</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">🛡️</span>
            <div>
              <h3>Trusted Results</h3>
              <p>AI models trained on real-world data for accuracy.</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <div>
              <h3>Fast Workflow</h3>
              <p>Start verifying in seconds with a seamless experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
