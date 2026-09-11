import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Signup from "./pages/auth/Signup"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/auth/Login"
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
