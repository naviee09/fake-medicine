import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './Landing'
import Login from './Login'
import Verification from './Verification'
import Remedies from './Remedies'
import Review from './Review'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/remedies" element={<Remedies />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </Router>
  )
}

export default App