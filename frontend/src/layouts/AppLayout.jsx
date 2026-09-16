import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { tokens } from '../styles/tokens';

/**
 * AppLayout component - main layout with sidebar, top bar, and content area
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
export function AppLayout({ children }) {
  const layoutStyles = {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  };

  const mainContentStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const pageContentStyles = {
    flex: 1,
    overflow: 'auto',
    backgroundColor: tokens.colors.background.base, // #FAFAF9 - light warm gray
    padding: tokens.spacing.xl, // 24px for operational density
  };

  return (
    <div style={layoutStyles}>
      <Sidebar />
      <div style={mainContentStyles}>
        <TopBar />
        <main style={pageContentStyles}>
          {children}
        </main>
      </div>
    </div>
  );
}
