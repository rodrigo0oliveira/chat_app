import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Users, Plus, User as UserIcon } from 'lucide-react';
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
}

export default function Groups() {
  const [groupRooms, setGroupRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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


      const rolesRes = await api.get('/rooms/group');
      setGroupRooms(rolesRes.data);

      const usersRes = await api.get('/user/all');
      setOtherUsers(usersRes.data.filter((u: User) => u._id !== user.id && u._id !== user._id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (room: Room) => {
    navigate(`/chat/${room.id}?name=${encodeURIComponent(room.name || 'Grupo')}`);
  };

  const createGroupRoom = async () => {
    if (!groupName || selectedUsers.length === 0) return alert('Forneça um nome e selecione pelo menos 1 membro');
    try {
      const res = await api.post('/rooms/group', { name: groupName, memberIds: selectedUsers });
      setGroupModalOpen(false);
      setGroupName('');
      setSelectedUsers([]);
      joinRoom(res.data);
    } catch (err) {
      console.error(err);
      alert('Falha ao criar chat em grupo.');
    }
  };

  return (
    <div className="rooms-container" style={{ minHeight: 'unset', height: '100%' }}>
      <header className="glass-header" style={{ position: 'static' }}>
        <h2>Grupos</h2>
      </header>

      <main className="rooms-main" style={{ maxWidth: '1000px', display: 'flex' }}>
        <div className="glass-panel rooms-panel" style={{ flex: 1 }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Meus Grupos</h3>
            <button className="btn-icon-small" onClick={() => setGroupModalOpen(true)} title="Novo Grupo">
              <Plus size={18} />
            </button>
          </div>
          <div className="rooms-list">
            {loading ? (
              <div className="loading-state"><span className="spinner"></span></div>
            ) : groupRooms.length === 0 ? (
              <div className="empty-state">Nenhum grupo ainda.</div>
            ) : (
              groupRooms.map(room => (
                <div key={room.id} className="room-card" onClick={() => joinRoom(room)}>
                  <div className="room-icon"><Users size={24} /></div>
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <span>Chat em Grupo</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {isGroupModalOpen && (
        <div className="modal-backdrop" onClick={() => setGroupModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Novo Chat em Grupo</h3>
            <div className="input-group">
              <label>Nome do Grupo</label>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Ex. Equipe de Engenharia" />
            </div>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>Selecionar membros:</p>
            <div className="user-list">
              {otherUsers.map(u => {
                const isSelected = selectedUsers.includes(u._id!);
                return (
                  <div key={u._id} className={`user-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedUsers(prev => isSelected ? prev.filter(id => id !== u._id) : [...prev, u._id!])}>
                    <UserIcon size={20} style={{ marginRight: '0.5rem' }} />
                    <span>{u.username}</span>
                  </div>
                )
              })}
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setGroupModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={createGroupRoom}>Criar Grupo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
