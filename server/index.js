require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes     = require('./routes/auth');
const usersRoutes    = require('./routes/users');
const todosRoutes    = require('./routes/todos');
const postsRoutes    = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const albumsRoutes   = require('./routes/albums');
const adminRoutes    = require('./routes/admin');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth',     authRoutes);
app.use('/users',    usersRoutes);    // inclut /users/:id/todos, /posts, /albums
app.use('/todos',    todosRoutes);
app.use('/posts',    postsRoutes);    // inclut /posts/:id/comments
app.use('/comments', commentsRoutes);
app.use('/albums',   albumsRoutes);   // inclut /albums/:id/photos
app.use('/admin',    adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
