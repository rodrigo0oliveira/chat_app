import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { MessageSquare, LogIn, UserPlus } from 'lucide-react';
import './Login.css';
import { tokenService } from '../../services/token';

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
        tokenService.setChatToken(res.data.token || res.data);
        navigate('/rooms');
      } else {
        await api.post('/auth/register', { username, email, password });
        setIsLogin(true);
        setError('Registro realizado com sucesso! Por favor, faça login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ação falhou. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-card">
        <div className="login-header">
          <MessageSquare size={48} className="logo-icon" />
          <h1>Bem-vindo ao ChatX</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className={`alert ${error.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <label>Nome de usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome de usuário"
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <span className="spinner"></span> : (
              isLogin ? <><LogIn size={20} /> Entrar</> : <><UserPlus size={20} /> Criar Conta</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            <button className="text-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Cadastre-se aqui' : 'Faça login aqui'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
