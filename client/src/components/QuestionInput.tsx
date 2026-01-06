import { useState, FormEvent } from 'react';
import { askQuestion } from '../services/api';
import './QuestionInput.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuestionInputProps {
  transcript: string;
  formattedIntake: string;
}

export function QuestionInput({ transcript, formattedIntake }: QuestionInputProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setError(null);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);

    setIsLoading(true);

    try {
      const answer = await askQuestion({
        question: userQuestion,
        transcript,
        formattedIntake,
      });

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="question-section">
      <h3>Ask Clarifying Questions</h3>

      {messages.length > 0 && (
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-label">Assistant</div>
              <div className="message-content loading">Thinking...</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="question-error">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="question-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the transcript..."
          disabled={isLoading}
          className="question-input"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="question-submit"
        >
          {isLoading ? 'Asking...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
