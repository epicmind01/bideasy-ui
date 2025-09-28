import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Form from './pages/Form'
import Table from './pages/Table'
import Detail from './pages/Detail'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}> 
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="form" element={<Form />} />
          <Route path="table" element={<Table />} />
          <Route path="detail" element={<Detail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
