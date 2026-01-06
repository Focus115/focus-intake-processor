import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onDismiss, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-container">
      <div className="error-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="error-content">
        <p className="error-message">{message}</p>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="error-btn retry">
              Try Again
            </button>
          )}
          <button onClick={onDismiss} className="error-btn dismiss">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
