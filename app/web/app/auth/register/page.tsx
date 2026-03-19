import RegisterForm from '@/components/RegisterForm'
import React from 'react'

function Register() {
  return (
    <main className="dofus-page flex items-center justify-center">
      <section className="w-full max-w-sm rounded-sm border-2 border-[#434739] bg-linear-to-b from-[#2c3127] to-[#1a1e17] p-4 shadow-[inset_0_0_0_1px_rgba(120,130,90,0.25)]">
        <div className="mb-3 rounded-sm border-2 border-[#4f5341] bg-[#161a14] px-3 py-2 text-center shadow-inner">
          <p className="text-3xl font-bold uppercase tracking-wide text-[#f5c81a]">LeBonExchange</p>
          <p className="mt-1 text-xs font-bold uppercase text-[#c8cbad]">Inscription échange de livres</p>
        </div>
        <RegisterForm />
      </section>
    </main>
  )
}

export default Register