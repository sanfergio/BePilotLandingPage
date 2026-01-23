import React, { useState, useEffect } from 'react';
import styles from './FormInstructor.module.css';
import supabase from '../../components/Keys/Keys.jsx';
import { validateCPF, formatCPF, formatCEP } from '../../utils/validators.js';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';

import logoHero from '../../assets/noScreen-whiteLogo.png';
import iconBenefit from '../../assets/noScreen-iconLogo.png';

const BePilotAmbassador = () => {
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
        uff_state: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);
    const [cepTimeout, setCepTimeout] = useState(null);

    // Validação em tempo real
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = "Nome completo é obrigatório";
                } else if (value.trim().length < 3) {
                    error = "Nome deve ter pelo menos 3 caracteres";
                }
                break;

            case 'email':
                if (!value) {
                    error = "Email é obrigatório";
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = "Email inválido";
                }
                break;

            case 'cpf':
                const cpfClean = value.replace(/\D/g, '');
                if (!value) {
                    error = "CPF é obrigatório";
                } else if (cpfClean.length === 11 && !validateCPF(cpfClean)) {
                    error = "CPF inválido";
                }
                break;

            case 'birth_day':
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }

                    if (age < 18) {
                        error = "Você deve ter pelo menos 18 anos";
                    } else if (age > 100) {
                        error = "Data de nascimento inválida";
                    }
                }
                break;

            case 'phone':
                const phoneClean = value.replace(/\D/g, '');
                if (!value) {
                    error = "Celular/WhatsApp é obrigatório";
                } else if (phoneClean.length > 0 && phoneClean.length < 10) {
                    error = "Telefone inválido";
                }
                break;

            case 'cep':
                const cepClean = value.replace(/\D/g, '');
                if (!value) {
                    error = "CEP é obrigatório";
                } else if (cepClean.length > 0 && cepClean.length !== 8) {
                    error = "CEP inválido";
                }
                break;

            case 'house_number':
                if (!value.trim()) {
                    error = "Número obrigatório";
                }
                break;

            case 'uff_state':
                if (value && value.length !== 2) {
                    error = "UF deve ter 2 caracteres";
                }
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
        const { name, value } = e.target;
        let formattedValue = value;

        // Formatação dos campos
        if (name === 'cpf') formattedValue = formatCPF(value);
        if (name === 'cep') formattedValue = formatCEP(value);
        if (name === 'phone') formattedValue = formatPhone(value);
        if (name === 'uff_state') formattedValue = value.toUpperCase();

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        // Validação em tempo real
        const error = validateField(name, formattedValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Busca automática do CEP quando estiver completo
        if (name === 'cep') {
            const cepClean = formattedValue.replace(/\D/g, '');

            // Limpa timeout anterior
            if (cepTimeout) clearTimeout(cepTimeout);

            // Se CEP estiver incompleto, limpa endereço
            if (cepClean.length !== 8) {
                setFormData(prev => ({
                    ...prev,
                    address: '',
                    neighborhood: '',
                    city: '',
                    uff_state: ''
                }));
            } else {
                // Aguarda 800ms após o usuário parar de digitar para buscar CEP
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

                    // Limpa erro do CEP se existir
                    if (errors.cep) {
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.cep;
                            return newErrors;
                        });
                    }

                    // Valida os campos preenchidos automaticamente
                    setErrors(prev => ({
                        ...prev,
                        address: data.logradouro ? '' : 'Endereço não encontrado',
                        neighborhood: data.bairro ? '' : 'Bairro não encontrado',
                        city: data.localidade ? '' : 'Cidade não encontrada',
                        uff_state: data.uf ? '' : 'UF não encontrada'
                    }));
                } else {
                    // CEP não encontrado - limpa campos de endereço
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
        if (cepClean.length === 8) {
            await fetchCEP(cepClean);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validação do nome
        if (!formData.name.trim()) {
            newErrors.name = "Nome completo é obrigatório";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Nome deve ter pelo menos 3 caracteres";
        }

        // Validação do email
        if (!formData.email) {
            newErrors.email = "Email é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email inválido";
        }

        // Validação do CPF
        if (!formData.cpf) {
            newErrors.cpf = "CPF é obrigatório";
        } else if (!validateCPF(formData.cpf.replace(/\D/g, ''))) {
            newErrors.cpf = "CPF inválido";
        }

        // Validação da data de nascimento
        if (!formData.birth_day) {
            newErrors.birth_day = "Data de nascimento obrigatória";
        } else {
            const birthDate = new Date(formData.birth_day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                newErrors.birth_day = "Você deve ter pelo menos 18 anos";
            } else if (age > 100) {
                newErrors.birth_day = "Data de nascimento inválida";
            }
        }

        // Validação do telefone
        if (!formData.phone) {
            newErrors.phone = "Celular/WhatsApp é obrigatório";
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = "Telefone inválido";
        }

        // Validação do CEP
        if (!formData.cep) {
            newErrors.cep = "CEP é obrigatório";
        } else if (formData.cep.replace(/\D/g, '').length !== 8) {
            newErrors.cep = "CEP inválido";
        }

        // Validação do endereço
        if (!formData.address.trim()) {
            newErrors.address = "Endereço obrigatório";
        }

        // Validação do bairro
        if (!formData.neighborhood.trim()) {
            newErrors.neighborhood = "Bairro obrigatório";
        }

        // Validação do número
        if (!formData.house_number.trim()) {
            newErrors.house_number = "Número obrigatório";
        }

        // Validação da cidade
        if (!formData.city.trim()) {
            newErrors.city = "Cidade obrigatória";
        }

        // Validação do estado
        if (!formData.uff_state) {
            newErrors.uff_state = "Estado obrigatório";
        } else if (formData.uff_state.length !== 2) {
            newErrors.uff_state = "UF deve ter 2 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log('Formulário inválido:', errors);
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

            console.log('Enviando dados:', dataToSend);

            const { error } = await supabase
                .from('pre_instructor')
                .insert([dataToSend]);

            if (error) {
                console.error('Erro do Supabase:', error);
                throw error;
            }

            setSubmitStatus('success');
            setFormData({
                name: '', email: '', cpf: '', birth_day: '', phone: '',
                cep: '', address: '', neighborhood: '', house_number: '', complement: '',
                city: '', uff_state: ''
            });
            setErrors({});

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            setSubmitStatus('error');
        } finally {
            setLoading(false);
        }
    };

    // Limpa timeout quando o componente desmonta
    useEffect(() => {
        return () => {
            if (cepTimeout) clearTimeout(cepTimeout);
        };
    }, [cepTimeout]);

    return (
        <div className={styles.container}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <img src={logoHero} alt="BePilot Logo" className={styles.logoHero} />
                    <h1>O Futuro da Instrução de Trânsito Começa com Você.</h1>
                    <p>Torne-se um <strong>Instrutor Embaixador BePilot</strong>. Faça sua <strong>PRÉ-INSCRIÇÃO</strong> como um Instrutor BePilot e garanta benefícios exclusivos, mais destaque em sua região e ajude a moldar a plataforma que vai revolucionar o seu trabalho.</p>
                    <a href="#cadastro" className={styles.ctaButton}>Quero ser Embaixador</a>
                </div>
            </section>

            <section className={styles.benefits}>
                <h2>Por que se cadastrar agora?</h2>
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>

                        <img className={styles.iconCircle} src="https://img.freepik.com/fotos-gratis/jovem-sorridente-testando-um-carro_23-2148333009.jpg" alt="" />

                        <h3>Pioneirismo</h3>
                        <p>Seja um dos primeiros a utilizar a tecnologia que conecta instrutores e alunos de forma inteligente.</p>
                    </div>
                    <div className={styles.card}>
                        <img className={styles.iconCircle} src="https://img.freepik.com/fotos-gratis/elegante-motorista-de-taxi-em-traje_23-2149204585.jpg" alt="" />
                        <h3>Gratuidade Vitalícia</h3>
                        <p>Embaixadores cadastrados nesta fase terão isenção de taxas da plataforma para sempre.</p>
                    </div>
                    <div className={styles.card}>
                        <img className={styles.iconCircle} src="https://img.freepik.com/fotos-gratis/homem-oferecendo-sua-mao-para-apertar_23-2148384936.jpg" alt="" />
                        <h3>Construa Conosco</h3>
                        <p>Sua opinião definirá as próximas funcionalidades. A plataforma será feita sob medida para suas necessidades.</p>
                    </div>
                    <div className={styles.card}>
                        <img className={styles.iconCircle} src="https://img.freepik.com/fotos-gratis/pessoa-que-se-prepara-para-obter-a-carta-de-conducao_23-2150167549.jpg" alt="" />
                        <h3>Destaque no App</h3>
                        <p>Sua participação fará com que seu perfil tenha maior destaque em sua região, ainda contará com o selo especial de Instrutor Embaixador.</p>
                    </div>
                </div>
            </section>

            <section id="cadastro" className={styles.formSection}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <img src={iconBenefit} alt="Icon" className={styles.formIcon} />
                        <h2>Pré-Cadastro de Instrutor</h2>
                        <p>Preencha seus dados para garantir sua vaga de Instrutor Embaixador.</p>
                        <p className={styles.requiredNote}></p>
                    </div>

                    {submitStatus === 'success' ? (
                        <div className={styles.successMessage}>
                            <h3>🎉 Cadastro Realizado!</h3>
                            <p>Bem-vindo ao time de Embaixadores BePilot. Entraremos em contato em breve.</p>
                            <button onClick={() => setSubmitStatus(null)} className={styles.resetButton}>Novo cadastro</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form} noValidate>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Nome Completo <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const error = validateField('name', e.target.value);
                                            setErrors(prev => ({ ...prev, name: error }));
                                        }}
                                        className={errors.name ? styles.errorInput : ''}
                                        placeholder="Digite seu nome completo"
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Email <span className={styles.required}>*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const error = validateField('email', e.target.value);
                                            setErrors(prev => ({ ...prev, email: error }));
                                        }}
                                        className={errors.email ? styles.errorInput : ''}
                                        placeholder="seu@email.com"
                                    />
                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Celular / WhatsApp <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const error = validateField('phone', e.target.value);
                                            setErrors(prev => ({ ...prev, phone: error }));
                                        }}
                                        className={errors.phone ? styles.errorInput : ''}
                                        placeholder="(XX) 9XXXX-XXXX"
                                    />
                                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>CPF <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const error = validateField('cpf', e.target.value);
                                            setErrors(prev => ({ ...prev, cpf: error }));
                                        }}
                                        maxLength="14"
                                        placeholder="000.000.000-00"
                                        className={errors.cpf ? styles.errorInput : ''}
                                    />
                                    {errors.cpf && <span className={styles.errorText}>{errors.cpf}</span>}
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Data de Nascimento <span className={styles.required}>*</span></label>
                                    <input
                                        type="date"
                                        name="birth_day"
                                        value={formData.birth_day}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const error = validateField('birth_day', e.target.value);
                                            setErrors(prev => ({ ...prev, birth_day: error }));
                                        }}
                                        className={errors.birth_day ? styles.errorInput : ''}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.birth_day && <span className={styles.errorText}>{errors.birth_day}</span>}
                                </div>
                            </div>

                            <div className={styles.divider}>Endereço</div>

                            <div className={styles.row}>
                                <div className={`${styles.inputGroup} ${styles.small}`}>
                                    <label>CEP <span className={styles.required}>*</span></label>
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
                                    {loading && <span className={styles.loadingText}>Buscando CEP...</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={`${styles.inputGroup} ${styles.large}`}>
                                    <label>Endereço <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        readOnly
                                        className={`${errors.address ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        placeholder="Preenchido automaticamente pelo CEP"
                                    />
                                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                                </div>
                                <div className={`${styles.inputGroup} ${styles.small}`}>
                                    <label>Número <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="house_number"
                                        value={formData.house_number}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const error = validateField('house_number', e.target.value);
                                            setErrors(prev => ({ ...prev, house_number: error }));
                                        }}
                                        className={errors.house_number ? styles.errorInput : ''}
                                        placeholder="123"
                                    />
                                    {errors.house_number && <span className={styles.errorText}>{errors.house_number}</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Bairro <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="neighborhood"
                                        value={formData.neighborhood}
                                        readOnly
                                        className={`${errors.neighborhood ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        placeholder="Preenchido automaticamente pelo CEP"
                                    />
                                    {errors.neighborhood && <span className={styles.errorText}>{errors.neighborhood}</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={`${styles.inputGroup} ${styles.large}`}>
                                    <label>Cidade <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        readOnly
                                        className={`${errors.city ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        placeholder="Preenchido automaticamente pelo CEP"
                                    />
                                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                                </div>
                                <div className={`${styles.inputGroup} ${styles.xsmall}`}>
                                    <label>UF <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        name="uff_state"
                                        value={formData.uff_state}
                                        readOnly
                                        maxLength="2"
                                        className={`${errors.uff_state ? styles.errorInput : ''} ${styles.readOnlyField}`}
                                        placeholder="Preenchido pelo CEP"
                                    />
                                    {errors.uff_state && <span className={styles.errorText}>{errors.uff_state}</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Complemento (opcional)</label>
                                    <input
                                        type="text"
                                        name="complement"
                                        value={formData.complement}
                                        onChange={handleChange}
                                        placeholder="Apto, Bloco, etc."
                                    />
                                </div>
                            </div>

                            {submitStatus === 'error' && (
                                <div className={styles.errorMessage}>
                                    <p>Erro ao enviar. Verifique seus dados ou tente mais tarde.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Finalizar Pré-Cadastro'}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            <Footer />

        </div>
    );
};

export default BePilotAmbassador;