import { Link, Outlet } from '@tanstack/react-router'

const links = [
  ['/', 'Dashboard'], ['/users', 'Users'], ['/products', 'Products'], ['/orders', 'Orders'], ['/notifications', 'Notifications'],
] as const

export function AppShell() {
  return <div className="app-shell"><aside className="sidebar"><div><p className="eyebrow">Practice project</p><h1>Performance Lab</h1></div><nav>{links.map(([to, label]) => <Link key={to} to={to} activeProps={{ className: 'nav-link active' }} className="nav-link">{label}</Link>)}</nav><p className="sidebar-note">Start slow on purpose. Measure, then improve.</p></aside><main className="main"><Outlet /></main></div>
}
