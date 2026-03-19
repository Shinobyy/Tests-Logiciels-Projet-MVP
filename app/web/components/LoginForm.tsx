"use client"
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await login({ email, password });
        setError(null);
        router.push('/articles');
    } catch {
        setError("Invalid email or password");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
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
            <button type="submit" disabled={isLoading}>{isLoading ? 'Connexion...' : 'Login'}</button>
        </form>

        <p>
            Pas encore de compte ? <Link href="/auth/register">Créer un compte</Link>
        </p>
    </>
  )
}

export default LoginForm