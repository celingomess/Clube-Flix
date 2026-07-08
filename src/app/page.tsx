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
  LineChart 
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <header className="glass" style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'var(--accent)', width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>CF</div>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-title)' }}>
            CLUBE<span className="gradient-text">FLIX</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <span className="glass" style={{ padding: '4px 8px', borderRadius: 4, textTransform: 'capitalize', fontSize: 11, background: 'rgba(255,255,255,0.05)' }}>
                  {currentUser.role === 'teacher' ? 'Professor' : currentUser.role === 'parent' ? 'Responsável' : 'Estudante'}
                </span>
                <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
              </div>
              <button 
                onClick={() => {
                  if (currentUser.role === 'teacher') router.push('/dashboard/teacher');
                  else if (currentUser.role === 'parent') router.push('/dashboard/parent');
                  else router.push('/vitrine');
                }}
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                Acessar Plataforma
              </button>
              <button onClick={handleLogout} style={{ background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <LogOut size={18} color="var(--text-muted)" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setShowLoginModal(true); setLoginRole('student'); }}
                style={{ background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Entrar
              </button>
              <button onClick={() => setShowQuiz(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                Diagnóstico Grátis
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Hero & Content */}
      <main style={{ flex: 1, padding: '60px 5%' }}>
        {!showQuiz ? (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center',
              margin: '40px 0 80px 0'
            }}>
              <div>
                <span style={{
                  color: 'var(--accent)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase',
                  letterSpacing: 2, display: 'block', marginBottom: 12
                }}>
                  LMS EDTECH SAAS - PROFESSOR CLÁUDIO BRUM
                </span>
                <h1 style={{ fontSize: 52, lineHeight: 1.1, marginBottom: 20 }}>
                  Acelere sua aprovação em <span className="gradient-text">Física & Matemática</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, marginBottom: 32 }}>
                  Uma plataforma de streaming educacional assíncrona feita sob medida para vestibulandos, concurseiros e estudantes de exatas. Vídeos protegidos, anotações inteligentes e relatórios completos para seus pais.
                </p>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <button onClick={() => setShowQuiz(true)} className="btn-primary" style={{ padding: '16px 36px', fontSize: 16 }}>
                    Fazer Teste de Diagnóstico <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      // Redirect direct subscription
                      router.push('/checkout');
                    }}
                    className="btn-secondary" 
                    style={{ padding: '16px 36px', fontSize: 16 }}
                  >
                    Assinar Agora
                  </button>
                </div>
              </div>

              {/* Right Side - Features Highlight */}
              <div className="glass floating" style={{ padding: 40, borderRadius: 24, position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20, background: 'var(--purple-gradient)',
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 'bold'
                }}>
                  100% Assíncrono
                </div>
                <h3 style={{ fontSize: 24, marginBottom: 20, fontFamily: 'var(--font-title)' }}>Recursos Premium</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ color: 'var(--accent)', marginTop: 2 }}><Shield size={22} /></div>
                    <div>
                      <h4 style={{ fontSize: 16, marginBottom: 4 }}>Panda/Bunny Security</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Marca d&apos;água dinâmica com seu e-mail contra gravação de tela e pirataria.</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ color: 'var(--accent)', marginTop: 2 }}><LineChart size={22} /></div>
                    <div>
                      <h4 style={{ fontSize: 16, marginBottom: 4 }}>Controle Parental</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Painel exclusivo para pais acompanharem métricas de progresso detalhadas do estudante.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ color: 'var(--accent)', marginTop: 2 }}><Award size={22} /></div>
                    <div>
                      <h4 style={{ fontSize: 16, marginBottom: 4 }}>Diagnóstico Inteligente</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Avaliação gratuita de nivelamento recomendando trilhas focadas em suas fraquezas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Panel for testing */}
            <div className="glass" style={{ padding: 24, borderRadius: 16, marginBottom: 60, border: '1px solid rgba(229, 9, 20, 0.2)' }}>
              <h3 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="var(--accent)" />
                Painel de Teste Rápido (Protótipo Funcional)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                Use os botões de simulação abaixo para testar instantaneamente a proteção de rotas (middleware), os painéis de controle e o player seguro.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => handleQuickLogin('teacher')} className="btn-primary" style={{ background: '#7928ca', boxShadow: 'none', fontSize: 13, padding: '8px 16px' }}>
                  Acessar como Prof. Cláudio Brum (Dashboard Professor)
                </button>
                <button onClick={() => handleQuickLogin('student', true)} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Estudante Assinante (Acessa Vitrine & Player)
                </button>
                <button onClick={() => handleQuickLogin('student', false)} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px', border: '1px dashed #e50914' }}>
                  Estudante Não-Assinante (Bloqueia Rotas & Checkout)
                </button>
                <button onClick={() => handleQuickLogin('parent')} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Responsável/Pai (Dashboard Parental)
                </button>
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
                          background: 'rgba(255,255,255,0.02)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
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
