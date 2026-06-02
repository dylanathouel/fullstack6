import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserTodos, getUserPosts, getUserAlbums } from '../services/api';
import TodoList from '../components/TodoList';
import PostList from '../components/PostList';
import AlbumList from '../components/AlbumList';
import UserInfo from '../components/UserInfo';

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { username, section } = useParams();

  const [view, setView] = useState(section || 'todos');
  // null = not yet fetched, array = already fetched (even if empty)
  const [cache, setCache] = useState({ todos: null, posts: null, albums: null });
  const [loadingView, setLoadingView] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (section) setView(section);
  }, [section]);

  // Lazy fetch: only when the view is first visited
  useEffect(() => {
    if (!user) return;
    if (cache[view] !== null) return; // already loaded — skip

    const loaders = {
      todos:  () => getUserTodos(user.id),
      posts:  () => getUserPosts(user.id),
      albums: () => getUserAlbums(user.id),
    };
    if (!loaders[view]) return;

    setLoadingView(view);
    loaders[view]()
      .then(({ data }) => setCache((prev) => ({ ...prev, [view]: data })))
      .finally(() => setLoadingView(null));
  }, [view, user]); // eslint-disable-line react-hooks/exhaustive-deps

  function switchView(next) {
    setView(next);
    navigate(`/users/${username}/${next}`);
  }

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="username-badge">@{user.username}</span>
        <nav>
          <button className={view === 'todos'  ? 'active' : ''} onClick={() => switchView('todos')}>Todos</button>
          <button className={view === 'posts'  ? 'active' : ''} onClick={() => switchView('posts')}>Posts</button>
          <button className={view === 'albums' ? 'active' : ''} onClick={() => switchView('albums')}>Albums</button>
          {user.role === 'admin' && (
            <button onClick={() => navigate('/admin')}>Admin</button>
          )}
        </nav>
        <div className="header-actions">
          <button onClick={() => setShowInfo((v) => !v)}>Info</button>
          <button className="danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {showInfo && <UserInfo user={user} />}

      <main>
        {/* Panels stay mounted (display:none) so local state is preserved on tab switch */}
        <div style={{ display: view === 'todos' ? 'block' : 'none' }}>
          {loadingView === 'todos' && <p className="loading">Loading…</p>}
          {cache.todos !== null && <TodoList todos={cache.todos} userId={user.id} />}
        </div>

        <div style={{ display: view === 'posts' ? 'block' : 'none' }}>
          {loadingView === 'posts' && <p className="loading">Loading…</p>}
          {cache.posts !== null && <PostList posts={cache.posts} currentUser={user} />}
        </div>

        <div style={{ display: view === 'albums' ? 'block' : 'none' }}>
          {loadingView === 'albums' && <p className="loading">Loading…</p>}
          {cache.albums !== null && <AlbumList albums={cache.albums} currentUser={user} />}
        </div>
      </main>
    </div>
  );
}
