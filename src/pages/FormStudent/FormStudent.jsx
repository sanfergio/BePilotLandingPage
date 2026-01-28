import React, { useState, useEffect } from 'react';
import styles from './FormStudent.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

// Mapeamento de campos por etapa para controle de erro
const STEP_FIELDS = {
    1: ['name', 'email', 'cpf', 'birth_day', 'phone'],
    2: ['document_type', 'learning_objective'],
    3: ['cep', 'address', 'house_number', 'neighborhood', 'city', 'uf_state']
};

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
        uf_state: '',
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

    // --- Validadores Auxiliares ---

    const calculateAge = (dateString) => {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validateField = (name, value) => {
        let error = '';
        const cleanValue = value ? String(value).trim() : '';

        switch (name) {
            case 'name':
                if (!cleanValue) error = "O nome completo é obrigatório.";
                else if (cleanValue.length < 3) error = "O nome deve conter no mínimo 3 caracteres.";
                break;
            case 'email':
                if (!cleanValue) error = "O e-mail é obrigatório.";
                else if (!/\S+@\S+\.\S+/.test(cleanValue)) error = "Por favor, insira um e-mail válido.";
                break;
            case 'cpf':
                if (!value) error = "CPF é obrigatório";
                else if (value && value.length !== 14) error = "CPF inválido";
                else if (!value.trim()) error = "CPF obrigatório";
                else if (!validateCPF(value)) error = "CPF inválido";
                break;
            case 'birth_day':
                if (!cleanValue) error = "A data de nascimento é obrigatória.";
                else {
                    const age = calculateAge(cleanValue);
                    if (age < 16) error = "É necessário ter no mínimo 16 anos.";
                    else if (age > 100) error = "Data de nascimento inválida.";
                }
                break;
            case 'phone':
                const phoneClean = value.replace(/\D/g, '');
                if (!value) error = "Celular/WhatsApp é obrigatório";
                else if (phoneClean.length < 10) error = "Telefone inválido";
                else if (phoneClean.length > 11) error = "Telefone inválido";
                break;
            case 'cep':
                const cepDigits = cleanValue.replace(/\D/g, '');
                if (!cleanValue) error = "O CEP é obrigatório.";
                else if (cepDigits.length !== 8) error = "CEP inválido.";
                break;
            case 'house_number':
                if (!cleanValue) error = "O número do endereço é obrigatório.";
                break;
            case 'address':
                if (!cleanValue) error = "O endereço é obrigatório.";
                break;
            case 'neighborhood':
                if (!cleanValue) error = "O bairro é obrigatório.";
                break;
            case 'city':
                if (!cleanValue) error = "A cidade é obrigatória.";
                break;
            case 'uf_state':
                if (!cleanValue || cleanValue.length !== 2) error = "Estado (UF) inválido.";
                break;
            case 'document_type':
                if (!cleanValue) error = "Selecione sua situação atual.";
                break;
            case 'learning_objective':
                if (!cleanValue) error = "Selecione um objetivo principal.";
                break;
            default:
                break;
        }
        return error;
    };

    // --- Formatadores ---

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    };

    // --- Handlers de Eventos ---

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

        // Limpa erro ao digitar (exceto checkbox)
        if (type !== 'checkbox' && errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Lógica específica do CEP
        if (name === 'cep') {
            const cepClean = formattedValue.replace(/\D/g, '');
            if (cepTimeout) clearTimeout(cepTimeout);

            if (cepClean.length !== 8) {
                // Limpa endereço se CEP for apagado/inválido
                setFormData(prev => ({
                    ...prev,
                    address: '',
                    neighborhood: '',
                    city: '',
                    uf_state: ''
                }));
            } else {
                const newTimeout = setTimeout(() => fetchCEP(cepClean), 800);
                setCepTimeout(newTimeout);
            }
        }
    };

    const fetchCEP = async (cepClean) => {
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
                // Remove erros de endereço se o CEP preencheu tudo
                setErrors(prev => {
                    const cleanErrors = { ...prev };
                    ['cep', 'address', 'neighborhood', 'city', 'uf_state'].forEach(k => delete cleanErrors[k]);
                    return cleanErrors;
                });
            } else {
                handleCepError();
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
            handleCepError();
        } finally {
            setLoading(false);
        }
    };

    const handleCepError = () => {
        setFormData(prev => ({
            ...prev,
            address: '', neighborhood: '', city: '', uf_state: ''
        }));
        setErrors(prev => ({
            ...prev,
            cep: 'CEP não encontrado.',
            address: 'Informe o endereço manualmente.',
            neighborhood: 'Informe o bairro.',
            city: 'Informe a cidade.',
            uf_state: 'Informe o estado.'
        }));
    };

    const handleBlurCEP = async () => {
        const cepClean = formData.cep.replace(/\D/g, '');
        if (cepClean.length === 8 && !formData.address) await fetchCEP(cepClean);
    };

    // --- Lógica de Validação e Submit ---

    const runFullValidation = () => {
        const newErrors = {};
        // Valida todos os campos do state
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 ? null : newErrors;
    };

    const handleValidationFocus = (currentErrors) => {
        if (!currentErrors) return;

        const errorKeys = Object.keys(currentErrors);
        if (errorKeys.length === 0) return;

        // Pega o primeiro campo com erro
        const firstErrorField = errorKeys[0];

        // Descobre em qual etapa este campo está
        let targetStep = 1;
        for (const [step, fields] of Object.entries(STEP_FIELDS)) {
            if (fields.includes(firstErrorField)) {
                targetStep = parseInt(step);
                break;
            }
        }

        // Muda a etapa visualmente
        setActiveStep(targetStep);

        // Aguarda a renderização da troca de aba para focar no input
        setTimeout(() => {
            const element = document.getElementsByName(firstErrorField)[0];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = runFullValidation();

        if (validationErrors) {
            handleValidationFocus(validationErrors);
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

            const { error } = await supabase
                .from('pre_student')
                .insert([dataToSend]);

            if (error) throw error;

            setSubmitStatus('success');
            // Limpa form
            setFormData({
                name: '', email: '', cpf: '', birth_day: '', phone: '',
                cep: '', address: '', neighborhood: '', house_number: '', complement: '',
                city: '', uf_state: '', document_type: '', learning_objective: '',
                questions_suggestion: '', group: 0
            });
            setErrors({});
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Erro de envio:', error);
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

            <section className={styles.hero}>
                <div className={styles.heroPattern}></div>
                <div className={styles.heroContent}>
                    <div className={styles.heroLeft}>
                        <h1 className={styles.heroTitle}>
                            Programa Beta <span className={styles.highlight}>Aluno BePilot</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Participe do desenvolvimento da próxima geração dos novos condutores.
                            Garanta acesso prioritário, influencie funcionalidades e receba suporte exclusivo.
                        </p>
                        <div className={styles.heroFeatures}>
                            <div className={styles.featureItem}><span>Acesso Antecipado</span></div>
                            <div className={styles.featureItem}><span>Co-criação</span></div>
                            <div className={styles.featureItem}><span>Suporte Premium</span></div>
                        </div>
                        <a href="#formSection" className={styles.ctaButton}>
                            Solicitar Acesso Beta
                        </a>
                    </div>
                    <div className={styles.heroRight}>
                        <div className={styles.floatingCard}>
                            <div className={styles.cardHeader}>
                                <h3>Benefícios Exclusivos</h3>
                            </div>
                            <ul className={styles.benefitsList}>
                                <li><span>✓</span> Acesso em primeira mão à plataforma</li>
                                <li><span>✓</span> Canal direto com a engenharia</li>
                                <li><span>✓</span> Relatórios detalhados de evolução</li>
                                <li><span>✓</span> Badge de "Early Adopter"</li>
                                <li><span>✓</span> Prioridade em novos recursos</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>50</div>
                        <div className={styles.statLabel}>Vagas Beta Disponíveis</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>100%</div>
                        <div className={styles.statLabel}>Feedback Analisado</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>24h</div>
                        <div className={styles.statLabel}>Suporte Premium</div>
                    </div>
                </div>
            </section>

            <section id="formSection" className={styles.formSection}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <div className={styles.stepsIndicator}>
                            {[1, 2, 3].map((step) => (
                                <React.Fragment key={step}>
                                    <div
                                        className={`${styles.step} ${activeStep === step ? styles.active : ''} ${activeStep > step ? styles.completed : ''}`}
                                        onClick={() => setActiveStep(step)}
                                    >
                                        <div className={styles.stepNumber}>{step}</div>
                                        <div className={styles.stepLabel}>
                                            {step === 1 ? 'Dados Pessoais' : step === 2 ? 'Perfil' : 'Localização'}
                                        </div>
                                    </div>
                                    {step < 3 && <div className={styles.stepLine}></div>}
                                </React.Fragment>
                            ))}
                        </div>

                        <h2 className={styles.formTitle}>Pré-Cadastro Aluno Beta Tester</h2>
                        <p className={styles.formSubtitle}>Preencha o formulário abaixo para validar sua elegibilidade ao programa.</p>
                    </div>

                    {submitStatus === 'success' ? (
                        <div className={styles.successCard}>
                            <div className={styles.successIcon}>✓</div>
                            <h3>Inscrição Confirmada</h3>
                            <p>Sua solicitação para o programa Aluno Beta Tester foi registrada com sucesso.</p>
                            <p>Para acompanhar as atualizações e novidades do desenvolvimento em tempo real, junte-se à nossa comunidade oficial.</p>
                            <a href="https://chat.whatsapp.com/EAlqLgfYD4XEGTLQSuYJi1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappButton}>
                                Acessar Comunidade Oficial
                            </a>
                            <br />
                            <button
                                onClick={() => setSubmitStatus(null)}
                                className={styles.backLink}
                                style={{ marginTop: '20px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                Realizar novo cadastro
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form} noValidate>
                            {/* Step 1: Dados Pessoais */}
                            <div className={`${styles.formStep} ${activeStep === 1 ? styles.active : ''}`} style={{ display: activeStep === 1 ? 'block' : 'none' }}>
                                <h3 className={styles.stepTitle}>Informações de Identificação</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Nome Completo *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={errors.name ? styles.errorInput : ''}
                                            placeholder="Insira seu nome completo"
                                        />
                                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>E-mail Corporativo ou Pessoal *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? styles.errorInput : ''}
                                            placeholder="exemplo@email.com"
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
                                            className={errors.birth_day ? styles.errorInput : ''}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.birth_day && <span className={styles.errorText}>{errors.birth_day}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Telefone Móvel / WhatsApp *</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={errors.phone ? styles.errorInput : ''}
                                            placeholder="(XX) 9XXXX-XXXX"
                                        />
                                        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                    </div>
                                </div>
                                <div className={styles.stepButtons}>
                                    <button type="button" className={styles.nextButton} onClick={() => setActiveStep(2)}>
                                        Avançar para Perfil
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Documentação */}
                            <div className={`${styles.formStep} ${activeStep === 2 ? styles.active : ''}`} style={{ display: activeStep === 2 ? 'block' : 'none' }}>
                                <h3 className={styles.stepTitle}>Perfil do Condutor</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Situação da Habilitação *</label>
                                        <div className={styles.radioGroup}>
                                            <label className={styles.radioOption}>
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="CNH"
                                                    checked={formData.document_type === 'CNH'}
                                                    onChange={handleChange}
                                                />
                                                <span className={styles.radioLabel}>CNH Ativa (Habilitado)</span>
                                            </label>
                                            <label className={styles.radioOption}>
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="LADV"
                                                    checked={formData.document_type === 'LADV'}
                                                    onChange={handleChange}
                                                />
                                                <span className={styles.radioLabel}>LADV (Em processo de habilitação)</span>
                                            </label>
                                            <label className={styles.radioOption}>
                                                <input
                                                    type="radio"
                                                    name="document_type"
                                                    value="NENHUM"
                                                    checked={formData.document_type === 'NENHUM'}
                                                    onChange={handleChange}
                                                />
                                                <span className={styles.radioLabel}>Não possuo documento</span>
                                            </label>
                                        </div>
                                        {errors.document_type && <span className={styles.errorText}>{errors.document_type}</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Objetivo Principal com a Plataforma *</label>
                                        <select
                                            name="learning_objective"
                                            value={formData.learning_objective}
                                            onChange={handleChange}
                                            className={errors.learning_objective ? styles.errorInput : ''}
                                        >
                                            <option value="">Selecione uma opção...</option>
                                            <option value="PERDER_MEDO">Superar insegurança ao dirigir</option>
                                            <option value="HORAS_DETRAN">Cumprimento de carga horária (DETRAN)</option>
                                            <option value="APRIMORAR">Aprimoramento técnico de direção</option>
                                            <option value="FUTURO_USO">Conhecimento prévio para futura habilitação</option>
                                            <option value="OUTRO">Outros objetivos</option>
                                        </select>
                                        {errors.learning_objective && <span className={styles.errorText}>{errors.learning_objective}</span>}
                                    </div>
                                </div>
                                <div className={styles.stepButtons}>
                                    <button type="button" className={styles.backButton} onClick={() => setActiveStep(1)}>
                                        Voltar
                                    </button>
                                    <button type="button" className={styles.nextButton} onClick={() => setActiveStep(3)}>
                                        Avançar para Localização
                                    </button>
                                </div>
                            </div>

                            {/* Step 3: Endereço */}
                            <div className={`${styles.formStep} ${activeStep === 3 ? styles.active : ''}`} style={{ display: activeStep === 3 ? 'block' : 'none' }}>
                                <h3 className={styles.stepTitle}>Endereço e Contato</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>CEP *</label>
                                        <input
                                            type="text"
                                            name="cep"
                                            value={formData.cep}
                                            onChange={handleChange}
                                            onBlur={handleBlurCEP}
                                            maxLength="9"
                                            placeholder="00000-000"
                                            className={errors.cep ? styles.errorInput : ''}
                                            disabled={loading}
                                        />
                                        {errors.cep && <span className={styles.errorText}>{errors.cep}</span>}
                                        {loading && <span className={styles.loadingText}>Validando CEP...</span>}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Logradouro *</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            readOnly={!errors.address && formData.address !== ''}
                                            onChange={handleChange}
                                            className={`${errors.address ? styles.errorInput : ''} ${!errors.address && formData.address ? styles.readOnlyField : ''}`}
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
                                            className={errors.house_number ? styles.errorInput : ''}
                                            placeholder="Nº"
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
                                            placeholder="Apto, Bloco, Sala"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Bairro *</label>
                                        <input
                                            type="text"
                                            name="neighborhood"
                                            value={formData.neighborhood}
                                            readOnly={!errors.neighborhood && formData.neighborhood !== ''}
                                            onChange={handleChange}
                                            className={`${errors.neighborhood ? styles.errorInput : ''} ${!errors.neighborhood && formData.neighborhood ? styles.readOnlyField : ''}`}
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
                                            name="uf_state"
                                            value={formData.uf_state}
                                            readOnly
                                            className={`${errors.uf_state ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        />
                                        {errors.uf_state && <span className={styles.errorText}>{errors.uf_state}</span>}
                                    </div>
                                </div>

                                <div className={styles.additionalFields}>
                                    <div className={styles.inputGroup}>
                                        <label>Observações ou Sugestões</label>
                                        <textarea
                                            name="questions_suggestion"
                                            value={formData.questions_suggestion}
                                            onChange={handleChange}
                                            placeholder="Compartilhe suas expectativas ou dúvidas sobre o programa..."
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
                                            <span>Desejo participar do grupo exclusivo de Aluno Beta Testers no WhatsApp</span>
                                        </label>
                                    </div>
                                    <br />
                                </div>

                                {submitStatus === 'error' && (
                                    <div className={styles.errorMessage}>
                                        <p>Não foi possível processar sua solicitação. Verifique sua conexão e tente novamente.</p>
                                    </div>
                                )}

                                <div className={styles.stepButtons}>
                                    <button type="button" className={styles.backButton} onClick={() => setActiveStep(2)}>
                                        Voltar
                                    </button>
                                    <button type="submit" className={styles.submitButton} disabled={loading}>
                                        {loading ? 'Processando...' : 'Confirmar Inscrição'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            <section className={styles.faqSection}>
                <div className={styles.faqContainer}>
                    <h2 className={styles.faqTitle}>Dúvidas Frequentes</h2>
                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <h3>Previsão de Liberação</h3>
                            <p>O acesso ao ambiente Beta é liberado gradualmente por lotes. Os inscritos receberão notificação prioritária via e-mail e WhatsApp.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Custo de Participação</h3>
                            <p>O programa é integralmente gratuito. A participação visa aprimorar a plataforma através do feedback dos usuários.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Processo de Feedback</h3>
                            <p>Disponibilizamos canais dedicados para reporte de inconsistências, sugestões de melhoria e participação em pesquisas de usabilidade.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Duração do Programa</h3>
                            <p>O ciclo de testes Beta tem duração estimada de 3 meses, podendo ser estendido conforme métricas de estabilidade do sistema.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BePilotStudentBeta;