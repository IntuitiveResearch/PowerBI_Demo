import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        
        // Get user info
        const userRes = await fetch(`${API}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        const userData = await userRes.json();
        
        setUser(userData);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(data.detail || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (email, password) => {
    setFormData({ email, password });
    setTimeout(() => {
      document.getElementById('login-form').requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1541959284-d104fd29a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBjZW1lbnQlMjBtYW51ZmFjdHVyaW5nJTIwcGxhbnQlMjBhZXJpYWx8ZW58MHx8fHwxNzcwNjU4OTgwfDA&ixlib=rb-4.1.0&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-sm mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
              Star Cement
            </h1>
            <p className="text-lg text-slate-300">KPI Analytics Platform</p>
          </div>

          {/* Login Card */}
          <div className="glass rounded-sm p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-heading font-semibold mb-6 text-slate-900 dark:text-white">
              Sign In
            </h2>

            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="kpi-label mb-2 block text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    data-testid="login-email-input"
                    type="email"
                    placeholder="demo@starcement.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/80 dark:bg-slate-800/80"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="kpi-label mb-2 block text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    data-testid="login-password-input"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white/80 dark:bg-slate-800/80"
                    required
                  />
                </div>
              </div>

              <Button
                data-testid="login-submit-button"
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-600">
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Demo Accounts (Click to use)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  data-testid="demo-cxo-button"
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin('demo@starcement.com', 'Demo1234!')}
                  className="text-xs"
                >
                  CXO
                </Button>
                <Button
                  data-testid="demo-plant-button"
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin('plant@starcement.com', 'Plant1234!')}
                  className="text-xs"
                >
                  Plant Head
                </Button>
                <Button
                  data-testid="demo-energy-button"
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin('energy@starcement.com', 'Energy1234!')}
                  className="text-xs"
                >
                  Energy Mgr
                </Button>
                <Button
                  data-testid="demo-sales-button"
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin('sales@starcement.com', 'Sales1234!')}
                  className="text-xs"
                >
                  Sales
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400 mt-6">
            &copy; 2025 Star Cement. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
