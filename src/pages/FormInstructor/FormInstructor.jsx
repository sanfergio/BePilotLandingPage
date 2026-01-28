import React, { useState, useEffect, useRef } from 'react';
import styles from './FormInstructor.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

import logoHero from '../../assets/noScreen-whiteLogo.png';
import iconBenefit from '../../assets/noScreen-iconLogo.png';

const BePilotAmbassador = () => {
    const formRef = useRef(null); // Referência para o formulário
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
        uff_state: '',
        questions_suggestion: '',
        group: 0
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);

    // --- Lógica de Validação e Formatação (Mantida e Otimizada) ---

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
                else if (phoneClean.length < 10) error = "Telefone inválido";
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
            case 'uff_state':
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
            if (name === 'uff_state') formattedValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        if (type !== 'checkbox') {
            const error = validateField(name, formattedValue);
            setErrors(prev => ({ ...prev, [name]: error }));
        }

        if (name === 'cep') {
            const cepClean = formattedValue.replace(/\D/g, '');
            if (cepTimeout) clearTimeout(cepTimeout);

            if (cepClean.length !== 8) {
                // Não limpa imediatamente para não frustrar o usuário enquanto digita
            } else {
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
                        uff_state: data.uf || '',
                    }));

                    // Limpa erros relacionados ao endereço
                    setErrors(prev => {
                        const newErrs = { ...prev };
                        ['cep', 'address', 'neighborhood', 'city', 'uff_state'].forEach(k => delete newErrs[k]);
                        return newErrs;
                    });
                } else {
                    setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
                    // Opcional: limpar endereço se CEP não encontrado
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
        // Lista de campos obrigatórios para verificar
        const fields = ['name', 'email', 'cpf', 'birth_day', 'phone', 'cep', 'address', 'neighborhood', 'house_number', 'city', 'uff_state'];

        fields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const scrollToFirstError = () => {
        setTimeout(() => {
            const firstErrorElement = document.querySelector(`.${styles.inputError}`);
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

            const { error } = await supabase.from('pre_instructor').insert([dataToSend]);

            if (error) throw error;

            setSubmitStatus('success');
            setFormData({
                name: '', email: '', cpf: '', birth_day: '', phone: '',
                cep: '', address: '', neighborhood: '', house_number: '', complement: '',
                city: '', uff_state: '', questions_suggestion: '', group: 0
            });
            setErrors({});
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Erro:', error);
            setSubmitStatus('error');
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
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <img src={logoHero} alt="BePilot Logo" className={styles.heroLogo} />
                        <h1 className={styles.heroTitle}>O Futuro da Instrução de Trânsito</h1>
                        <p className={styles.heroText}>
                            Torne-se um <strong>Instrutor Embaixador BePilot</strong>. Garanta benefícios exclusivos,
                            isenção vitalícia de taxas e destaque em sua região.
                        </p>
                        <a href="#cadastro" className={styles.heroButton}>Quero ser Embaixador</a>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className={styles.benefitsSection}>
                    <h2 className={styles.sectionTitle}>Por que se cadastrar agora?</h2>
                    <div className={styles.benefitsGrid}>
                        <BenefitCard
                            img="https://img.freepik.com/fotos-gratis/jovem-sorridente-testando-um-carro_23-2148333009.jpg"
                            title="Pioneirismo"
                            text="Seja um dos primeiros a utilizar a tecnologia que conecta instrutores e alunos de forma inteligente."
                        />
                        <BenefitCard
                            img="https://img.freepik.com/fotos-gratis/elegante-motorista-de-taxi-em-traje_23-2149204585.jpg"
                            title="Gratuidade Vitalícia"
                            text="Embaixadores cadastrados nesta fase terão isenção total de taxas da plataforma para sempre."
                        />
                        <BenefitCard
                            img="https://img.freepik.com/fotos-gratis/homem-oferecendo-sua-mao-para-apertar_23-2148384936.jpg"
                            title="Construa Conosco"
                            text="Sua opinião é fundamental. Ajudará a definir as próximas funcionalidades sob medida para você."
                        />
                        <BenefitCard
                            img="https://img.freepik.com/fotos-gratis/pessoa-que-se-prepara-para-obter-a-carta-de-conducao_23-2150167549.jpg"
                            title="Destaque no App"
                            text="Ganhe o selo especial de Instrutor Embaixador e tenha prioridade de visualização em sua região."
                        />
                    </div>
                </section>

                {/* Form Section */}
                <section id="cadastro" className={styles.formSection}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <img src={iconBenefit} alt="Ícone" className={styles.formIcon} />
                            <h2>Pré-Cadastro de Instrutor</h2>
                            <p>Preencha seus dados para garantir sua vaga de Instrutor Embaixador.</p>
                        </div>

                        {submitStatus === 'success' ? (
                            <div className={styles.successState}>
                                <div className={styles.successIcon}>🎉</div>
                                <h3>Cadastro Realizado com Sucesso!</h3>
                                <p>Agradecemos seu interesse. Entraremos em contato em breve.</p>
                                <div className={styles.whatsappBox}>
                                    <p>Não perca nenhuma novidade!<br />Entre em nosso grupo oficial dos Instrutores Embaixadores no Whatsapp:</p>
                                    <a href="https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll" target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
                                        Entrar no Grupo VIP
                                    </a>
                                </div>
                                <button onClick={() => setSubmitStatus(null)} className={styles.textButton}>
                                    Enviar outro pré-cadastro
                                </button>
                            </div>
                        ) : (
                            <form ref={formRef} onSubmit={handleSubmit} className={styles.formGrid} noValidate>

                                {/* Grupo: Dados Pessoais */}
                                <div className={styles.formGroupTitle}>Dados Pessoais</div>

                                <InputField
                                    label="Nome Completo"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                    placeholder="Digite seu nome completo"
                                    required
                                    className={styles.spanFull}
                                />

                                <InputField
                                    label="Email"
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
                                    placeholder="(XX) 9XXXX-XXXX"
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

                                {/* Grupo: Endereço */}
                                <div className={styles.formGroupTitle}>Localização</div>

                                <div className={styles.cepWrapper}>
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
                                    {loading && <span className={styles.loadingIndicator}>Buscando...</span>}
                                </div>

                                <div className={styles.emptySpace}></div> {/* Spacer for grid alignment */}

                                <InputField
                                    label="Endereço"
                                    name="address"
                                    value={formData.address}
                                    readOnly
                                    error={errors.address}
                                    className={`${styles.spanFull} ${styles.readOnly}`}
                                    placeholder="Preenchimento automático"
                                />

                                <InputField
                                    label="Número"
                                    name="house_number"
                                    value={formData.house_number}
                                    onChange={handleChange}
                                    error={errors.house_number}
                                    placeholder="123"
                                    required
                                />

                                <InputField
                                    label="Complemento (Opcional)"
                                    name="complement"
                                    value={formData.complement}
                                    onChange={handleChange}
                                    placeholder="Apto, Bloco, etc."
                                />

                                <InputField
                                    label="Bairro"
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    readOnly
                                    error={errors.neighborhood}
                                    className={styles.readOnly}
                                />

                                <div className={styles.cityStateGrid}>
                                    <InputField
                                        label="Cidade"
                                        name="city"
                                        value={formData.city}
                                        readOnly
                                        error={errors.city}
                                        className={styles.readOnly}
                                    />
                                    <InputField
                                        label="UF"
                                        name="uff_state"
                                        value={formData.uff_state}
                                        readOnly
                                        error={errors.uff_state}
                                        className={styles.readOnly}
                                        maxLength={2}
                                    />
                                </div>

                                {/* Grupo: Finalização */}
                                <div className={styles.formGroupTitle}>Finalização</div>

                                <div className={styles.spanFull}>
                                    <label className={styles.label}>Dúvidas ou Sugestões (Opcional)</label>
                                    <br />
                                    <br />
                                    <InputField
                                        type="text"
                                        name="questions_suggestion"
                                        value={formData.questions_suggestion}
                                        onChange={handleChange}
                                        placeholder="Gostaria de sugerir..."
                                        className={styles.input}
                                    />
                                </div>

                                <div className={`${styles.spanFull} ${styles.checkboxWrapper}`}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="group"
                                            checked={formData.group === 1}
                                            onChange={handleChange}
                                            className={styles.spanFull}
                                        />
                                        <span className={styles.checkboxText}>
                                            Deseja entrar no grupo do WhatsApp para receber atualizações exclusivas?
                                        </span>
                                    </label>
                                </div>

                                {submitStatus === 'error' && (
                                    <div className={`${styles.spanFull} ${styles.errorMessage}`}>
                                        Ocorreu um erro ao enviar. Verifique os campos em vermelho e tente novamente.
                                    </div>
                                )}

                                <div className={styles.spanFull}>
                                    <button type="submit" className={styles.submitButton} disabled={loading}>
                                        {loading ? 'Processando...' : 'Confirmar Pré-Cadastro'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

// Sub-componentes para limpar o JSX principal
const InputField = ({ label, name, value, onChange, error, className = '', readOnly, type = "text", ...props }) => (
    <div className={`${styles.inputGroup} ${className}`}>
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

const BenefitCard = ({ img, title, text }) => (
    <div className={styles.benefitCard}>
        <div className={styles.imageContainer}>
            <img src={img} alt={title} className={styles.cardImage} />
        </div>
        <h3>{title}</h3>
        <p>{text}</p>
    </div>
);

export default BePilotAmbassador;