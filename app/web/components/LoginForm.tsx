"use client"
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import React, { useState } from 'react'

function LoginForm() {
    const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    login({ email, password })
        .then(() => {
            setError(null);
            redirect('/articles');
        })
        .catch(() => {
            setError("Invalid email or password");
        });
  }

  return (
    <form onSubmit={handleLogin}>
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

export default LoginForm