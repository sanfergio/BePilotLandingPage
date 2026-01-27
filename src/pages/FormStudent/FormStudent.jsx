import React, { useState, useEffect } from 'react';
import styles from './FormStudent.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

import logoHero from '../../assets/noScreen-whiteLogo.png';
import iconBenefit from '../../assets/noScreen-iconLogo.png';

const BePilotStudentBeta = () => {
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
        document_type: '',
        learning_objective: '',
        questions_suggestion: '',
        group: 0
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);
    const [activeStep, setActiveStep] = useState(1);

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
                const cpfClean = value.replace(/\D/g, '');
                if (!value) error = "CPF é obrigatório";
                else if (cpfClean.length === 11 && !validateCPF(cpfClean)) error = "CPF inválido";
                break;
            case 'birth_day':
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
                    if (age < 16) error = "Você deve ter pelo menos 16 anos";
                    else if (age > 100) error = "Data de nascimento inválida";
                }
                break;
            case 'phone':
                const phoneClean = value.replace(/\D/g, '');
                if (!value) error = "Celular/WhatsApp é obrigatório";
                else if (phoneClean.length > 0 && phoneClean.length < 10) error = "Telefone inválido";
                break;
            case 'cep':
                const cepClean = value.replace(/\D/g, '');
                if (!value) error = "CEP é obrigatório";
                else if (cepClean.length > 0 && cepClean.length !== 8) error = "CEP inválido";
                break;
            case 'house_number':
                if (!value.trim()) error = "Número obrigatório";
                break;
            case 'uff_state':
                if (value && value.length !== 2) error = "UF deve ter 2 caracteres";
                break;
            case 'document_type':
                if (!value) error = "Selecione uma opção";
                break;
            case 'learning_objective':
                if (!value) error = "Selecione seu objetivo";
                break;
            default:
                break;
        }

        return error;
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
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
                setFormData(prev => ({
                    ...prev,
                    address: '',
                    neighborhood: '',
                    city: '',
                    uff_state: ''
                }));
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

                    if (errors.cep) {
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.cep;
                            return newErrors;
                        });
                    }

                    setErrors(prev => ({
                        ...prev,
                        address: data.logradouro ? '' : 'Endereço não encontrado',
                        neighborhood: data.bairro ? '' : 'Bairro não encontrado',
                        city: data.localidade ? '' : 'Cidade não encontrada',
                        uff_state: data.uf ? '' : 'UF não encontrada'
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        address: '',
                        neighborhood: '',
                        city: '',
                        uff_state: ''
                    }));
                    setErrors(prev => ({
                        ...prev,
                        cep: 'CEP não encontrado',
                        address: 'Endereço obrigatório',
                        neighborhood: 'Bairro obrigatório',
                        city: 'Cidade obrigatória',
                        uff_state: 'Estado obrigatório'
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
                setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
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

        if (!formData.name.trim()) newErrors.name = "Nome completo é obrigatório";
        else if (formData.name.trim().length < 3) newErrors.name = "Nome deve ter pelo menos 3 caracteres";

        if (!formData.email) newErrors.email = "Email é obrigatório";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";

        if (!formData.cpf) newErrors.cpf = "CPF é obrigatório";
        else if (!validateCPF(formData.cpf.replace(/\D/g, ''))) newErrors.cpf = "CPF inválido";

        if (!formData.birth_day) newErrors.birth_day = "Data de nascimento obrigatória";
        else {
            const birthDate = new Date(formData.birth_day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            if (age < 16) newErrors.birth_day = "Você deve ter pelo menos 16 anos";
            else if (age > 100) newErrors.birth_day = "Data de nascimento inválida";
        }

        if (!formData.phone) newErrors.phone = "Celular/WhatsApp é obrigatório";
        else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = "Telefone inválido";

        if (!formData.cep) newErrors.cep = "CEP é obrigatório";
        else if (formData.cep.replace(/\D/g, '').length !== 8) newErrors.cep = "CEP inválido";

        if (!formData.address.trim()) newErrors.address = "Endereço obrigatório";
        if (!formData.neighborhood.trim()) newErrors.neighborhood = "Bairro obrigatório";
        if (!formData.house_number.trim()) newErrors.house_number = "Número obrigatório";
        if (!formData.city.trim()) newErrors.city = "Cidade obrigatória";

        if (!formData.uff_state) newErrors.uff_state = "Estado obrigatório";
        else if (formData.uff_state.length !== 2) newErrors.uff_state = "UF deve ter 2 caracteres";

        if (!formData.document_type) newErrors.document_type = "Selecione uma opção";
        if (!formData.learning_objective) newErrors.learning_objective = "Selecione seu objetivo";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

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

            const { error } = await supabase
                .from('pre_student')
                .insert([dataToSend]);

            if (error) throw error;

            setSubmitStatus('success');
            setFormData({
                name: '', email: '', cpf: '', birth_day: '', phone: '',
                cep: '', address: '', neighborhood: '', house_number: '', complement: '',
                city: '', uff_state: '', document_type: '', learning_objective: '',
                questions_suggestion: '', group: 0
            });
            setErrors({});
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            setSubmitStatus('error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => { if (cepTimeout) clearTimeout(cepTimeout); };
    }, [cepTimeout]);

    return (
        <div className={styles.container}>
            <Header />

            {/* Hero Section - Design Diferente */}
            <section className={styles.hero}>
                <div className={styles.heroPattern}></div>
                <div className={styles.heroContent}>
                    <div className={styles.heroLeft}>
                        <h1 className={styles.heroTitle}>
                            Seja <span className={styles.highlight}>Beta Tester</span> da Nova Geração de Condutores
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Acesse primeiro, influencie o desenvolvimento e tenha suporte direto da equipe BePilot
                        </p>
                        <div className={styles.heroFeatures}>
                            <div className={styles.featureItem}>
                                <span>Acesso Antecipado</span>
                            </div>
                            <div className={styles.featureItem}>
                                <span>Voz no Desenvolvimento</span>
                            </div>
                            <div className={styles.featureItem}>
                                <span>Experiência Personalizada</span>
                            </div>
                        </div>
                        <a href="#formSection" className={styles.ctaButton}>
                            Garantir Meu Acesso Beta
                        </a>
                    </div>
                    <div className={styles.heroRight}>
                        <div className={styles.floatingCard}>
                            <div className={styles.cardHeader}>
                                <h3>Vantagens Exclusivas</h3>
                            </div>
                            <ul className={styles.benefitsList}>
                                <li><span>✓</span> Primeiro acesso à plataforma</li>
                                <li><span>✓</span> Canal direto com desenvolvedores</li>
                                <li><span>✓</span> Relatórios de progresso detalhados</li>
                                <li><span>✓</span> Conteúdo exclusivo Beta</li>
                                <li><span>✓</span> Certificado de Beta Tester</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>50</div>
                        <div className={styles.statLabel}>Vagas Beta Disponíveis</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>100%</div>
                        <div className={styles.statLabel}>Feedback Implementado</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>24h</div>
                        <div className={styles.statLabel}>Suporte Prioritário</div>
                    </div>
                </div>
            </section>

            {/* Form Section - Design em Etapas */}
            <section id="formSection" className={styles.formSection}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <div className={styles.stepsIndicator}>
                            <div className={`${styles.step} ${activeStep === 1 ? styles.active : ''}`}>
                                <div className={styles.stepNumber}>1</div>
                                <div className={styles.stepLabel}>Dados Pessoais</div>
                            </div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.step} ${activeStep === 2 ? styles.active : ''}`}>
                                <div className={styles.stepNumber}>2</div>
                                <div className={styles.stepLabel}>Documentação</div>
                            </div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.step} ${activeStep === 3 ? styles.active : ''}`}>
                                <div className={styles.stepNumber}>3</div>
                                <div className={styles.stepLabel}>Endereço</div>
                            </div>
                        </div>

                        <h2 className={styles.formTitle}>Pré-Cadastro Beta Tester</h2>
                        <p className={styles.formSubtitle}>Complete o formulário para garantir seu acesso antecipado</p>
                    </div>

                    {submitStatus === 'success' ? (
                        <div className={styles.successCard}>
                            <div className={styles.successIcon}>🎉</div>
                            <h3>Inscrição Confirmada!</h3>
                            <p>Você agora faz parte do programa Beta Tester da BePilot.</p>
                            <p>Faça parte do nosso grupo do whatsapp <br /> e fique por dentro de tudo que acontece no nosso App!</p>
                            <a href="https://chat.whatsapp.com/EAlqLgfYD4XEGTLQSuYJi1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappButton}>
                                Entrar no Grupo
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Step 1: Dados Pessoais */}
                            <div className={`${styles.formStep} ${activeStep === 1 ? styles.active : ''}`}>
                                <h3 className={styles.stepTitle}>Informações Pessoais</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Nome Completo *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(1)}
                                            className={errors.name ? styles.errorInput : ''}
                                            placeholder="Como consta no documento"
                                        />
                                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(1)}
                                            className={errors.email ? styles.errorInput : ''}
                                            placeholder="seu@email.com"
                                        />
                                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>CPF *</label>
                                        <input
                                            type="text"
                                            name="cpf"
                                            value={formData.cpf}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(1)}
                                            maxLength="14"
                                            placeholder="000.000.000-00"
                                            className={errors.cpf ? styles.errorInput : ''}
                                        />
                                        {errors.cpf && <span className={styles.errorText}>{errors.cpf}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Data de Nascimento *</label>
                                        <input
                                            type="date"
                                            name="birth_day"
                                            value={formData.birth_day}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(1)}
                                            className={errors.birth_day ? styles.errorInput : ''}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.birth_day && <span className={styles.errorText}>{errors.birth_day}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Celular/WhatsApp *</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(1)}
                                            className={errors.phone ? styles.errorInput : ''}
                                            placeholder="(XX) 9XXXX-XXXX"
                                        />
                                        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={styles.nextButton}
                                    onClick={() => setActiveStep(2)}
                                >
                                    Continuar →
                                </button>
                            </div>

                            {/* Step 2: Documentação */}
                            <div className={`${styles.formStep} ${activeStep === 2 ? styles.active : ''}`}>
                                <h3 className={styles.stepTitle}>Sua Situação</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Documento Atual *</label>
                                        <div className={styles.radioGroup}>
                                            <label className={styles.radioOption}>
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="CNH"
                                                    checked={formData.document_type === 'CNH'}
                                                    onChange={handleChange}
                                                    onFocus={() => setActiveStep(2)}
                                                />
                                                <span className={styles.radioLabel}>CNH (Já habilitado)</span>
                                            </label>
                                            <label className={styles.radioOption}>
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="LADV"
                                                    checked={formData.document_type === 'LADV'}
                                                    onChange={handleChange}
                                                    onFocus={() => setActiveStep(2)}
                                                />
                                                <span className={styles.radioLabel}>LADV (Em processo)</span>
                                            </label>
                                            <label className={styles.radioOption}>
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="NENHUM"
                                                    checked={formData.document_type === 'NENHUM'}
                                                    onChange={handleChange}
                                                    onFocus={() => setActiveStep(2)}
                                                />
                                                <span className={styles.radioLabel}>Nenhum (Quero começar)</span>
                                            </label>
                                        </div>
                                        {errors.document_type && <span className={styles.errorText}>{errors.document_type}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Seu Objetivo Principal *</label>
                                        <select
                                            name="learning_objective"
                                            value={formData.learning_objective}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(2)}
                                            className={errors.learning_objective ? styles.errorInput : ''}
                                        >
                                            <option value="">Selecione seu objetivo...</option>
                                            <option value="PERDER_MEDO">Perder o medo de dirigir</option>
                                            <option value="HORAS_DETRAN">Cumprir horas obrigatórias do DETRAN</option>
                                            <option value="APRIMORAR">Aprimorar minhas habilidades</option>
                                            <option value="FUTURO_USO">Conhecer para usar no futuro</option>
                                            <option value="OUTRO">Outro objetivo</option>
                                        </select>
                                        {errors.learning_objective && <span className={styles.errorText}>{errors.learning_objective}</span>}
                                    </div>
                                </div>
                                <div className={styles.stepButtons}>
                                    <button
                                        type="button"
                                        className={styles.backButton}
                                        onClick={() => setActiveStep(1)}
                                    >
                                        ← Voltar
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.nextButton}
                                        onClick={() => setActiveStep(3)}
                                    >
                                        Continuar →
                                    </button>
                                </div>
                            </div>

                            {/* Step 3: Endereço */}
                            <div className={`${styles.formStep} ${activeStep === 3 ? styles.active : ''}`}>
                                <h3 className={styles.stepTitle}>Localização</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>CEP *</label>
                                        <input
                                            type="text"
                                            name="cep"
                                            value={formData.cep}
                                            onChange={handleChange}
                                            onBlur={handleBlurCEP}
                                            onFocus={() => setActiveStep(3)}
                                            maxLength="9"
                                            placeholder="00000-000"
                                            className={errors.cep ? styles.errorInput : ''}
                                            disabled={loading}
                                        />
                                        {errors.cep && <span className={styles.errorText}>{errors.cep}</span>}
                                        {loading && <span className={styles.loadingText}>Buscando endereço...</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Endereço *</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            readOnly
                                            className={`${errors.address ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                            placeholder="Rua, Avenida, etc."
                                        />
                                        {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Número *</label>
                                        <input
                                            type="text"
                                            name="house_number"
                                            value={formData.house_number}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(3)}
                                            className={errors.house_number ? styles.errorInput : ''}
                                            placeholder="123"
                                        />
                                        {errors.house_number && <span className={styles.errorText}>{errors.house_number}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Complemento</label>
                                        <input
                                            type="text"
                                            name="complement"
                                            value={formData.complement}
                                            onChange={handleChange}
                                            onFocus={() => setActiveStep(3)}
                                            placeholder="Apto, Bloco, etc."
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Bairro *</label>
                                        <input
                                            type="text"
                                            name="neighborhood"
                                            value={formData.neighborhood}
                                            readOnly
                                            className={`${errors.neighborhood ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        />
                                        {errors.neighborhood && <span className={styles.errorText}>{errors.neighborhood}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Cidade *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            readOnly
                                            className={`${errors.city ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        />
                                        {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>UF *</label>
                                        <input
                                            type="text"
                                            name="uff_state"
                                            value={formData.uff_state}
                                            readOnly
                                            maxLength="2"
                                            className={`${errors.uff_state ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        />
                                        {errors.uff_state && <span className={styles.errorText}>{errors.uff_state}</span>}
                                    </div>
                                </div>

                                <div className={styles.additionalFields}>
                                    <div className={styles.inputGroup}>
                                        <label>Alguma dúvida ou sugestão?</label>
                                        <textarea
                                            name="questions_suggestion"
                                            value={formData.questions_suggestion}
                                            onChange={handleChange}
                                            placeholder="Conte-nos suas expectativas ou perguntas sobre o programa Beta..."
                                            rows="3"
                                        />
                                    </div>
                                    <div className={styles.checkboxGroup}>
                                        <label className={styles.checkboxOption}>
                                            <input
                                                type="checkbox"
                                                name="group"
                                                checked={formData.group === 1}
                                                onChange={handleChange}
                                            />
                                            <span>Sim, quero participar do grupo exclusivo de Beta Testers no WhatsApp</span>
                                        </label>
                                    </div>
                                </div>

                                {submitStatus === 'error' && (
                                    <div className={styles.errorMessage}>
                                        <p>❌ Ocorreu um erro ao enviar. Por favor, tente novamente.</p>
                                    </div>
                                )}

                                <div className={styles.stepButtons}>
                                    <button
                                        type="button"
                                        className={styles.backButton}
                                        onClick={() => setActiveStep(2)}
                                    >
                                        ← Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? 'Enviando...' : 'Finalizar Pré-Inscrição'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className={styles.faqSection}>
                <div className={styles.faqContainer}>
                    <h2 className={styles.faqTitle}>Perguntas Frequentes</h2>
                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <h3>Quando receberei o acesso?</h3>
                            <p>O acesso Beta será liberado em lotes. Os primeiros cadastrados recebem em até o lançamento da verão beta do App.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Preciso pagar algo?</h3>
                            <p>Não! O programa Beta Tester é completamente gratuito durante todo o período de testes.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Como funciona o feedback?</h3>
                            <p>Você terá um canal direto com nossa equipe para reportar bugs, sugerir melhorias e participar de pesquisas.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Por quanto tempo dura o Beta?</h3>
                            <p>O período Beta dura aproximadamente 3 meses, com possibilidade de extensão conforme necessidade.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BePilotStudentBeta;