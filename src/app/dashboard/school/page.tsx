'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseMock, Course, Progress } from '@/lib/supabase';
import { 
  Users, 
  LineChart, 
  Award, 
  UserPlus, 
  Mail, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  TrendingUp,
  FileText,
  Building,
  ShieldCheck,
  Zap,
  CheckCircle,
  Plus
} from 'lucide-react';

export default function SchoolDashboard() {
  const router = useRouter();
  
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [studentInputEmails, setStudentInputEmails] = useState('');
  const [invitedStudents, setInvitedStudents] = useState<string[]>([]);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  
  // Selected student progress
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);

  // B2B Licences config
  const totalLicences = 300;

  useEffect(() => {
    const email = SupabaseMock.getCurrentUserEmail();
    const role = SupabaseMock.getCurrentUserRole();
    const name = SupabaseMock.getCurrentUserName();

    // Standard school admin bypass or check
    if (!email || (role !== 'teacher' && email !== 'escola@colegio.com.br')) {
      if (role !== 'teacher') {
        router.push('/');
        return;
      }
    }

    const currentSchoolEmail = email || 'escola@colegio.com.br';
    setSchoolEmail(currentSchoolEmail);
    setSchoolName(name || 'Colégio Integral Exponent');
    setCourses(SupabaseMock.getCourses());
    
    // Load school linked students from localStorage
    const saved = localStorage.getItem(`clube_flix_school_students_${currentSchoolEmail}`);
    let list: string[] = [];
    if (saved) {
      list = JSON.parse(saved);
    } else {
      list = ['ana.silva@colegio.com.br', 'pedro.santos@colegio.com.br', 'lucas.oliveira@colegio.com.br'];
      localStorage.setItem(`clube_flix_school_students_${currentSchoolEmail}`, JSON.stringify(list));
      
      list.forEach(email => SupabaseMock.enrollUser(email, 'active'));
    }
    setInvitedStudents(list);
    
    if (list.length > 0) {
      setSelectedStudentEmail(list[0]);
    }
  }, [router]);

  useEffect(() => {
    if (selectedStudentEmail) {
      setStudentProgress(SupabaseMock.getProgress(selectedStudentEmail));
    } else {
      setStudentProgress([]);
    }
  }, [selectedStudentEmail]);

  const handleInviteStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInputEmails.trim()) return;

    const newEmails = studentInputEmails
      .split(/[\s,;]+/)
      .map(email => email.toLowerCase().trim())
      .filter(email => email && email.includes('@') && !invitedStudents.includes(email));

    if (newEmails.length === 0) {
      alert('Nenhum e-mail novo e válido inserido.');
      return;
    }

    if (invitedStudents.length + newEmails.length > totalLicences) {
      alert(`Erro: Ação excede a franquia restante de ${totalLicences - invitedStudents.length} licenças B2B.`);
      return;
    }

    newEmails.forEach(email => {
      SupabaseMock.enrollUser(email, 'active');
    });

    const updatedList = [...invitedStudents, ...newEmails];
    setInvitedStudents(updatedList);
    localStorage.setItem(`clube_flix_school_students_${schoolEmail}`, JSON.stringify(updatedList));
    setSelectedStudentEmail(newEmails[0]);
    setStudentInputEmails('');
    alert(`Sucesso! ${newEmails.length} licenças B2B ativadas instantaneamente.`);
  };

  const totalVideos = courses.flatMap(c => c.modules.flatMap(m => m.videos)).length;
  const completedVideos = studentProgress.filter(p => p.completed).length;
  const totalMinutesStudied = Math.round(studentProgress.reduce((acc, p) => acc + p.watchedSeconds, 0) / 60);
  const studentLevel = selectedStudentEmail ? SupabaseMock.getLevel(selectedStudentEmail) : 1;
  const studentXp = selectedStudentEmail ? SupabaseMock.getXP(selectedStudentEmail) : 0;

  const activeLicences = invitedStudents.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', width: '100%' }}>
      
      {/* Header */}
      <header className="glass" style={{
        padding: '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(201, 168, 76, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => router.push('/')}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', color: '#fff' }}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: '10px' }}>
              <span style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                fontSize: '7px', 
                fontWeight: 700, 
                color: '#7a8b9e', 
                letterSpacing: '2.5px', 
                textTransform: 'uppercase'
              }}>
                PROFESSOR
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: 900, 
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  lineHeight: 1
                }}>
                  <span style={{ color: '#ffffff' }}>CLAUDIO</span>
                  <span style={{ color: '#c9a84c', margin: '0 1px', fontWeight: 900, transform: 'translateY(1px)' }}>_</span>
                  <span style={{ color: '#c9a84c' }}>BRUM</span>
                </span>
                <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }}></div>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-title)', 
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  lineHeight: 1
                }}>
                  <span style={{ color: '#ffffff' }}>CLUBE</span>
                  <span style={{ color: '#c9a84c' }}>FLIX</span>
                </span>
              </div>
            </div>
          </div>
          <div style={{ height: '18px', width: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 14px' }}></div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Portal B2B Escolas
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff' }}>{schoolName}</span>
            <span style={{ fontSize: 10, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <ShieldCheck size={10} /> Conta Escolar Verificada
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ flex: 1, padding: '40px 5%', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* KPI Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          
          <div className="glass" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--accent)', padding: 12, borderRadius: 12 }}>
              <Building size={24} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Licenças Contratadas</span>
              <strong style={{ fontSize: 22, color: '#fff' }}>{activeLicences} <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>/ {totalLicences}</span></strong>
            </div>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--accent)', padding: 12, borderRadius: 12 }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Média de Engajamento</span>
              <strong style={{ fontSize: 22, color: '#fff' }}>87.5%</strong>
            </div>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--accent)', padding: 12, borderRadius: 12 }}>
              <Zap size={24} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Foco dos Alunos</span>
              <strong style={{ fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>Física Geral</strong>
            </div>
          </div>

        </section>

        {/* Inner Sections Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 32 }}>
          
          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Activating Licences */}
            <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="var(--accent)" />
                Ativação de Licenças (Lote)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                Cole e-mails dos alunos ou professores da instituição separados por vírgula ou espaço para dar acesso imediato.
              </p>

              <form onSubmit={handleInviteStudents}>
                <textarea
                  required
                  placeholder="aluno1@escola.com, aluno2@escola.com"
                  value={studentInputEmails}
                  onChange={(e) => setStudentInputEmails(e.target.value)}
                  className="input-field"
                  style={{ minHeight: 100, resize: 'none', fontSize: 13, marginBottom: 16 }}
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 0' }}>
                  Ativar Acesso no Sistema
                </button>
              </form>
            </div>

            {/* List of Active licences */}
            <div className="glass" style={{ padding: 24, borderRadius: 20, flex: 1 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="var(--accent)" />
                Alunos Matriculados ({invitedStudents.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                {invitedStudents.map((email) => {
                  const isSelected = selectedStudentEmail === email;
                  return (
                    <div
                      key={email}
                      onClick={() => setSelectedStudentEmail(email)}
                      style={{
                        padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                        background: isSelected ? 'rgba(201, 168, 76, 0.08)' : 'rgba(255,255,255,0.01)',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <span style={{ fontSize: 13, color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                        {email}
                      </span>
                      <ChevronRight size={14} color={isSelected ? 'var(--accent)' : 'var(--text-muted)'} />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Panel */}
          <div className="glass" style={{ padding: 32, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 28 }}>
            {selectedStudentEmail ? (
              <>
                <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: 20 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Visão Geral do Aluno
                  </span>
                  <h3 style={{ fontSize: 20, color: '#fff' }}>{selectedStudentEmail}</h3>
                </div>

                {/* Progress Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nível Alcançado</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Award size={20} color="var(--accent)" />
                      <span style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Nível {studentLevel}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>{studentXp} XP Acumulado</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Tempo de Tela de Estudos</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={20} color="var(--accent)" />
                      <span style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{totalMinutesStudied} minutos</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Tempo ativo estimado</span>
                  </div>

                </div>

                {/* Course Completion Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Evolução por Conteúdo Curricular</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {courses.map((course) => {
                      const courseVideoIds = course.modules.flatMap(m => m.videos.map(v => v.id));
                      const totalCourseVideos = courseVideoIds.length;
                      const completedInCourse = studentProgress.filter(
                        p => courseVideoIds.includes(p.videoId) && p.completed
                      ).length;
                      const percentage = totalCourseVideos > 0 ? Math.round((completedInCourse / totalCourseVideos) * 100) : 0;

                      return (
                        <div key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{course.title}</span>
                            <span style={{ color: percentage === 100 ? '#22c55e' : 'var(--text-muted)' }}>
                              {percentage === 100 ? '100% Concluído' : `${completedInCourse}/${totalCourseVideos} aulas (${percentage}%)`}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%', 
                              background: percentage === 100 ? '#22c55e' : 'var(--accent-gradient)', 
                              borderRadius: 3
                            }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-muted)' }}>
                <Building size={48} />
                <span>Nenhum aluno selecionado para visualização de métricas B2B.</span>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
