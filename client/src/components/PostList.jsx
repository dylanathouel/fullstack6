import { useState } from 'react';
import { createPost, updatePost, deletePost, getPostComments } from '../services/api';
import CommentList from './CommentList';

export default function PostList({ posts: initial, currentUser }) {
  const [posts, setPosts] = useState(initial);
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [editId, setEditId] = useState(null);
  const [editPost, setEditPost] = useState({ title: '', body: '' });
  const [openComments, setOpenComments] = useState({}); // postId → comments[]

  async function handleAdd(e) {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    const { data } = await createPost(newPost);
    setPosts((prev) => [
      ...prev,
      { id: data.id, user_id: currentUser.id, title: newPost.title, body: newPost.body },
    ]);
    setNewPost({ title: '', body: '' });
  }

  function startEdit(post) {
    setEditId(post.id);
    setEditPost({ title: post.title, body: post.body });
  }

  async function handleSaveEdit(id) {
    await updatePost(id, editPost);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...editPost } : p)));
    setEditId(null);
  }

  async function handleDelete(id) {
    await deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setOpenComments((prev) => { const c = { ...prev }; delete c[id]; return c; });
  }

  async function toggleComments(postId) {
    if (openComments[postId] !== undefined) {
      setOpenComments((prev) => { const c = { ...prev }; delete c[postId]; return c; });
      return;
    }
    const { data } = await getPostComments(postId);
    setOpenComments((prev) => ({ ...prev, [postId]: data }));
  }

  const isOwner = (post) => post.user_id === currentUser.id;

  return (
    <div className="list-container">
      <h2>Posts</h2>
      <form onSubmit={handleAdd} className="add-form post-form">
        <input
          value={newPost.title}
          onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
          placeholder="Post title…"
        />
        <textarea
          value={newPost.body}
          onChange={(e) => setNewPost((p) => ({ ...p, body: e.target.value }))}
          placeholder="Content…"
          rows={3}
        />
        <button type="submit">Publish</button>
      </form>

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-item">
            {editId === post.id ? (
              <>
                <input
                  value={editPost.title}
                  onChange={(e) => setEditPost((p) => ({ ...p, title: e.target.value }))}
                  className="edit-input"
                />
                <textarea
                  value={editPost.body}
                  onChange={(e) => setEditPost((p) => ({ ...p, body: e.target.value }))}
                  className="edit-input"
                  rows={3}
                />
              </>
            ) : (
              <>
                <strong>{post.title}</strong>
                <p>{post.body}</p>
              </>
            )}
            <div className="actions">
              <button onClick={() => toggleComments(post.id)}>
                {openComments[post.id] !== undefined ? 'Hide comments' : 'View comments'}
              </button>
              {isOwner(post) && (
                <>
                  {editId === post.id ? (
                    <button onClick={() => handleSaveEdit(post.id)}>Save</button>
                  ) : (
                    <button onClick={() => startEdit(post)}>Edit</button>
                  )}
                  <button className="danger" onClick={() => handleDelete(post.id)}>Delete</button>
                </>
              )}
            </div>
            {openComments[post.id] !== undefined && (
              <CommentList
                comments={openComments[post.id]}
                postId={post.id}
                currentUserId={currentUser.id}
              />
            )}
          </li>
        ))}
        {posts.length === 0 && <li className="empty">No posts yet.</li>}
      </ul>
    </div>
  );
}
