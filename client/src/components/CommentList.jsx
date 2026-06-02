import { useState } from 'react';
import { createComment, updateComment, deleteComment } from '../services/api';

export default function CommentList({ comments: initial, postId, currentUserId }) {
  const [comments, setComments] = useState(initial);
  const [newBody, setNewBody] = useState('');
  const [editId, setEditId] = useState(null);
  const [editBody, setEditBody] = useState('');

  async function handleAdd(e) {
    e.preventDefault();
    if (!newBody.trim()) return;
    // Minimal payload: postId + body only (userId comes from the JWT server-side)
    const { data } = await createComment({ postId, body: newBody.trim() });
    setComments((prev) => [
      ...prev,
      { id: data.id, post_id: postId, user_id: currentUserId, body: newBody.trim() },
    ]);
    setNewBody('');
  }

  async function handleEdit(comment) {
    if (editId === comment.id) {
      await updateComment(comment.id, { body: editBody });
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, body: editBody } : c))
      );
      setEditId(null);
    } else {
      setEditId(comment.id);
      setEditBody(comment.body);
    }
  }

  async function handleDelete(id) {
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  const isOwner = (comment) => comment.user_id === currentUserId;

  return (
    <div className="comment-section">
      <h4>Comments ({comments.length})</h4>
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id}>
            {editId === c.id ? (
              <input
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="edit-input"
              />
            ) : (
              <span>{c.body}</span>
            )}
            {isOwner(c) && (
              <div className="actions">
                <button onClick={() => handleEdit(c)}>
                  {editId === c.id ? 'Save' : 'Edit'}
                </button>
                <button className="danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
        {comments.length === 0 && <li className="empty">No comments yet.</li>}
      </ul>
      <form onSubmit={handleAdd} className="add-form">
        <input
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Add a comment…"
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}
