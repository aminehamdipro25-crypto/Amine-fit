import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Subscribers from './pages/Subscribers'
import Calculator from './pages/Calculator'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="calculator" element={<Calculator />} />
      </Route>
    </Routes>
  )
}
