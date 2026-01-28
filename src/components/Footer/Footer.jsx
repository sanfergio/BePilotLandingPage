import React from 'react';
import styles from './Footer.module.css';
import logoWhite from '../../assets/blueScreen-nameLogo-withSlogan.png';
import { Instagram, Facebook, Mail } from "lucide-react"
import { FaTiktok } from "react-icons/fa";


const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.col}>
                    <img src={logoWhite} alt="BePilot White" className={styles.logo} />

                </div>

                <div className={styles.col}>
                    <h4>Empresa</h4>
                    <a href="/sobre">Sobre</a>
                    <a href="/como-funciona">Como funciona?</a>
                    <a href="/contato">Fale conosco</a>
                </div>

                <div className={styles.col}>
                    <h4>Suporte</h4>
                    <a href="/central-de-ajuda">Central de Ajuda</a>
                    <a href="/termos-de-uso">Termos de Uso</a>
                    <a href="/politica-de-privacidade">Privacidade</a>
                </div>

                <div className={styles.col}>
                    <h4>Contato</h4>
                    <p>
                        <a
                            href="mailto:atendimento@bepilot.com"
                            style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
                        >
                            <Mail size={18} />
                            atendimento@bepilot.com
                        </a>
                    </p>
                    <div className={styles.socials}>
                        {/* Placeholders para redes sociais */}
                        <a target="_blank" href="https://www.facebook.com/bepilot_br" aria-label="Facebook"><Facebook size={20} /></a>
                        <a target="_blank" href="https://www.instagram.com/bepilot_br/" aria-label="Instagram"><Instagram size={20} /></a>
                        <a target="_blank" href="https://www.tiktok.com/@bepilot_br" aria-label="TikTok"><FaTiktok size={18} /> </a>
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                &copy; 2026 BePilot | Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;