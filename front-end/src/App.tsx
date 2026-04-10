import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import Chat from './pages/Chat';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
