import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Review.css'

function Review() {
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

  const userName = localStorage.getItem('userName') || 'Guest'

  return (
    <div className="review-container">
      <canvas ref={canvasRef} className="review-canvas" />
      <nav className="top-nav">
        <div className="nav-brand">MEDPROOF AI</div>
        <div className="nav-user">Signed in as: <strong>{userName}</strong></div>
        <button className="nav-auth-btn" onClick={() => navigate('/auth')}>
          Sign In / Login
        </button>
      </nav>
      <header className="review-header">
        <h1>Project Review: Natural Medicine Authenticity Verifier</h1>
        <p>A comprehensive overview of our AI-powered platform for combating counterfeit medicines</p>
      </header>

      <main className="review-content">
        <section className="project-overview">
          <h2>Project Overview</h2>
          <p>
            This platform addresses the critical issue of counterfeit medicines, particularly focusing on natural products.
            Using advanced AI and computer vision, we provide instant verification of medicine authenticity through
            packaging analysis and optional identifier checks.
          </p>
        </section>

        <section className="key-features">
          <h2>Key Features</h2>
          <ul>
            <li>AI-powered image analysis for packaging verification</li>
            <li>Optional identifier-based authentication</li>
            <li>Natural product focus for health protection</li>
            <li>User-friendly interface with secure login</li>
            <li>Real-time verification results</li>
            <li>Mobile-responsive design</li>
          </ul>
        </section>

        <section className="technology-stack">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h3>Frontend</h3>
              <ul>
                <li>React 18</li>
                <li>TypeScript</li>
                <li>Vite</li>
                <li>React Router</li>
                <li>CSS3</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>AI/ML (Planned)</h3>
              <ul>
                <li>Computer Vision</li>
                <li>Deep Learning</li>
                <li>Image Processing</li>
                <li>Pattern Recognition</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Backend (Future)</h3>
              <ul>
                <li>Node.js/Express</li>
                <li>Database Integration</li>
                <li>Authentication</li>
                <li>API Services</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="impact">
          <h2>Natural Remedies Focus</h2>
          <p>
            Counterfeit medicines pose a significant threat to public health, especially in the natural products market.
            Our platform helps consumers verify authenticity and provides guidance on trusted natural remedies for safe use.
          </p>
          <ul>
            <li>Recommend evidence-based herbal alternatives when possible</li>
            <li>Highlight safe sourcing for natural supplements</li>
            <li>Educate users about quality checks and certification</li>
          </ul>
        </section>

        <section className="medicine-info">
          <h2>Medicine & Health Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Check Expiration & Shelf Life</h3>
              <p>Always verify expiry dates and avoid medicines that are discolored or damaged.</p>
            </div>
            <div className="insight-card">
              <h3>Know the Active Ingredient</h3>
              <p>Look for core ingredients like Paracetamol, Ibuprofen, or Amoxicillin to match your prescription.</p>
            </div>
            <div className="insight-card">
              <h3>Use Trusted Suppliers</h3>
              <p>Buy from certified pharmacies and avoid unverified online sellers for safety.</p>
            </div>
            <div className="insight-card">
              <h3>Report Suspected Fakes</h3>
              <p>Report any suspicious tablets to local health authorities and do not use them.</p>
            </div>
          </div>
        </section>

        <section className="health-faq">
          <h2>Health Q&A</h2>
          <div className="faq-item">
            <strong>Q: How do I know if a medicine is counterfeit?</strong>
            <p>A: Check appearance, packaging, pill markings, and verify against trusted databases.</p>
          </div>
          <div className="faq-item">
            <strong>Q: Can I take expired medicine?</strong>
            <p>A: It's unsafe; expiration means potency could be reduced and safety not guaranteed.</p>
          </div>
          <div className="faq-item">
            <strong>Q: What should I do when side effects occur?</strong>
            <p>A: Stop taking the drug, consult a healthcare provider, and keep a sample for inspection.</p>
          </div>
          <div className="faq-item">
            <strong>Q: Is natural always safe?</strong>
            <p>A: Natural products can be beneficial, but must also be verified, correctly dosed, and discussed with professionals.</p>
          </div>
        </section>

        <section className="problem-solutions">
          <h2>Common Health Problems & Action Steps</h2>
          <p>Beyond pills or natural remedies, this covers general problems in everyday health and safe response steps.</p>
          <ul>
            <li>Respiratory issues: monitor breathing, use clean air, avoid irritants, and seek medical advice for persistent coughs.</li>
            <li>Digestive discomfort: hydrate, choose gentle foods, avoid unverified supplements, and consult a nutritionist for long-term change.</li>
            <li>Mental well-being: maintain sleep routine, exercise, avoid substance misuse, and reach out to professionals for stress or depression.</li>
            <li>Musculoskeletal pain: apply heat/cold, maintain good posture, and review medication with doctors before self-medication.</li>
            <li>Chronic condition management: keep records, check for side effects, and always follow prescribed treatment plans from certified providers.</li>
          </ul>
        </section>

        <section className="future-plans">
          <h2>Future Enhancements</h2>
          <ul>
            <li>Integration with pharmacy databases</li>
            <li>Mobile app development</li>
            <li>Blockchain-based verification</li>
            <li>Multi-language support</li>
            <li>Advanced AI model training</li>
          </ul>
        </section>
      </main>

      <footer className="review-footer">
        <Link to="/verify" className="back-btn">Back to Verification</Link>
        <p>&copy; 2026 Natural Medicine Authenticity Verifier. Protecting health through technology.</p>
      </footer>
    </div>
  )
}

export default Review