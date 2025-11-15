// pages/quiz.js
'use client';
import { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";

import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import A2 from "../../components/A2";
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
  const [availablePool, setAvailablePool] = useState([]); // questions remaining (unused)
  const usedIdsRef = useRef(new Set()); // IDs used in this run
  const [round, setRound] = useState(1); // current round (1..)
  const [questionsForRound, setQuestionsForRound] = useState([]); // current round's questions (length == round)
  const [qIndex, setQIndex] = useState(0); // index within current round
  const [selected, setSelected] = useState(null);
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          await Swal.fire({ icon: "warning", title: "No questions", text: "No questions available in the database." });
          setAvailablePool([]);
          setLoading(false);
          return;
        }
        // shuffle and set pool
        const shuffled = shuffleArray(data);
        setAvailablePool(shuffled);
        // prepare first round (needs 1 question)
        prepareRoundWithoutReplacement(1, shuffled);
      } catch (err) {
        console.error(err);
        await Swal.fire({ icon: "error", title: "Load failed", text: err.message || "Could not load questions." });
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw `count` questions without replacement from availablePool.
  // It returns { picked, remainingPool }.
  function drawWithoutReplacement(count, pool) {
    const p = [...pool];
    const picked = p.splice(0, count); // pool is pre-shuffled
    return { picked, remainingPool: p };
  }

  // Prepare a round of `roundNumber` questions, ensuring they are removed from availablePool
  function prepareRoundWithoutReplacement(roundNumber, pool = availablePool) {
    // Check we have enough unused questions
    const unusedCount = pool.length;
    if (unusedCount < roundNumber) {
      // not enough unique questions left
      Swal.fire({
        icon: "info",
        title: "Not enough questions",
        html: `There are only <strong>${unusedCount}</strong> unused question(s) left but round <strong>${roundNumber}</strong> needs <strong>${roundNumber}</strong>.`,
        showCancelButton: true,
        confirmButtonText: "Start Over",
        cancelButtonText: "See Results",
      }).then(result => {
        if (result.isConfirmed) {
          // restart full run
          restartAll();
        } else {
          // end game and show results
          setEnded(true);
        }
      });
      return;
    }

    // draw questions for the round
    const { picked, remainingPool } = drawWithoutReplacement(roundNumber, pool);
    // mark their ids as used
    picked.forEach(q => usedIdsRef.current.add(q._id));
    // update pool to remaining (so they aren't used again)
    setAvailablePool(remainingPool);
    // set the round questions
    setRound(roundNumber);
    setQuestionsForRound(picked);
    setQIndex(0);
    setSelected(null);
  }

  async function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);

    const q = questionsForRound[qIndex];
    const chosen = q.options[idx];
    const correctIdx = q.options.findIndex(o => !!o.isCorrect);
    const correctOption = q.options[correctIdx];

    if (chosen?.isCorrect) {
      setTotalCorrect(c => c + 1);
      await Swal.fire({
        icon: 'success',
        title: 'Correct!',
        html: `<div style="font-weight:600">${chosen.text}</div><div style="margin-top:8px">Good — continuing...</div>`,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        backdrop: 'rgba(0,123,255,0.08)'
      });

      // next question or finish round
      if (qIndex + 1 < questionsForRound.length) {
        setQIndex(i => i + 1);
        setSelected(null);
      } else {
        // completed round
        await onRoundComplete();
      }
    } else {
      // wrong answer
      await Swal.fire({
        icon: 'error',
        title: 'Wrong answer',
        html: `<div>You chose: <strong>${chosen?.text ?? '—'}</strong></div>
               <div style="margin-top:8px">Correct answer: <strong>${correctOption?.text ?? '—'}</strong></div>`,
        confirmButtonText: 'OK',
        backdrop: 'rgba(0,0,0,0.6)'
      });
      setEnded(true);
    }
  }

  async function onRoundComplete() {
    const result = await Swal.fire({
      title: `Round ${round} complete!`,
      html: `<div style="margin-top:8px">You answered all <strong>${round}</strong> questions correctly.</div>
             <div style="margin-top:6px">Total correct so far: <strong>${totalCorrect}</strong></div>`,
      icon: 'success',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Next Round',
      denyButtonText: 'Retry Round',
      cancelButtonText: 'Home',
      showCloseButton: true,
      allowOutsideClick: false,
      backdrop: 'rgba(0,0,0,0.6)'
    });

    if (result.isConfirmed) {
      // Next round: check if pool has enough for round+1 and then draw without replacement
      const nextRound = round + 1;
      // ensure we have enough questions left
      if (availablePool.length < nextRound) {
        await Swal.fire({
          icon: 'info',
          title: 'Not enough questions for next round',
          html: `Only <strong>${availablePool.length}</strong> unused question(s) remain but next round needs <strong>${nextRound}</strong>.`,
          confirmButtonText: 'Start Over',
          showCancelButton: true,
          cancelButtonText: 'See Results'
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
      // Retry same round: we need to re-draw `round` questions without replacement. BUT those questions were already removed from pool.
      // We'll reconstruct: put the previously used questions for this round back to the front of pool so we can draw a fresh set.
      // Simpler approach: reload initial DB and reset used set (but user asked no repeats across run).
      // For safety and simplicity here, we'll re-add the questions for this round back to the front of availablePool,
      // remove their IDs from usedIdsRef, then draw for the same round number anew.
      const currentRoundQuestions = questionsForRound;
      // Put them back to pool front (so they can be re-used)
      const newPool = [...currentRoundQuestions, ...availablePool];
      // remove their ids from used set
      currentRoundQuestions.forEach(q => usedIdsRef.current.delete(q._id));
      setAvailablePool(newPool);
      prepareRoundWithoutReplacement(round, newPool);
    } else {
      // Cancel -> Home
      router.push("/");
    }
  }

  function restartAll() {
    // full restart: re-fetch or reshuffle all questions.
    // Easiest: just reload page to get fresh pool from server
    // But we'll implement client-side restart using current availablePool + usedIdsRef
    // For full fresh set, reload the app
    window.location.reload();
  }

  if (loading) return <Layout><div className="p-6 text-center">Loading quiz...</div></Layout>;
  if (!questionsForRound || questionsForRound.length === 0) return <Layout><div className="p-6 text-center">No questions available.</div></Layout>;

  if (ended) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto text-center p-8">
          <h2 className="text-2xl font-bold">Game Over</h2>
          <p className="mt-4">You reached round <strong>{round}</strong> and answered <strong>{totalCorrect}</strong> questions correctly in total.</p>
          <div className="mt-6 space-x-2">
            <button onClick={() => {
              // Retry same round: put previous round questions back and prepare round again
              // For simplicity, restart the whole run so uniqueness constraint is reset
              restartAll();
            }} className="px-4 py-2 border rounded">Start Over</button>
            <button onClick={() => router.push("/")} className="px-4 py-2 border rounded">Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questionsForRound[qIndex];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <p className="text-sm">Round <strong>{round}</strong></p>
            <p className="text-sm text-gray-600">Question {qIndex + 1} of {questionsForRound.length}</p>
          </div>
          <div className="text-sm">Total correct: <strong>{totalCorrect}</strong></div>
        </div>

        <A2 question={currentQuestion} onSelect={handleSelect} selectedIndex={selected} />
      </div>
    </Layout>
  );
}