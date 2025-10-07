import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work/break
  const audioRef = useRef(null);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            audioRef.current.play();
            if (mode === 'work') {
              setMode('break');
              setMinutes(5);
            } else {
              setMode('work');
              setMinutes(25);
            }
            setIsActive(false);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Pomodoro Timer</h1>
      
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className={`text-6xl font-mono mb-4 ${mode === 'work' ? 'text-red-500' : 'text-green-500'}`}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-xl font-semibold">
            {mode === 'work' ? 'Temps de travail ⚒️' : 'Pause ☕'}
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className={`${
              isActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white px-6 py-3 rounded-lg text-lg transition`}
          >
            {isActive ? 'Pause' : 'Démarrer'}
          </button>
          
          <button
            onClick={resetTimer}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg transition"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
    </div>
  );
}