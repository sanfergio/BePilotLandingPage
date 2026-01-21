import React from 'react';
import styles from './Pricing.module.css';
import { Check, Users, Car, School } from 'lucide-react';

const Pricing = () => {
    return (
        <section id="precos" className={styles.pricing}>
            <div className={styles.container}>
                <h2 className={styles.title}>Planos para cada Perfil</h2>
                <div className={styles.cardsWrapper}>

                    {/* Plano Aluno */}
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}>
                            <Users size={32} />
                        </div>
                        <h3>Aluno</h3>
                        <div className={styles.price}>Grátis<span>/cadastro</span></div>
                        <ul className={styles.featuresList}>
                            <li><Check size={16} /> Busca por instrutores qualificados</li>
                            <li><Check size={16} /> Agendamento de aulas online</li>
                            <li><Check size={16} /> Acompanhamento de horas</li>
                            <li><Check size={16} /> Simulados teóricos</li>
                            <li><Check size={16} /> Avaliações de instrutores</li>
                        </ul>
                        <button className={styles.btnOutline}>Começar como Aluno</button>
                    </div>

                    {/* Plano Instrutor (Destaque) */}
                    <div className={`${styles.card} ${styles.highlight}`}>
                        <div className={styles.badge}>Mais Popular</div>
                        <div className={styles.iconWrapper}>
                            <Car size={32} />
                        </div>
                        <h3>Instrutor</h3>
                        <div className={styles.price}>Grátis<span>/cadastro</span></div>
                        <ul className={styles.featuresList}>
                            <li><Check size={16} /> Perfil profissional destacado</li>
                            <li><Check size={16} /> Gestão de agenda e alunos</li>
                            <li><Check size={16} /> Receba pagamentos online</li>
                            <li><Check size={16} /> Relatórios de desempenho</li>
                            <li><Check size={16} /> Suporte prioritário</li>
                        </ul>
                        <button className={styles.btnSolid}>Começar como Instrutor</button>
                    </div>

                    {/* Plano CFC */}
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}>
                            <School size={32} />
                        </div>
                        <h3>Autoescola</h3>
                        <div className={styles.price}>R$ 59,90<span>/mês</span></div>
                        <ul className={styles.featuresList}>
                            <li><Check size={16} /> Gestão completa de instrutores</li>
                            <li><Check size={16} /> Dashboard administrativo</li>
                            <li><Check size={16} /> Controle de frota e horários</li>
                            <li><Check size={16} /> Relatórios financeiros</li>
                            <li><Check size={16} /> Gerente de conta dedicado</li>
                        </ul>
                        <button className={styles.btnOutline}>Cadastrar CFC</button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Pricing;