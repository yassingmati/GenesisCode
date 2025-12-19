import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { getApiUrl } from '../../utils/apiConfig';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
    Button, Card, CardBody, Chip, Progress, Spinner
} from "@nextui-org/react";
import {
    IconArrowLeft, IconCheck, IconPlayerPlay, IconTrophy, IconArrowRight, IconLock, IconStar
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const API_BASE = getApiUrl('/api/courses');

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

export default function LevelExercisesPage() {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [level, setLevel] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [completedExercises, setCompletedExercises] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextLevelId, setNextLevelId] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                // 1. Fetch Level details
                const res = await fetch(`${API_BASE}/levels/${levelId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Impossible de charger le niveau');
                const levelData = await res.json();

                if (mounted) {
                    setLevel(levelData);
                    setExercises(levelData.exercises || []);
                }

                // 2. Fetch User Progress
                if (userId) {
                    const progressRes = await fetch(`${API_BASE}/users/${userId}/levels/${levelId}/progress`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (progressRes.ok) {
                        const progressData = await progressRes.json();
                        if (mounted && progressData.exerciseProgresses) {
                            setCompletedExercises(progressData.exerciseProgresses);
                        }
                    }
                }

                // 3. Find Next Level logic
                if (levelData.path) {
                    const pathId = typeof levelData.path === 'object' ? levelData.path._id : levelData.path;
                    const levelsRes = await fetch(`${API_BASE}/paths/${pathId}/levels`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (levelsRes.ok) {
                        const levelsList = await levelsRes.json();
                        const currentIndex = levelsList.findIndex(l => l._id === levelId);
                        if (currentIndex !== -1 && currentIndex < levelsList.length - 1) {
                            if (mounted) setNextLevelId(levelsList[currentIndex + 1]._id);
                        }
                    }
                }

            } catch (err) {
                if (mounted) setError(err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => mounted = false;
    }, [levelId]);

    // Effects handling
    const totalExercises = exercises.length;
    const completedCount = exercises.filter(ex => completedExercises[ex._id]?.completed).length;
    const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
    const isAllCompleted = totalExercises > 0 && completedCount === totalExercises;

    useEffect(() => {
        if (isAllCompleted && !loading) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [isAllCompleted, loading]);

    return (
        <ClientPageLayout
            title={level?.translations?.fr?.title || level?.name || 'Exercices'}
            subtitle={`Pratiquez et validez vos acquis pour ce niveau.`}
            breadcrumbs={[
                { label: 'Niveau', path: `/courses/levels/${levelId}` },
                { label: 'Exercices' }
            ]}
            loading={loading}
            error={error}
            onRetry={() => window.location.reload()}
            backPath={`/courses/levels/${levelId}`}
            backLabel="Retour au cours"
            // Add a subtle animated background to the layout if supported
            className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-slate-900"
        >
            <div className="max-w-6xl mx-auto py-8 px-4 relative">

                {/* Animated Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10">
                    {/* Progress Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="mb-10 border-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl overflow-hidden relative">
                            {/* Decorative patterns */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>

                            <CardBody className="p-8 md:p-10 relative z-10">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                                <IconTrophy size={32} className="text-yellow-300 drop-shadow-md" />
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                {isAllCompleted ? "Niveau Maîtrisé !" : "Votre Progression"}
                                            </h2>
                                        </div>
                                        <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
                                            {isAllCompleted
                                                ? "Bravo ! Vous avez relevé tous les défis. Vous êtes prêt pour la suite."
                                                : `Continuez vos efforts ! Vous avez complété ${completedCount} exercice${completedCount > 1 ? 's' : ''} sur ${totalExercises}.`}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/3 flex flex-col items-end gap-2">
                                        <span className="text-4xl font-bold font-mono tracking-tighter">
                                            {Math.round(progressPercentage)}%
                                        </span>
                                        <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercentage}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="bg-yellow-400 h-full rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)] relative"
                                            >
                                                <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                            </motion.div>
                                        </div>
                                        <span className="text-xs text-blue-200 font-medium uppercase tracking-wider">
                                            {completedCount} / {totalExercises} Validés
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Exercises Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {exercises.map((ex, idx) => {
                            const isCompleted = completedExercises[ex._id]?.completed;
                            const difficultyColor = ex.difficulty === 'easy' ? 'success' : ex.difficulty === 'hard' ? 'danger' : 'warning';

                            return (
                                <motion.div key={ex._id} variants={itemVariants}>
                                    <Card
                                        isPressable
                                        onPress={() => navigate(`/courses/levels/${levelId}/exercises/${ex._id}`)}
                                        className={`border-none h-full group overflow-visible transition-all duration-300 ${isCompleted
                                                ? 'bg-white dark:bg-zinc-900 shadow-md ring-1 ring-green-500/20'
                                                : 'bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:-translate-y-1'
                                            }`}
                                    >
                                        <CardBody className="p-0 relative h-full flex flex-col">
                                            {/* Top Banner Status */}
                                            <div className={`h-1.5 w-full absolute top-0 left-0 right-0 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                }`}></div>

                                            <div className="p-6 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-110 ${isCompleted
                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                        }`}>
                                                        {isCompleted ? <IconCheck size={24} stroke={3} /> : <span className="font-mono text-xl">{idx + 1}</span>}
                                                    </div>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={difficultyColor}
                                                        classNames={{ content: "font-semibold px-2" }}
                                                    >
                                                        {ex.difficulty === 'easy' ? 'Facile' : ex.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
                                                    </Chip>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {ex.name}
                                                </h3>

                                                <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        <IconStar size={16} className="text-yellow-400 fill-yellow-400" />
                                                        {ex.points} pts
                                                    </span>

                                                    <motion.div whileHover={{ x: 3 }} className={`flex items-center gap-1.5 text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-primary'
                                                        }`}>
                                                        {isCompleted ? 'Revoir' : 'Commencer'}
                                                        <IconArrowRight size={16} />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Next Level Button Area - Animated Entry */}
                    <AnimatePresence>
                        {isAllCompleted && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.2
                                }}
                                className="mt-16 flex justify-center pb-8"
                            >
                                <Button
                                    size="lg"
                                    className="font-bold text-lg px-10 py-8 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 text-white"
                                    endContent={<IconArrowRight stroke={3} />}
                                    isDisabled={!nextLevelId}
                                    onPress={() => nextLevelId && navigate(`/courses/levels/${nextLevelId}`)}
                                >
                                    {nextLevelId ? "DÉBLOQUER LE NIVEAU SUIVANT" : "PARCOURS TERMINÉ"}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </ClientPageLayout>
    );
}
