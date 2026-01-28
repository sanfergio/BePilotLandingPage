import React from "react";
import { Target, Shield, Zap, Users, ChevronRight } from "lucide-react";
import styles from "./About.module.css";
// Assumindo que Header e Footer já existem no seu projeto
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const About = () => {
    const values = [
        {
            id: 1,
            icon: <Shield size={28} />,
            title: "Segurança e Confiança",
            description: "Verificamos rigorosamente todos os instrutores e CFCs para garantir um ambiente de aprendizado seguro."
        },
        {
            id: 2,
            icon: <Zap size={28} />,
            title: "Inovação Tecnológica",
            description: "Eliminamos a burocracia do papel. Agendamentos, pagamentos e relatórios em uma única plataforma."
        },
        {
            id: 3,
            icon: <Users size={28} />,
            title: "Comunidade Integrada",
            description: "Conectamos alunos, instrutores e autoescolas em um ecossistema transparente e colaborativo."
        }
    ];

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main>
                {/* Seção Hero */}
                <section className={styles.heroSection}>
                    <div className={styles.container}>
                        <div className={styles.heroContent}>
                            <span className={styles.tagline}>Sobre o BePilot</span>
                            <h1 className={styles.heroTitle}>
                                Transformando a jornada da <span className={styles.highlightText}>Habilitação</span>
                            </h1>
                            <p className={styles.heroText}>
                                O BePilot nasceu para modernizar o ensino de trânsito no Brasil.
                                Somos a ponte digital que une alunos ansiosos por aprender, instrutores
                                apaixonados por ensinar e autoescolas que buscam gestão eficiente.
                            </p>
                        </div>
                        <div className={styles.heroImageWrapper}>
                            {/* Placeholder para imagem ilustrativa */}
                            <div className={styles.imagePlaceholder}>
                                <img src="https://img.freepik.com/fotos-premium/menina-bonita-com-um-sorriso-alegre-em-pe-perto-do-carro-e-mostrando-a-carteira-de-motorista-na-frente-mulher-expressa-sua-felicidade-apos-passar-no-exame-de-direcao_123211-1915.jpg" />

                                <div className={styles.floatingCard}>
                                    <div className={styles.statNumber}>+50k</div>
                                    <div className={styles.statLabel}>Aulas Realizadas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção Missão e Visão */}
                <section className={styles.missionSection}>
                    <div className={styles.container}>
                        <div className={styles.missionGrid}>
                            <div className={styles.missionText}>
                                <h2 className={styles.sectionTitle}>Nossa Missão</h2>
                                <p>
                                    Acreditamos que tirar a carteira de motorista não deve ser um processo
                                    estressante ou burocrático. Nossa missão é simplificar cada etapa desse
                                    caminho através da tecnologia, oferecendo ferramentas que empoderam
                                    os profissionais e facilitam a vida dos futuros condutores.
                                </p>
                                <ul className={styles.statsList}>
                                    <li>
                                        <strong>100%</strong> <span>Digital</span>
                                    </li>
                                    <li>
                                        <strong>24/5</strong> <span>Suporte</span>
                                    </li>
                                    <li>
                                        <strong>5.0</strong> <span>Avaliação</span>
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.missionIconContainer}>
                                <Target size={120} strokeWidth={1} className={styles.largeIcon} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção Nossos Valores */}
                <section className={styles.valuesSection}>
                    <div className={styles.container}>
                        <header className={styles.valuesHeader}>
                            <h2 className={styles.sectionTitle}>Nossos Pilares</h2>
                            <p className={styles.sectionSubtitle}>
                                O que guia cada linha de código e cada decisão que tomamos.
                            </p>
                        </header>

                        <div className={styles.valuesGrid}>
                            {values.map((val) => (
                                <div key={val.id} className={styles.valueCard}>
                                    <div className={styles.iconBox}>{val.icon}</div>
                                    <h3>{val.title}</h3>
                                    <p>{val.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className={styles.ctaSection}>
                    <div className={styles.container}>
                        <div className={styles.ctaCard}>
                            <h2>Pronto para dirigir o futuro?</h2>
                            <p>Junte-se a milhares de instrutores e alunos que já usam o BePilot.</p>
                            <div className={styles.ctaButtons}>
                                <a href="/planos" className={styles.btnPrimary}>
                                    Baixar App <ChevronRight size={20} />
                                </a>
                                <a href="/contato" className={styles.btnSecondary}>
                                    Falar com Consultor
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;