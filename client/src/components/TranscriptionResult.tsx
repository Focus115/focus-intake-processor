import { useState } from 'react';
import './TranscriptionResult.css';

interface TranscriptionResultProps {
  text: string;
  fileName: string;
  onClear: () => void;
  title?: string;
  hideActions?: boolean;
}

export function TranscriptionResult({
  text,
  fileName,
  onClear,
  title = 'Transcription',
  hideActions = false
}: TranscriptionResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = title.toLowerCase().replace(/\s+/g, '_');
    a.download = fileName.replace(/\.[^.]+$/, '') + `_${suffix}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>{title}</h2>
        <div className="result-actions">
          <button onClick={handleCopy} className="action-btn">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="action-btn">
            Download
          </button>
          {!hideActions && (
            <button onClick={onClear} className="action-btn secondary">
              New File
            </button>
          )}
        </div>
      </div>

      <div className="result-stats">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>

      <div className="result-text">
        {text}
      </div>
    </div>
  );
}
