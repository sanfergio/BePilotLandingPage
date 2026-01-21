import React, { useState } from 'react';
import styles from './Header.module.css';
// Importe o logo que tem fundo transparente e texto escuro
import logo from '../../assets/noScreen-nameLogo.png';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="BePilot Logo" className={styles.logo} />
                </div>

                {/* Menu Desktop */}
                <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                    <a href="#recursos">Recursos</a>
                    <a href="#sobre">Sobre</a>
                    <a href="#precos">Preços</a>
                    <a href="#contato">Contato</a>

                    <div className={styles.authButtonsMobile}>
                        <button className={styles.btnLogin}>Login</button>
                        <button className={styles.btnCta}>Comece Agora</button>
                    </div>
                </nav>

                <div className={styles.actions}>
                    <button className={styles.btnLogin}>Login</button>
                    <button className={styles.btnCta}>Comece Agora</button>

                    {/* Menu Hamburguer Mobile */}
                    <div className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
                        <div />
                        <div />
                        <div />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;