import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', phone: '', website: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await register(form);
      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration error');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username *
          <input name="username" value={form.username} onChange={handleChange} autoFocus required />
        </label>
        <label>
          Full name *
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email *
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password *
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Website
          <input name="website" value={form.website} onChange={handleChange} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
