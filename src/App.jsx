import React from 'react';
import './App.css';

// Substitua pelo caminho real da sua imagem após salvar no projeto
import Logo from './assets/logo_bepilot.png'; 

function App() {
  const whatsappNumber = "5500000000000"; // Substitua pelo número real
  const message = encodeURIComponent("Olá! Gostaria de saber mais sobre a BePilot.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <img src={Logo} alt="BePilot Logo" />
        </div>
        <a href={whatsappUrl} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
          Falar com Consultor
        </a>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>A nova era da habilitação chegou.</h1>
          <p>
            Conectamos alunos, instrutores autônomos e CFCs em uma única plataforma tecnológica. 
            Aprenda a dirigir com liberdade e segurança.
          </p>
          <a href={whatsappUrl} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
            Quero começar agora
          </a>
        </div>
        <div className="hero-image">
          {/* Espaço para ilustração ou mock-up do app */}
          <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#0062FF" fillOpacity="0.1"/>
            <path d="M100 40V160M40 100H160" stroke="#0062FF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </header>

      {/* Info Section sobre a Lei */}
      <section className="law-notice">
        <h2>Em conformidade com a nova legislação</h2>
        <p>Preparamos você para o novo cenário de desburocratização das autoescolas no Brasil.</p>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <h3>Para Alunos</h3>
          <p>Escolha seu instrutor por avaliações, acompanhe sua evolução em tempo real e tenha seguro total em todas as aulas.</p>
        </div>
        <div className="feature-card">
          <h3>Para Instrutores</h3>
          <p>Gestão autônoma de agenda, aluguel de veículos via marketplace e recebimento garantido via Split de pagamento.</p>
        </div>
        <div className="feature-card">
          <h3>Para CFCs</h3>
          <p>Monetize sua frota ociosa alugando para instrutores parceiros e gerencie sua equipe com dados de performance.</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <img src={Logo} alt="BePilot Logo" style={{height: '40px', marginBottom: '1rem'}} />
          <p>Transformando a educação de trânsito através da tecnologia.</p>
          <div className="ductus-info">
            <p>Desenvolvido por <strong>Ductus</strong></p>
            <p>© 2025 BePilot - Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;