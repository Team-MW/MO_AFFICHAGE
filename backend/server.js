// backend/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// 🧮 Variable compteur
let count = 0;

// 🔹 Récupérer la valeur actuelle
app.get('/count', (req, res) => {
  res.json({ count });
});

// 🔹 Définir une valeur précise (POST)
app.post('/count', (req, res) => {
  const { value } = req.body;
  count = value;
  io.emit('countUpdated', count);
  res.json({ count });
});

// 🔹 WebSocket - gestion en temps réel
io.on('connection', (socket) => {
  console.log('✅ Nouveau client connecté');
  socket.emit('countUpdated', count);

  socket.on('increment', () => {
    count++;
    io.emit('countUpdated', count);
    console.log(`➕ Incrémenté : ${count}`);
  });

  socket.on('decrement', () => {
    count = Math.max(0, count - 1);
    io.emit('countUpdated', count);
    console.log(`➖ Décrémenté : ${count}`);
  });

  socket.on('reset', () => {
    count = 0;
    io.emit('countUpdated', count);
    console.log(`🔄 Réinitialisé`);
  });

  socket.on('setValue', (val) => {
    count = val;
    io.emit('countUpdated', count);
    console.log(`✏️ Valeur définie : ${count}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté');
  });
});

// 🚀 Démarrage du serveur
const PORT = 4000;
server.listen(PORT, () => console.log(`🚀 Backend démarré sur http://localhost:${PORT}`));
