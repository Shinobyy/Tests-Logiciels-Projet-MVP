"use client"
import { useAuth } from '@/context/AuthContext';
import { register } from '@/services/auth';
import { redirect } from 'next/navigation';
import React, { useState } from 'react'

function RegisterForm() {

  const [pseudonym, setPseudonym] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    register({ email, password, pseudonym })
        .then(() => {
            setError(null);
            redirect('/login');
        })
        .catch(() => {
            setError("Registration failed. Please try again.");
        });
  }

  return (
    <form onSubmit={handleLogin}>
        <div>
            <label htmlFor="pseudonym">Pseudonym:</label>
            <input 
                type="text"
                id="pseudonym"
                name="pseudonym"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                required
            />
        </div>
        <div>
            <label htmlFor="email">Email:</label>
            <input 
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
        </div>
        <div>
            <label htmlFor="password">Password:</label>
            <input 
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
        </div>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button type="submit">Login</button>
    </form>
  )
}

export default RegisterForm