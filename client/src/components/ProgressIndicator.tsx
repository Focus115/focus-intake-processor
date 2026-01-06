import { TranscriptionStatus } from '../hooks/useTranscription';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  status: TranscriptionStatus;
  uploadProgress: number;
  fileName: string | null;
}

export function ProgressIndicator({ status, uploadProgress, fileName }: ProgressIndicatorProps) {
  if (status === 'idle' || status === 'complete' || status === 'error') {
    return null;
  }

  const isIndeterminate = status === 'transcribing' || status === 'processing';

  return (
    <div className="progress-container">
      <div className="progress-info">
        {fileName && <span className="file-name">{fileName}</span>}
        <span className="status-text">
          {status === 'uploading' && `Uploading... ${uploadProgress}%`}
          {status === 'transcribing' && 'Transcribing audio...'}
          {status === 'processing' && 'Processing intake form...'}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${isIndeterminate ? 'indeterminate' : ''}`}
          style={{ width: status === 'uploading' ? `${uploadProgress}%` : '100%' }}
        />
      </div>
    </div>
  );
}
