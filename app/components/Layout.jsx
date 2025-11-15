// components/Layout.js
'use client'

import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_SITE_TITLE || "Quiz App"}</h1>
          <nav className="space-x-4">
            <Link href="/">Home</Link>
            <Link href="/pages/quiz">Take Quiz</Link>
            <Link href="/pages/admin">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
