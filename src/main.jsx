import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 1. IMPORT PUSAT KENDALI TEMA
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* 2. BUNGKUS SELURUH APLIKASI DENGAN THEME PROVIDER */}
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>,
)