import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon, TableCellsIcon, ClockIcon, TrophyIcon,
  ArrowsRightLeftIcon, ChartBarIcon, PencilSquareIcon,
  CircleStackIcon, XMarkIcon, UserCircleIcon
} from '@heroicons/react/24/outline'
import { useLocale } from '../context/LocaleContext'

const Sidebar = ({ userRole, mobileMenuOpen, onCloseMobileMenu }) => {
  const location = useLocation()
  const { t, locale, setLocale } = useLocale()

  const reports = [
    { key: 'nav.panel',        href: '/panel',          icon: HomeIcon },
    { key: 'nav.mensual',      href: '/mensual',        icon: TableCellsIcon },
    { key: 'nav.historico',    href: '/historico',      icon: ClockIcon },
    { key: 'nav.records',      href: '/records',        icon: TrophyIcon },
    { key: 'nav.comparativas', href: '/comparativas',   icon: ArrowsRightLeftIcon },
    { key: 'nav.proyecciones', href: '/proyecciones',   icon: ChartBarIcon },
  ]

  const admin = [
    { key: 'nav.carga',  href: '/carga',  icon: PencilSquareIcon },
    { key: 'nav.datos',  href: '/datos',  icon: CircleStackIcon },
  ]

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/')

  const NavItem = ({ item }) => (
    <Link
      to={item.href}
      onClick={onCloseMobileMenu}
      className={isActive(item.href) ? 'nav-item-active' : 'nav-item-inactive'}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span>{t(item.key)}</span>
    </Link>
  )

  const Content = () => (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-border-default">
      {/* Brand */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0">
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-[#75AADB]" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#F6B40E]" />
              </div>
              <div className="flex-1 bg-[#75AADB]" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-text-primary leading-tight">{t('app.title')}</p>
            <p className="text-[10px] text-text-tertiary leading-tight">{t('app.subtitle')}</p>
          </div>
        </div>
        <button onClick={onCloseMobileMenu} className="lg:hidden p-1 hover:bg-bg-surface rounded-md">
          <XMarkIcon className="h-5 w-5 text-text-secondary" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <div className="section-header">{t('nav.section.reportes')}</div>
        {reports.map(item => <NavItem key={item.href} item={item} />)}

        <div className="section-header mt-4">{t('nav.section.admin')}</div>
        {admin.map(item => <NavItem key={item.href} item={item} />)}
      </nav>

      {/* Locale toggle + user */}
      <div className="px-3 py-3 border-t border-border-default space-y-2">
        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-bg-surface rounded-md p-0.5">
          {['es', 'en'].map(l => (
            <button key={l} onClick={() => setLocale(l)}
              className={`flex-1 text-xs font-medium py-1 rounded transition-all ${
                locale === l
                  ? 'bg-bg-secondary text-brand shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-bg-surface rounded-full flex items-center justify-center">
            <UserCircleIcon className="h-4 w-4 text-text-tertiary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">Admin</p>
            <p className="text-[10px] text-text-tertiary truncate capitalize">{userRole || 'admin'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:flex lg:flex-shrink-0 sticky top-0 h-screen">
        <div className="flex flex-col w-56"><Content /></div>
      </div>

      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobileMenu} />
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden animate-slide-in-left">
            <Content />
          </div>
        </>
      )}
    </>
  )
}

export default Sidebar
