import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const DoctorAuthContext = createContext();

export const DoctorAuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    const doctorData = localStorage.getItem('doctorData');
    if (token && doctorData) {
      setDoctor(JSON.parse(doctorData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/doctor-auth/login', { email, password });
    localStorage.setItem('doctorToken', res.data.token);
    localStorage.setItem('doctorData', JSON.stringify(res.data.doctor));
    setDoctor(res.data.doctor);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData');
    setDoctor(null);
  };

  return (
    <DoctorAuthContext.Provider value={{ doctor, login, logout, loading }}>
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = () => useContext(DoctorAuthContext);