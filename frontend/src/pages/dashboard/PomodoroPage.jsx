import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody, Button, CircularProgress, Chip } from "@nextui-org/react";
import { IconPlayerPlay, IconPlayerPause, IconRefresh, IconCoffee, IconBrain } from '@tabler/icons-react';

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

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fadeIn">
      <Card className="bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl border-none overflow-visible">
        <CardBody className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[500px] relative">
          {/* Background Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${mode === 'work' ? 'bg-red-500' : 'bg-green-500'}`} />

          <Chip
            variant="shadow"
            color={mode === 'work' ? "danger" : "success"}
            className="mb-8 px-4 py-2 capitalize text-lg"
            startContent={mode === 'work' ? <IconBrain size={20} /> : <IconCoffee size={20} />}
          >
            {mode === 'work' ? 'Temps de Concentration' : 'Pause Café'}
          </Chip>

          <div className="relative mb-8">
            <CircularProgress
              aria-label="Timer Progress"
              size="lg"
              value={progress}
              color={mode === 'work' ? "danger" : "success"}
              showValueLabel={false}
              classNames={{
                svg: "w-64 h-64 md:w-80 md:h-80 drop-shadow-md",
                indicator: "stroke-[8px]",
                track: "stroke-[8px] stroke-white/10",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-6xl md:text-8xl font-mono font-bold tracking-tighter">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-white/50 mt-2 text-sm uppercase tracking-widest">
                {isActive ? 'En cours' : 'En pause'}
              </span>
            </div>
          </div>

          <div className="flex gap-6 z-10">
            <Button
              size="lg"
              color={isActive ? "warning" : (mode === 'work' ? "danger" : "success")}
              variant="shadow"
              onPress={toggleTimer}
              startContent={isActive ? <IconPlayerPause /> : <IconPlayerPlay />}
              className="font-bold min-w-[140px]"
            >
              {isActive ? 'Pause' : 'Démarrer'}
            </Button>

            <Button
              size="lg"
              color="default"
              variant="flat"
              onPress={resetTimer}
              isIconOnly
              aria-label="Reset"
            >
              <IconRefresh />
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="text-center mt-6 text-gray-500 text-sm">
        <p>💡 Astuce : Travaillez 25 minutes, puis faites une pause de 5 minutes.</p>
      </div>

      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
    </div>
  );
}