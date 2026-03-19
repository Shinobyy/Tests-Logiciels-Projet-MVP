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

    const handleRegister = async (e: { preventDefault: () => void }) => {
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
        <form onSubmit={handleRegister} className="space-y-2">
            <div>
                <label htmlFor="pseudonym" className="mb-1 block text-xs font-bold text-[#c8cbad]">Pseudo</label>
                <input
                    type="text"
                    id="pseudonym"
                    name="pseudonym"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    required
                    className="dofus-input py-1.5 text-sm"
                />
            </div>
            <div>
                <label htmlFor="email" className="mb-1 block text-xs font-bold text-[#c8cbad]">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="dofus-input py-1.5 text-sm"
                />
            </div>
            <div>
                <label htmlFor="password" className="mb-1 block text-xs font-bold text-[#c8cbad]">Mot de passe</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dofus-input py-1.5 text-sm"
                />
            </div>
            {error && <p className="text-xs font-bold text-[#d86f56]">{error}</p>}
            <button type="submit" disabled={isLoading} className="dofus-btn mt-2 w-full disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading ? 'Inscription...' : 'CRÉER'}
            </button>
        </form>

        <p className="mt-3 text-center text-xs text-[#c8cbad]">
            Déjà inscrit ? <Link href="/auth/login" className="font-bold uppercase">Se connecter</Link>
        </p>
    </>
  )
}

export default RegisterForm