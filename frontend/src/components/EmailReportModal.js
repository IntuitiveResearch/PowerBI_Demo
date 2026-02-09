import React, { useState } from 'react';
import { Mail, X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EmailReportModal({ open, onClose, role, plant }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/send-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_email: email,
          role: role,
          plant: plant
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        toast.success(`Report sent to ${email}`);
        setTimeout(() => {
          setSent(false);
          setEmail('');
          onClose();
        }, 2000);
      } else {
        toast.error(data.detail || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Send KPI Report</h2>
              <p className="text-sm opacity-90">Email dashboard summary</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Sent!</h3>
              <p className="text-sm text-gray-500">Check your inbox for the KPI report.</p>
            </div>
          ) : (
            <>
              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Report Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Dashboard:</span>
                    <span className="ml-2 font-medium text-gray-800">{role}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plant:</span>
                    <span className="ml-2 font-medium text-gray-800">{plant === 'all' ? 'All Plants' : plant}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The report will include all KPIs currently displayed on your dashboard.
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Recipient Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  data-testid="email-input"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Report will be sent to this email address
                </p>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={sending || !email}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                data-testid="send-report-button"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Report
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
