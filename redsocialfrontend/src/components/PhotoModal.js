import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PhotoModal = ({ fotoId, onClose }) => {
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/fotografias/${fotoId}`);
        setDetalle(res.data);
      } catch (err) {
        console.error('Error al cargar detalle');
      }
    };
    if (fotoId) cargarDetalle();
  }, [fotoId]);

  if (!detalle) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ float: 'right', background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>X</button>
        <h3>Publicado por @{detalle.fotografia.username}</h3>
        <p>Rostros detectados (face-api.js): <strong>{detalle.fotografia.rostros_detectados}</strong></p>

        <h4>Imagen Original (Resolución Completa - S3):</h4>
        <img src={detalle.fotografia.url_original} alt="Original" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} />

        <h4>Transformaciones Automáticas (AWS Lambda / Sharp):</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {detalle.transformaciones.map((trans, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{trans.tipo_transformacion.replace('_', ' ')}</span>
              <img src={trans.url_transformada} alt={trans.tipo_transformacion} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;