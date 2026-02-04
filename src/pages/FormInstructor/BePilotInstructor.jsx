import React, { useState, useRef } from 'react';
import styles from './BePilotInstructor.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

// Ícones SVG para a UI
const IconCheck = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const IconLock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const IconPlane = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M13 2l9 10-9 10"></path><path d="M5 2l9 10-9 10"></path></svg>
);

const BePilotInstructor = () => {
    const formRef = useRef(null);
    // Mesmo schema de dados do Ambassador, mudando apenas o group para 1 (Instrutor)
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
        group: 1, // 1 para Instrutores
        cupon_used: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);

    // --- Mesma Lógica de Validação ---
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
            // Enviando para a tabela 'Instructor_Leads' (ou Ambassador_Leads se for tabela unificada)
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

            <main className={styles.mainWrapper}>
                {/* Coluna da Esquerda: Plano de Carreira do Instrutor */}
                <div className={styles.contentColumn}>
                    <section className={styles.heroSection}>
                        <h1 className={styles.heroTitle}>
                            Ensine e Cresça com a <span> BePilot</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Digitalize sua carreira de instrução. Gerencie alunos, receba pagamentos e construa sua reputação em uma única plataforma.
                        </p>
                    </section>

                    {/* Timeline do Instrutor: Básico vs Desbloqueável */}
                    <div className={styles.careerRoadmap}>

                        {/* Nível 1: Imediato */}
                        <div className={styles.roadmapItem}>
                            <div className={styles.roadmapHeader}>
                                <div className={styles.tagStart}>Comece Agora</div>
                                <h3>Seja um Instrutor Parceiro</h3>
                            </div>
                            <div className={styles.roadmapContent}>
                                <ul>
                                    <li><IconCheck /> Perfil profissional verificado na plataforma</li>
                                    <li><IconCheck /> Ferramentas de agendamento de aulas</li>
                                    <li><IconCheck /> Gestão financeira completa</li>
                                    <li><IconCheck /> Acesso à base de alunos da sua região</li>
                                </ul>
                            </div>
                        </div>

                        {/* Nível 1: Imediato */}
                        <div className={styles.roadmapItem}>
                            <div className={styles.roadmapHeader}>
                                <div className={styles.tagStart}>Faça Parte</div>
                                <h3>Plataforma amigável e intuitiva</h3>
                            </div>
                            <div className={styles.roadmapContent}>
                                <ul>
                                    <li><IconCheck /> Tutorial interativo para ingressar com tudo na plataforma!  </li>
                                    <li><IconCheck /> Mensalidade flexiva </li>
                                    <li><IconCheck /> Painel completo para administrar a sua carreira</li>
                                    <li><IconCheck /> Desbloqueie novas funcionalidades conforme sua evolução</li>
                                </ul>
                            </div>
                        </div>

                        {/* Nível 1: Imediato */}
                        <div className={styles.roadmapItem}>
                            <div className={styles.roadmapHeader}>
                                <div className={styles.tagStart}>Cresça com a BeP</div>
                                <h3>Economize tempo, distância e dinheiro</h3>
                            </div>
                            <div className={styles.roadmapContent}>
                                <ul>
                                    <li><IconCheck /> Trabalhe dentro da sua região residêncial </li>
                                    <li><IconCheck /> Feche com alunos de forma totalmente digital </li>
                                    <li><IconCheck /> Taxas abaixo do padrão do mercado </li>
                                    <li><IconCheck /> Faça seus horários</li>
                                </ul>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Coluna da Direita: Formulário (Sticky) */}
                <div className={styles.formCard} ref={formRef}>
                    {submitStatus === 'success' ? (
                        <div className={styles.successContainer}>
                            <div className={styles.successIconCircle}>
                                <IconPlane />
                            </div>
                            <h3>Cadastro Realizado!</h3>
                            <p>Seus dados foram enviados para análise da equipe BePilot.</p>

                            <div className={styles.whatsappCard}>
                                <h4>Próximos Passos</h4>
                                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                    Entraremos em contato via WhatsApp para validar suas credenciais (CMA/ANAC) e ativar seu perfil.
                                    <br /><br />
                                    Enquanto isso, entre no nosso grupo exclusivo de instrutores para ficar por dentro das novidades!
                                </p>
                                <a href="https://chat.whatsapp.com/L9BQqgWC4j07MBrNbEd7Ll" target='_blank' className={styles.whatsappButton} >
                                    Entrar no Grupo do WhatsApp
                                </a>
                            </div>

                            <button onClick={resetForm} className={styles.secondaryButton}>
                                Cadastrar outro instrutor
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formHeader}>
                                <h2>Cadastro de Instrutor</h2>
                                <p>Preencha os dados para iniciar sua jornada</p>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>Nome Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Seu nome completo"
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="seu@email.com"
                                    />
                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>CPF</label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="000.000.000-00"
                                        maxLength="14"
                                    />
                                    {errors.cpf && <span className={styles.errorText}>{errors.cpf}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Data Nasc.</label>
                                    <input
                                        type="date"
                                        name="birth_day"
                                        value={formData.birth_day}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.birth_day && <span className={styles.errorText}>{errors.birth_day}</span>}
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>WhatsApp / Celular</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="(00) 00000-0000"
                                        maxLength="15"
                                    />
                                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                </div>

                                {/* Endereço */}
                                <div className={styles.inputGroup}>
                                    <label>CEP</label>
                                    <input
                                        type="text"
                                        name="cep"
                                        value={formData.cep}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="00000-000"
                                        maxLength="9"
                                    />
                                    {errors.cep && <span className={styles.errorText}>{errors.cep}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Número</label>
                                    <input
                                        type="text"
                                        name="house_number"
                                        value={formData.house_number}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.house_number && <span className={styles.errorText}>{errors.house_number}</span>}
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>Endereço</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        readOnly
                                        className={styles.readOnlyInput}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Bairro</label>
                                    <input type="text" name="neighborhood" value={formData.neighborhood} readOnly className={styles.readOnlyInput} />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Cidade/UF</label>
                                    <input type="text" value={`${formData.city} - ${formData.uf_state}`} readOnly className={styles.readOnlyInput} />
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>Complemento (Opcional)</label>
                                    <input
                                        type="text"
                                        name="complement"
                                        value={formData.complement}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>Cupom Indicação (Opcional)</label>
                                    <input
                                        type="text"
                                        name="cupon_used"
                                        value={formData.cupon_used}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>Sobre sua experiência (Opcional)</label>
                                    <textarea
                                        name="questions_suggestion"
                                        value={formData.questions_suggestion}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Breve resumo das aeronaves que instrui..."
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? 'Enviando...' : 'Cadastrar como Instrutor'}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BePilotInstructor;