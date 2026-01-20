import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <span className="logo-icon">💸</span>
                    <span className="logo-text">TIWIB</span>
                </div>
                <nav className="nav">
                    <a href="#" className="nav-link">首页</a>
                    <a href="#" className="nav-link">关于</a>
                </nav>
            </div>
        </header>
    );
}
