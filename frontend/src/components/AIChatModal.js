import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AIChatModal({ open, onClose, contextFilters }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [samplePrompts, setSamplePrompts] = useState([]);

  useEffect(() => {
    if (open) {
      // Load sample prompts
      fetch(`${API}/insights/prompts`)
        .then(res => res.json())
        .then(data => setSamplePrompts(data.prompts || []))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          contextFilters: contextFilters || {}
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setResult(data);
      } else {
        toast.error(data.message || 'Failed to generate insight');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useSamplePrompt = (prompt) => {
    setQuestion(prompt);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="ai-chat-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-heading">
            <Bot className="w-6 h-6 text-primary" />
            Ask My Data
          </DialogTitle>
          <DialogDescription>
            Get AI-powered insights from your cement manufacturing data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Sample Prompts */}
          {!result && samplePrompts.length > 0 && (
            <div>
              <p className="kpi-label mb-3">Sample Questions</p>
              <div className="space-y-2">
                {samplePrompts.map((prompt, idx) => (
                  <Button
                    key={idx}
                    data-testid={`sample-prompt-${idx}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuestion(prompt);
                      setResult(null);
                    }}
                    className="w-full justify-start text-left h-auto py-2 px-3"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Question Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              data-testid="ai-question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              data-testid="ai-submit-button"
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Result */}
          {result && (
            <div data-testid="ai-result" className="space-y-4">
              {/* Summary */}
              <div className="kpi-card">
                <div className="flex items-start gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Analysis Summary
                    </h4>
                    <p className="text-base text-foreground leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Causes */}
              {result.causes && result.causes.length > 0 && (
                <div className="kpi-card">
                  <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    Identified Causes
                  </h4>
                  <ul className="space-y-2">
                    {result.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-mono text-sm flex-shrink-0 mt-0.5">
                          {idx + 1}.
                        </span>
                        <span className="text-sm text-foreground">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Actions */}
              {result.recommendedActions && result.recommendedActions.length > 0 && (
                <div className="kpi-card bg-primary/5 border-primary/20">
                  <h4 className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence */}
              {result.evidence && (
                <details className="kpi-card">
                  <summary className="text-sm font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    Show Evidence & SQL Query
                  </summary>
                  <div className="mt-4 space-y-3">
                    {result.evidence.computed_metrics && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Computed Metrics</p>
                        <div className="bg-muted rounded-sm p-3">
                          <pre className="text-xs font-mono overflow-x-auto">
                            {JSON.stringify(result.evidence.computed_metrics, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    {result.evidence.sql_query && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">SQL Query</p>
                        <div className="bg-muted rounded-sm p-3">
                          <pre className="text-xs font-mono overflow-x-auto">
                            {result.evidence.sql_query}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Ask Another Question */}
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setQuestion('');
                }}
                className="w-full"
              >
                Ask Another Question
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
