import React, { useState, useEffect, useRef } from 'react';
import styles from './FormCFC.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

// Ícones SVG Inline para performance e estilo limpo
const Icons = {
    Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="12"></line><line x1="15" y1="12" x2="15" y2="2"></line><line x1="12" y1="2" x2="12" y2="2"></line></svg>,
    MapPin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Chart: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
    Target: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
    Car: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    Users: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
};

const BePilotCFC = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', cpf: '', phone: '',
        cnpj: '', businessName: '', businessEmail: '', businessPhone: '', businessWebsite: '',
        cep: '', address: '', neighborhood: '', house_number: '', complement: '',
        city: '', uff_state: '',
        instructor_count: '', vehicle_count: '',
        questions_suggestion: '', group: 0
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const formRef = useRef(null);

    // Mapeamento de campos por passo para validação e navegação
    const steps = [
        { id: 1, key: 'responsavel', title: 'Responsável', icon: <Icons.User />, fields: ['name', 'cpf', 'email', 'phone'] },
        { id: 2, key: 'empresa', title: 'Empresa', icon: <Icons.Building />, fields: ['cnpj', 'businessName', 'businessEmail', 'businessPhone', 'instructor_count', 'vehicle_count'] },
        { id: 3, key: 'endereco', title: 'Endereço', icon: <Icons.MapPin />, fields: ['cep', 'address', 'house_number', 'neighborhood', 'city', 'uff_state'] }
    ];

    const formatCNPJ = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18);
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    };

    const validateField = (name, value) => {
        let error = '';
        const cleanValue = typeof value === 'string' ? value.trim() : value;

        switch (name) {
            case 'name':
                if (!cleanValue) error = "Nome completo é obrigatório";
                else if (cleanValue.length < 3) error = "Nome deve ter pelo menos 3 caracteres";
                break;
            case 'email':
            case 'businessEmail':
                if (!cleanValue) error = "Email é obrigatório";
                else if (!/\S+@\S+\.\S+/.test(cleanValue)) error = "Insira um email válido";
                break;
            case 'cpf':
                if (!value) error = "CPF é obrigatório";
                else if (value && value.length !== 14) error = "CPF inválido";
                else if (!value.trim()) error = "CPF obrigatório";
                else if (!validateCPF(value)) error = "CPF inválido";
                break;
            case 'cnpj':
                const cnpjClean = value.replace(/\D/g, '');
                if (!cleanValue) error = "CNPJ é obrigatório";
                else if (cnpjClean.length < 14) error = "CNPJ inválido";
                break;
            case 'phone':
            case 'businessPhone':
                const phoneClean = value.replace(/\D/g, '');
                if (!value) error = "Celular/WhatsApp é obrigatório";
                else if (phoneClean.length <= 10) error = "Telefone inválido";
                else if (phoneClean.length > 11) error = "Telefone inválido";
                break;
            case 'cep':
                const cepClean = value.replace(/\D/g, '');
                if (!cleanValue) error = "CEP é obrigatório";
                else if (cepClean.length !== 8) error = "CEP incompleto";
                break;
            case 'businessName':
                if (!cleanValue) error = "Razão Social é obrigatória";
                break;
            case 'house_number':
                if (!cleanValue) error = "Número obrigatório";
                break;
            case 'address':
                if (!cleanValue) error = "Endereço obrigatório";
                break;
            case 'neighborhood':
                if (!cleanValue) error = "Bairro obrigatório";
                break;
            case 'city':
                if (!cleanValue) error = "Cidade obrigatória";
                break;
            case 'uff_state':
                if (value && value.length !== 2) error = "UF inválida";
                else if (!value.trim()) error = "UF obrigatória";
                break;
            case 'instructor_count':
                if (value && isNaN(value)) error = "Nº Instrutores deve ser numérico";
                else if (value <= 0) error = "Nº Instrutores não pode ser negativo";
                break;
            case 'vehicle_count':
                if (value && isNaN(value)) error = "Nº Veículos deve ser numérico";
                else if (value <= 0) error = "Nº Veículos não pode ser negativo";
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let formattedValue = value;

        if (type === 'checkbox') {
            formattedValue = checked ? 1 : 0;
        } else {
            if (name === 'cpf') formattedValue = formatCPF(value);
            if (name === 'cnpj') formattedValue = formatCNPJ(value);
            if (name === 'cep') formattedValue = formatCEP(value);
            if (name === 'phone' || name === 'businessPhone') formattedValue = formatPhone(value);
            if (name === 'uff_state') formattedValue = value.toUpperCase().slice(0, 2);
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
                // Reset address fields if CEP is cleared or invalid
            } else {
                const newTimeout = setTimeout(() => fetchCEP(cepClean), 800);
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

                    // Limpar erros dos campos preenchidos
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        ['cep', 'address', 'neighborhood', 'city', 'uff_state'].forEach(k => delete newErrors[k]);
                        return newErrors;
                    });
                } else {
                    setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
                setErrors(prev => ({ ...prev, cep: 'Erro de conexão ao buscar CEP' }));
            } finally {
                setLoading(false);
            }
        }
    };

    const focusOnError = (newErrors) => {
        const firstErrorKey = Object.keys(newErrors)[0];
        if (firstErrorKey) {
            // Descobrir em qual step está o erro
            const stepWithError = steps.find(step => step.fields.includes(firstErrorKey));

            if (stepWithError) {
                setCurrentStep(stepWithError.id);
                // Pequeno delay para permitir a renderização da aba antes do foco
                setTimeout(() => {
                    const element = document.querySelector(`[name="${firstErrorKey}"]`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.focus();
                    }
                }, 100);
            }
        }
    };

    const validateAll = () => {
        const newErrors = {};
        // Valida todos os campos de todos os steps
        steps.forEach(step => {
            step.fields.forEach(field => {
                const error = validateField(field, formData[field]);
                if (error) newErrors[field] = error;
            });
        });
        setErrors(newErrors);
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateAll();

        if (Object.keys(newErrors).length > 0) {
            focusOnError(newErrors);
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                cnpj: formData.cnpj.replace(/\D/g, ''),
                phone: formData.phone.replace(/\D/g, ''),
                businessPhone: formData.businessPhone.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, ''),
                instructor_count: formData.instructor_count.replace(/\D/g, ''),
                vehicle_count: formData.vehicle_count.replace(/\D/g, ''),
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('pre_cfc').insert([dataToSend]);
            if (error) throw error;

            setSubmitStatus('success');
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Erro ao enviar:', error);
            setSubmitStatus('error');
        } finally {
            setLoading(false);
        }
    };

    // Navegação entre steps
    const nextStep = () => {
        // Valida apenas os campos do step atual antes de avançar
        const currentFields = steps[currentStep - 1].fields;
        const currentErrors = {};
        let isValid = true;

        currentFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                currentErrors[field] = error;
                isValid = false;
            }
        });

        if (!isValid) {
            setErrors(prev => ({ ...prev, ...currentErrors }));
            focusOnError(currentErrors);
        } else {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.mainContent}>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContainer}>
                        <div className={styles.heroText}>
                            <div className={styles.badge}>
                                <span>PARA AUTOESCOLAS</span>
                            </div>
                            <h1 className={styles.title}>
                                Modernize seu <span className={styles.highlight}>CFC</span> com Tecnologia de Ponta
                            </h1>
                            <p className={styles.subtitle}>
                                Cadastre-se e seja um dos pioneiros na plataforma que unifica a gestão de instrutores, alunos, frota e financeiro.
                            </p>

                            <div className={styles.statsRow}>
                                <div className={styles.statItem}>
                                    <strong>+80%</strong>
                                    <span>Eficiência</span>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.statItem}>
                                    <strong>100%</strong>
                                    <span>Digital</span>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.statItem}>
                                    <strong>24/7</strong>
                                    <span>Suporte</span>
                                </div>
                            </div>

                            <button onClick={() => {
                                document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' });
                            }} className={styles.ctaPrimary}>
                                Quero Cadastrar meu CFC
                            </button>
                        </div>

                        <div className={styles.heroVisual}>
                            <div className={styles.featureList}>
                                <div className={styles.featureItem}>
                                    <div className={styles.iconBox}><Icons.Chart /></div>
                                    <div>
                                        <h3>Gestão Inteligente</h3>
                                        <p>Controle total de KPIs e métricas.</p>
                                    </div>
                                </div>
                                <div className={styles.featureItem}>
                                    <div className={styles.iconBox}><Icons.Target /></div>
                                    <div>
                                        <h3>Captação de Alunos</h3>
                                        <p>Visibilidade baseada em localização.</p>
                                    </div>
                                </div>
                                <div className={styles.featureItem}>
                                    <div className={styles.iconBox}><Icons.Car /></div>
                                    <div>
                                        <h3>Controle de Frota</h3>
                                        <p>Gestão de manutenção e uso.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form Section */}
                <section id="registration-form" className={styles.formSection}>
                    <div className={styles.container}>
                        {submitStatus === 'success' ? (
                            <div className={styles.successCard}>
                                <div className={styles.successIconWrapper}>
                                    <Icons.Check />
                                </div>
                                <h2>Cadastro Realizado com Sucesso!</h2>
                                <p>Sua autoescola foi registrada em nossa base de parceiros pioneiros.</p>
                                <div className={styles.successDivider}></div>
                                <p className={styles.nextSteps}>
                                    Nossa equipe de implantação entrará em contato em até <strong>24 horas úteis</strong>.
                                </p>
                                <div className={styles.actionButtons}>
                                    <a href="https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                                        Acessar Grupo VIP
                                    </a>
                                    <button onClick={() => window.location.reload()} className={styles.outlineBtn}>
                                        Novo Cadastro
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.formCard}>
                                <div className={styles.formHeader}>
                                    <h2>Ficha de Cadastro</h2>
                                    <p>Preencha os dados para iniciar sua jornada digital.</p>
                                </div>

                                {/* Stepper Navigation */}
                                <div className={styles.stepper}>
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={`${styles.stepItem} ${currentStep === step.id ? styles.activeStep : ''} ${currentStep > step.id ? styles.completedStep : ''}`}
                                            onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                                        >
                                            <div className={styles.stepIcon}>
                                                {step.icon}
                                            </div>
                                            <span className={styles.stepLabel}>{step.title}</span>
                                            {index < steps.length - 1 && <div className={styles.stepLine}></div>}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className={styles.mainForm} ref={formRef}>

                                    {/* Step 1: Responsável */}
                                    <div className={currentStep === 1 ? styles.stepContentActive : styles.stepContentHidden}>
                                        <div className={styles.gridTwo}>
                                            <div className={styles.inputGroup}>
                                                <label htmlFor="name">Nome Completo *</label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={errors.name ? styles.inputError : ''}
                                                    placeholder="Ex: João da Silva"
                                                />
                                                {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="cpf">CPF *</label>
                                                <input
                                                    id="cpf"
                                                    type="text"
                                                    name="cpf"
                                                    value={formData.cpf}
                                                    onChange={handleChange}
                                                    maxLength="14"
                                                    className={errors.cpf ? styles.inputError : ''}
                                                    placeholder="000.000.000-00"
                                                />
                                                {errors.cpf && <span className={styles.errorMsg}>{errors.cpf}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="email">Email Pessoal *</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={errors.email ? styles.inputError : ''}
                                                    placeholder="seu@email.com"
                                                />
                                                {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="phone">Celular / WhatsApp *</label>
                                                <input
                                                    id="phone"
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={errors.phone ? styles.inputError : ''}
                                                    placeholder="(00) 90000-0000"
                                                />
                                                {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Empresa */}
                                    <div className={currentStep === 2 ? styles.stepContentActive : styles.stepContentHidden}>
                                        <div className={styles.gridTwo}>
                                            <div className={styles.inputGroup}>
                                                <label htmlFor="cnpj">CNPJ *</label>
                                                <input
                                                    id="cnpj"
                                                    type="text"
                                                    name="cnpj"
                                                    value={formData.cnpj}
                                                    onChange={handleChange}
                                                    maxLength="18"
                                                    className={errors.cnpj ? styles.inputError : ''}
                                                    placeholder="00.000.000/0000-00"
                                                />
                                                {errors.cnpj && <span className={styles.errorMsg}>{errors.cnpj}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="businessName">Razão Social *</label>
                                                <input
                                                    id="businessName"
                                                    type="text"
                                                    name="businessName"
                                                    value={formData.businessName}
                                                    onChange={handleChange}
                                                    className={errors.businessName ? styles.inputError : ''}
                                                    placeholder="Nome registrado da empresa"
                                                />
                                                {errors.businessName && <span className={styles.errorMsg}>{errors.businessName}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="businessEmail">Email Corporativo *</label>
                                                <input
                                                    id="businessEmail"
                                                    type="email"
                                                    name="businessEmail"
                                                    value={formData.businessEmail}
                                                    onChange={handleChange}
                                                    className={errors.businessEmail ? styles.inputError : ''}
                                                />
                                                {errors.businessEmail && <span className={styles.errorMsg}>{errors.businessEmail}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="businessPhone">Telefone Comercial *</label>
                                                <input
                                                    id="businessPhone"
                                                    type="text"
                                                    name="businessPhone"
                                                    value={formData.businessPhone}
                                                    onChange={handleChange}
                                                    className={errors.businessPhone ? styles.inputError : ''}
                                                />
                                                {errors.businessPhone && <span className={styles.errorMsg}>{errors.businessPhone}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="businessWebsite">Site (Opcional)</label>
                                                <input
                                                    id="businessWebsite"
                                                    type="text"
                                                    name="businessWebsite"
                                                    value={formData.businessWebsite}
                                                    onChange={handleChange}
                                                    placeholder="www.suaautoescola.com.br"
                                                />
                                            </div>

                                            <div className={styles.gridNested}>
                                                <div className={styles.inputGroup}>
                                                    <label htmlFor="instructor_count">Nº Instrutores</label>
                                                    <input
                                                        id="instructor_count"
                                                        type="number"
                                                        name="instructor_count"
                                                        value={formData.instructor_count}
                                                        onChange={handleChange}
                                                        min="0"
                                                    />
                                                    {errors.instructor_count && <span className={styles.errorMsg}>{errors.instructor_count}</span>}
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label htmlFor="vehicle_count">Nº Veículos</label>
                                                    <input
                                                        id="vehicle_count"
                                                        type="number"
                                                        name="vehicle_count"
                                                        value={formData.vehicle_count}
                                                        onChange={handleChange}
                                                        min="0"
                                                    />
                                                    {errors.vehicle_count && <span className={styles.errorMsg}>{errors.vehicle_count}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3: Endereço & Finalização */}
                                    <div className={currentStep === 3 ? styles.stepContentActive : styles.stepContentHidden}>
                                        <div className={styles.gridAddress}>
                                            <div className={styles.inputGroup}>
                                                <label htmlFor="cep">CEP *</label>
                                                <div className={styles.inputWrapper}>
                                                    <input
                                                        id="cep"
                                                        type="text"
                                                        name="cep"
                                                        value={formData.cep}
                                                        onChange={handleChange}
                                                        maxLength="9"
                                                        className={errors.cep ? styles.inputError : ''}
                                                        placeholder="00000-000"
                                                    />
                                                    {loading && <span className={styles.spinner}></span>}
                                                </div>
                                                {errors.cep && <span className={styles.errorMsg}>{errors.cep}</span>}
                                            </div>

                                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                                <label htmlFor="address">Endereço *</label>
                                                <input
                                                    id="address"
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    readOnly
                                                    className={styles.readOnly}
                                                />
                                                {errors.address && <span className={styles.errorMsg}>{errors.address}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="house_number">Número *</label>
                                                <input
                                                    id="house_number"
                                                    type="text"
                                                    name="house_number"
                                                    value={formData.house_number}
                                                    onChange={handleChange}
                                                    className={errors.house_number ? styles.inputError : ''}
                                                />
                                                {errors.house_number && <span className={styles.errorMsg}>{errors.house_number}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="complement">Complemento</label>
                                                <input
                                                    id="complement"
                                                    type="text"
                                                    name="complement"
                                                    value={formData.complement}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="neighborhood">Bairro *</label>
                                                <input
                                                    id="neighborhood"
                                                    type="text"
                                                    name="neighborhood"
                                                    value={formData.neighborhood}
                                                    readOnly
                                                    className={styles.readOnly}
                                                />
                                                {errors.neighborhood && <span className={styles.errorMsg}>{errors.neighborhood}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="city">Cidade *</label>
                                                <input
                                                    id="city"
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    readOnly
                                                    className={styles.readOnly}
                                                />
                                                {errors.city && <span className={styles.errorMsg}>{errors.city}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label htmlFor="uff_state">UF *</label>
                                                <input
                                                    id="uff_state"
                                                    type="text"
                                                    name="uff_state"
                                                    value={formData.uff_state}
                                                    readOnly
                                                    className={styles.readOnly}
                                                />
                                                {errors.uff_state && <span className={styles.errorMsg}>{errors.uff_state}</span>}
                                            </div>
                                        </div>

                                        <div className={styles.additionalSection}>
                                            <div className={styles.inputGroup}>
                                                <label htmlFor="questions_suggestion">Observações ou Dúvidas</label>
                                                <textarea
                                                    id="questions_suggestion"
                                                    name="questions_suggestion"
                                                    value={formData.questions_suggestion}
                                                    onChange={handleChange}
                                                    rows="3"
                                                />
                                            </div>

                                            <label className={styles.checkboxContainer}>
                                                <input
                                                    type="checkbox"
                                                    name="group"
                                                    checked={formData.group === 1}
                                                    onChange={handleChange}
                                                />
                                                <span className={styles.checkmark}></span>
                                                <span className={styles.checkboxText}>Desejo participar do grupo exclusivo de Diretores de CFC no WhatsApp.</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={styles.formFooter}>
                                        {submitStatus === 'error' && (
                                            <div className={styles.submitError}>
                                                Algo deu errado. Verifique os campos e tente novamente.
                                            </div>
                                        )}

                                        <div className={styles.navButtons}>
                                            {currentStep > 1 && (
                                                <button type="button" onClick={prevStep} className={styles.backBtn}>
                                                    Voltar
                                                </button>
                                            )}

                                            {currentStep < 3 ? (
                                                <button type="button" onClick={nextStep} className={styles.nextBtn}>
                                                    Próximo Passo
                                                </button>
                                            ) : (
                                                <button type="submit" disabled={loading} className={styles.submitBtn}>
                                                    {loading ? 'Processando...' : 'Finalizar Cadastro'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </section>

                {/* FAQ Simplificado */}
                <section className={styles.faqSection}>
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Perguntas Frequentes</h2>
                        <div className={styles.faqGrid}>
                            <div className={styles.faqItem}>
                                <h3>O sistema é online?</h3>
                                <p>Sim, 100% em nuvem. Acesse de qualquer lugar sem instalações complexas.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>Existe custo de adesão agora?</h3>
                                <p>O pré-cadastro garante condições especiais de lançamento para os primeiros parceiros.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>Como migro meus dados?</h3>
                                <p>Nossa equipe oferece suporte completo para importação de dados de alunos e agenda.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BePilotCFC;