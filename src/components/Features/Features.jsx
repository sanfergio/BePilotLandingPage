import React from 'react';
import styles from './Features.module.css';
import { Calendar, Target, Shield, Clock, MapPin, Award } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: <Calendar size={40} />,
            title: "Agendamento Flexível",
            desc: "Escolha horários que se encaixam na sua rotina, incluindo finais de semana e feriados."
        },
        {
            icon: <Target size={40} />,
            title: "Foco nas suas Necessidades",
            desc: "Aulas personalizadas: primeira habilitação, prática extra, perder o medo ou reciclagem."
        },
        {
            icon: <Shield size={40} />,
            title: "Instrutores Verificados",
            desc: "Todos os profissionais passam por verificação de documentos e avaliações constantes."
        },
        {
            icon: <Clock size={40} />,
            title: "Controle de Horas",
            desc: "Acompanhe em tempo real as horas cumpridas e obrigatórias para cada categoria."
        },
        {
            icon: <MapPin size={40} />,
            title: "Aulas em sua Região",
            desc: "Encontre instrutores próximos ao seu endereço ou locais de sua preferência."
        },
        {
            icon: <Award size={40} />,
            title: "Simulados e Certificados",
            desc: "Testes teóricos e emissão de certificados de conclusão de módulos práticos."
        }
    ];

    return (
        <section id="recursos" className={styles.features}>
            <div className={styles.container}>
                <h2 className={styles.heading}>Como a BePilot transforma sua jornada no volante</h2>
                <div className={styles.grid}>
                    {features.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;