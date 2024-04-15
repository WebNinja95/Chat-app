import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRouter from './routers/auth.js';
import profileRouter from './routers/profile.js';
import User from './models/user.js'
import connectToDatabase from './utils/DbConnect.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { verifyToken } from './utils/token.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const app = express(); 
const server = createServer(app); 
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 3000;

dotenv.config();
connectToDatabase();

app.use(express.static('public', {
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

app.get('/', [verifyToken], (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});
app.get('/api/user/data', [verifyToken], async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    res.json({ user });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ success: false, message: 'Error retrieving user data' });
  }
});

app.get('/api/prof/datas', verifyToken, async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    res.json({ user });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ success: false, message: 'Error retrieving user data' });
  }
});

// Socket.io connection
// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // When a new message is received
  socket.on('chat message', async ({ message, sender, image_sender }) => {
    console.log('Message:', message);
    console.log('Sender:', sender);
    
    
    
    // Emit the message back to the sender
    socket.emit('chat message', { message, sender, image_sender });
    
    // Broadcast the message to all connected clients except the sender
    socket.broadcast.emit('chat message', { message, sender, image_sender });
  });
  
  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
