import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Tab, Tabs, Avatar, Chip, CircularProgress } from '@nextui-org/react';
import { TrophyIcon, FireIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/solid';

const LeaderboardWidget = () => {
    const [period, setPeriod] = useState("alltime"); // alltime, daily, monthly
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/users/leaderboard?limit=10&period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
            case 2: return <TrophyIcon className="w-6 h-6 text-gray-400" />;
            case 3: return <TrophyIcon className="w-6 h-6 text-amber-600" />;
            default: return <span className="font-bold text-gray-500 w-6 text-center">{rank}</span>;
        }
    };

    return (
        <Card className="h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="flex flex-col gap-3 pb-0">
                <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Classement</h3>
                    </div>
                </div>
                <Tabs
                    aria-label="Leaderboard Period"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-primary",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-primary"
                    }}
                    selectedKey={period}
                    onSelectionChange={setPeriod}
                >
                    <Tab
                        key="alltime"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>Global</span>
                            </div>
                        }
                    />
                    <Tab
                        key="monthly"
                        title={
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Mois</span>
                            </div>
                        }
                    />
                    <Tab
                        key="daily"
                        title={
                            <div className="flex items-center space-x-2">
                                <FireIcon className="w-4 h-4" />
                                <span>Jour</span>
                            </div>
                        }
                    />
                </Tabs>
            </CardHeader>
            <CardBody className="py-4">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <CircularProgress color="primary" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {users.map((user, index) => (
                            <div key={user._id || index} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="flex justify-center items-center w-8">
                                        {getRankIcon(index + 1)}
                                    </div>
                                    <Avatar
                                        src={user.avatar}
                                        name={user.firstName?.charAt(0)}
                                        className="w-10 h-10 text-large"
                                        showFallback
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white truncate max-w-[120px]">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        {user.rank > 0 && (
                                            <span className="text-xs text-gray-500">Rang {user.rank}</span>
                                        )}
                                    </div>
                                </div>
                                <Chip
                                    startContent={<StarIcon className="w-3 h-3 text-yellow-500" />}
                                    variant="flat"
                                    color="warning"
                                    size="sm"
                                    classNames={{ content: "font-bold text-yellow-800 dark:text-yellow-300" }}
                                >
                                    {period === 'daily' ? (user.xpStats?.daily || 0) :
                                        period === 'monthly' ? (user.xpStats?.monthly || 0) :
                                            user.totalXP} XP
                                </Chip>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                Aucun classement disponible
                            </div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default LeaderboardWidget;
