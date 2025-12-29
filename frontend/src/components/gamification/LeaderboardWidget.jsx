import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiConfig';
import api from '../../utils/api';
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
            // Using axios api instance which handles base URL and auth token auto-magically
            const res = await api.get(`/api/users/leaderboard?limit=10&period=${period}`);
            const data = res.data;
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
        <Card className="h-full flex flex-col bg-[#1a1b26]/60 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="flex-none flex flex-col gap-3 pb-2 pt-6 px-6">
                <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-xl border border-amber-500/30">
                            <TrophyIcon className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                        </div>
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Classement</h3>
                    </div>
                </div>
                <Tabs
                    aria-label="Leaderboard Period"
                    color="warning"
                    variant="underlined"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-white/10",
                        cursor: "w-full bg-gradient-to-r from-amber-400 to-yellow-500 h-0.5",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-amber-400 text-gray-400 font-medium transition-colors"
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
            <CardBody className="flex-1 overflow-y-auto min-h-0 py-4 px-4 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <CircularProgress color="warning" aria-label="Loading..." size="lg" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {users.map((user, index) => {
                            let rankStyle = "bg-white/5 border border-white/5";
                            let rankGlow = "";
                            let avatarRing = "border-white/10";

                            if (index === 0) { // Gold
                                rankStyle = "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-amber-500/30";
                                rankGlow = "shadow-[0_0_15px_rgba(245,158,11,0.1)]";
                                avatarRing = "border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
                            } else if (index === 1) { // Silver
                                rankStyle = "bg-gradient-to-r from-gray-400/10 to-slate-400/10 border border-gray-400/30";
                                avatarRing = "border-gray-300 shadow-[0_0_10px_rgba(209,213,219,0.3)]";
                            } else if (index === 2) { // Bronze
                                rankStyle = "bg-gradient-to-r from-orange-700/10 to-yellow-800/10 border border-orange-700/30";
                                avatarRing = "border-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.3)]";
                            }

                            return (
                                <div key={user._id || index} className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 ${rankStyle} ${rankGlow}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex justify-center items-center w-8 font-black text-lg text-white/80">
                                            {getRankIcon(index + 1)}
                                        </div>
                                        <div className={`relative rounded-full p-[2px] border-2 ${avatarRing}`}>
                                            <Avatar
                                                src={user.avatar}
                                                name={user.firstName?.charAt(0)}
                                                className="w-10 h-10 text-large"
                                                showFallback
                                            />
                                            {index < 3 && <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-500'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-4 w-4 ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'}`}></span>
                                            </div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold truncate max-w-[120px] ${index === 0 ? 'text-amber-300' : 'text-gray-200'}`}>
                                                {user.firstName} {user.lastName}
                                            </span>
                                            {user.rank > 0 && (
                                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Rang {user.rank}</span>
                                            )}
                                        </div>
                                    </div>
                                    <Chip
                                        startContent={<StarIcon className="w-3 h-3 text-yellow-900" />}
                                        variant="shadow"
                                        classNames={{
                                            base: "bg-gradient-to-r from-yellow-400 to-amber-500 border-none shadow-[0_0_10px_rgba(251,191,36,0.4)]",
                                            content: "font-black text-yellow-950 px-2"
                                        }}
                                        size="sm"
                                    >
                                        {period === 'daily' ? (user.xpStats?.daily || 0) :
                                            period === 'monthly' ? (user.xpStats?.monthly || 0) :
                                                user.totalXP} XP
                                    </Chip>
                                </div>
                            );
                        })}
                        {users.length === 0 && (
                            <div className="text-center text-gray-500 py-10 italic">
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
