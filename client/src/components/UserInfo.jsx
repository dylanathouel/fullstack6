import { useState } from 'react';
import { changePassword, updateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserInfo({ user }) {
  const { updateUserInfo } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name, email: user.email, phone: user.phone || '', website: user.website || '',
  });
  const [editMsg, setEditMsg] = useState('');

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdMsg('');
    try {
      await changePassword(user.id, pwdForm);
      setPwdMsg('Password changed successfully.');
      setPwdForm({ oldPassword: '', newPassword: '' });
      setShowPwd(false);
    } catch (err) {
      setPwdMsg(err.response?.data?.message || 'Error');
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setEditMsg('');
    try {
      await updateUser(user.id, editForm);
      updateUserInfo(editForm);
      setEditMsg('Profile updated successfully.');
      setShowEdit(false);
    } catch (err) {
      setEditMsg(err.response?.data?.message || 'Error');
    }
  }

  return (
    <div className="user-info">
      <h3>My information</h3>
      {!showEdit ? (
        <table>
          <tbody>
            <tr><td>Name</td><td>{user.name}</td></tr>
            <tr><td>Email</td><td>{user.email}</td></tr>
            {user.phone && <tr><td>Phone</td><td>{user.phone}</td></tr>}
            {user.website && <tr><td>Website</td><td>{user.website}</td></tr>}
            <tr><td>Role</td><td>{user.role}</td></tr>
          </tbody>
        </table>
      ) : (
        <form onSubmit={handleSaveProfile} className="auth-form">
          <label>
            Name
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label>
            Website
            <input
              value={editForm.website}
              onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
            />
          </label>
          <button type="submit">Save</button>
        </form>
      )}

      <button onClick={() => setShowEdit((v) => !v)}>
        {showEdit ? 'Cancel' : 'Edit profile'}
      </button>
      {editMsg && <p className="info-msg">{editMsg}</p>}

      <button onClick={() => setShowPwd((v) => !v)}>
        {showPwd ? 'Cancel' : 'Change password'}
      </button>

      {showPwd && (
        <form onSubmit={handleChangePassword} className="auth-form">
          <label>
            Current password
            <input
              type="password"
              value={pwdForm.oldPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, oldPassword: e.target.value }))}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
            />
          </label>
          <button type="submit">Confirm</button>
        </form>
      )}
      {pwdMsg && <p className="info-msg">{pwdMsg}</p>}
    </div>
  );
}
