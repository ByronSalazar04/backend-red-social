import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PhotoModal from './components/PhotoModal';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [fotografias, setFotografias] = useState([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    cargarFotografias();
  }, []);

  const cargarFotografias = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/fotografias`);
      setFotografias(res.data.fotografias);
    } catch (err) {
      console.error('Error al cargar fotos');
    }
  };

  const handleLoginSuccess = (tokenRecibido, usuarioRecibido) => {
    setToken(tokenRecibido);
    setUsuario(usuarioRecibido);
    localStorage.setItem('token', tokenRecibido);
    localStorage.setItem('usuario', JSON.stringify(usuarioRecibido));
  };

  const handleLogout = () => {
    setToken('');
    setUsuario(null);
    localStorage.clear();
  };

  const handleSubirFoto = async (e) => {
    e.preventDefault();
    if (!archivo) return;

    setSubiendo(true);
    const formData = new FormData();
    formData.append('imagen', archivo);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/fotografias`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setArchivo(null);
      setSubiendo(false);
      cargarFotografias();
    } catch (err) {
      alert('Error al subir la fotografía');
      setSubiendo(false);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h2>Instagram Cloud App</h2>
        <div>
          <span>Hola, <strong>{usuario?.nombre}</strong></span>
          <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '8px 12px', background: '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <section style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Subir Nueva Fotografía</h3>
        <form onSubmit={handleSubirFoto} style={{ display: 'flex', gap: '10px' }}>
          <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0])} required />
          <button type="submit" disabled={subiendo} style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {subiendo ? 'Procesando en S3...' : 'Subir Foto'}
          </button>
        </form>
      </section>

      <main>
        <h3>Galería de Fotografías</h3>
        <div className="grid-photos">
          {fotografias.map((foto) => (
            <div key={foto.id} className="card-photo" onClick={() => setFotoSeleccionada(foto.id)}>
              <img src={foto.url_miniatura || foto.url_original} alt="Miniatura" />
              <div style={{ padding: '10px' }}>
                <small>Por @{foto.username}</small>
              </div>
            </div>
          ))}
        </div>
      </main>

      {fotoSeleccionada && (
        <PhotoModal fotoId={fotoSeleccionada} onClose={() => setFotoSeleccionada(null)} />
      )}
    </div>
  );
}

export default App;