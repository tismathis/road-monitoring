import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * Modal/Overlay component with Apple-style frosted glass
 * Dark mode optimized with backdrop blur
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string|number} props.width - Modal width (default: '90vw')
 * @param {string|number} props.maxWidth - Modal max-width (default: '1200px')
 */
export function Modal({ isOpen, onClose, children, title, width = '90vw', maxWidth = '1200px' }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: tokens.spacing.lg,
    animation: 'fadeIn 200ms ease-out',
  };

  const modalStyles = {
    background: 'rgba(26, 26, 31, 0.95)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: tokens.borderRadius.xl,
    border: `1px solid ${tokens.colors.neutral.border}`,
    boxShadow: tokens.shadows.xl,
    width,
    maxWidth,
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    animation: 'scaleIn 250ms ease-out',
  };

  const headerStyles = {
    padding: tokens.spacing.xl,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyles = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    margin: 0,
    letterSpacing: '-0.02em',
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: tokens.typography.fontSize['2xl'],
    cursor: 'pointer',
    color: tokens.colors.text.secondary,
    padding: tokens.spacing.sm,
    lineHeight: 1,
    borderRadius: tokens.borderRadius.md,
    transition: `all ${tokens.transitions.normal}`,
  };

  const contentStyles = {
    padding: tokens.spacing.xl,
  };

  return (
    <>
      <div style={overlayStyles} onClick={onClose}>
        <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
          {title && (
            <div style={headerStyles}>
              <h2 style={titleStyles}>{title}</h2>
              <button
                style={closeButtonStyles}
                onClick={onClose}
                className="modal-close-btn"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
          )}
          <div style={contentStyles}>
            {children}
          </div>
        </div>
      </div>

      <style>{`
        .modal-close-btn:hover {
          background-color: ${tokens.colors.background.grouped};
          color: ${tokens.colors.text.primary};
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
