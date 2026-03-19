"use client"
import { register } from '@/services/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

function RegisterForm() {
  const router = useRouter();

  const [pseudonym, setPseudonym] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await register({ email, password, pseudonym });
        setError(null);
        router.push('/auth/login');
    } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
        setError(message);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
        <form onSubmit={handleRegister}>
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
            <button type="submit" disabled={isLoading}>{isLoading ? 'Inscription...' : 'Register'}</button>
        </form>

        <p>
            Déjà inscrit ? <Link href="/auth/login">Se connecter</Link>
        </p>
    </>
  )
}

export default RegisterForm