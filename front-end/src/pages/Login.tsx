import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MessageSquare, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('chat_token', res.data.token || res.data); // Adjust depending on your backend response format
        navigate('/rooms');
      } else {
        await api.post('/auth/register', { username, email, password });
        setIsLogin(true);
        setError('Registration successful! Please login.');
        // Don't set error as red in this case, it's just a success message
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-card">
        <div className="login-header">
          <MessageSquare size={48} className="logo-icon" />
          <h1>Welcome to ChatX</h1>
          <p>Real-time conversations, beautifully designed.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-error'}`}>
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username"
                required={!isLogin} 
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <span className="spinner"></span> : (
              isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Create Account</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="text-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up here' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
