import React, { useState, useEffect, useCallback } from 'react';
import '../styles/math-test.scss';

const OPS = ['+', '-', '*', '/'];

export default function MathTest({ onCancel }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const generateQuestion = useCallback(() => {
    let a = Math.floor(Math.random() * 99) + 1;
    let b = Math.floor(Math.random() * 99) + 1;
    let op = OPS[Math.floor(Math.random() * OPS.length)];
    
    let correctAnswer;
    if (op === '/') {
      b = Math.floor(Math.random() * 49) + 1; // b from 1 to 49
      const maxMultiplier = Math.floor(99 / b);
      correctAnswer = Math.floor(Math.random() * maxMultiplier) + 1;
      a = b * correctAnswer;
    } else if (op === '+') {
      correctAnswer = a + b;
    } else if (op === '-') {
      if (a < b) [a, b] = [b, a]; 
      correctAnswer = a - b;
    } else {
      // Multiplication within 1-99 for a and b, but keep correctAnswer reasonable if possible
      // or just follow the 1-99 rule strictly
      a = Math.floor(Math.random() * 20) + 1; // Keep it manageable for basic math
      b = Math.floor(Math.random() * 20) + 1;
      correctAnswer = a * b;
    }

    // Generate 3 wrong options
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
      let wrong;
      if (op === '*') {
        wrong = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      } else {
        wrong = correctAnswer + (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
      }
      if (wrong >= 0) options.add(wrong);
    }

    setCurrentQuestion({
      a, b, op, 
      correctAnswer,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    });
    setTimeLeft(10);
    setSelectedOption(null);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isFinished]);

  const handleNext = (chosenOption = null) => {
    if (chosenOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 10);
    }

    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndex(prev => prev + 1);
      generateQuestion();
    } else {
      setIsFinished(true);
    }
  };

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    setTimeout(() => handleNext(option), 500);
  };

  if (isFinished) {
    return (
      <div className="math-test-container result-view">
        <div className="test-card">
          <h2>Test Completed!</h2>
          <div className="score-display">
            <span className="marks">{score}</span>
            <span className="total">/ 100</span>
          </div>
          <p className="feedback">
            {score >= 80 ? 'Excellent!' : score >= 50 ? 'Good Job!' : 'Keep Practicing!'}
          </p>
          <div className="test-actions">
            <button className="restart-btn" onClick={() => {
              setScore(0);
              setCurrentQuestionIndex(0);
              setIsFinished(false);
              generateQuestion();
            }}>Try Again</button>
            <button className="back-btn" onClick={onCancel}>Exit Test</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="math-test-container">
      <div className="test-header">
        <div className="progress">Question {currentQuestionIndex + 1}/10</div>
        <div className={`timer ${timeLeft <= 3 ? 'urgent' : ''}`}>
          Time: {timeLeft}s
        </div>
      </div>
      
      <div className="question-card">
        <div className="expression">
          {currentQuestion.a} {currentQuestion.op === '/' ? '÷' : currentQuestion.op === '*' ? '×' : currentQuestion.op} {currentQuestion.b} = ?
        </div>
        
        <div className="options-grid">
          {currentQuestion.options.map((opt, i) => (
            <button 
              key={i} 
              className={`option-btn ${selectedOption === opt ? (opt === currentQuestion.correctAnswer ? 'correct' : 'wrong') : ''}`}
              onClick={() => handleOptionClick(opt)}
              disabled={selectedOption !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      
      <button className="cancel-test" onClick={onCancel}>Cancel Test</button>
    </div>
  );
}
