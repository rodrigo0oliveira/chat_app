import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LogOut, Hash, Search, Plus, User as UserIcon, Users, MessageSquare } from 'lucide-react';

interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

interface Room {
  id: string;
  name: string | null;
  type: 'PUBLIC' | 'DIRECT' | 'GROUP';
  members?: any[];
}

export default function Rooms() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDirectModalOpen, setDirectModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const profRes = await api.get('/user/profile');
      setCurrentUser(profRes.data.user);

      // Fetch public rooms
      const pubRes = await api.get('/rooms/public');
      setPublicRooms(pubRes.data);

      // Fetch user's private rooms (DIRECT, GROUP)
      const myRes = await api.get('/rooms');
      setMyRooms(myRes.data);

      // Pre-fetch all users for the modals
      const usersRes = await api.get('/user/all');
      setAllUsers(usersRes.data);

    } catch (error: any) {
      console.error('Failed to fetch data', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    navigate('/');
  };

  const joinRoom = (room: Room) => {
    let displayName = room.name;
    if (room.type === 'DIRECT') {
       displayName = "Direct Chat";
       if (room.members && currentUser) {
           const otherMember = room.members.find((m: any) => m.userId !== currentUser.id && m.userId !== currentUser._id);
           if (otherMember && otherMember.username) displayName = otherMember.username;
       }
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
      alert('Failed to create direct chat.');
    }
  };

  const createGroupRoom = async () => {
    if (!groupName || selectedUsers.length === 0) return alert('Provide a name and select at least 1 member');
    try {
      const res = await api.post('/rooms/group', { name: groupName, memberIds: selectedUsers });
      setGroupModalOpen(false);
      setGroupName('');
      setSelectedUsers([]);
      joinRoom(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to create group chat.');
    }
  };

  const directRooms = myRooms.filter(r => r.type === 'DIRECT');
  const groupRooms = myRooms.filter(r => r.type === 'GROUP');

  const otherUsers = allUsers.filter(u => u._id !== currentUser?.id && u._id !== currentUser?._id);

  return (
    <div className="rooms-container">
      <header className="glass-header">
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <MessageSquare size={24} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
          <h2>ChatX</h2>
        </div>
        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser && (
            <span className="user-greeting" style={{ fontSize: '0.9rem' }}>
              Hello, <strong>{currentUser.username}</strong>
            </span>
          )}
          <button className="btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="rooms-main">
        {/* PUBLIC ROOMS */}
        <div className="glass-panel rooms-panel">
          <div className="panel-header">
            <h3>Public Rooms</h3>
          </div>
          
          <div className="rooms-list">
            {loading ? (
              <div className="loading-state"><span className="spinner"></span></div>
            ) : publicRooms.length === 0 ? (
              <div className="empty-state">No public rooms.</div>
            ) : (
              publicRooms.map(room => (
                <div key={room.id} className="room-card" onClick={() => joinRoom(room)}>
                  <div className="room-icon"><Hash size={24} /></div>
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <span>Public Channel</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GROUP ROOMS */}
        <div className="glass-panel rooms-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Groups</h3>
            <button className="btn-icon-small" onClick={() => setGroupModalOpen(true)} title="New Group">
              <Plus size={18} />
            </button>
          </div>
          <div className="rooms-list">
            {loading ? (
              <div className="loading-state"><span className="spinner"></span></div>
            ) : groupRooms.length === 0 ? (
              <div className="empty-state">No group chats yet.</div>
            ) : (
              groupRooms.map(room => (
                <div key={room.id} className="room-card" onClick={() => joinRoom(room)}>
                  <div className="room-icon"><Users size={24} /></div>
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <span>Group Chat</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div className="glass-panel rooms-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Direct Messages</h3>
            <button className="btn-icon-small" onClick={() => setDirectModalOpen(true)} title="New DM">
              <Plus size={18} />
            </button>
          </div>
          <div className="rooms-list">
            {loading ? (
              <div className="loading-state"><span className="spinner"></span></div>
            ) : directRooms.length === 0 ? (
              <div className="empty-state">No private chats yet.</div>
            ) : (
              directRooms.map(room => {
                 let otherName = "Direct Chat";
                 if (room.members && currentUser) {
                     const m = room.members.find((mx: any) => mx.userId !== currentUser.id && mx.userId !== currentUser._id);
                     if (m && m.username) otherName = m.username;
                 }
                 return (
                  <div key={room.id} className="room-card" onClick={() => joinRoom(room)}>
                    <div className="room-icon"><UserIcon size={24} /></div>
                    <div className="room-info">
                      <h4>{otherName}</h4>
                      <span>Private Chat</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      {isDirectModalOpen && (
        <div className="modal-backdrop" onClick={() => setDirectModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom: '0.5rem'}}>New Direct Message</h3>
            <p style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>Select a user to start chatting</p>
            <div className="user-list">
              {otherUsers.map(u => (
                <div key={u._id} className="user-card" onClick={() => createDirectRoom(u._id!)}>
                  <UserIcon size={20} style={{marginRight: '0.5rem'}}/> 
                  <span>{u.username}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
              <button className="btn-secondary" onClick={() => setDirectModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className="modal-backdrop" onClick={() => setGroupModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom: '1rem'}}>New Group Chat</h3>
            <div className="input-group">
              <label>Group Name</label>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="E.g. Engineering Team" />
            </div>
            <p style={{margin: '0.5rem 0', color: 'var(--text-muted)'}}>Select members:</p>
            <div className="user-list">
              {otherUsers.map(u => {
                const isSelected = selectedUsers.includes(u._id!);
                return (
                  <div key={u._id} className={`user-card ${isSelected ? 'selected' : ''}`} 
                       onClick={() => setSelectedUsers(prev => isSelected ? prev.filter(id => id !== u._id) : [...prev, u._id!])}>
                    <UserIcon size={20} style={{marginRight: '0.5rem'}}/> 
                    <span>{u.username}</span>
                  </div>
                )
              })}
            </div>
            <div className="modal-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem'}}>
              <button className="btn-secondary" onClick={() => setGroupModalOpen(false)}>Cancel</button>
              <button className="btn-primary" style={{width: 'auto'}} onClick={createGroupRoom}>Create Group</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
