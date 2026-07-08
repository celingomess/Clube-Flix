'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseMock, Course, Progress } from '@/lib/supabase';
import { 
  Users, 
  LineChart, 
  Calendar, 
  Award, 
  UserPlus, 
  Mail, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ParentDashboard() {
  const router = useRouter();
  
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [studentInputEmail, setStudentInputEmail] = useState('');
  const [linkedStudents, setLinkedStudents] = useState<string[]>([]);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  
  // Selected student progress
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);

  useEffect(() => {
    const email = SupabaseMock.getCurrentUserEmail();
    const role = SupabaseMock.getCurrentUserRole();
    const name = SupabaseMock.getCurrentUserName();

    if (!email || role !== 'parent') {
      router.push('/');
      return;
    }

    setParentEmail(email);
    setParentName(name || 'Responsável');
    setCourses(SupabaseMock.getCourses());
    
    // Load linked students
    const links = SupabaseMock.getParentStudents(email);
    setLinkedStudents(links);
    
    // Auto select first student if available
    if (links.length > 0) {
      setSelectedStudentEmail(links[0]);
    } else {
      // Create a default link for demonstration if none exists, to let parent view demo student data easily
      SupabaseMock.linkParentStudent(email, 'student@clube.com');
      const updatedLinks = SupabaseMock.getParentStudents(email);
      setLinkedStudents(updatedLinks);
      setSelectedStudentEmail('student@clube.com');
    }
  }, [router]);

  useEffect(() => {
    if (selectedStudentEmail) {
      setStudentProgress(SupabaseMock.getProgress(selectedStudentEmail));
    } else {
      setStudentProgress([]);
    }
  }, [selectedStudentEmail]);

  const handleLinkStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInputEmail) return;

    SupabaseMock.linkParentStudent(parentEmail, studentInputEmail);
    const updated = SupabaseMock.getParentStudents(parentEmail);
    setLinkedStudents(updated);
    setSelectedStudentEmail(studentInputEmail);
    setStudentInputEmail('');
  };

  // Helper stats
  const totalVideos = courses.flatMap(c => c.modules.flatMap(m => m.videos)).length;
  const completedVideos = studentProgress.filter(p => p.completed).length;
  const totalMinutesStudied = Math.round(studentProgress.reduce((acc, p) => acc + p.watchedSeconds, 0) / 60);
  const studentLevel = Math.max(1, Math.floor(completedVideos * 1.5) + 1);

  // Check if any course is 100% completed
  const getCompletedCourses = () => {
    return courses.filter(c => {
      const courseVideoIds = c.modules.flatMap(m => m.videos.map(v => v.id));
      if (courseVideoIds.length === 0) return false;
      const completed = studentProgress.filter(p => courseVideoIds.includes(p.videoId) && p.completed).length;
      return completed === courseVideoIds.length;
    });
  };

  const completedCoursesList = getCompletedCourses();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass" style={{
        padding: '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => router.push('/')}
            style={{ background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
              onClick={() => router.push('/')}
            >
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
                  {/* Nome do Professor */}
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

                  {/* Separador */}
                  <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }}></div>

                  {/* Nome da Plataforma */}
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
              Painel dos Pais
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{parentName}</span>
            <span style={{ fontSize: 10, color: '#3b82f6' }}>Acompanhamento Parental</span>
          </div>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>P</div>
        </div>
      </header>

      {/* Main container */}
      <main style={{ flex: 1, padding: '40px 5%', display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Top Split Layout: Link student & Select student */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
          
          {/* Linked student Selector */}
          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--accent)" /> Estudantes Vinculados
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>
              Selecione o e-mail do seu filho para inspecionar os relatórios de desempenho e tempo de tela.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {linkedStudents.map((email) => {
                const active = selectedStudentEmail === email;
                return (
                  <button
                    key={email}
                    onClick={() => setSelectedStudentEmail(email)}
                    className="glass"
                    style={{
                      padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      background: active ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                      borderColor: active ? 'var(--accent)' : 'var(--border-glass)',
                      color: '#fff', fontWeight: 600, transition: 'var(--transition-smooth)'
                    }}
                  >
                    {email}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link student form */}
          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={18} color="#22c55e" /> Vincular Novo Estudante
            </h3>
            <form onSubmit={handleLinkStudent} style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="email" 
                  required
                  placeholder="e-mail do seu filho (Ex: joao@gmail.com)"
                  value={studentInputEmail}
                  onChange={(e) => setStudentInputEmail(e.target.value)}
                  className="input-field"
                  style={{ padding: '10px 14px 10px 36px', fontSize: 13 }}
                />
                <Mail size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '10px 16px', fontSize: 13 }}>
                Vincular
              </button>
            </form>
          </div>

        </section>

        {/* Selected Student Metrics & Logs */}
        {selectedStudentEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Progresso Acadêmico</span>
                <strong style={{ fontSize: 28 }}>{completedVideos}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> / {totalVideos} aulas concluídas</span>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 12 }}>
                  <div style={{ width: `${totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0}%`, height: '100%', background: 'var(--accent)' }}></div>
                </div>
              </div>

              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Tempo de Foco</span>
                <strong style={{ fontSize: 28 }}>{totalMinutesStudied}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> Minutos estudados</span>
                <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>Em vídeo aulas de exatas</span>
              </div>

              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Nível Alcançado</span>
                <strong style={{ fontSize: 28, color: '#eab308' }}>Nível {studentLevel}</strong>
                <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Evolução reativa à notas</span>
              </div>

              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Justificativa de Retenção</span>
                <strong style={{ fontSize: 22, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Excelente!
                </strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Foco assíncrono ativo</span>
              </div>
            </div>

            {/* Split Progress logs & Certificates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
              
              {/* Detailed logs */}
              <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
                <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={20} color="var(--accent)" /> Registro de Estudo Detalhado
                </h3>

                {studentProgress.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                    Seu filho ainda não iniciou nenhuma aula na vitrine.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {studentProgress.map((p, idx) => {
                      // Find video title
                      let videoTitle = p.videoId;
                      for (const c of courses) {
                        for (const m of c.modules) {
                          const v = m.videos.find(vid => vid.id === p.videoId);
                          if (v) {
                            videoTitle = v.title;
                            break;
                          }
                        }
                      }

                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: 14, borderRadius: 10, border: '1px solid var(--border-glass)',
                            background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 14, display: 'block' }}>{videoTitle}</strong>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Último acesso em: {new Date(p.updatedAt).toLocaleDateString()} às {new Date(p.updatedAt).toLocaleTimeString().substring(0, 5)}
                            </span>
                          </div>

                          <div>
                            {p.completed ? (
                              <span style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                                Concluído
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                                Assistindo ({Math.round(p.watchedSeconds / 60)}m)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Certificates Simulator Section */}
              <div className="glass" style={{ padding: 32, borderRadius: 20, height: 'fit-content' }}>
                <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={20} color="#eab308" /> Certificados de Conclusão
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 20 }}>
                  Quando o aluno completar 100% de uma trilha do Professor Brum, você poderá ver o certificado dele aqui.
                </p>

                {completedCoursesList.length === 0 ? (
                  <div style={{
                    padding: 20, borderRadius: 10, border: '1px dashed var(--border-glass)',
                    textAlign: 'center', color: 'var(--text-muted)', fontSize: 12
                  }}>
                    Ainda não há trilhas concluídas para emissão de certificado.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {completedCoursesList.map((course) => (
                      <div 
                        key={course.id}
                        style={{
                          padding: 16, borderRadius: 10, border: '1px solid rgba(234, 179, 8, 0.3)',
                          background: 'rgba(234, 179, 8, 0.05)', display: 'flex', flexDirection: 'column', gap: 10
                        }}
                      >
                        <strong style={{ fontSize: 13, color: '#fff' }}>{course.title}</strong>
                        <button 
                          onClick={() => alert(`Simulação: Certificado de Conclusão de ${course.title} assinado pelo Professor Cláudio Brum gerado com sucesso!`)}
                          className="btn-primary" 
                          style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', padding: '8px 12px', fontSize: 12, boxShadow: 'none' }}
                        >
                          <FileText size={14} /> Baixar Certificado Oficial
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Selecione ou vincule um estudante para visualizar o relatório.
          </div>
        )}

      </main>
    </div>
  );
}
