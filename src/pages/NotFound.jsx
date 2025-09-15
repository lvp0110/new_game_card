import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div>
      <h1>404 — Страница не найдена</h1>
      <p><Link to='/'>На главную</Link></p>
    </div>
  )
}
