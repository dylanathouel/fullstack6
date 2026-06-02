import { useState } from 'react';
import { changePassword } from '../services/api';

export default function UserInfo({ user }) {
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState('');

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

  return (
    <div className="user-info">
      <h3>My information</h3>
      <table>
        <tbody>
          <tr><td>Name</td><td>{user.name}</td></tr>
          <tr><td>Email</td><td>{user.email}</td></tr>
          {user.phone && <tr><td>Phone</td><td>{user.phone}</td></tr>}
          {user.website && <tr><td>Website</td><td>{user.website}</td></tr>}
          <tr><td>Role</td><td>{user.role}</td></tr>
        </tbody>
      </table>

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
