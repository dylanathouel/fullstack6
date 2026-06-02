import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminGetUsers, adminBlockUser, adminGetLogs } from '../services/api';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    adminGetUsers().then(({ data }) => setUsers(data));
  }, [user, navigate]);

  async function toggleBlock(u) {
    await adminBlockUser(u.id, !u.blocked);
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, blocked: !u.blocked } : x))
    );
  }

  async function loadLogs() {
    const { data } = await adminGetLogs();
    setLogs(data);
    setTab('logs');
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="username-badge">Admin panel</span>
        <nav>
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
          <button className={tab === 'logs'  ? 'active' : ''} onClick={loadLogs}>Logs</button>
        </nav>
        <button onClick={() => navigate(`/users/${user.username}/todos`)}>← Back</button>
      </header>

      {tab === 'users' && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Username</th><th>Name</th><th>Email</th>
              <th>Role</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.blocked ? 'blocked' : ''}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.blocked ? 'Blocked' : 'Active'}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button className={u.blocked ? '' : 'danger'} onClick={() => toggleBlock(u)}>
                      {u.blocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'logs' && (
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>User</th><th>Action</th><th>Date</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.username || '—'}</td>
                <td>{l.action}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4}>No logs.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
