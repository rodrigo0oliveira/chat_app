import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Hash } from 'lucide-react';
import './RoomsShared.css';

interface Room {
  id: string;
  name: string | null;
  type: 'PUBLIC' | 'DIRECT' | 'GROUP';
}

export default function PublicRooms() {
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms/public');
      setPublicRooms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (room: Room) => {
    navigate(`/chat/${room.id}?name=${encodeURIComponent(room.name || 'Chat')}`);
  };

  return (
    <div className="rooms-container" style={{ minHeight: 'unset', height: '100%' }}>
      <header className="glass-header" style={{ position: 'static' }}>
        <h2>Salas Públicas</h2>
      </header>

      <main className="rooms-main" style={{ maxWidth: '1000px', display: 'flex' }}>
        <div className="glass-panel rooms-panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <h3>Explorar Canais</h3>
          </div>
          <div className="rooms-list">
            {loading ? (
              <div className="loading-state"><span className="spinner"></span></div>
            ) : publicRooms.length === 0 ? (
              <div className="empty-state">Nenhuma sala pública.</div>
            ) : (
              publicRooms.map(room => (
                <div key={room.id} className="room-card" onClick={() => joinRoom(room)}>
                  <div className="room-icon"><Hash size={24} /></div>
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <span>Canal Público</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
