import React, { useEffect } from 'react';

const STATS_KEY = 'genesis_user_stats';

const TimeTracker = () => {
    useEffect(() => {
        const interval = setInterval(() => {
            try {
                const stored = localStorage.getItem(STATS_KEY);
                const stats = stored ? JSON.parse(stored) : { totalMinutes: 0, completedLevels: 0 };

                stats.totalMinutes = (stats.totalMinutes || 0) + 1;

                localStorage.setItem(STATS_KEY, JSON.stringify(stats));
                console.log('Time tracked: ', stats.totalMinutes, 'minutes');
            } catch (e) {
                console.error("Error tracking time", e);
            }
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
};

export default TimeTracker;
