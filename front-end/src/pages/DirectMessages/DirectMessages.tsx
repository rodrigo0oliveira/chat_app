import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { User as UserIcon, Plus } from 'lucide-react';
import '../PublicRooms/RoomsShared.css';

interface User {
  _id?: string;
  id?: string;
  username: string;
}

interface Room {
  id: string;
  name: string | null;
  type: 'PUBLIC' | 'DIRECT' | 'GROUP';
  members?: any[];
}

export default function DirectMessages() {
  const [directRooms, setDirectRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isDirectModalOpen, setDirectModalOpen] = useState(false);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/user/profile');
      const user = profRes.data.user;
      setCurrentUser(user);

      const rolesRes = await api.get('/rooms/direct');
      setDirectRooms(rolesRes.data);

      const usersRes = await api.get('/user/all');
      setOtherUsers(usersRes.data.filter((u: User) => u._id !== user.id && u._id !== user._id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (room: Room) => {
    let displayName = room.name;
    if (room.members && currentUser) {
      const otherMember = room.members.find((m: any) => m.userId !== currentUser.id && m.userId !== currentUser._id);
      if (otherMember && otherMember.username) displayName = otherMember.username;
    }
    navigate(`/chat/${room.id}?name=${encodeURIComponent(displayName || 'Chat')}`);
  };

  const createDirectRoom = async (targetUserId: string) => {
    try {
      const res = await api.post('/rooms/direct', { targetUserId });
      setDirectModalOpen(false);
      joinRoom(res.data);
    } catch (err) {
      console.error(err);
      alert('Falha ao criar chat direto.');
    }
  };

  return (
    <div className="rooms-container" style={{ minHeight: 'unset', height: '100%' }}>
      <header className="glass-header" style={{ position: 'static' }}>
        <h2>Mensagens Diretas</h2>
      </header>

      <main className="rooms-main" style={{ maxWidth: '1000px', display: 'flex' }}>
        <div className="glass-panel rooms-panel" style={{ flex: 1 }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Conversas</h3>
            <button className="btn-icon-small" onClick={() => setDirectModalOpen(true)} title="Nova Mensagem Direta">
              <Plus size={18} />
            </button>
          </div>
          <div className="rooms-list">
            {loading ? (
              <div className="loading-state"><span className="spinner"></span></div>
            ) : directRooms.length === 0 ? (
              <div className="empty-state">Nenhum chat privado ainda.</div>
            ) : (
              directRooms.map(room => {
                let otherName = "Chat Direto";
                if (room.members && currentUser) {
                  const m = room.members.find((mx: any) => mx.userId !== currentUser.id && mx.userId !== currentUser._id);
                  if (m && m.username) otherName = m.username;
                }
                return (
                  <div key={room.id} className="room-card" onClick={() => joinRoom(room)}>
                    <div className="room-icon"><UserIcon size={24} /></div>
                    <div className="room-info">
                      <h4>{otherName}</h4>
                      <span>Chat Privado</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {isDirectModalOpen && (
        <div className="modal-backdrop" onClick={() => setDirectModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem' }}>Nova Mensagem Direta</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Selecione um usuário para conversar</p>
            <div className="user-list">
              {otherUsers.map(u => (
                <div key={u._id} className="user-card" onClick={() => createDirectRoom(u._id!)}>
                  <UserIcon size={20} style={{ marginRight: '0.5rem' }} />
                  <span>{u.username}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setDirectModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
