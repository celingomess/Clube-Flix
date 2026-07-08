'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseMock, Course } from '@/lib/supabase';
import { 
  Play, 
  Shield, 
  Award, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  User, 
  LogOut, 
  Mail, 
  BookOpen, 
  CheckCircle2, 
  LineChart,
  GraduationCap,
  ChevronDown,
  Menu
} from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Qual é o seu objetivo de estudo principal no momento?',
    options: [
      { text: 'Concurso Público (Exatas e Raciocínio Lógico)', points: 'Logic' },
      { text: 'Vestibulares Tradicionais / ENEM (Física e Matemática)', points: 'Physics' },
      { text: 'Aprovação em Disciplinas de Engenharia / Exatas na Faculdade', points: 'Math' }
    ]
  },
  {
    id: 2,
    question: 'Como você avalia seu conhecimento sobre a Primeira Lei de Newton (Inércia)?',
    options: [
      { text: 'Sei que um corpo tende a manter seu estado de repouso ou MRU se a força resultante for zero.', points: 'correct' },
      { text: 'Acho que diz que a força é igual a massa vezes a aceleração.', points: 'incorrect' },
      { text: 'Nunca ouvi falar ou não me lembro.', points: 'incorrect' }
    ]
  },
  {
    id: 3,
    question: 'Em Raciocínio Lógico, se a proposição p é verdadeira e q é falsa, qual o valor de p → q (condicional)?',
    options: [
      { text: 'Verdadeiro', points: 'incorrect' },
      { text: 'Falso (A única hipótese em que a condicional é falsa é V → F)', points: 'correct' },
      { text: 'Indeterminado', points: 'incorrect' }
    ]
  },
  {
    id: 4,
    question: 'Qual é a derivada da função f(x) = 3x² + 5x em relação a x?',
    options: [
      { text: 'f\'(x) = 6x + 5', points: 'correct' },
      { text: 'f\'(x) = 3x + 5', points: 'incorrect' },
      { text: 'f\'(x) = 6x²', points: 'incorrect' }
    ]
  },
  {
    id: 5,
    question: 'Qual a sua maior dificuldade ao estudar disciplinas de ciências exatas?',
    options: [
      { text: 'Falta de base conceitual sólida para interpretar as questões.', points: 'Physics' },
      { text: 'Dificuldade em montar tabelas-verdade e estruturar argumentos lógicos.', points: 'Logic' },
      { text: 'Dificuldade com Cálculo diferencial/integral puro e álgebra avançada.', points: 'Math' }
    ]
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; name: string } | null>(null);
  
  // Auth state inputs
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'teacher' | 'parent'>('student');

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [recommendation, setRecommendation] = useState<Course | null>(null);

  useEffect(() => {
    const email = SupabaseMock.getCurrentUserEmail();
    const role = SupabaseMock.getCurrentUserRole();
    const name = SupabaseMock.getCurrentUserName();
    if (email && role && name) {
      setCurrentUser({ email, role, name });
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginName) return;

    // Login mock
    SupabaseMock.login(loginEmail, loginName, loginRole);
    
    // Set cookies for middleware
    const isSubscribed = SupabaseMock.isEnrolled(loginEmail);
    document.cookie = `clube_flix_user_email=${loginEmail}; path=/; max-age=86400`;
    document.cookie = `clube_flix_user_role=${loginRole}; path=/; max-age=86400`;
    document.cookie = `clube_flix_is_subscribed=${isSubscribed || loginRole !== 'student'}; path=/; max-age=86400`;

    setCurrentUser({ email: loginEmail, role: loginRole, name: loginName });
    setShowLoginModal(false);

    // Redirect to dashboard/vitrine accordingly
    if (loginRole === 'teacher') {
      router.push('/dashboard/teacher');
    } else if (loginRole === 'parent') {
      router.push('/dashboard/parent');
    } else {
      router.push('/vitrine');
    }
  };

  const handleLogout = () => {
    SupabaseMock.logout();
    document.cookie = 'clube_flix_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'clube_flix_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'clube_flix_is_subscribed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    setCurrentUser(null);
    router.refresh();
  };

  // Quick Demo Access to help user test paths
  const handleQuickLogin = (role: 'student' | 'teacher' | 'parent', subscribed = true) => {
    const email = `${role}@clube.com`;
    const name = role === 'teacher' ? 'Prof. Cláudio Brum' : role === 'parent' ? 'Sr. Carlos Brum' : 'Alonso Estudante';
    
    SupabaseMock.login(email, name, role);
    if (role === 'student' && subscribed) {
      SupabaseMock.enrollUser(email, 'active');
    } else if (role === 'student' && !subscribed) {
      // Create non-subscribed student
      const enrollments = JSON.parse(localStorage.getItem('clube_flix_enrollments') || '[]');
      const cleanIdx = enrollments.findIndex((e: any) => e.userEmail === email);
      if (cleanIdx > -1) enrollments.splice(cleanIdx, 1);
      localStorage.setItem('clube_flix_enrollments', JSON.stringify(enrollments));
    }

    document.cookie = `clube_flix_user_email=${email}; path=/; max-age=86400`;
    document.cookie = `clube_flix_user_role=${role}; path=/; max-age=86400`;
    document.cookie = `clube_flix_is_subscribed=${subscribed || role !== 'student'}; path=/; max-age=86400`;

    setCurrentUser({ email, role, name });
    
    if (role === 'teacher') {
      router.push('/dashboard/teacher');
    } else if (role === 'parent') {
      router.push('/dashboard/parent');
    } else {
      if (subscribed) {
        router.push('/vitrine');
      } else {
        router.push('/checkout');
      }
    }
  };

  // Quiz Handling
  const handleQuizAnswer = (points: string, optionText: string) => {
    setQuizAnswers({ ...quizAnswers, [currentQuestionIdx]: optionText });

    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Grade quiz and save lead
      let score = 0;
      let categories = { Physics: 0, Math: 0, Logic: 0 };
      
      // Basic grading
      if (optionText.includes('Sei que um corpo')) score++;
      if (quizAnswers[2]?.includes('Falso (A única')) score++;
      if (quizAnswers[3]?.includes('6x + 5')) score++;

      // Count struggle areas
      if (quizAnswers[0]?.includes('Raciocínio Lógico')) categories.Logic++;
      if (quizAnswers[0]?.includes('Física')) categories.Physics++;
      if (quizAnswers[0]?.includes('Engenharia')) categories.Math++;
      if (quizAnswers[4]?.includes('conceitual sólida')) categories.Physics++;
      if (quizAnswers[4]?.includes('tabelas-verdade')) categories.Logic++;
      if (quizAnswers[4]?.includes('diferencial/integral')) categories.Math++;

      // Decide recommendation
      const courses = SupabaseMock.getCourses();
      let recommended: Course = courses[0]; // default
      if (categories.Logic >= categories.Physics && categories.Logic >= categories.Math) {
        recommended = courses.find(c => c.category === 'Logic') || courses[0];
      } else if (categories.Math >= categories.Physics && categories.Math >= categories.Logic) {
        recommended = courses.find(c => c.category === 'Math') || courses[0];
      } else {
        recommended = courses.find(c => c.category === 'Physics') || courses[0];
      }

      setQuizScore(score);
      setRecommendation(recommended);
      setQuizFinished(true);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    // Save lead database
    SupabaseMock.saveDiagnostic(leadName, leadEmail, quizAnswers, quizScore, recommendation?.id || 'mecanica-geral');
    
    // Auto login lead as student (non-subscribed)
    SupabaseMock.login(leadEmail, leadName, 'student');
    document.cookie = `clube_flix_user_email=${leadEmail}; path=/; max-age=86400`;
    document.cookie = `clube_flix_user_role=student; path=/; max-age=86400`;
    document.cookie = `clube_flix_is_subscribed=false; path=/; max-age=86400`;
    
    setCurrentUser({ email: leadEmail, role: 'student', name: leadName });
    
    // Redirect to checkout with recommended course
    router.push(`/checkout?courseId=${recommendation?.id}`);
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setQuizAnswers({});
    setQuizFinished(false);
    setShowQuiz(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      
      {/* Top Gold Promo Bar */}
      <div style={{
        background: 'var(--accent)',
        color: '#000',
        padding: '8px 16px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '11px',
        letterSpacing: '0.15em',
        zIndex: 110,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
      }}>
        TURMAS 2026 COM VAGAS LIMITADAS | ENCERRA EM: <span style={{ fontFamily: 'monospace', marginLeft: '6px' }}>04:59:00</span>
      </div>

      {/* Floating Navigation Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, width: '100%', padding: '0 5%'
      }}>
        <header className="glass" style={{
          margin: '20px auto 0 auto',
          maxWidth: '1200px',
          padding: '12px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '2rem',
          border: '1px solid rgba(201, 168, 76, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}>
          {/* Logo brand */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '2px', paddingLeft: '2px' }}>
              Professor
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', color: '#fff' }}>
              CLAUDIO<span style={{ color: 'var(--accent)' }}>_BRUM</span>
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <nav className="hidden lg:flex" style={{ display: 'flex', gap: 24, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span className="cursor-pointer hover:text-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                Cursos <ChevronDown size={14} />
              </span>
              <span style={{ cursor: 'pointer' }}>Metodologia</span>
              <span style={{ cursor: 'pointer' }}>Aprovados</span>
              <span 
                onClick={() => { setShowLoginModal(true); setLoginRole('student'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(201, 168, 76, 0.85)', cursor: 'pointer', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '6px 12px', borderRadius: '12px' }}
              >
                Área do Aluno
              </span>
              <span onClick={() => setShowQuiz(true)} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Diagnóstico</span>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {currentUser ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentUser.role === 'teacher') router.push('/dashboard/teacher');
                      else if (currentUser.role === 'parent') router.push('/dashboard/parent');
                      else router.push('/vitrine');
                    }}
                    className="btn-primary" 
                    style={{ padding: '8px 16px', fontSize: 11, borderRadius: '12px' }}
                  >
                    Entrar
                  </button>
                  <button onClick={handleLogout} style={{ background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <LogOut size={16} color="var(--text-muted)" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => router.push('/checkout')}
                  className="btn-primary" 
                  style={{
                    padding: '10px 20px', 
                    fontSize: '11px', 
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Quero Minha Vaga
                </button>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Main Hero & Content */}
      <main style={{ flex: 1, padding: '0 5% 60px 5%' }}>
        {!showQuiz ? (
          <>
            {/* Hero Banner Section with integrated professor photo */}
            <div style={{
              minHeight: '80vh',
              borderRadius: '24px',
              overflow: 'hidden',
              margin: '30px auto 60px auto',
              maxWidth: '1200px',
              position: 'relative',
              backgroundImage: `linear-gradient(to right, #040814 38%, rgba(4, 8, 20, 0.6) 68%, transparent 100%), url('/claudio_brum_banner.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              padding: '60px',
              border: '1px solid var(--border-glass)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}>
              {/* Left Column Text */}
              <div style={{ maxWidth: '650px', zIndex: 5 }}>
                {/* Active Tag */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  background: 'rgba(201, 168, 76, 0.08)',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '28px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'block' }} className="pulsing"></span>
                  Turmas Abertas 2026 | Vagas Limitadas
                </div>

                <h1 style={{
                  fontSize: '52px',
                  lineHeight: '1.08',
                  fontWeight: 900,
                  marginBottom: '24px',
                  fontFamily: 'var(--font-title)',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                }}>
                  A <span style={{ color: 'var(--accent)' }}>aprovação</span> que você sempre sonhou começa aqui.
                </h1>
                
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '17px',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  maxWidth: '520px'
                }}>
                  Concursos militares, escolas técnicas federais ou reforço escolar, o <strong style={{ color: '#fff' }}>Método Professor Claudio Brum</strong> já aprovou mais de 500 alunos e o próximo pode ser você (ou seu filho).
                </p>

                {/* Pill categories */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                    borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52, 211, 153, 0.2)',
                    fontSize: '13px', fontWeight: 'bold', color: '#a7f3d0'
                  }}>
                    <Shield size={14} /> Concursos Militares
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                    borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(56, 189, 248, 0.2)',
                    fontSize: '13px', fontWeight: 'bold', color: '#bae6fd'
                  }}>
                    <GraduationCap size={14} /> Escolas Técnicas e Federais
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                    borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.2)',
                    fontSize: '13px', fontWeight: 'bold', color: '#ddd6fe'
                  }}>
                    <BookOpen size={14} /> Acompanhamento Escolar
                  </div>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => router.push('/checkout')}
                    className="btn-primary" 
                    style={{ padding: '16px 36px', fontSize: '15px', color: '#000', fontWeight: '900' }}
                  >
                    Quero Garantir Minha Vaga
                  </button>
                  <button 
                    onClick={() => setShowQuiz(true)}
                    className="btn-secondary" 
                    style={{ padding: '16px 36px', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Conhecer os Cursos <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Info Indicators Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              maxWidth: '1200px',
              margin: '-30px auto 60px auto',
              padding: '0 20px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> +1.500 aprovados
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> 20+ anos de experiência
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> Militares, Técnicas & Reforço
              </div>
            </div>

            {/* Quick Demo Credentials Panel for testing */}
            <div className="glass" style={{ margin: '0 auto 60px auto', maxWidth: '1200px', padding: 24, borderRadius: 16, border: '1px solid rgba(201, 168, 76, 0.2)' }}>
              <h3 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="var(--accent)" />
                Painel de Teste Rápido (Protótipo Funcional)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                Use os botões de simulação abaixo para testar instantaneamente a proteção de rotas (middleware), os painéis de controle e o player seguro.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => handleQuickLogin('teacher')} className="btn-primary" style={{ background: 'var(--purple-gradient)', color: '#fff', boxShadow: 'none', fontSize: 13, padding: '8px 16px' }}>
                  Acessar como Prof. Cláudio Brum (Dashboard Professor)
                </button>
                <button onClick={() => handleQuickLogin('student', true)} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Estudante Assinante (Acessa Vitrine & Player)
                </button>
                <button onClick={() => handleQuickLogin('student', false)} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px', border: '1px dashed #c9a84c' }}>
                  Estudante Não-Assinante (Bloqueia Rotas & Checkout)
                </button>
                <button onClick={() => handleQuickLogin('parent')} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Responsável/Pai (Dashboard Parental)
                </button>
              </div>
            </div>

            {/* Professor Cláudio Brum Section */}
            <div style={{
              display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 50, alignItems: 'center',
              margin: '60px auto 40px auto', maxWidth: '1200px', borderTop: '1px solid var(--border-glass)', paddingTop: 60
            }}>
              {/* Photo Card */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -15, left: -15, right: 15, bottom: 15,
                  background: 'var(--accent-gradient)', borderRadius: 24, zIndex: 1, opacity: 0.15, filter: 'blur(8px)'
                }}></div>
                <div className="glass" style={{
                  position: 'relative', zIndex: 2, borderRadius: 24, overflow: 'hidden',
                  border: '1px solid rgba(201, 168, 76, 0.15)', padding: 16, display: 'flex', flexDirection: 'column'
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/claudio_brum.jpg" 
                    alt="Professor Cláudio Brum" 
                    style={{ width: '100%', borderRadius: 16, display: 'block', objectFit: 'cover', aspectRatio: '1/1' }}
                  />
                  <div style={{ padding: '20px 8px 8px 8px', textAlign: 'center' }}>
                    <strong style={{ fontSize: 20, display: 'block', marginBottom: 6, fontFamily: 'var(--font-title)' }}>Prof. Cláudio Brum</strong>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Estrategista da sua Aprovação
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Pedagogy */}
              <div>
                <span style={{
                  color: 'var(--accent)', fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
                  letterSpacing: 2, display: 'block', marginBottom: 12
                }}>
                  QUEM É CLÁUDIO BRUM
                </span>
                <h2 style={{ fontSize: 36, lineHeight: 1.2, marginBottom: 20, fontFamily: 'var(--font-title)' }}>
                  Muito mais que ensinar exatas:<br/>a <span style={{ color: 'var(--accent)' }}>engenharia</span> por trás da sua aprovação.
                </h2>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                  Cláudio Brum não é apenas um professor; ele é o estrategista que vai guiar a sua jornada rumo à vaga dos seus sonhos. Com mais de <strong>20 anos de experiência</strong> dedicados a aprovar estudantes nas bancas mais difíceis do país, Cláudio une sua formação sólida em Física e Matemática à sua especialização em Psicopedagogia. Criador do aclamado <em>Clube da Matemática</em>, ele desenvolveu uma metodologia única para desmistificar as exatas e destravar o potencial lógico de cada aluno.
                </p>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                  O grande segredo por trás do seu método inovador vem de uma paixão paralela: a música. Como <strong>saxofonista profissional</strong>, Cláudio compreende que a matemática e a harmonia musical compartilham a mesma essência — padrões, ritmo e disciplina. Ao trazer o rigor técnico e a repetição estratégica do treino musical para a rotina de estudos, ele ensina o aluno a identificar e resolver questões de forma natural e automatizada. Aqui, a aprovação deixa de ser uma questão de sorte e passa a ser a consequência inevitável de um treinamento de elite.
                </p>

                {/* 4 Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="glass" style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong style={{ display: 'block', fontSize: 24, color: 'var(--accent)', marginBottom: 4 }}>20+</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, display: 'block' }}>
                      Anos preparando para concursos, escolas técnicas e reforço
                    </span>
                  </div>
                  <div className="glass" style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong style={{ display: 'block', fontSize: 24, color: 'var(--accent)', marginBottom: 4 }}>500+</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, display: 'block' }}>
                      Alunos aprovados em concursos militares, CEFET, IFRJ e Pedro II
                    </span>
                  </div>
                  <div className="glass" style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong style={{ display: 'block', fontSize: 24, color: 'var(--accent)', marginBottom: 4 }}>94%</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, display: 'block' }}>
                      Taxa de aprovação dos alunos que seguem o método completo
                    </span>
                  </div>
                  <div className="glass" style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong style={{ display: 'block', fontSize: 24, color: 'var(--accent)', marginBottom: 4 }}>3</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, display: 'block' }}>
                      Pilares: Militares, Escolas Técnicas e Reforço Escolar
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Features Section */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
              maxWidth: '1200px', margin: '40px auto 20px auto', borderTop: '1px solid var(--border-glass)', paddingTop: 60
            }}>
              <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
                <div style={{ color: 'var(--accent)', marginBottom: 16 }}><Shield size={28} /></div>
                <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: 'var(--font-title)' }}>Panda/Bunny Security</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                  Marca d&apos;água dinâmica com o e-mail do usuário flutuando na tela, criptografia HLS e chaves temporárias para bloquear gravação de tela e downloads não autorizados.
                </p>
              </div>

              <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
                <div style={{ color: 'var(--accent)', marginBottom: 16 }}><LineChart size={28} /></div>
                <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: 'var(--font-title)' }}>Controle Parental</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                  Painel exclusivo para os pais vincularem e acompanharem o tempo de estudo, evolução do progresso e emissão automática de relatórios acadêmicos.
                </p>
              </div>

              <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
                <div style={{ color: 'var(--accent)', marginBottom: 16 }}><Award size={28} /></div>
                <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: 'var(--font-title)' }}>Diagnóstico Gratuito</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                  Avaliação interativa de nivelamento com recomendação instantânea de trilhas de aprendizado personalizadas focadas nas maiores deficiências de exatas.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Quiz Component */
          <div style={{ maxWidth: 640, margin: '40px auto' }}>
            <div className="glass" style={{ padding: 40, borderRadius: 24 }}>
              {!quizFinished ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 'bold' }}>TESTE DE DIAGNÓSTICO</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Questão {currentQuestionIdx + 1} de {QUIZ_QUESTIONS.length}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 30 }}>
                    <div style={{
                      width: `${((currentQuestionIdx + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                      height: '100%', background: 'var(--accent)', borderRadius: 2,
                      transition: 'var(--transition-smooth)'
                    }}></div>
                  </div>

                  <h2 style={{ fontSize: 24, marginBottom: 30, fontFamily: 'var(--font-title)', lineHeight: 1.3 }}>
                    {QUIZ_QUESTIONS[currentQuestionIdx].question}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {QUIZ_QUESTIONS[currentQuestionIdx].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(opt.points, opt.text)}
                        className="glass"
                        style={{
                          padding: '16px 20px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                          fontSize: 15, transition: 'var(--transition-smooth)', display: 'block', width: '100%',
                          background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-glass)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>

                  <button onClick={resetQuiz} style={{ marginTop: 24, background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                    Cancelar teste
                  </button>
                </>
              ) : (
                /* Quiz Lead Capture & Results recommendation */
                <div>
                  <h2 style={{ fontSize: 28, marginBottom: 16, fontFamily: 'var(--font-title)' }}>
                    Diagnóstico Concluído!
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 24 }}>
                    Analisamos suas respostas. Você acertou <strong style={{ color: '#fff' }}>{quizScore} de 3</strong> questões de conceito direto! Recomendamos uma trilha voltada a <strong className="gradient-text">{recommendation?.title}</strong>.
                  </p>

                  <div className="glass" style={{ padding: 24, borderRadius: 12, marginBottom: 32, background: 'rgba(0,0,0,0.2)' }}>
                    <h4 style={{ marginBottom: 8, fontSize: 16 }}>Trilha Sugerida:</h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{recommendation?.description}</p>
                  </div>

                  <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 18, fontFamily: 'var(--font-title)' }}>Preencha seus dados para receber o relatório e cupom:</h3>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Seu nome completo</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: João da Silva" 
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="input-field" 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Seu e-mail principal</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="Ex: joao@gmail.com" 
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="input-field" 
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '16px 20px', fontSize: 16, marginTop: 10 }}>
                      Verificar Recomendação & Iniciar Aulas <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{ padding: 40, borderRadius: 24, width: '100%', maxWidth: 440 }}>
            <h2 style={{ fontSize: 24, marginBottom: 20, fontFamily: 'var(--font-title)' }}>Entrar no Clube Flix</h2>
            
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Nome"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>E-mail</label>
                <input 
                  type="email" 
                  required 
                  placeholder="seuemail@exemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Seu Papel</label>
                <select 
                  value={loginRole} 
                  onChange={(e: any) => setLoginRole(e.target.value)}
                  className="input-field"
                  style={{ background: '#0e0e16' }}
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor (Prof. Cláudio Brum)</option>
                  <option value="parent">Pai / Responsável</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Entrar</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '24px 5%', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        <p>© 2026 Clube Flix. Todos os direitos reservados para o Professor Cláudio Brum. Plataforma LMS EdTech SaaS.</p>
      </footer>
    </div>
  );
}
