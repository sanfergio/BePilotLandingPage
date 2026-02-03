import React, { useState, useEffect, useRef } from 'react';
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
        group: 1 // 1 para Instrutores
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);

    // --- Lógica de Validação Robusta ---
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = "Nome completo é obrigatório";
                else if (value.trim().split(' ').length < 2) error = "Digite seu nome completo";
                break;
            case 'email':
                if (!value) error = "Email é obrigatório";
                else if (!/\S+@\S+\.\S+/.test(value)) error = "Email inválido";
                break;
            case 'cpf':
                if (!value) error = "CPF é obrigatório";
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
                else if (phoneClean.length < 10 || phoneClean.length > 11) error = "Telefone inválido";
                break;
            case 'cep':
                const cepCleanVal = value.replace(/\D/g, '');
                if (!value) error = "CEP é obrigatório";
                else if (cepCleanVal.length !== 8) error = "CEP incompleto";
                break;
            case 'house_number':
                if (!value.trim()) error = "Número é obrigatório";
                break;
            case 'address': if (!value.trim()) error = "Endereço obrigatório"; break;
            case 'neighborhood': if (!value.trim()) error = "Bairro obrigatório"; break;
            case 'city': if (!value.trim()) error = "Cidade obrigatória"; break;
            case 'uf_state': if (!value.trim()) error = "UF obrigatória"; break;
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
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cpf') formattedValue = formatCPF(value);
        if (name === 'cep') formattedValue = formatCEP(value);
        if (name === 'phone') formattedValue = formatPhone(value);
        if (name === 'uf_state') formattedValue = value.toUpperCase();

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        // Limpa erro ao digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'cep') {
            const cepClean = formattedValue.replace(/\D/g, '');
            if (cepTimeout) clearTimeout(cepTimeout);
            if (cepClean.length === 8) {
                const newTimeout = setTimeout(() => fetchCEP(cepClean), 800);
                setCepTimeout(newTimeout);
            }
        }
    };

    const fetchCEP = async (cepClean) => {
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const requiredFields = ['name', 'email', 'cpf', 'birth_day', 'phone', 'cep', 'address', 'neighborhood', 'house_number', 'city', 'uf_state'];

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.getElementsByName(firstErrorField)[0];
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
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
            if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Erro ao enviar:', error);
            setSubmitStatus('error');
            alert('Erro ao enviar cadastro. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', cpf: '', birth_day: '', phone: '',
            cep: '', address: '', neighborhood: '', house_number: '',
            complement: '', city: '', uf_state: '', questions_suggestion: '', group: 1
        });
        setSubmitStatus(null);
        setErrors({});
    };

    useEffect(() => {
        return () => { if (cepTimeout) clearTimeout(cepTimeout); };
    }, [cepTimeout]);

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainWrapper}>
                <div className={styles.contentColumn}>
                    <section className={styles.heroSection}>
                        <h1 className={styles.heroTitle}>
                            Ensine e Decole com a <br />
                            <span>BePilot</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Digitalize sua carreira de instrução. Gerencie alunos, receba pagamentos e construa sua reputação em uma única plataforma.
                        </p>
                    </section>

                    <div className={styles.careerRoadmap}>
                        <div className={styles.roadmapItem}>
                            <div className={styles.roadmapHeader}>
                                <div className={styles.tagStart}>Comece Agora</div>
                                <h3>Instrutor Parceiro</h3>
                            </div>
                            <div className={styles.roadmapContent}>
                                <ul>
                                    <li><IconCheck /> Perfil profissional verificado na plataforma</li>
                                    <li><IconCheck /> Ferramentas de agendamento de voos e aulas</li>
                                    <li><IconCheck /> Gestão financeira e recebimento automático</li>
                                    <li><IconCheck /> Acesso à base de alunos da sua região</li>
                                </ul>
                            </div>
                        </div>

                        <div className={`${styles.roadmapItem} ${styles.locked}`}>
                            <div className={styles.roadmapHeader}>
                                <div className={styles.tagUnlock}>Metas & Gamificação</div>
                                <h3>Top Instructor</h3>
                            </div>
                            <div className={styles.roadmapContent}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
                                    Alcance as metas de horas/aula e desbloqueie:
                                </p>
                                <ul>
                                    <li><IconLock /> Selo de destaque nas buscas ("Top Rated")</li>
                                    <li><IconLock /> Prioridade no recebimento de novos leads</li>
                                    <li><IconLock /> Taxas reduzidas na plataforma</li>
                                    <li><IconLock /> Acesso a eventos exclusivos de networking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

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
                                </p>
                                <a href="#" className={styles.whatsappButton} onClick={(e) => e.preventDefault()}>
                                    Aguarde nosso contato
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
                                        placeholder="Seu nome completo"
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label>E-mail Profissional</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
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
                                        placeholder="(00) 00000-0000"
                                        maxLength="15"
                                    />
                                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>CEP</label>
                                    <input
                                        type="text"
                                        name="cep"
                                        value={formData.cep}
                                        onChange={handleChange}
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
                                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Bairro</label>
                                    <input type="text" name="neighborhood" value={formData.neighborhood} readOnly className={styles.readOnlyInput} />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Cidade/UF</label>
                                    <input type="text" value={formData.city ? `${formData.city} - ${formData.uf_state}` : ''} readOnly className={styles.readOnlyInput} />
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