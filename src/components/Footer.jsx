import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">毛孩子破产记</h3>
                        <p className="footer-description">
                            为宠物主人精选全球最有趣的创意产品
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">快速链接</h4>
                        <ul className="footer-links">
                            <li><a href="#home">首页</a></li>
                            <li><a href="#about">关于我们</a></li>
                            <li><a href="#privacy">隐私政策</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">免责声明</h4>
                        <p className="footer-disclaimer">
                            本站为 Amazon 联盟营销网站。点击链接购买商品，我们可能获得佣金。
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} 毛孩子破产记. All rights reserved.</p>
                    <p className="footer-tagline">让你的钱包为毛孩子破产 🐾</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
