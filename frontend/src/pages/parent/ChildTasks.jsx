import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChildTasks, getChildProgress } from '../../services/taskService';

const ChildTasks = () => {
    const { childId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [tasksData, progressData] = await Promise.all([
                    getChildTasks(childId),
                    getChildProgress(childId)
                ]);
                setTasks(tasksData);
                setProgress(progressData);
            } catch (error) {
                console.error("Error fetching child tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            fetchData();
        }
    }, [childId]);

    if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Learning Progress & Tasks</h1>

            {/* Summary Cards */}
            {progress && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm mb-1">Total Exercises</div>
                        <div className="text-2xl font-bold text-indigo-600">{progress.total_exercises_submitted}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm mb-1">Levels Completed</div>
                        <div className="text-2xl font-bold text-green-600">{progress.total_levels_completed}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm mb-1">Hours Spent</div>
                        <div className="text-2xl font-bold text-blue-600">{progress.total_hours_spent}h</div>
                    </div>
                </div>
            )}

            {/* Active Tasks List */}
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Assigned Tasks</h2>
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-gray-500 italic">No tasks assigned for this period.</div>
                ) : (
                    tasks.map(task => (
                        <div key={task._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">{task.templateId?.title || 'Custom Task'}</h3>
                                    <div className="text-sm text-gray-500">
                                        {new Date(task.periodStart).toLocaleDateString()} - {new Date(task.periodEnd).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {task.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {Object.keys(task.metricsTarget).map(metric => {
                                    if (task.metricsTarget[metric] > 0) {
                                        const current = task.metricsCurrent[metric] || 0;
                                        const target = task.metricsTarget[metric];
                                        const percent = Math.min(100, Math.round((current / target) * 100));

                                        return (
                                            <div key={metric}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-700 capitalize">{metric.replace('_', ' ')}</span>
                                                    <span className="text-gray-500">{current} / {target}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChildTasks;
