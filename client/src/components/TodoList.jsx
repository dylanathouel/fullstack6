import { useState } from 'react';
import { createTodo, updateTodo, deleteTodo } from '../services/api';

export default function TodoList({ todos: initial, userId }) {
  const [todos, setTodos] = useState(initial);
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  async function handleToggle(todo) {
    await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { data } = await createTodo({ title: newTitle.trim() });
    setTodos((prev) => [
      ...prev,
      { id: data.id, user_id: userId, title: newTitle.trim(), completed: false },
    ]);
    setNewTitle('');
  }

  async function handleEdit(todo) {
    if (editId === todo.id) {
      await updateTodo(todo.id, { title: editTitle });
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, title: editTitle } : t))
      );
      setEditId(null);
    } else {
      setEditId(todo.id);
      setEditTitle(todo.title);
    }
  }

  async function handleDelete(id) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="list-container">
      <h2>Todos</h2>
      <form onSubmit={handleAdd} className="add-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New todo…"
        />
        <button type="submit">Add</button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'done' : ''}>
            <input
              type="checkbox"
              checked={!!todo.completed}
              onChange={() => handleToggle(todo)}
            />
            {editId === todo.id ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="edit-input"
              />
            ) : (
              <span>{todo.title}</span>
            )}
            <div className="actions">
              <button onClick={() => handleEdit(todo)}>
                {editId === todo.id ? 'Save' : 'Edit'}
              </button>
              <button className="danger" onClick={() => handleDelete(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
        {todos.length === 0 && <li className="empty">No todos yet.</li>}
      </ul>
    </div>
  );
}
