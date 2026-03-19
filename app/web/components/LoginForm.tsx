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

    const handleLogin = async (e: { preventDefault: () => void }) => {
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
        <form onSubmit={handleLogin} className="space-y-2">
            <div>
                <label htmlFor="email" className="mb-1 block text-xs font-bold text-[#c8cbad]">Nom de compte</label>
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
                {isLoading ? 'Connexion...' : 'SE CONNECTER'}
            </button>
        </form>

        <p className="mt-3 text-center text-xs text-[#c8cbad]">
            Pas encore de compte ? <Link href="/auth/register" className="font-bold uppercase">Créer un compte</Link>
        </p>
    </>
  )
}

export default LoginForm