import React, { useState } from 'react';
import styles from './Header.module.css';
// Importe o logo que tem fundo transparente e texto escuro
import logo from '../../assets/noScreen-nameLogo.png';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <a href="./">
                    <div className={styles.logoContainer}>
                        <img src={logo} alt="BePilot Logo" className={styles.logo} />
                    </div>
                </a>
                {/* Menu Desktop */}
                <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                    <a href="/como-funciona">Como funciona?</a>
                    <a href="/sobre">Sobre</a>
                    <a href="/planos">Planos</a>
                    <a href="/contato">Contato</a>

                    <div className={styles.authButtonsMobile}>
                        <a href='/planos' className={styles.btnLogin}>Login</a>
                        <a href='/planos' className={styles.btnCta}>Comece Agora</a>
                    </div>
                </nav>

                <div className={styles.actions}>
                    <a href='/planos' className={styles.btnLogin}>Login</a>
                    <a href='/planos' className={styles.btnCta}>Comece Agora</a>

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