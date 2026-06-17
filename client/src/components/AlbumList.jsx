import { useState } from 'react';
import { createAlbum, updateAlbum, deleteAlbum, getAlbumPhotos, createPhoto, updatePhoto, deletePhoto } from '../services/api';

const PHOTOS_PAGE_SIZE = 5;

export default function AlbumList({ albums: initial, currentUser }) {
  const [albums, setAlbums] = useState(initial);
  const [newTitle, setNewTitle] = useState('');
  const [openPhotos, setOpenPhotos] = useState({}); // albumId → photos[]
  const [photoHasMore, setPhotoHasMore] = useState({}); // albumId → bool
  const [photoForm, setPhotoForm] = useState({}); // albumId → { title, url, thumbnailUrl }
  const [editAlbumId, setEditAlbumId] = useState(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [editPhotoId, setEditPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');

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

  function startEditAlbum(album) {
    setEditAlbumId(album.id);
    setEditAlbumTitle(album.title);
  }

  async function handleSaveAlbum(id) {
    await updateAlbum(id, { title: editAlbumTitle });
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, title: editAlbumTitle } : a)));
    setEditAlbumId(null);
  }

  function startEditPhoto(photo) {
    setEditPhotoId(photo.id);
    setEditPhotoTitle(photo.title);
  }

  async function handleSavePhoto(albumId, photoId) {
    await updatePhoto(photoId, { title: editPhotoTitle });
    setOpenPhotos((prev) => ({
      ...prev,
      [albumId]: prev[albumId].map((p) => (p.id === photoId ? { ...p, title: editPhotoTitle } : p)),
    }));
    setEditPhotoId(null);
  }

  async function togglePhotos(albumId) {
    if (openPhotos[albumId] !== undefined) {
      setOpenPhotos((prev) => { const c = { ...prev }; delete c[albumId]; return c; });
      setPhotoHasMore((prev) => { const c = { ...prev }; delete c[albumId]; return c; });
      return;
    }
    const { data } = await getAlbumPhotos(albumId, { _limit: PHOTOS_PAGE_SIZE, _start: 0 });
    setOpenPhotos((prev) => ({ ...prev, [albumId]: data }));
    setPhotoHasMore((prev) => ({ ...prev, [albumId]: data.length === PHOTOS_PAGE_SIZE }));
  }

  async function handleLoadMorePhotos(albumId) {
    const current = openPhotos[albumId] || [];
    const { data } = await getAlbumPhotos(albumId, { _limit: PHOTOS_PAGE_SIZE, _start: current.length });
    setOpenPhotos((prev) => ({ ...prev, [albumId]: [...current, ...data] }));
    setPhotoHasMore((prev) => ({ ...prev, [albumId]: data.length === PHOTOS_PAGE_SIZE }));
  }

  function updatePhotoForm(albumId, field, value) {
    setPhotoForm((prev) => ({
      ...prev,
      [albumId]: { ...prev[albumId], [field]: value },
    }));
  }

  async function handleAddPhoto(e, albumId) {
    e.preventDefault();
    const form = photoForm[albumId] || {};
    if (!form.title?.trim() || !form.url?.trim() || !form.thumbnailUrl?.trim()) return;

    const { data } = await createPhoto(albumId, {
      title: form.title.trim(),
      url: form.url.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
    });
    setOpenPhotos((prev) => ({
      ...prev,
      [albumId]: [
        ...prev[albumId],
        { id: data.id, album_id: albumId, title: form.title.trim(), url: form.url.trim(), thumbnail_url: form.thumbnailUrl.trim() },
      ],
    }));
    setPhotoForm((prev) => ({ ...prev, [albumId]: { title: '', url: '', thumbnailUrl: '' } }));
  }

  async function handleDeletePhoto(albumId, photoId) {
    await deletePhoto(photoId);
    setOpenPhotos((prev) => ({
      ...prev,
      [albumId]: prev[albumId].filter((p) => p.id !== photoId),
    }));
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
            {editAlbumId === album.id ? (
              <input
                value={editAlbumTitle}
                onChange={(e) => setEditAlbumTitle(e.target.value)}
                className="edit-input"
              />
            ) : (
              <span>{album.title}</span>
            )}
            <div className="actions">
              <button onClick={() => togglePhotos(album.id)}>
                {openPhotos[album.id] !== undefined ? 'Hide photos' : 'View photos'}
              </button>
              {isOwner(album) && (
                <>
                  {editAlbumId === album.id ? (
                    <button onClick={() => handleSaveAlbum(album.id)}>Save</button>
                  ) : (
                    <button onClick={() => startEditAlbum(album)}>Edit</button>
                  )}
                  <button className="danger" onClick={() => handleDelete(album.id)}>Delete</button>
                </>
              )}
            </div>
            {openPhotos[album.id] !== undefined && (
              <div className="photo-grid">
                {openPhotos[album.id].map((photo) => (
                  <div key={photo.id} className="photo-item">
                    <img src={photo.thumbnail_url} alt={photo.title} />
                    {editPhotoId === photo.id ? (
                      <input
                        value={editPhotoTitle}
                        onChange={(e) => setEditPhotoTitle(e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{photo.title}</span>
                    )}
                    {isOwner(album) && (
                      <>
                        {editPhotoId === photo.id ? (
                          <button onClick={() => handleSavePhoto(album.id, photo.id)}>Save</button>
                        ) : (
                          <button onClick={() => startEditPhoto(photo)}>Edit</button>
                        )}
                        <button className="danger" onClick={() => handleDeletePhoto(album.id, photo.id)}>Delete</button>
                      </>
                    )}
                  </div>
                ))}
                {openPhotos[album.id].length === 0 && <p>No photos.</p>}
                {photoHasMore[album.id] && (
                  <button onClick={() => handleLoadMorePhotos(album.id)} className="load-more-btn">
                    More photos
                  </button>
                )}
                {isOwner(album) && (
                  <form onSubmit={(e) => handleAddPhoto(e, album.id)} className="add-form photo-add-form">
                    <input
                      value={photoForm[album.id]?.title || ''}
                      onChange={(e) => updatePhotoForm(album.id, 'title', e.target.value)}
                      placeholder="Photo title"
                    />
                    <input
                      value={photoForm[album.id]?.url || ''}
                      onChange={(e) => updatePhotoForm(album.id, 'url', e.target.value)}
                      placeholder="Image URL"
                    />
                    <input
                      value={photoForm[album.id]?.thumbnailUrl || ''}
                      onChange={(e) => updatePhotoForm(album.id, 'thumbnailUrl', e.target.value)}
                      placeholder="Thumbnail URL"
                    />
                    <button type="submit">Add photo</button>
                  </form>
                )}
              </div>
            )}
          </li>
        ))}
        {albums.length === 0 && <li className="empty">No albums yet.</li>}
      </ul>
    </div>
  );
}
