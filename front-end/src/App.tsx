import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Chat from './pages/Chat/Chat';
import Layout from './components/Layout/Layout';
import PublicRooms from './pages/PublicRooms/PublicRooms';
import Groups from './pages/Groups/Groups';
import DirectMessages from './pages/DirectMessages/DirectMessages';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/public-rooms" element={<PublicRooms />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/direct" element={<DirectMessages />} />
          <Route path="/rooms" element={<Navigate to="/public-rooms" replace />} />
        </Route>

        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
