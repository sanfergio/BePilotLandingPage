import React, { useState } from "react";
import {
    Download,
    Search,
    CalendarCheck,
    Award,
    UserPlus,
    LayoutDashboard,
    CreditCard,
    TrendingUp,
    Smartphone,
    ChevronRight
} from "lucide-react";
import styles from "./HowWork.module.css";
// Componentes globais
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import imgLogo from "../../assets/noScreen-whiteLogo.png";

const HowWork = () => {
    const [activeTab, setActiveTab] = useState("aluno");

    // Dados dos passos para o Aluno
    const studentSteps = [
        {
            id: 1,
            icon: <Download size={28} />,
            title: "Baixe e Cadastre-se",
            description: "Crie sua conta gratuita em segundos. Basta inserir seus dados básicos e validar seu telefone."
        },
        {
            id: 2,
            icon: <Search size={28} />,
            title: "Encontre seu Instrutor",
            description: "Filtre por localização, avaliações, preço e tipo de veículo. Veja o perfil completo antes de escolher."
        },
        {
            id: 3,
            icon: <CalendarCheck size={28} />,
            title: "Agende sua Aula",
            description: "Visualize a agenda em tempo real e reserve seu horário com um clique. Sem ligações, sem espera."
        },
        {
            id: 4,
            icon: <Award size={28} />,
            title: "Aprenda e Avalie",
            description: "Realize a aula, acompanhe sua evolução no app e avalie o instrutor para ajudar a comunidade."
        }
    ];

    // Dados dos passos para o Instrutor/
    const partnerSteps = [
        {
            id: 1,
            icon: <UserPlus size={28} />,
            title: "Crie seu Perfil Pro",
            description: "Cadastre suas credenciais como Autônomo, documentação e configure sua área de atuação."
        },
        {
            id: 2,
            icon: <LayoutDashboard size={28} />,
            title: "Configure sua Agenda",
            description: "Defina seus horários disponíveis, locais de atendimento e valores. Você tem controle total."
        },
        {
            id: 3,
            icon: <CreditCard size={28} />,
            title: "Receba Alunos",
            description: "Alunos encontram seu perfil e agendam direto pelo app. Você recebe notificações instantâneas."
        },
        {
            id: 4,
            icon: <TrendingUp size={28} />,
            title: "Gerencie Ganhos",
            description: "Receba pagamentos de forma segura e acompanhe relatórios de desempenho financeiro e pedagógico."
        }
    ];

    const currentSteps = activeTab === "aluno" ? studentSteps : partnerSteps;

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.container}>
                        <header className={styles.heroHeader}>
                            <h1 className={styles.heroTitle}>
                                Como o <span className={styles.highlightText}>BePilot</span> Funciona?
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Seja você um futuro motorista ou um profissional do trânsito,
                                simplificamos a jornada em 4 passos simples.
                            </p>
                        </header>

                        {/* Toggle Switch */}
                        <div className={styles.toggleContainer}>
                            <button
                                className={`${styles.toggleBtn} ${activeTab === "aluno" ? styles.active : ""}`}
                                onClick={() => setActiveTab("aluno")}
                            >
                                Para Alunos
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${activeTab === "instrutor" ? styles.active : ""}`}
                                onClick={() => setActiveTab("instrutor")}
                            >
                                Para Instrutores
                            </button>
                        </div>
                    </div>
                </section>

                {/* Timeline Steps Section */}
                <section className={styles.stepsSection}>
                    <div className={styles.container}>
                        <div className={styles.stepsGrid}>
                            {currentSteps.map((step, index) => (
                                <div key={step.id} className={styles.stepCard}>
                                    <div className={styles.stepNumber}>0{index + 1}</div>
                                    <div className={styles.iconWrapper}>
                                        {step.icon}
                                    </div>
                                    <h3 className={styles.stepTitle}>{step.title}</h3>
                                    <p className={styles.stepDescription}>{step.description}</p>

                                    {/* Linha conectora (visual apenas desktop) */}
                                    {index < currentSteps.length - 1 && (
                                        <div className={styles.connectorLine}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* App Preview / Features Section */}
                <section className={styles.appFeatureSection}>
                    <div className={styles.container}>
                        <div className={styles.featureLayout}>
                            <div className={styles.featureText}>
                                <div className={styles.miniTag}>Tecnologia</div>
                                <h2>Tudo na palma da sua mão</h2>
                                <p>
                                    Esqueça as planilhas de papel e as ligações perdidas.
                                    O BePilot centraliza toda a experiência em uma interface
                                    limpa e intuitiva.
                                </p>
                                <ul className={styles.featureList}>
                                    <li>
                                        <Smartphone className={styles.listIcon} size={20} />
                                        <span>Notificações em tempo real sobre aulas</span>
                                    </li>
                                    <li>
                                        <Smartphone className={styles.listIcon} size={20} />
                                        <span>Chat integrado entre aluno e instrutor</span>
                                    </li>
                                    <li>
                                        <Smartphone className={styles.listIcon} size={20} />
                                        <span>Histórico financeiro detalhado</span>
                                    </li>
                                </ul>
                                <a href="/planos" className={styles.btnCta}>
                                    Baixar o Aplicativo <ChevronRight size={20} />
                                </a>
                            </div>

                            <div className={styles.featureVisual}>
                                {/* Representação visual do App (Mockup CSS) */}
                                <div className={styles.phoneMockup}>
                                    <div className={styles.phoneScreen}>
                                        <div className={styles.appHeader}>
                                            <img src={imgLogo} alt="Logo BePilot" />
                                        </div>
                                        <div className={styles.appBody}>
                                            <div className={styles.skeletonLine}></div>
                                            <div className={styles.skeletonBlock}></div>
                                            <div className={styles.skeletonBlock}></div>
                                        </div>
                                        <div className={styles.floatingUiCard}>
                                            <span>Aula Agendada! ✅</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HowWork;