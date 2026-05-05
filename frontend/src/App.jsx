import { Routes, Route, Navigate } from 'react-router-dom'
import MainEditor from './pages/MainEditor'
import ReviewPage from './pages/ReviewPage'
import AuthPage from './pages/AuthPage'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="scrutin-app"><div className="loading-spinner"></div></div>
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <MainEditor /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/review/:id" element={<ReviewPage />} />
    </Routes>
  )
}

export default App;