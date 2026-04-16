import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, Hash, Users, User as UserIcon } from 'lucide-react';
import { api } from '../../services/api';
import { tokenService } from '../../services/token';
import './Layout.css';

interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

export default function Layout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profRes = await api.get('/user/profile');
      setCurrentUser(profRes.data.user);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    tokenService.removeChatToken();
    navigate('/');
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <MessageSquare size={24} color="var(--primary)" />
          <h2>ChatX</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/public-rooms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Hash size={20} />
            Salas Públicas
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Meus Grupos
          </NavLink>
          <NavLink to="/direct" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserIcon size={20} />
            Mensagens Diretas
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span>Conectado como</span>
            <strong>{currentUser?.username || '...'}</strong>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
