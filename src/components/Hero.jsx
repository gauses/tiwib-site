import './Hero.css';

export default function Hero() {
    return (
        <div className="hero">
            <div className="hero-content">
                <h1 className="hero-title">
                    This Is Why <span className="gradient-text">I'm Broke</span>
                </h1>
                <p className="hero-subtitle">
                    Discover the coolest, weirdest, and most innovative products. Your wallet won't thank you, but your life will! 💸
                </p>
            </div>

            {/* Floating emojis */}
            <div className="floating-emoji" style={{ top: '10%', left: '10%' }}>🎮</div>
            <div className="floating-emoji" style={{ top: '20%', right: '15%' }}>🚀</div>
            <div className="floating-emoji" style={{ top: '60%', left: '20%' }}>💎</div>
            <div className="floating-emoji" style={{ top: '70%', right: '10%' }}>🎁</div>
        </div>
    );
}
