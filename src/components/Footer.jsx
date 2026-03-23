import './Footer.css';
import { getCategoryLabel } from '../utils/categories';
import { getCategoryPath } from '../utils/routes';

const FOOTER_LINKS = [
    { label: 'Home', href: '/' },
    { label: getCategoryLabel('novelty'), href: getCategoryPath('novelty') },
    { label: getCategoryLabel('tech'), href: getCategoryPath('tech') },
    { label: 'Sitemap', href: '/sitemap.xml' },
];

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">TIWIB Niche</h3>
                        <p className="footer-description">
                            Curating the most interesting and creative products from around the world.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            {FOOTER_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href}>{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Disclaimer</h4>
                        <p className="footer-disclaimer">
                            We are an Amazon Associate and may earn commissions from qualifying purchases.
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} TIWIB Niche. All rights reserved.</p>
                    <p className="footer-tagline">Making your wallet lighter since 2026 💸</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
