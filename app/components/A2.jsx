// components/A2.js
'use client'
import React from "react";

export default function A2({ question, onSelect, selectedIndex }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3">{question.text}</h3>
      <div className="space-y-2">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-full text-left border rounded p-2 hover:bg-gray-50 transition ${
              selectedIndex === idx ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
