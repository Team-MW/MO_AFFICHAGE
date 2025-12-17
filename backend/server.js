// backend/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ajouterClient, listerClients, getLastCountFromDb, saveCountToDb } from './supabaseClient.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// 🔎 Healthcheck (keep-alive)
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// 🧮 Variable compteur
let count = 0;

// 🔹 Récupérer la valeur actuelle (depuis la base si possible)
app.get('/count', async (req, res) => {
  try {
    const lastCount = await getLastCountFromDb();
    count = lastCount;
    res.json({ count });
  } catch (error) {
    console.error('Erreur /count GET:', error);
    // En cas d'erreur base, on renvoie au moins la valeur en mémoire
    res.json({ count });
  }
});

// 🔹 Définir une valeur précise (POST) et la sauvegarder en base
app.post('/count', async (req, res) => {
  try {
    const { value } = req.body;
    if (typeof value !== 'number') {
      return res.status(400).json({ error: 'Le champ \"value\" doit être un nombre' });
    }
    count = value;
    await saveCountToDb(count);
    io.emit('countUpdated', count);
    res.json({ count });
  } catch (error) {
    console.error('Erreur /count POST:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du compteur' });
  }
});

// 🔹 Ajouter un client dans la base Supabase (table "client")
app.post('/clients', async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom || typeof nom !== 'string') {
      return res.status(400).json({ error: 'Le champ \"nom\" est requis' });
    }
    const client = await ajouterClient(nom);
    res.status(201).json(client);
  } catch (error) {
    console.error('Erreur /clients POST:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du client' });
  }
});

// 🔹 Lister tous les clients
app.get('/clients', async (_req, res) => {
  try {
    const clients = await listerClients();
    res.json(clients);
  } catch (error) {
    console.error('Erreur /clients GET:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des clients' });
  }
});

// 🔹 WebSocket - gestion en temps réel
io.on('connection', (socket) => {
  console.log('✅ Nouveau client connecté');
  socket.emit('countUpdated', count);

  socket.on('increment', async () => {
    try {
      count++;
      await saveCountToDb(count);
      io.emit('countUpdated', count);
      console.log(`➕ Incrémenté : ${count}`);
    } catch (error) {
      console.error('Erreur increment (WebSocket):', error);
    }
  });

  socket.on('decrement', async () => {
    try {
      count = Math.max(0, count - 1);
      await saveCountToDb(count);
      io.emit('countUpdated', count);
      console.log(`➖ Décrémenté : ${count}`);
    } catch (error) {
      console.error('Erreur decrement (WebSocket):', error);
    }
  });

  socket.on('reset', async () => {
    try {
      count = 0;
      await saveCountToDb(count);
      io.emit('countUpdated', count);
      console.log(`🔄 Réinitialisé`);
    } catch (error) {
      console.error('Erreur reset (WebSocket):', error);
    }
  });

  socket.on('setValue', async (val) => {
    try {
      if (typeof val !== 'number') {
        return;
      }
      count = val;
      await saveCountToDb(count);
      io.emit('countUpdated', count);
      console.log(`✏️ Valeur définie : ${count}`);
    } catch (error) {
      console.error('Erreur setValue (WebSocket):', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté');
  });
});

// 🚀 Démarrage du serveur
const PORT = 4000;
server.listen(PORT, () => console.log(`🚀 Backend démarré sur http://localhost:${PORT}`));
