import React, { useState, useEffect } from 'react';
import { buildAxios } from '../api/axiosInstance';
import { UserPlusIcon, UserIcon, LockClosedIcon, EnvelopeIcon, PhoneIcon,
  UserCircleIcon, IdentificationIcon
 } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // Limpiar campos al montar el componente
  useEffect(() => {
    setUsername('');
    setPassword('');
    setNombre('');
    setApellido('');
    setEmail('');
    setPhone('');
    setMensaje('');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try { 
      const axios = buildAxios();
      const res = await axios.post('/api/register', {
        username,
        password,
        nombre,
        apellido,
        email,
        phone
      });
      console.log(res.data);
      setMensaje('Usuario registrado exitosamente ✅');
      // Limpiar campos después de un registro exitoso
      setUsername('');
      setPassword('');
      setNombre('');
      setApellido('');
      setEmail('');
      setPhone('');
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 409) {
        setMensaje('El usuario ya existe ❌');
      } else {
        setMensaje('Error al registrar usuario ❌');
      }
    }
  };

  return (
    <form onSubmit={handleRegister} className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="new-password"
          />
        </div>
        <div className="relative">
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <IdentificationIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>
        <div className="relative">
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <UserCircleIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>
        <div className="relative">
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>
        <div className="relative">
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <PhoneIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Telefono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          Crear cuenta
        </button>
      </div>

      {mensaje && (
        <p className={`mt-4 text-center ${mensaje.includes("exitosamente") ? "text-green-500" : "text-red-500"}`}>
          {mensaje}
        </p>
      )}
    </form>
  );
};

export default RegisterForm;
