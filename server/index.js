require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Last-resort safety net: never let an unexpected async error or rejection
// terminate the server process. Log it and keep running.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const authRoutes     = require('./routes/auth');
const usersRoutes    = require('./routes/users');
const todosRoutes    = require('./routes/todos');
const postsRoutes    = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const albumsRoutes   = require('./routes/albums');
const photosRoutes   = require('./routes/photos');
const adminRoutes    = require('./routes/admin');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth',     authRoutes);
app.use('/users',    usersRoutes);    // includes /users/:id/todos, /posts, /albums
app.use('/todos',    todosRoutes);
app.use('/posts',    postsRoutes);    // includes /posts/:id/comments
app.use('/comments', commentsRoutes);
app.use('/albums',   albumsRoutes);   // includes /albums/:id/photos
app.use('/photos',   photosRoutes);
app.use('/admin',    adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler: any error forwarded via next(err) — including rejected
// promises caught by the async router — lands here and returns a 500 instead
// of crashing the process.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Request error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
