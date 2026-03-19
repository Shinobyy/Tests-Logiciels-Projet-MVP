import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Leboncoin-like</h1>
      <p>Échanges d&apos;articles entre utilisateurs.</p>

      <h2>Navigation</h2>
      <ul>
        <li><Link href="/auth/login">Login</Link></li>
        <li><Link href="/auth/register">Register</Link></li>
        <li><Link href="/articles">Voir les articles</Link></li>
        <li><Link href="/exchanges">Voir mes échanges</Link></li>
      </ul>

      <h2>Comptes de test (mocks)</h2>
      <ul>
        <li>alice@test.com / password123</li>
        <li>bob@test.com / password123</li>
        <li>charlie@test.com / password123</li>
      </ul>
    </main>
  );
}
