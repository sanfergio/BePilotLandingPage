import React from 'react';
import styles from './Contact.module.css';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

// Ícones SVG
const IconWhatsApp = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.917-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.013-.57-.013-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.226 1.36.194 1.872.118.57-.086 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.462 9.618a9.856 9.856 0 0 1-4.928-1.32l-5.537 1.452 1.481-5.347a9.888 9.888 0 1 1 8.984 5.215z" fill="currentColor" />
    </svg>
);

const IconPhone = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const IconMail = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const IconUsers = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconMapPin = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconClock = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const Contact = () => {
    const whatsappGroups = [
        {
            title: "CFCs",
            description: "Grupo exclusivo para Autoescolas",
            link: "https://chat.whatsapp.com/SUA-LINK-CFCS",
            members: "250+ membros",
            icon: <IconUsers />
        },
        {
            title: "Instrutores",
            description: "Comunidade para instrutores de trânsito",
            link: "https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll",
            members: "500+ membros",
            icon: <IconUsers />
        },
        {
            title: "Alunos",
            description: "Grupo para alunos em formação",
            link: "https://chat.whatsapp.com/SUA-LINK-ALUNOS",
            members: "1000+ membros",
            icon: <IconUsers />
        }
    ];

    const handleWhatsAppClick = () => {
        const phone = "+5521977403656";
        const message = "Olá! Gostaria de mais informações sobre a BePilot.";
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleEmailClick = () => {
        window.location.href = "mailto:atendimento@bepilot.com.br";
    };

    return (
        <div className={styles.pageContainer}>
            <Header />

            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Conecte-se com a <span className={styles.highlight}>BePilot</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Estamos aqui para ajudar você em sua jornada de formação. Entre em contato através dos nossos canais oficiais.
                    </p>
                </div>
                <div className={styles.heroPattern}></div>
            </div>

            <main className={styles.mainContent}>
                {/* Contatos Diretos */}
                <section className={styles.contactSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Canais Oficiais de Contato</h2>
                        <p>Entre em contato diretamente com nossa equipe</p>
                    </div>

                    <div className={styles.contactCards}>
                        <div className={styles.contactCard}>
                            <div className={styles.cardIcon}>
                                <IconPhone />
                            </div>
                            <h3>Telefone / WhatsApp</h3>
                            <p className={styles.contactInfo}>+55 21 97740-3656</p>
                            <p className={styles.contactDescription}>
                                Atendimento de segunda a sexta, das 9h às 18h
                            </p>
                            <button
                                className={styles.whatsappButton}
                                onClick={handleWhatsAppClick}
                            >
                                <IconWhatsApp />
                                Conversar no WhatsApp
                            </button>
                        </div>

                        <div className={styles.contactCard}>
                            <div className={styles.cardIcon}>
                                <IconMail />
                            </div>
                            <h3>E-mail</h3>
                            <p className={styles.contactInfo}>atendimento@bepilot.com.br</p>
                            <p className={styles.contactDescription}>
                                Respondemos em até 24 horas úteis
                            </p>
                            <button
                                className={styles.emailButton}
                                onClick={handleEmailClick}
                            >
                                <IconMail />
                                Enviar E-mail
                            </button>
                        </div>

                        <div className={styles.contactCard}>
                            <div className={styles.cardIcon}>
                                <IconMapPin />
                            </div>
                            <h3>Localização</h3>
                            <p className={styles.contactInfo}>Rio de Janeiro, RJ</p>
                            <p className={styles.contactDescription}>
                                Atendimento digital nacional com sede no Rio de Janeiro
                            </p>
                            <a
                                href="https://maps.google.com/?q=Rio+de+Janeiro+RJ+Brazil"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mapButton}
                            >
                                <IconMapPin />
                                Ver no Google Maps
                            </a>
                        </div>
                    </div>
                </section>

                {/* Grupos do WhatsApp */}
                <section className={styles.groupsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Comunidades no WhatsApp</h2>
                        <p>Junte-se à nossa comunidade e fique por dentro de tudo</p>
                    </div>

                    <div className={styles.groupsGrid}>
                        {whatsappGroups.map((group, index) => (
                            <div key={index} className={styles.groupCard}>
                                <div className={styles.groupHeader}>
                                    <div className={styles.groupIcon}>
                                        {group.icon}
                                    </div>
                                    <div className={styles.groupBadge}>
                                        <span>{group.members}</span>
                                    </div>
                                </div>

                                <h3>{group.title}</h3>
                                <p className={styles.groupDescription}>{group.description}</p>

                                <a
                                    href={group.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.groupButton}
                                >
                                    <IconWhatsApp />
                                    Entrar no Grupo
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Informações Adicionais */}
                <section className={styles.infoSection}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <IconClock />
                            </div>
                            <h3>Horário de Atendimento</h3>
                            <ul className={styles.infoList}>
                                <li><strong>Segunda a Sexta:</strong> 9h às 17h</li>
                                <li><strong>Sábados e Domingos:</strong> Fechado</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <IconMail />
                            </div>
                            <h3>Outros Contatos</h3>
                            <ul className={styles.infoList}>
                                <li><strong>Suporte técnico:</strong> suporte@bepilot.com.br</li>
                                <li><strong>Parcerias:</strong> parcerias@bepilot.com.br</li>
                                <li><strong>Financeiro:</strong> financeiro@bepilot.com.br</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* FAQ Rápido */}
                <section className={styles.faqSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Perguntas Frequentes</h2>
                        <p>Tire suas dúvidas rapidamente</p>
                    </div>

                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <h3>Quanto tempo leva para receber uma resposta?</h3>
                            <p>Normalmente respondemos em até 24 horas úteis. Para urgências, utilize o WhatsApp.</p>
                        </div>

                        <div className={styles.faqItem}>
                            <h3>Posso entrar em mais de um grupo?</h3>
                            <p>Sim! Você pode participar de todos os grupos que sejam relevantes para você.</p>
                        </div>


                        <div className={styles.faqItem}>
                            <h3>Há custo para participar dos grupos?</h3>
                            <p>Não! Todos os nossos grupos do WhatsApp são completamente gratuitos.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* CTA Final */}
            <div className={styles.ctaSection}>
                <h2>Precisa de ajuda imediata?</h2>
                <p>Nosso WhatsApp está disponível durante o horário comercial para atendimento rápido e personalizado.</p>
                <button
                    className={styles.ctaButton}
                    onClick={handleWhatsAppClick}
                >
                    <IconWhatsApp />
                    Falar com a BePilot Agora
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;