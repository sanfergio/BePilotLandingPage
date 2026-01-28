import React from "react";
import { Check, Users, Car, School } from "lucide-react";
import styles from "./Pricing.module.css";
// Supondo que estes componentes existam em sua estrutura
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function Pricing() {
    const plansData = [
        {
            id: "aluno",
            title: "Aluno",
            icon: <Users size={32} />,
            price: "Grátis",
            period: "/cadastro",
            highlight: false,
            ctaText: "Começar como Aluno",
            ctaLink: "seja-aluno",
            features: [
                "Busca por instrutores qualificados",
                "Agendamento de aulas online",
                "Acompanhamento de horas",
                "Simulados teóricos",
                "Avaliações de instrutores",
            ],
        },
        {
            id: "instrutor",
            title: "Instrutor",
            icon: <Car size={32} />,
            price: "Grátis",
            period: "/cadastro",
            highlight: true,
            badge: "Mais Popular",
            ctaText: "Começar como Instrutor",
            ctaLink: "seja-instrutor",
            features: [
                "Perfil profissional destacado",
                "Gestão de agenda e alunos",
                "Receba pagamentos online",
                "Relatórios de desempenho",
                "Suporte prioritário",
            ],
        },
        {
            id: "cfc",
            title: "Autoescola",
            icon: <School size={32} />,
            price: "Grátis",
            period: "/cadastro",
            highlight: false,
            ctaText: "Cadastrar CFC",
            ctaLink: "seja-cfc",
            features: [
                "Gestão completa de instrutores",
                "Dashboard administrativo",
                "Controle de frota e horários",
                "Relatórios financeiros",
                "Gerente de conta dedicado",
            ],
        },
    ];

    return (
        <div className={styles.pageWrapper}>


            <div className={styles.mainContent}>
                <section id="precos" className={styles.pricingSection}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.title}>Planos para cada Perfil</h2>
                            <p className={styles.subtitle}>
                                Escolha a modalidade ideal e comece a transformar o trânsito hoje mesmo.
                            </p>
                        </div>

                        <div className={styles.gridWrapper}>
                            {plansData.map((plan) => (
                                <article
                                    key={plan.id}
                                    className={`${styles.card} ${plan.highlight ? styles.highlightCard : ""}`}
                                >
                                    {plan.highlight && (
                                        <div className={styles.badge}>{plan.badge}</div>
                                    )}

                                    <div className={styles.cardHeader}>
                                        <div className={styles.iconWrapper}>{plan.icon}</div>
                                        <h3 className={styles.cardTitle}>{plan.title}</h3>
                                        <div className={styles.priceContainer}>
                                            <span className={styles.currency}>{plan.price}</span>
                                            <span className={styles.period}>{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className={styles.featuresList}>
                                        {plan.features.map((feature, index) => (
                                            <li key={index}>
                                                <Check size={18} className={styles.checkIcon} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className={styles.cardFooter}>
                                        <a
                                            href={plan.ctaLink}
                                            className={plan.highlight ? styles.btnPrimary : styles.btnOutline}
                                        >
                                            {plan.ctaText}
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Pricing;