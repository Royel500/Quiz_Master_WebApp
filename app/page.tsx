// pages/index.js
'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Layout from './components/Layout';

export default function Home(){
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      {/* Enhanced Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                <span className="text-sm text-white/90 font-medium">Live Quiz Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                Master Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Knowledge</span>
              </h1>
              
              <p className="mt-6 text-xl text-indigo-100 max-w-2xl leading-relaxed">
                Challenge yourself with progressive rounds that test your limits. 
                Each level demands more precision — one wrong answer resets your progress. 
                How far can you go?
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/pages/quiz" 
                  className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                    activeLink === 'quiz' 
                      ? 'bg-white text-indigo-700 ring-4 ring-white/30 underline underline-offset-4' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/25'
                  }`}
                  onClick={() => setActiveLink('quiz')}
                >
                  <span>Start Quiz Challenge</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <Link 
                  href="/pages/admin" 
                  className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold border-2 transition-all duration-300 transform hover:scale-105 ${
                    activeLink === 'admin'
                      ? 'bg-white/30 border-white/40 text-white underline underline-offset-4 ring-4 ring-white/20'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                  }`}
                  onClick={() => setActiveLink('admin')}
                >
                  <span>Admin Dashboard</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>

              {/* Feature Tags */}
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/90 text-sm font-medium">4 options per question</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/90 text-sm font-medium">Round-based difficulty</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/90 text-sm font-medium">No-repeat questions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Enhanced Stats Card */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-white/70 text-sm uppercase tracking-wider">Current Round</div>
                    <div className="text-4xl font-bold text-white mt-1">1</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/70 text-sm uppercase tracking-wider">Top Score</div>
                    <div className="text-4xl font-bold text-white mt-1">—</div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="flex justify-between text-white/70 text-sm mb-2">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full w-0 transition-all duration-1000"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m1 8H6a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Round Mechanics</div>
                      <div className="text-white/60 text-sm">Round N requires N correct answers</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-white/70 text-sm">Questions per round</div>
                    <div className="text-xl font-bold text-white">1 → ∞</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-white/70 text-sm">Options</div>
                    <div className="text-xl font-bold text-white">4</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full blur-xl opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-400 rounded-full blur-xl opacity-60 animate-bounce animation-delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </header>

      {/* Enhanced Features Section */}
      <main className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A unique quiz experience designed to push your knowledge to the limits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 transform hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Progressive Rounds</h3>
                <p className="text-gray-600 leading-relaxed">
                  Each round increases the challenge. Start with 1 question, then 2, then 3... 
                  The difficulty scales with your success.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl shadow-xl p-8 transform hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-400 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">One Mistake Ends Run</h3>
                <p className="text-gray-600 leading-relaxed">
                  Precision is everything. A single incorrect answer resets your progress — 
                  perfect for competitive challenge modes that test true mastery.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl shadow-xl p-8 transform hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l3 10 4-18 3 8h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No-Repeats</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every question is unique to your session. No repeats means you're constantly 
                  facing new challenges and expanding your knowledge base.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <section className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to test your knowledge?
                </h4>
                <p className="text-indigo-100 text-lg max-w-2xl">
                  Join thousands of players mastering their skills through our progressive quiz system.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/pages/quiz" 
                  className={`px-8 py-4 rounded-2xl font-bold text-center transition-all duration-300 transform hover:scale-105 ${
                    activeLink === 'quiz' 
                      ? 'bg-white text-indigo-700 ring-4 ring-white/30 underline underline-offset-4' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/25'
                  }`}
                  onClick={() => setActiveLink('quiz')}
                >
                  Start Quiz Now
                </Link>
                <Link 
                  href="/pages/admin" 
                  className={`px-8 py-4 rounded-2xl font-bold text-center border-2 transition-all duration-300 transform hover:scale-105 ${
                    activeLink === 'admin'
                      ? 'bg-white/30 border-white/40 text-white underline underline-offset-4 ring-4 ring-white/20'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  onClick={() => setActiveLink('admin')}
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="text-lg font-semibold">Quiz Master</div>
          </div>
          <p className="text-gray-400">Built with ❤️ using Next.js and Tailwind CSS</p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-400">
            <span>© 2024 Quiz Master</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </Layout>
  );
}