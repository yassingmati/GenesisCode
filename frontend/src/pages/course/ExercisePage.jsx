import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Spinner,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Link
} from "@nextui-org/react";
import {
  IconArrowLeft,
  IconCheck,
  IconCode,
  IconListCheck,
  IconBrain,
  IconAbc,
  IconTrophy,
  IconPlayerPlay
} from '@tabler/icons-react';
import { getApiUrl } from '../../utils/apiConfig';

const API_BASE = getApiUrl('/api/courses');

export default function ExercisePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const res = await fetch(`${API_BASE}/levels/${levelId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!res.ok) throw new Error('Impossible de charger le niveau');
        const data = await res.json();
        setLevel(data);

        // Load progress from backend API
        if (userId && token) {
          try {
            const progressRes = await fetch(`${API_BASE}/users/${userId}/levels/${levelId}/progress`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (progressRes.ok) {
              const progressData = await progressRes.json();
              console.log('Progress API Response:', progressData); // Debug log

              // Transform backend data to match frontend structure
              // API returns: { exerciseProgresses: { exerciseId: { completed, xp, ... } } }
              const completed = {};
              if (progressData.exerciseProgresses) {
                Object.entries(progressData.exerciseProgresses).forEach(([exerciseId, progress]) => {
                  completed[exerciseId] = {
                    completed: progress.completed,
                    pointsEarned: progress.pointsEarned,
                    pointsMax: progress.pointsMax
                  };
                });
              }
              console.log('Transformed completed exercises:', completed); // Debug log
              setCompletedExercises(completed);
            }
          } catch (progressErr) {
            console.error('Failed to load progress:', progressErr);
            // Fallback to localStorage if API fails
            const stored = localStorage.getItem('completedExercises');
            if (stored) setCompletedExercises(JSON.parse(stored));
          }
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [levelId]);

  const stats = useMemo(() => {
    if (!level?.exercises) return { total: 0, completed: 0, percentage: 0 };
    const total = level.exercises.length;
    const completed = level.exercises.filter(ex => completedExercises[ex._id]?.completed).length;
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [level, completedExercises]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Spinner size="lg" label="Chargement..." color="primary" />
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
      <p className="text-danger">{error}</p>
      <Button onPress={() => navigate('/courses')}>Retour</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-default-50">
      {/* Navbar */}
      <Navbar isBordered className="bg-background/70 backdrop-blur-md">
        <NavbarBrand className="gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis" className="h-8 w-auto" />
            <p className="font-bold text-inherit hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              GenesisCode
            </p>
          </div>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
          <Button isIconOnly variant="light" onPress={() => navigate(`/courses/levels/${levelId}`)}>
            <IconArrowLeft />
          </Button>
          <p className="font-bold text-inherit ml-2 line-clamp-1">Exercices : {level.title}</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-default-500">Progression</span>
              <span className="text-sm font-bold text-primary">{stats.completed} / {stats.total}</span>
            </div>
            <Progress
              value={stats.percentage}
              color="primary"
              size="sm"
              className="w-32"
            />
          </div>
        </NavbarContent>
      </Navbar>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="md:col-span-3">
            <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-none">
              <CardBody className="flex flex-row items-center justify-between p-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Prêt à pratiquer ?</h1>
                  <p className="text-white/80 max-w-xl">
                    Complétez les exercices ci-dessous pour valider vos connaissances.
                    Gagnez des points et débloquez la suite du parcours !
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <IconTrophy size={48} className="text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Exercise List */}
          {level.exercises?.map((ex, idx) => (
            <ExerciseCard
              key={ex._id}
              exercise={ex}
              index={idx}
              isCompleted={completedExercises[ex._id]?.completed}
              onClick={() => navigate(`/courses/levels/${levelId}/exercises/${ex._id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, index, isCompleted, onClick }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Code': return <IconCode />;
      case 'QCM': return <IconListCheck />;
      case 'TextInput': return <IconAbc />;
      default: return <IconBrain />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        isPressable
        onPress={onClick}
        className={`h-full border-2 transition-all hover:scale-[1.02] ${isCompleted ? 'border-success bg-success-50/30' : 'border-transparent hover:border-primary'}`}
      >
        <CardHeader className="flex justify-between items-start pb-0">
          <Chip
            size="sm"
            variant="flat"
            color={exercise.difficulty === 'easy' ? 'success' : exercise.difficulty === 'hard' ? 'danger' : 'warning'}
          >
            {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
          </Chip>
          {isCompleted && (
            <div className="bg-success text-white rounded-full p-1">
              <IconCheck size={14} />
            </div>
          )}
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
              {getTypeIcon(exercise.type)}
            </div>
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{exercise.name || `Exercice ${index + 1}`}</h3>
              <p className="text-tiny text-default-500">{exercise.points || 10} points</p>
            </div>
          </div>
          <Button
            className="w-full mt-auto"
            color={isCompleted ? "success" : "primary"}
            variant={isCompleted ? "flat" : "solid"}
            endContent={<IconPlayerPlay size={16} />}
          >
            {isCompleted ? "Recommencer" : "Commencer"}
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
}
