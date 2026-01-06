import { useState, useEffect } from 'react';
import { useTranscription } from './hooks/useTranscription';
import { UploadZone } from './components/UploadZone';
import { ProgressIndicator } from './components/ProgressIndicator';
import { TranscriptionResult } from './components/TranscriptionResult';
import { ErrorMessage } from './components/ErrorMessage';
import { QuestionInput } from './components/QuestionInput';
import { Login } from './components/Login';
import { checkAuthRequired, getToken, clearToken } from './services/auth';
import './App.css';

function App() {
  const [authState, setAuthState] = useState<'loading' | 'login' | 'authenticated'>('loading');

  const {
    status,
    uploadProgress,
    transcription,
    formattedIntake,
    error,
    fileName,
    transcribeFile,
    reset,
  } = useTranscription();

  const [showRawTranscript, setShowRawTranscript] = useState(false);

  const isProcessing = status === 'uploading' || status === 'transcribing' || status === 'processing';

  useEffect(() => {
    async function checkAuth() {
      const authRequired = await checkAuthRequired();
      if (!authRequired) {
        setAuthState('authenticated');
        return;
      }

      const token = getToken();
      if (token) {
        setAuthState('authenticated');
      } else {
        setAuthState('login');
      }
    }
    checkAuth();
  }, []);

  // Handle auth errors from API calls
  useEffect(() => {
    if (error && error.includes('Authentication required')) {
      clearToken();
      setAuthState('login');
    }
  }, [error]);

  if (authState === 'loading') {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (authState === 'login') {
    return <Login onSuccess={() => setAuthState('authenticated')} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <img src="/logo.png" alt="Focus Integrated Fitness" className="app-logo" />
        <p>Upload call recording to generate client consultation notes</p>
      </header>

      <main className="app-main">
        {status !== 'complete' && (
          <UploadZone onFileSelect={transcribeFile} disabled={isProcessing} />
        )}

        <ProgressIndicator
          status={status}
          uploadProgress={uploadProgress}
          fileName={fileName}
        />

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={reset}
            onRetry={reset}
          />
        )}

        {formattedIntake && fileName && (
          <>
            <TranscriptionResult
              text={formattedIntake}
              fileName={fileName}
              onClear={reset}
              title="Formatted Intake"
            />

            {transcription && (
              <>
                <QuestionInput
                  transcript={transcription}
                  formattedIntake={formattedIntake}
                />

                <div className="raw-transcript-section">
                  <button
                    className="toggle-raw-btn"
                    onClick={() => setShowRawTranscript(!showRawTranscript)}
                  >
                    {showRawTranscript ? 'Hide' : 'Show'} Raw Transcript
                  </button>

                  {showRawTranscript && (
                    <TranscriptionResult
                      text={transcription}
                      fileName={fileName}
                      onClear={() => {}}
                      title="Raw Transcript"
                      hideActions
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by OpenAI Whisper + GPT-4o</p>
      </footer>
    </div>
  );
}

export default App;
