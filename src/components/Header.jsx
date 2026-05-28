import { ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useLocale } from '../context/LocaleContext'

const Header = ({ onLogout, onMenuToggle, pageTitle }) => {
  const { t } = useLocale()

  return (
    <header className="bg-bg-secondary border-b border-border-default flex-shrink-0 z-30">
      <div className="px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-4">
            <button onClick={onMenuToggle}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-md transition-colors">
              <Bars3Icon className="h-5 w-5" />
            </button>
            {pageTitle && (
              <span className="text-text-primary font-semibold text-sm">{pageTitle}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-text-tertiary">{t('app.source')}</span>
            <div className="w-px h-5 bg-border-default mx-1" />
            <button onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-md transition-colors">
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
