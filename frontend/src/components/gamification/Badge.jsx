import React from 'react';
import { Tooltip } from '@nextui-org/react';
import { getBadgeConfig } from '../../config/badges';

const Badge = ({ badgeId, size = "md", showTitle = false }) => {
    const config = getBadgeConfig(badgeId);
    const Icon = config.icon;

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8"
    };

    return (
        <Tooltip content={
            <div className="px-1 py-2">
                <div className="text-small font-bold">{config.title}</div>
                <div className="text-tiny">{config.description}</div>
            </div>
        }>
            <div className={`flex flex-col items-center gap-1 cursor-help`}>
                <div className={`${sizeClasses[size]} ${config.color} rounded-full flex items-center justify-center shadow-sm`}>
                    <Icon className={iconSizes[size]} />
                </div>
                {showTitle && <span className="text-xs font-semibold text-center max-w-[80px] leading-tight">{config.title}</span>}
            </div>
        </Tooltip>
    );
};

export default Badge;
