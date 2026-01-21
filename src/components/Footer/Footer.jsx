import React from 'react';
import styles from './Footer.module.css';
// Logo para fundo escuro (branco total ou com texto branco)
import logoWhite from '../../assets/blueScreen-nameLogo-withSlogan.png';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.col}>
                    <img src={logoWhite} alt="BePilot White" className={styles.logo} />
    
                </div>

                <div className={styles.col}>
                    <h4>Empresa</h4>
                    <a href="#">Sobre</a>
                    <a href="#">Carreiras</a>
                    <a href="#">Blog</a>
                </div>

                <div className={styles.col}>
                    <h4>Suporte</h4>
                    <a href="#">Central de Ajuda</a>
                    <a href="#">Termos de Uso</a>
                    <a href="#">Privacidade</a>
                </div>

                <div className={styles.col}>
                    <h4>Contato</h4>
                    <p>contato@bepilot.com</p>
                    <div className={styles.socials}>
                        {/* Placeholders para redes sociais */}
                        <span>IG</span>
                        <span>LI</span>
                        <span>TW</span>
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                &copy; 2026 BePilot. Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;