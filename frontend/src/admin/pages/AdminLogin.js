import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginAdmin } from '../../api/adminService';

const Container = styled.div`
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: slideUp 0.5s var(--transition);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--radius);
  transition: border var(--transition);
  &:focus {
    border-color: var(--primary);
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius);
  font-size: 1rem;
  transition: background var(--transition);
  &:hover {
    background: #357abd;
  }
`;

const Error = styled.p`
  color: red;
  margin-top: 0.75rem;
  text-align: center;
`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin, setToken } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const { token, admin } = await loginAdmin({ email, password });
      setToken(token);
      setAdmin(admin);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Échec de la connexion');
    }
  };

  return (
    <Container>
      <Title>Admin Login</Title>
      <form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit">Se connecter</Button>
        {error && <Error>{error}</Error>}
      </form>
    </Container>
  );
}
