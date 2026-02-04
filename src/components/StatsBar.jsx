import { useState, useEffect } from 'react';
import './StatsBar.css';

export default function StatsBar() {
    const [stats, setStats] = useState({
        items: 234667,
        saving: 0,
        active: 124
    });

    useEffect(() => {
        // Mock "live" increment for savings
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                saving: prev.saving + Math.floor(Math.random() * 100),
                active: prev.active + (Math.random() > 0.5 ? 1 : -1)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="stats-bar-wrapper">
            <div className="stats-bar container">
                <div className="stat-item">
                    <span className="stat-value">{stats.items.toLocaleString()}</span>
                    <span className="stat-label">Curated Items</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-value highlight">${stats.saving.toLocaleString()}</span>
                    <span className="stat-label">Hypothetically Saved</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-value">{stats.active}</span>
                    <span className="stat-label">Degenerates Browsing</span>
                </div>
            </div>
        </div>
    );
}
