import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', correo: '', username: '', password: '' });
  const [captchaValido, setCaptchaValido] = useState(false);
  const [error, setError] = useState('');

  const handleCaptchaChange = (value) => {
    if (value) setCaptchaValido(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaValido) {
      setError('Por favor, completa el ReCAPTCHA de seguridad.');
      return;
    }

    const endpoint = isRegister ? '/auth/registro' : '/auth/login';

    // Armamos explícitamente el objeto con los nombres exactos que espera el Backend
    const payload = isRegister ? {
      nombre: formData.nombre,
      username: formData.username,
      correo: formData.correo,
      password: formData.password
    } : {
      correo: formData.correo,
      password: formData.password
    };

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, payload);
      onLoginSuccess(res.data.token, res.data.usuario);
    } catch (err) {
      // Capturamos el error detallado que responde el servidor o la BD
      const mensajeServidor = err.response?.data?.error || err.response?.data?.mensaje || 'Error en la autenticación';
      setError(mensajeServidor);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/registro`, {
        google_id: credentialResponse.credential,
        correo: `google_user_${Date.now()}@gmail.com`,
        username: `google_user_${Date.now()}`,
        nombre: 'Usuario Google'
      });
      onLoginSuccess(res.data.token, res.data.usuario);
    } catch (err) {
      setError('Error al autenticar con Google');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', background: '#1e1e1e', padding: '30px', borderRadius: '10px' }}>
      <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      {error && <p style={{ color: '#ff4d4d' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              style={{ width: '100%', margin: '8px 0', padding: '10px' }}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              style={{ width: '100%', margin: '8px 0', padding: '10px' }}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </>
        )}
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          style={{ width: '100%', margin: '8px 0', padding: '10px' }}
          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          required
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          style={{ width: '100%', margin: '8px 0', padding: '10px' }}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div style={{ margin: '15px 0' }}>
          <ReCAPTCHA
  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
  onChange={handleCaptchaChange}
  theme="dark"
/>
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#0084ff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isRegister ? 'Registrarse' : 'Entrar'}
        </button>
      </form>

      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <p>O continúa con:</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Falló el login de Google')}
        />
      </div>

      <p style={{ textAlign: 'center', cursor: 'pointer', color: '#0084ff' }} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
      </p>
    </div>
  );
};

export default Login;