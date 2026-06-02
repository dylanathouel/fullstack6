import { useState } from 'react';
import { createAlbum, deleteAlbum, getAlbumPhotos } from '../services/api';

export default function AlbumList({ albums: initial, currentUser }) {
  const [albums, setAlbums] = useState(initial);
  const [newTitle, setNewTitle] = useState('');
  const [openPhotos, setOpenPhotos] = useState({}); // albumId → photos[]

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { data } = await createAlbum({ title: newTitle.trim() });
    setAlbums((prev) => [
      ...prev,
      { id: data.id, user_id: currentUser.id, title: newTitle.trim() },
    ]);
    setNewTitle('');
  }

  async function handleDelete(id) {
    await deleteAlbum(id);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setOpenPhotos((prev) => { const c = { ...prev }; delete c[id]; return c; });
  }

  async function togglePhotos(albumId) {
    if (openPhotos[albumId] !== undefined) {
      setOpenPhotos((prev) => { const c = { ...prev }; delete c[albumId]; return c; });
      return;
    }
    const { data } = await getAlbumPhotos(albumId);
    setOpenPhotos((prev) => ({ ...prev, [albumId]: data }));
  }

  const isOwner = (album) => album.user_id === currentUser.id;

  return (
    <div className="list-container">
      <h2>Albums</h2>
      <form onSubmit={handleAdd} className="add-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New album name…"
        />
        <button type="submit">Create</button>
      </form>
      <ul className="album-list">
        {albums.map((album) => (
          <li key={album.id} className="album-item">
            <span>{album.title}</span>
            <div className="actions">
              <button onClick={() => togglePhotos(album.id)}>
                {openPhotos[album.id] !== undefined ? 'Hide photos' : 'View photos'}
              </button>
              {isOwner(album) && (
                <button className="danger" onClick={() => handleDelete(album.id)}>Delete</button>
              )}
            </div>
            {openPhotos[album.id] !== undefined && (
              <div className="photo-grid">
                {openPhotos[album.id].map((photo) => (
                  <div key={photo.id} className="photo-item">
                    <img src={photo.thumbnail_url} alt={photo.title} />
                    <span>{photo.title}</span>
                  </div>
                ))}
                {openPhotos[album.id].length === 0 && <p>No photos.</p>}
              </div>
            )}
          </li>
        ))}
        {albums.length === 0 && <li className="empty">No albums yet.</li>}
      </ul>
    </div>
  );
}
