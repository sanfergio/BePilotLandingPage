import React from 'react';
import styles from './Hero.module.css';
import heroImage from '../../assets/noScreen-nameLogo-withSlogan.png';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Conecte-se <br/> com <span className={styles.highlight}> instrutores qualificados</span>
                    </h1>
                    <p className={styles.description}>
                        A BePilot conecta alunos a instrutores autônomos certificados pelo Detran para cumprir horas obrigatórias, 
                        perder o medo de dirigir (mesmo para quem já tem CNH) ou simplesmente ganhar mais prática. 
                    </p>
                    <div className={styles.buttonGroup}>   
                        <a className={styles.btnPrimary} href="/seja-aluno">Quero ser aluno</a>
                        <a className={styles.btnSecondary} href="/seja-instrutor">Quero ser instrutor</a>
                    </div>
                    <div className={styles.ctaNote}>
                        <span>CFC autorizado? </span>
                        <a href="/seja-cfc" className={styles.ctaLink}>Cadastre sua autoescola</a>
                    </div>
                </div>
                <div className={styles.imageWrapper}>
                    <img src="https://img.freepik.com/fotos-gratis/instrutor-de-conducao-a-mostrar-o-painel-e-os-botoes-do-veiculo-ao-estudante-que-recebe-aulas-de-conducao_342744-691.jpg" alt="Dashboard BePilot - Plataforma de Aulas de Direção" className={styles.heroImg} />
                </div>
            </div>
        </section>
    );
};

export default Hero;