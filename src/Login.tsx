import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showGoogleForm, setShowGoogleForm] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const pills: Array<{ x: number; y: number; size: number; speed: number; angle: number; drift: number; color: string }> = []

    const palette = [
      'rgba(16,185,129,0.45)',
      'rgba(59,130,246,0.45)',
      'rgba(139,92,246,0.45)',
      'rgba(236,72,153,0.45)',
      'rgba(248,113,113,0.45)',
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
      const count = 30
      for (let i = 0; i < count; i += 1) {
        pills.push({
          x: random(0, window.innerWidth),
          y: random(-window.innerHeight, 0),
          size: random(18, 32),
          speed: random(0.3, 0.8),
          angle: random(0, Math.PI * 2),
          drift: random(-0.6, 0.6),
          color: palette[Math.floor(random(0, palette.length))],
        })
      }
    }

    const drawPill = (pill: typeof pills[number]) => {
      ctx.save()
      ctx.translate(pill.x, pill.y)
      ctx.rotate(pill.angle)
      ctx.fillStyle = pill.color
      ctx.shadowColor = pill.color
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.ellipse(0, 0, pill.size * 0.9, pill.size * 0.45, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.ellipse(-pill.size * 0.2, -pill.size * 0.1, pill.size * 0.22, pill.size * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      pills.forEach((pill) => {
        pill.y += pill.speed
        pill.x += pill.drift
        pill.angle += 0.003

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

    const handleResize = () => {
      resize()
      initPills()
    }

    // Parallax background movement
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      mouseX = (e.clientX / innerWidth - 0.5) * 20
      mouseY = (e.clientY / innerHeight - 0.5) * 20
    }

    const animateParallax = () => {
      targetX += (mouseX - targetX) * 0.1
      targetY += (mouseY - targetY) * 0.1

      if (backgroundRef.current) {
        backgroundRef.current.style.setProperty('--parallax-x', `${targetX}px`)
        backgroundRef.current.style.setProperty('--parallax-y', `${targetY}px`)
      }

      animationId = window.requestAnimationFrame(animateParallax)
    }

    resize()
    initPills()
    animate()
    animateParallax()

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      localStorage.setItem('userName', username)
      navigate('/verify')
    }, 800)
  }

  const handleGoogleLogin = () => {
    setShowGoogleForm(true)
  }

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleEmail || !googleName) return

    setIsGoogleLoading(true)
    setTimeout(() => {
      setIsGoogleLoading(false)
      setShowGoogleForm(false)
      localStorage.setItem('userName', googleName)
      navigate('/verify')
    }, 900)
  }

  return (
    <div className="login-container">
      {/* Background Animation */}
      <div ref={backgroundRef} className="login-background">
        <canvas ref={canvasRef} className="live-canvas" />
        <div className="background-image"></div>
        <div className="background-overlay"></div>
        
        {/* Gradient Orbs */}
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="login-wrapper">
        {/* Left Side - Branding */}
        <div className="login-branding-section">
          <div className="branding-content">
            <div className="logo-circle">
              <span className="logo-icon">🧪</span>
            </div>
            <h2 className="branding-title">AI-FAKE MEDICINE</h2>
            <p className="branding-subtitle">Counterfeit drug detection powered by AI</p>

            <div className="branding-features">
              <div className="branding-feature">
                <div className="feature-icon">🔍</div>
                <h3>Smart Detection</h3>
                <p>Computer vision & AI analysis</p>
              </div>
              <div className="branding-feature">
                <div className="feature-icon">🛡️</div>
                <h3>Verified Safety</h3>
                <p>Pattern recognition technology</p>
              </div>
              <div className="branding-feature">
                <div className="feature-icon">⚡</div>
                <h3>Instant Results</h3>
                <p>Real-time authenticity check</p>
              </div>
            </div>

            <p className="branding-footer">Protecting health through innovation</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h1>{isSigningUp ? 'Create Account' : 'Welcome Back'}</h1>
              <p>
                {isSigningUp
                  ? 'Join the AI-Fake Medicine verification system'
                  : 'Sign in to your AI-Fake Medicine dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {isSigningUp && (
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirm-password"
                      required
                      placeholder="Re-enter your password"
                      disabled={isLoading}
                    />
                    <span className="input-icon">🔒</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="signin-btn"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loader"></span>
                    {isSigningUp ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  isSigningUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              <div className="oauth-divider">or</div>

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                <span className="google-icon">🔵</span>
                {isGoogleLoading ? 'Redirecting to Google...' : 'Sign in with Google'}
              </button>
            </form>

            {showGoogleForm && (
              <div className="google-modal">
                <form className="google-form" onSubmit={handleGoogleSubmit}>
                  <h3>Google Sign-In</h3>
                  <p>Enter the account details to continue with Google authentication.</p>
                  <div className="form-group">
                    <label htmlFor="google-name">Full Name</label>
                    <input
                      id="google-name"
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="google-email">Google Email</label>
                    <input
                      id="google-email"
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      required
                    />
                  </div>
                  <div className="google-actions">
                    <button type="submit" className="google-confirm-btn" disabled={isGoogleLoading}>
                      {isGoogleLoading ? 'Signing in...' : 'Confirm & Continue'}
                    </button>
                    <button type="button" className="google-cancel-btn" onClick={() => setShowGoogleForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="form-footer">
              <p>Secure AI-powered authentication for medicine verification</p>
              <button
                type="button"
                className="form-toggle"
                onClick={() => setIsSigningUp(!isSigningUp)}
              >
                {isSigningUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login