import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, Hash, Users, User as UserIcon, Menu, X } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout">
      <div className="mobile-header">
        <div className="mobile-header-content">
          <MessageSquare size={24} color="var(--primary)" />
          <h2>ChatX</h2>
        </div>
        <button className="btn-icon" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={24} color="var(--primary)" />
            <h2>ChatX</h2>
          </div>
          <button className="btn-icon close-sidebar-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/public-rooms" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Hash size={20} />
            Salas Públicas
          </NavLink>
          <NavLink to="/groups" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Meus Grupos
          </NavLink>
          <NavLink to="/direct" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
