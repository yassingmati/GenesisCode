import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiConfig';
import api from '../../utils/api';
import { Card, CardHeader, CardBody, Tab, Tabs, Avatar, Chip, CircularProgress } from '@nextui-org/react';
import { TrophyIcon, FireIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '../../hooks/useTranslation';

const LeaderboardWidget = () => {
    const { language } = useTranslation();
    const [period, setPeriod] = useState("alltime"); // alltime, daily, monthly
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const translations = {
        fr: {
            title: "Classement",
            global: "Global",
            month: "Mois",
            day: "Jour",
            rank: "Rang",
            xp: "XP",
            empty: "Aucun classement disponible"
        },
        en: {
            title: "Leaderboard",
            global: "All Time",
            month: "Month",
            day: "Day",
            rank: "Rank",
            xp: "XP",
            empty: "No leaderboard available"
        },
        ar: {
            title: "الترتيب",
            global: "الكل",
            month: "شهر",
            day: "يوم",
            rank: "رتبة",
            xp: "نقاط",
            empty: "لا يوجد ترتيب متاح"
        }
    };

    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            // Using axios api instance which handles base URL and auth token auto-magically
            const res = await api.get(`/api/users/leaderboard?limit=5&period=${period}`);
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
            case 2: return <TrophyIcon className="w-6 h-6 text-gray-300" />;
            case 3: return <TrophyIcon className="w-6 h-6 text-amber-700" />;
            default: return <span className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center">{rank}</span>;
        }
    };

    return (
        <Card className="h-full flex flex-col bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <CardHeader className="flex-none flex flex-col gap-3 pb-3 pt-4 px-4 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <TrophyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                                {t.title}
                            </h3>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Top 5</p>
                        </div>
                    </div>
                </div>
                <Tabs
                    aria-label="Leaderboard Period"
                    color="warning"
                    variant="light"
                    classNames={{
                        tabList: "gap-1 w-full bg-gray-100/50 dark:bg-white/5 p-1 rounded-lg",
                        cursor: "w-full bg-white dark:bg-zinc-800 shadow-sm rounded-md",
                        tab: "h-7 px-2 text-[10px] font-medium",
                        tabContent: "group-data-[selected=true]:text-gray-900 dark:group-data-[selected=true]:text-white text-gray-500 dark:text-gray-400"
                    }}
                    selectedKey={period}
                    onSelectionChange={setPeriod}
                >
                    <Tab key="alltime" title={t.global} />
                    <Tab key="monthly" title={t.month} />
                    <Tab key="daily" title={t.day} />
                </Tabs>
            </CardHeader>
            <CardBody className="flex-1 overflow-y-auto min-h-0 py-2 px-3 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <CircularProgress color="warning" aria-label="Loading..." size="md" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {users.map((user, index) => {
                            let rankStyle = "bg-white/40 dark:bg-zinc-800/40 border-transparent hover:bg-white/60 dark:hover:bg-zinc-800/60";
                            let rankGlow = "";
                            let avatarRing = "border-gray-200 dark:border-zinc-700";

                            if (index === 0) { // Gold
                                rankStyle = "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/20 hover:from-amber-500/20";
                                rankGlow = "shadow-[0_0_20px_rgba(245,158,11,0.1)]";
                                avatarRing = "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/20";
                            } else if (index === 1) { // Silver
                                rankStyle = "bg-gradient-to-r from-slate-300/10 to-gray-300/5 border-slate-400/20 hover:from-slate-300/20";
                                avatarRing = "border-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.3)]";
                            } else if (index === 2) { // Bronze
                                rankStyle = "bg-gradient-to-r from-orange-800/10 to-amber-900/5 border-orange-700/20 hover:from-orange-800/20";
                                avatarRing = "border-orange-700 shadow-[0_0_10px_rgba(194,65,12,0.3)]";
                            }

                            return (
                                <div key={user._id || index} className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${rankStyle} ${rankGlow} ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="flex justify-center items-center w-5 font-black text-sm text-gray-400">
                                            {getRankIcon(index + 1)}
                                        </div>
                                        <div className={`relative rounded-full p-[1.5px] border-2 transition-transform duration-300 group-hover:scale-105 ${avatarRing}`}>
                                            <Avatar
                                                src={user.avatar}
                                                name={user.firstName?.charAt(0)}
                                                className="w-8 h-8 text-sm"
                                                showFallback
                                            />
                                            {index === 0 && (
                                                <div className="absolute -top-1.5 -right-1.5 text-base">👑</div>
                                            )}
                                        </div>
                                        <div className={`flex flex-col ${isRTL ? 'items-end' : ''}`}>
                                            <span className={`text-xs font-bold truncate max-w-[100px] ${index === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <div className="flex items-center gap-1 mt-0">
                                                {user.rank > 0 && (
                                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400`}>
                                                        #{user.rank}
                                                    </span>
                                                )}
                                                <span className="text-[9px] text-gray-400 dark:text-gray-500">Lvl {Math.floor(user.totalXP / 1000) + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                                            {period === 'daily' ? (user.xpStats?.daily || 0) :
                                                period === 'monthly' ? (user.xpStats?.monthly || 0) :
                                                    user.totalXP}
                                            <span className="text-[9px] font-bold text-amber-600/70 dark:text-amber-500/70">XP</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {users.length === 0 && (
                            <div className="text-center py-8 flex flex-col items-center gap-2 opacity-60">
                                <TrophyIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.empty}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default LeaderboardWidget;
