import React, { useState, useEffect, useRef } from 'react';
import styles from './BePilotAmbassador.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

import logoHero from '../../assets/noScreen-whiteLogo.png';
import iconBenefit from '../../assets/noScreen-iconLogo.png';

const BePilotAmbassador = () => {
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
        group: 0
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);

    // --- Lógica de Validação (Mantida Intacta) ---
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = "Nome completo é obrigatório";
                else if (value.trim().length < 3) error = "Nome deve ter pelo menos 3 caracteres";
                break;
            case 'email':
                if (!value) error = "Email é obrigatório";
                else if (!/\S+@\S+\.\S+/.test(value)) error = "Email inválido";
                break;
            case 'cpf':
                if (!value) error = "CPF é obrigatório";
                else if (value && value.length !== 14) error = "CPF inválido";
                else if (!value.trim()) error = "CPF obrigatório";
                else if (!validateCPF(value)) error = "CPF inválido";
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
            case 'phone':
                const phoneClean = value.replace(/\D/g, '');
                if (!value) error = "Celular/WhatsApp é obrigatório";
                else if (phoneClean.length <= 10) error = "Telefone inválido";
                else if (phoneClean.length > 11) error = "Telefone inválido";
                break;
            case 'cep':
                const cepCleanVal = value.replace(/\D/g, '');
                if (!value) error = "CEP é obrigatório";
                else if (cepCleanVal.length !== 8) error = "CEP incompleto";
                break;
            case 'house_number':
                if (!value.trim()) error = "Número é obrigatório";
                break;
            case 'uf_state':
                if (value && value.length !== 2) error = "UF inválida";
                else if (!value.trim()) error = "UF obrigatória";
                break;
            case 'address': if (!value.trim()) error = "Endereço obrigatório"; break;
            case 'neighborhood': if (!value.trim()) error = "Bairro obrigatório"; break;
            case 'city': if (!value.trim()) error = "Cidade obrigatória"; break;
            default: break;
        }
        return error;
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let formattedValue = value;

        if (type === 'checkbox') {
            formattedValue = checked ? 1 : 0;
        } else {
            if (name === 'cpf') formattedValue = formatCPF(value);
            if (name === 'cep') formattedValue = formatCEP(value);
            if (name === 'phone') formattedValue = formatPhone(value);
            if (name === 'uf_state') formattedValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        if (type !== 'checkbox') {
            const error = validateField(name, formattedValue);
            setErrors(prev => ({ ...prev, [name]: error }));
        }

        if (name === 'cep') {
            const cepClean = formattedValue.replace(/\D/g, '');
            if (cepTimeout) clearTimeout(cepTimeout);

            if (cepClean.length === 8) {
                const newTimeout = setTimeout(async () => {
                    await fetchCEP(cepClean);
                }, 800);
                setCepTimeout(newTimeout);
            }
        }
    };

    const fetchCEP = async (cepClean) => {
        if (cepClean.length === 8) {
            setLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        address: data.logradouro || '',
                        neighborhood: data.bairro || '',
                        city: data.localidade || '',
                        uf_state: data.uf || '',
                    }));

                    setErrors(prev => {
                        const newErrs = { ...prev };
                        ['cep', 'address', 'neighborhood', 'city', 'uf_state'].forEach(k => delete newErrs[k]);
                        return newErrs;
                    });
                } else {
                    setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
                setErrors(prev => ({ ...prev, cep: 'Erro na busca do CEP' }));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBlurCEP = async () => {
        const cepClean = formData.cep.replace(/\D/g, '');
        if (cepClean.length === 8) await fetchCEP(cepClean);
    };

    const validateForm = () => {
        const newErrors = {};
        const fields = ['name', 'email', 'cpf', 'birth_day', 'phone', 'cep', 'address', 'neighborhood', 'house_number', 'city', 'uf_state'];

        fields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Lógica melhorada para scroll
    const scrollToFirstError = () => {
        setTimeout(() => {
            // Procura pelo atributo data-has-error que definimos no InputField
            const firstErrorElement = document.querySelector('[data-has-error="true"] input');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorElement.focus();
            }
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            scrollToFirstError();
            return;
        }

        setLoading(true);
        setSubmitStatus(null);

        try {
            const dataToSend = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                phone: formData.phone.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, ''),
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('pre_ambassador').insert([dataToSend]);

            if (error) throw error;

            setSubmitStatus('success');
            setFormData({
                name: '', email: '', cpf: '', birth_day: '', phone: '',
                cep: '', address: '', neighborhood: '', house_number: '', complement: '',
                city: '', uf_state: '', questions_suggestion: '', group: 0
            });
            setErrors({});

        } catch (error) {
            console.error('Erro:', error);
            setSubmitStatus('error');
            scrollToFirstError(); // Scroll para o topo ou aviso de erro
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => { if (cepTimeout) clearTimeout(cepTimeout); };
    }, [cepTimeout]);

    return (
        <div className={styles.pageContainer}>
            <Header />

            <main className={styles.mainContent}>
                {/* Hero Section Modernizada */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <img src={logoHero} alt="BePilot Logo" className={styles.heroLogo} />
                        <h1 className={styles.heroTitle}>O Futuro da Instrução de Trânsito</h1>
                        <p className={styles.heroText}>
                            Programa de Instrutores Embaixadores BePilot. Tecnologia, benefícios exclusivos e isenção vitalícia de taxas para os pioneiros.
                        </p>
                        <a href="#cadastro" className={styles.heroButton}>Fazer Pré-Inscrição</a>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className={styles.benefitsSection}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Benefícios Exclusivos!</h2>
                            <p className={styles.sectionSubtitle}>Por que se tornar um instrutor embaixador agora?</p>
                        </div>

                        <div className={styles.benefitsGrid}>
                            <BenefitCard
                                title="Pioneirismo Tecnológico"
                                text="Acesso antecipado à plataforma que conecta instrutores e alunos através de geolocalização inteligente."
                            />
                            <BenefitCard
                                title="Isenção Vitalícia"
                                text="Instrutores fundadores garantem 0% de taxas administrativas na plataforma para sempre."
                            />
                            <BenefitCard
                                title="Co-criação"
                                text="Participação ativa no desenvolvimento de funcionalidades, moldando o app às suas necessidades reais."
                            />
                            <BenefitCard
                                title="Selo de Autoridade"
                                text="Destaque verificado no aplicativo, garantindo maior visibilidade na sua região e confiança para novos alunos."
                            />
                        </div>
                    </div>
                </section>

                {/* Form Section */}
                <section id="cadastro" className={styles.formSection}>
                    <div className={styles.formContainer}>
                        {submitStatus === 'success' ? (
                            <SuccessMessage onReset={() => setSubmitStatus(null)} />
                        ) : (
                            <>
                                <div className={styles.formHeader}>
                                    <div className={styles.iconWrapper}>
                                        <img src={iconBenefit} alt="Ícone" />
                                    </div>
                                    <h2>Ficha de Pré-Cadastro</h2>
                                    <p>Preencha os campos abaixo com atenção para validar sua elegibilidade.</p>
                                </div>

                                <form ref={formRef} onSubmit={handleSubmit} className={styles.formLayout} noValidate>

                                    {/* Seção 1: Dados Pessoais */}
                                    <div className={styles.formSectionGroup}>
                                        <h3 className={styles.groupTitle}>Identificação</h3>
                                        <div className={styles.gridRow}>
                                            <InputField
                                                label="Nome Completo"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                error={errors.name}
                                                placeholder="Nome completo conforme documento"
                                                required
                                                className={styles.colSpan2}
                                            />
                                            <InputField
                                                label="Email Corporativo ou Pessoal"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={errors.email}
                                                placeholder="seu@email.com"
                                                required
                                            />
                                            <InputField
                                                label="Celular / WhatsApp"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                error={errors.phone}
                                                placeholder="(00) 00000-0000"
                                                required
                                            />
                                            <InputField
                                                label="CPF"
                                                name="cpf"
                                                value={formData.cpf}
                                                onChange={handleChange}
                                                error={errors.cpf}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                                required
                                            />
                                            <InputField
                                                label="Data de Nascimento"
                                                name="birth_day"
                                                type="date"
                                                value={formData.birth_day}
                                                onChange={handleChange}
                                                error={errors.birth_day}
                                                max={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Seção 2: Localização */}
                                    <div className={styles.formSectionGroup}>
                                        <h3 className={styles.groupTitle}>Endereço e Atuação</h3>
                                        <div className={styles.gridRow}>
                                            <div className={styles.cepContainer}>
                                                <InputField
                                                    label="CEP"
                                                    name="cep"
                                                    value={formData.cep}
                                                    onChange={handleChange}
                                                    onBlur={handleBlurCEP}
                                                    error={errors.cep}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                    required
                                                    disabled={loading}
                                                />
                                                {loading && <div className={styles.spinner}></div>}
                                            </div>

                                            <InputField
                                                label="Endereço"
                                                name="address"
                                                value={formData.address}
                                                readOnly
                                                error={errors.address}
                                                className={`${styles.colSpan2} ${styles.readOnlyField}`}
                                                placeholder="Logradouro"
                                            />

                                            <InputField
                                                label="Número"
                                                name="house_number"
                                                value={formData.house_number}
                                                onChange={handleChange}
                                                error={errors.house_number}
                                                placeholder="Nº"
                                                required
                                            />

                                            <InputField
                                                label="Complemento"
                                                name="complement"
                                                value={formData.complement}
                                                onChange={handleChange}
                                                placeholder="Apto, Bloco (Opcional)"
                                            />

                                            <InputField
                                                label="Bairro"
                                                name="neighborhood"
                                                value={formData.neighborhood}
                                                readOnly
                                                error={errors.neighborhood}
                                                className={styles.readOnlyField}
                                                placeholder="Bairro"
                                            />

                                            <div className={styles.cityUfGroup}>
                                                <InputField
                                                    label="Cidade"
                                                    name="city"
                                                    value={formData.city}
                                                    readOnly
                                                    error={errors.city}
                                                    className={`${styles.readOnlyField} ${styles.flexGrow}`}
                                                />
                                                <InputField
                                                    label="UF"
                                                    name="uf_state"
                                                    value={formData.uf_state}
                                                    readOnly
                                                    error={errors.uf_state}
                                                    className={`${styles.readOnlyField} ${styles.flexShrink}`}
                                                    maxLength={2}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção 3: Finalização */}
                                    <div className={styles.formSectionGroup}>
                                        <h3 className={styles.groupTitle}>Preferências</h3>

                                        <div className={styles.inputBlock}>
                                            <label className={styles.label}>Dúvidas ou Sugestões</label>
                                            <textarea
                                                name="questions_suggestion"
                                                value={formData.questions_suggestion}
                                                onChange={handleChange}
                                                placeholder="Tem alguma sugestão para a plataforma? Digite aqui..."
                                                className={styles.textarea}
                                                rows="3"
                                            />
                                        </div>

                                        <div className={styles.checkboxContainer}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    name="group"
                                                    checked={formData.group === 1}
                                                    onChange={handleChange}
                                                />
                                                <span className={styles.checkboxText}>
                                                    Autorizo o contato e desejo entrar no grupo VIP de instrutores para atualizações.
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {submitStatus === 'error' && (
                                        <div className={styles.errorMessage}>
                                            Não foi possível enviar. Verifique os campos destacados em vermelho.
                                        </div>
                                    )}

                                    <div className={styles.footerAction}>
                                        <button type="submit" className={styles.submitButton} disabled={loading}>
                                            {loading ? 'Processando Inscrição...' : 'Confirmar Pré-Cadastro'}
                                        </button>
                                        <p className={styles.privacyNote}>Seus dados estão seguros e serão utilizados apenas para fins de cadastro na plataforma.</p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

// Componente de Input Refatorado
const InputField = ({ label, name, value, onChange, error, className = '', readOnly, type = "text", ...props }) => (
    <div className={`${styles.inputWrapper} ${className}`} data-has-error={!!error}>
        <label htmlFor={name} className={styles.label}>
            {label} {props.required && <span className={styles.requiredMark}>*</span>}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`${styles.input} ${error ? styles.inputError : ''} ${readOnly ? styles.inputReadOnly : ''}`}
            readOnly={readOnly}
            {...props}
        />
        {error && <span className={styles.errorText}>{error}</span>}
    </div>
);

// Componente de Card de Benefício Refatorado
const BenefitCard = ({ title, text }) => (
    <div className={styles.benefitCard}>
        <div className={styles.cardHeaderLine}></div>
        <h3>{title}</h3>
        <p>{text}</p>
    </div>
);

// Componente de Sucesso Refatorado
const SuccessMessage = ({ onReset }) => (
    <div className={styles.successContainer}>
        <div className={styles.successIconCircle}>
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <h3>Cadastro Recebido</h3>
        <p>Seus dados foram registrados em nossa base de embaixadores.</p>

        <div className={styles.whatsappCard}>
            <div className={styles.whatsappContent}>
                <h4>Próximo Passo: Comunidade VIP</h4>
                <p>Para não perder os lançamentos e cronogramas, acesse o grupo oficial.</p>
            </div>
            <a href="https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll" target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
                Acessar Grupo
            </a>
        </div>

        <button onClick={onReset} className={styles.secondaryButton}>
            Cadastrar novo instrutor
        </button>
    </div>
);

export default BePilotAmbassador;