import React, { useState, useRef } from 'react';
import styles from './BePilotInstructor.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

// Ícones SVG modernizados
const IconCheck = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconShield = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconRocket = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconMap = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const BePilotInstructor = () => {
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',
        birth_day: '',
        phone: '',
        cep: '',
        address: '',
        neighborhood: '',
        house_number: '',
        complement: '',
        city: '',
        uf_state: '',
        questions_suggestion: '',
        group: 1,
        cupon_used: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Nome completo é obrigatório';
                else if (value.trim().split(' ').length < 2) error = 'Digite seu nome completo';
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) error = 'E-mail é obrigatório';
                else if (!emailRegex.test(value)) error = 'E-mail inválido';
                break;
            case 'cpf':
                if (!value) error = "CPF é obrigatório";
                else if (value && value.length !== 14) error = "CPF inválido";
                else if (!value.trim()) error = "CPF obrigatório";
                else if (!validateCPF(value)) error = "CPF inválido";
                break;
            case 'phone':
                if (value.length < 14) error = 'Telefone inválido';
                break;
            case 'cep':
                const cepCleanVal = value.replace(/\D/g, '');
                if (!value) error = "CEP é obrigatório";
                else if (cepCleanVal.length !== 8) error = "CEP incompleto";
                break;
            case 'house_number':
                if (!value.trim()) error = 'Número é obrigatório';
                break;
            case 'birth_day':
                if (!value) error = "Data de nascimento obrigatória";
                else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

                    if (age < 18) error = "É necessário ter pelo menos 18 anos";
                    else if (age > 100) error = "Data de nascimento inválida";
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cpf') formattedValue = formatCPF(value);
        if (name === 'cep') formattedValue = formatCEP(value);
        if (name === 'phone') formattedValue = formatPhone(value);

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'cep' && formattedValue.length === 9) {
            if (cepTimeout) clearTimeout(cepTimeout);
            const timeout = setTimeout(() => fetchAddress(formattedValue), 500);
            setCepTimeout(timeout);
        }
    };

    const fetchAddress = async (cep) => {
        try {
            const cleanCep = cep.replace(/\D/g, '');
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    uf_state: data.uf
                }));
            } else {
                setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'complement' && key !== 'questions_suggestion' && key !== 'group') {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstError = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('pre_instructor')
                .insert([formData]);

            if (error) throw error;

            setSubmitStatus('success');
            if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Erro ao enviar:', error);
            setSubmitStatus('error');
            alert('Erro ao enviar cadastro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', cpf: '', birth_day: '', phone: '',
            cep: '', address: '', neighborhood: '', house_number: '',
            complement: '', city: '', uf_state: '', questions_suggestion: '', group: 1, cupon_used: ''
        });
        setSubmitStatus(null);
    };

    return (
        <div className={styles.pageContainer}>
            <Header />

            <div className={styles.backgroundGradient}>
                <div className={styles.floatingElements}>
                    <div className={styles.floatingElement1}></div>
                    <div className={styles.floatingElement2}></div>
                    <div className={styles.floatingElement3}></div>
                </div>

                <main className={styles.mainWrapper}>
                    {/* Hero Section */}
                    <div className={styles.heroSection}>
                        <div className={styles.heroContent}>
                            <div className={styles.badge}>
                                <IconRocket />
                                <span>Junte-se à revolução</span>
                            </div>
                            <h1 className={styles.heroTitle}>
                                Transforme sua <span className={styles.gradientText}>experiência</span> em uma carreira de sucesso
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Torne-se um instrutor BePilot e tenha acesso a uma plataforma completa para gerenciar alunos, receber pagamentos e construir sua reputação no mercado de aviação.
                            </p>

                            <div className={styles.statsContainer}>
                                <div className={styles.statItem}>
                                    <div className={styles.statNumber}>+500</div>
                                    <div className={styles.statLabel}>Instrutores Ativos</div>
                                </div>
                                <div className={styles.statDivider}></div>
                                <div className={styles.statItem}>
                                    <div className={styles.statNumber}>+10.000</div>
                                    <div className={styles.statLabel}>Aulas Ministradas</div>
                                </div>
                                <div className={styles.statDivider}></div>
                                <div className={styles.statItem}>
                                    <div className={styles.statNumber}>98%</div>
                                    <div className={styles.statLabel}>Satisfação</div>
                                </div>
                            </div>
                        </div>

                        {/* Form Card - Agora ao lado do hero */}
                        <div className={styles.formSection} ref={formRef}>
                            <div className={styles.formCard}>
                                {submitStatus === 'success' ? (
                                    <div className={styles.successContainer}>
                                        <div className={styles.successAnimation}>
                                            <div className={styles.checkmarkCircle}>
                                                <div className={styles.checkmark}></div>
                                            </div>
                                        </div>
                                        <h3>Cadastro realizado com sucesso!</h3>
                                        <p className={styles.successMessage}>
                                            Seus dados foram enviados para análise da equipe BePilot. Em breve entraremos em contato para os próximos passos.
                                        </p>

                                        <div className={styles.whatsappCard}>
                                            <div className={styles.whatsappHeader}>
                                                <IconShield />
                                                <h4>Próximos Passos</h4>
                                            </div>
                                            <p>
                                                Entre no nosso grupo exclusivo de instrutores para acompanhar as novidades e validar suas credenciais.
                                            </p>
                                            <a
                                                href="https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll"
                                                target='_blank'
                                                rel="noopener noreferrer"
                                                className={styles.whatsappButton}
                                            >
                                                <span>Entrar no Grupo</span>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" />
                                                </svg>
                                            </a>
                                        </div>

                                        <button onClick={resetForm} className={styles.secondaryButton}>
                                            Cadastrar outro instrutor
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.formHeader}>
                                            <h2>Pré-cadastro de Instrutor</h2>
                                            <p>Preencha os dados abaixo para iniciar sua jornada</p>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <div className={styles.formGrid}>
                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>Nome Completo</span>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="Digite seu nome completo"
                                                            className={errors.name ? styles.errorInput : ''}
                                                        />
                                                    </label>
                                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                                </div>

                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>E-mail</span>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="seu@email.com"
                                                            className={errors.email ? styles.errorInput : ''}
                                                        />
                                                    </label>
                                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>
                                                        <span>CPF</span>
                                                        <input
                                                            type="text"
                                                            name="cpf"
                                                            value={formData.cpf}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="000.000.000-00"
                                                            maxLength="14"
                                                            className={errors.cpf ? styles.errorInput : ''}
                                                        />
                                                    </label>
                                                    {errors.cpf && <span className={styles.errorText}>{errors.cpf}</span>}
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>
                                                        <span>Data de Nasc.</span>
                                                        <div className={styles.dateInputWrapper}>
                                                            <input
                                                                type="date"
                                                                name="birth_day"
                                                                value={formData.birth_day}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                className={errors.birth_day ? styles.errorInput : ''}
                                                            />
                                                        </div>
                                                    </label>
                                                    {errors.birth_day && <span className={styles.errorText}>{errors.birth_day}</span>}
                                                </div>

                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>WhatsApp / Celular</span>
                                                        <input
                                                            type="text"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="(00) 00000-0000"
                                                            maxLength="15"
                                                            className={errors.phone ? styles.errorInput : ''}
                                                        />
                                                    </label>
                                                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                                </div>

                                                {/* Endereço */}
                                                <div className={styles.inputGroup}>
                                                    <label>
                                                        <span>CEP</span>
                                                        <input
                                                            type="text"
                                                            name="cep"
                                                            value={formData.cep}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="00000-000"
                                                            maxLength="9"
                                                            className={errors.cep ? styles.errorInput : ''}
                                                        />
                                                    </label>
                                                    {errors.cep && <span className={styles.errorText}>{errors.cep}</span>}
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>
                                                        <span>Número</span>
                                                        <input
                                                            type="text"
                                                            name="house_number"
                                                            value={formData.house_number}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            placeholder="Nº"
                                                            className={errors.house_number ? styles.errorInput : ''}
                                                        />
                                                    </label>
                                                    {errors.house_number && <span className={styles.errorText}>{errors.house_number}</span>}
                                                </div>

                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>Endereço</span>
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            value={formData.address}
                                                            readOnly
                                                            className={styles.readOnlyInput}
                                                            placeholder="Preenchido automaticamente"
                                                        />
                                                    </label>
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>
                                                        <span>Bairro</span>
                                                        <input
                                                            type="text"
                                                            name="neighborhood"
                                                            value={formData.neighborhood}
                                                            readOnly
                                                            className={styles.readOnlyInput}
                                                            placeholder="Preenchido automaticamente"
                                                        />
                                                    </label>
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <label>
                                                        <span>Cidade/UF</span>
                                                        <div className={styles.cityInputWrapper}>
                                                            <input
                                                                type="text"
                                                                value={`${formData.city} - ${formData.uf_state}`}
                                                                readOnly
                                                                className={styles.readOnlyInput}
                                                                placeholder="Preenchido automaticamente"
                                                            />
                                                        </div>
                                                    </label>
                                                </div>

                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>Complemento <small>(Opcional)</small></span>
                                                        <input
                                                            type="text"
                                                            name="complement"
                                                            value={formData.complement}
                                                            onChange={handleChange}
                                                            placeholder="Apto, Bloco, etc."
                                                        />
                                                    </label>
                                                </div>

                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>Cupom de Indicação <small>(Opcional)</small></span>
                                                        <input
                                                            type="text"
                                                            name="cupon_used"
                                                            value={formData.cupon_used}
                                                            onChange={handleChange}
                                                            placeholder="Digite o cupom"
                                                        />
                                                    </label>
                                                </div>

                                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                    <label>
                                                        <span>Experiência e Sugestões <small>(Opcional)</small></span>
                                                        <textarea
                                                            name="questions_suggestion"
                                                            value={formData.questions_suggestion}
                                                            onChange={handleChange}
                                                            rows="3"
                                                            placeholder="Conte sobre suas experiências, aeronaves que já instruiu, ou sugestões..."
                                                        ></textarea>
                                                    </label>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className={styles.submitButton}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className={styles.loadingText}>
                                                        <span className={styles.spinner}></span>
                                                        Enviando...
                                                    </span>
                                                ) : 'Cadastrar como Instrutor'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <section className={styles.benefitsSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Por que ser um Instrutor BePilot?</h2>
                            <p>Tudo que você precisa para transformar sua paixão por ensinar em uma carreira próspera</p>
                        </div>

                        <div className={styles.benefitsGrid}>
                            <div className={styles.benefitCard}>
                                <div className={styles.benefitIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3>Plataforma Completa</h3>
                                <p>Gerencione alunos, agende aulas, receba pagamentos e acompanhe seu progresso em um só lugar.</p>
                            </div>

                            <div className={styles.benefitCard}>
                                <div className={styles.benefitIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <h3>Flexibilidade Total</h3>
                                <p>Defina seus próprios horários, trabalhe na sua região e tenha controle sobre sua agenda.</p>
                            </div>

                            <div className={styles.benefitCard}>
                                <div className={styles.benefitIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h3>Base de Alunos</h3>
                                <p>Acesso a uma rede de estudantes qualificados buscando instrução na sua região.</p>
                            </div>

                            <div className={styles.benefitCard}>
                                <div className={styles.benefitIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <h3>Suporte Dedicado</h3>
                                <p>Equipe especializada para te ajudar em toda jornada, desde o cadastro até o crescimento.</p>
                            </div>
                        </div>
                    </section>

                    {/* Steps Timeline */}
                    <section className={styles.stepsSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Sua Jornada em 4 Passos</h2>
                            <p>Do cadastro à primeira aula, te guiamos em cada etapa</p>
                        </div>

                        <div className={styles.timeline}>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineNumber}>1</div>
                                <div className={styles.timelineContent}>
                                    <h3>Cadastro e Validação</h3>
                                    <p>Preencha o formulário e nossa equipe validará suas credenciais de instrutor.</p>
                                </div>
                            </div>

                            <div className={styles.timelineItem}>
                                <div className={styles.timelineNumber}>2</div>
                                <div className={styles.timelineContent}>
                                    <h3>Onboarding Personalizado</h3>
                                    <p>Tour completo pela plataforma e configuração do seu perfil profissional.</p>
                                </div>
                            </div>

                            <div className={styles.timelineItem}>
                                <div className={styles.timelineNumber}>3</div>
                                <div className={styles.timelineContent}>
                                    <h3>Conquiste Seus Primeiros Alunos</h3>
                                    <p>Comece a receber solicitações de alunos na sua região e feche suas primeiras aulas.</p>
                                </div>
                            </div>

                            <div className={styles.timelineItem}>
                                <div className={styles.timelineNumber}>4</div>
                                <div className={styles.timelineContent}>
                                    <h3>Crescimento e Reputação</h3>
                                    <p>Acumule avaliações positivas, aumente sua taxa de sucesso e ganhe mais visibilidade.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.whatsappCard}>
                            <p>
                                Entre no nosso grupo exclusivo de instrutores para acompanhar as novidades e validar suas credenciais.
                            </p>
                            <a
                                href="https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll"
                                target='_blank'
                                rel="noopener noreferrer"
                                className={styles.whatsappButton}
                            >
                                <span>Entrar no Grupo</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" />
                                </svg>
                            </a>
                        </div>
                    </section>
                </main>
            </div>

            <Footer />
        </div >
    );
};

export default BePilotInstructor;