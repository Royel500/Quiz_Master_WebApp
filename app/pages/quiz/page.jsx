// pages/quiz.js
'use client';
import { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { useRouter } from "next/navigation";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const [availablePool, setAvailablePool] = useState([]);
  const usedIdsRef = useRef(new Set());
  const [round, setRound] = useState(1);
  const [questionsForRound, setQuestionsForRound] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const router = useRouter();

  // User registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    age: '',
    email: '',
    gender: '',
    phone: ''
  });

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          await Swal.fire({ 
            icon: "warning", 
            title: "No questions available", 
            text: "Please add questions in the admin panel first.",
            background: '#1f2937',
            color: 'white',
            confirmButtonColor: '#6366f1'
          });
          setAvailablePool([]);
          setLoading(false);
          return;
        }
        const shuffled = shuffleArray(data);
        setAvailablePool(shuffled);
        
        // Show registration popup after questions are loaded
        setTimeout(() => {
          setShowRegistration(true);
        }, 500);
        
      } catch (err) {
        console.error(err);
        await Swal.fire({ 
          icon: "error", 
          title: "Load failed", 
          text: err.message || "Could not load questions.",
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#6366f1'
        });
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle registration form input changes
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

// Handle registration submission
const handleRegistrationSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!registrationForm.name.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Name Required',
      text: 'Please enter your name to continue.',
      background: '#1f2937',
      color: 'white',
      confirmButtonColor: '#6366f1'
    });
    return;
  }

  const ageNum = Number(registrationForm.age);
  if (!registrationForm.age || Number.isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
    Swal.fire({
      icon: 'warning',
      title: 'Valid Age Required',
      text: 'Please enter a valid age between 5 and 100.',
      background: '#1f2937',
      color: 'white',
      confirmButtonColor: '#6366f1'
    });
    return;
  }

  // disable repeated submits
  setIsSubmitting(true);

  try {
    // POST to /api/users (app router route: app/api/users/route.js)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationForm),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = data?.message || 'Failed to save user. Try again.';
      throw new Error(msg);
    }

    // success: data.user should contain the saved user
    setUserInfo(data.user ?? registrationForm); // fallback to local form if server didn't return user
    setShowRegistration(false);

    // Prepare the first round (draw without replacement)
    prepareRoundWithoutReplacement(1, availablePool);

    // Show welcome message
    await Swal.fire({
      icon: 'success',
      title: `Welcome, ${data.user?.name ?? registrationForm.name}!`,
      text: 'Get ready for the quiz challenge!',
      timer: 1800,
      showConfirmButton: false,
      background: '#1f2937',
      color: 'white'
    });
  } catch (err) {
    console.error("Registration save failed:", err);
    Swal.fire({
      icon: 'error',
      title: 'Save failed',
      text: err.message || 'Could not save your info. Try again.',
      background: '#1f2937',
      color: 'white',
      confirmButtonColor: '#6366f1'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  function drawWithoutReplacement(count, pool) {
    const p = [...pool];
    const picked = p.splice(0, count);
    return { picked, remainingPool: p };
  }

  function prepareRoundWithoutReplacement(roundNumber, pool = availablePool) {
    const unusedCount = pool.length;
    if (unusedCount < roundNumber) {
      Swal.fire({
        icon: "info",
        title: "Not enough questions",
        html: `There are only <strong>${unusedCount}</strong> unused question(s) left but round <strong>${roundNumber}</strong> needs <strong>${roundNumber}</strong>.`,
        showCancelButton: true,
        confirmButtonText: "Start Over",
        cancelButtonText: "See Results",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280'
      }).then(result => {
        if (result.isConfirmed) {
          restartAll();
        } else {
          setEnded(true);
        }
      });
      return;
    }


    const { picked, remainingPool } = drawWithoutReplacement(roundNumber, pool);
    picked.forEach(q => usedIdsRef.current.add(q._id));
    setAvailablePool(remainingPool);
    setRound(roundNumber);
    setQuestionsForRound(picked);
    setQIndex(0);
    setSelected(null);
  }

  async function handleSelect(idx) {
    if (selected !== null || isSubmitting) return;
    
    setIsSubmitting(true);
    setSelected(idx);

    const q = questionsForRound[qIndex];
    const chosen = q.options[idx];
    const correctIdx = q.options.findIndex(o => !!o.isCorrect);
    const correctOption = q.options[correctIdx];

    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (chosen?.isCorrect) {
      setTotalCorrect(c => c + 1);
      await Swal.fire({
        icon: 'success',
        title: 'Correct! 🎉',
        html: `<div style="font-weight:600; color: #10b981; font-size: 1.1rem">${chosen.text}</div><div style="margin-top:12px; color: #d1d5db">Well done! Moving to next question...</div>`,
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#1f2937',
        color: 'white'
      });

      if (qIndex + 1 < questionsForRound.length) {
        setQIndex(i => i + 1);
        setSelected(null);
      } else {
        await onRoundComplete();
      }
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Wrong Answer ❌',
        html: `<div style="color: #ef4444; margin-bottom: 12px;">You chose: <strong>${chosen?.text ?? '—'}</strong></div>
               <div style="color: #10b981;">Correct answer: <strong>${correctOption?.text ?? '—'}</strong></div>`,
        confirmButtonText: 'Continue',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#6366f1'
      });
      setEnded(true);
    }
    setIsSubmitting(false);
  }

  async function onRoundComplete() {
    const result = await Swal.fire({
      title: `🎊 Round ${round} Complete!`,
      html: `<div style="margin-top:12px; color: #d1d5db">You answered all <strong style="color: #10b981">${round}</strong> questions correctly.</div>
             <div style="margin-top:8px; color: #d1d5db">Total correct so far: <strong style="color: #3b82f6">${totalCorrect}</strong></div>`,
      icon: 'success',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Next Round →',
      denyButtonText: '🔄 Retry Round',
      cancelButtonText: '🏠 Home',
      showCloseButton: true,
      allowOutsideClick: false,
      background: '#1f2937',
      color: 'white',
      confirmButtonColor: '#6366f1',
      denyButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      const nextRound = round + 1;
      if (availablePool.length < nextRound) {
        await Swal.fire({
          icon: 'info',
          title: 'Not enough questions',
          html: `Only <strong>${availablePool.length}</strong> unused question(s) remain but next round needs <strong>${nextRound}</strong>.`,
          confirmButtonText: 'Start Over',
          showCancelButton: true,
          cancelButtonText: 'See Results',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#6366f1',
          cancelButtonColor: '#6b7280'
        }).then(async r => {
          if (r.isConfirmed) {
            restartAll();
          } else {
            setEnded(true);
          }
        });
        return;
      }
      prepareRoundWithoutReplacement(nextRound);
    } else if (result.isDenied) {
      const currentRoundQuestions = questionsForRound;
      const newPool = [...currentRoundQuestions, ...availablePool];
      currentRoundQuestions.forEach(q => usedIdsRef.current.delete(q._id));
      setAvailablePool(newPool);
      prepareRoundWithoutReplacement(round, newPool);
    } else {
      router.push("/");
    }
  }

  function restartAll() {
    // Reset user info and show registration again
    setUserInfo(null);
    setShowRegistration(true);
    setRegistrationForm({
      name: '',
      age: '',
      email: '',
      gender: '',
      phone: ''
    });
    // Reload questions
    window.location.reload();
  }

  // Calculate performance metrics
  const calculatePerformance = () => {
    const totalAnswered = totalCorrect + (ended ? 1 : 0);
    const successRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    const baseScore = totalCorrect * 10;
    const roundBonus = round * 5;
    const totalScore = baseScore + roundBonus;
    
    let performanceLevel = "Beginner";
    let performanceColor = "text-yellow-400";
    
    if (totalScore >= 100) {
      performanceLevel = "Expert";
      performanceColor = "text-purple-400";
    } else if (totalScore >= 70) {
      performanceLevel = "Advanced";
      performanceColor = "text-green-400";
    } else if (totalScore >= 40) {
      performanceLevel = "Intermediate";
      performanceColor = "text-blue-400";
    }

    return {
      totalAnswered,
      successRate,
      totalScore,
      performanceLevel,
      performanceColor,
      baseScore,
      roundBonus
    };
  };

  // Registration Popup Component
  const RegistrationPopup = () => (
    <div className=" inset-0 scroll-auto  backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Quiz Master! 🎯</h2>
          <p className="text-indigo-200">Please register to start your quiz challenge</p>
        </div>

        <form onSubmit={handleRegistrationSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={registrationForm.name}
              onChange={handleRegistrationChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Age *</label>
              <input
                type="number"
                name="age"
                value={registrationForm.age}
                onChange={handleRegistrationChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Age"
                min="5"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Gender</label>
              <select
                name="gender"
                value={registrationForm.gender}
                onChange={handleRegistrationChange}
                className="w-full border border-white/20 rounded-xl px-4 py-3
                 text-white bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={registrationForm.email}
              onChange={handleRegistrationChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={registrationForm.phone}
              onChange={handleRegistrationChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="+1 (555) 000-0000"
            />
          </div>
         <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:scale-105 transform transition duration-200"
          >
            Start Quiz Challenge 🚀
          </button>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-indigo-200 text-sm">Your information is secure and will not be shared</span>
            </div>
          </div>

 
        </form>
      </div>
    </div>
  );


  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading quiz questions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show registration popup if not registered
  if (showRegistration) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <RegistrationPopup />
        </div>
      </Layout>
    );
  }

  if (!questionsForRound || questionsForRound.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Questions Available</h2>
            <p className="text-indigo-100 mb-6">Please add some questions in the admin panel to start the quiz.</p>
            <button 
              onClick={() => router.push("/pages/admin")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transform transition"
            >
              Go to Admin Panel
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (ended) {
    const performance = calculatePerformance();
    
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
            {/* User Info Header */}
            {userInfo && (
              <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">{userInfo.name}</div>
                    <div className="text-indigo-200 text-sm">
                      {userInfo.age} years • {userInfo.gender || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Rest of the summary remains the same */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m1 8H6a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-2">Quiz Complete! 🎯</h2>
              <p className="text-indigo-200 text-lg">Here's your performance summary</p>
            </div>

            {/* Performance Level */}
            <div className="mb-8">
              <div className={`text-2xl font-bold ${performance.performanceColor} mb-2`}>
                {performance.performanceLevel}
              </div>
              <div className="text-5xl font-bold text-white mb-2">{performance.totalScore}</div>
              <div className="text-indigo-200">Total Points</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{round}</div>
                <div className="text-indigo-200 text-sm">Round Reached</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-2xl font-bold text-green-400">{totalCorrect}</div>
                <div className="text-indigo-200 text-sm">Correct Answers</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-2xl font-bold text-yellow-400">{performance.successRate}%</div>
                <div className="text-indigo-200 text-sm">Success Rate</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-2xl font-bold text-blue-400">{performance.totalAnswered}</div>
                <div className="text-indigo-200 text-sm">Total Answered</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={restartAll}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-xl font-semibold hover:scale-105 transform transition text-lg"
              >
                🎮 Play Again
              </button>
              <button 
                onClick={() => router.push("/")}
                className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/20 transition text-lg"
              >
                🏠 Back to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questionsForRound[qIndex];

  return (
    <Layout>
      {/* User Info Bar */}
      {userInfo && (
        <div className="bg-white/10 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Welcome, {userInfo.name}</div>
                  <div className="text-indigo-200 text-xs">
                    Round {round} • Question {qIndex + 1}/{questionsForRound.length}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-lg">Correct :{totalCorrect}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-indigo-200 text-sm">Current Round</div>
              <div className="text-3xl font-bold text-white">{round}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-indigo-200 text-sm">Progress</div>
              <div className="text-3xl font-bold text-white">{qIndex + 1}<span className="text-lg text-indigo-200">/{questionsForRound.length}</span></div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-indigo-200 text-sm">Total Correct</div>
              <div className="text-3xl font-bold text-green-400">{totalCorrect}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span>Round Progress</span>
              <span>{Math.round(((qIndex + 1) / questionsForRound.length) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((qIndex + 1) / questionsForRound.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl mb-6">
            {/* Question Display - FIXED */}
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion?.text || "Question text not available"}
                </h2>
                {currentQuestion.category && (
                  <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-indigo-200 text-sm mt-3 border border-white/10">
                    Category: {currentQuestion.category}
                  </div>
                )}
              </div>
            </div>

            {/* MCQ Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options && currentQuestion.options.map((option, index) => {
                const optionNumber = index + 1;
                const isSelected = selected === index;
                const isCorrect = option.isCorrect;
                
                let optionStyle = "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30";
                let textStyle = "text-white";
                let numberStyle = "bg-white/10 text-white";
                
                if (isSelected) {
                  if (isCorrect) {
                    optionStyle = "bg-green-500/20 border-green-400 ring-2 ring-green-400/30";
                    textStyle = "text-green-100";
                    numberStyle = "bg-green-500 text-white";
                  } else {
                    optionStyle = "bg-red-500/20 border-red-400 ring-2 ring-red-400/30";
                    textStyle = "text-red-100";
                    numberStyle = "bg-red-500 text-white";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={selected !== null || isSubmitting}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${optionStyle} ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${numberStyle}`}>
                        {optionNumber}
                      </div>
                      <span className={`font-medium ${textStyle}`}>
                        {option.text || `Option ${optionNumber}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Help */}
            <div className="mt-6 text-center">
              <p className="text-indigo-200 text-sm">
                {selected === null 
                  ? "Select your answer above" 
                  : isSubmitting 
                    ? "Checking answer..." 
                    : "Processing..."}
              </p>
            </div>
          </div>

          {/* Game Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-indigo-200 text-sm">Round {round} • Question {qIndex + 1} of {questionsForRound.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


