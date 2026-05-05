import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fffaf1',
            color: '#141411',
            border: '1px solid rgba(77, 73, 62, 0.16)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 16px 34px rgba(59, 53, 43, 0.14)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
