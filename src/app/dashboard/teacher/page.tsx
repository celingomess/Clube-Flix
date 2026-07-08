'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseMock, Course, DiagnosticResult } from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  LineChart, 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowLeft,
  Mail,
  CheckCircle,
  FolderPlus
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  
  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, totalDiagnosticLeads: 0, completionsRate: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [leads, setLeads] = useState<DiagnosticResult[]>([]);

  // Add course form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Physics' | 'Math' | 'Logic'>('Physics');
  const [newDifficulty, setNewDifficulty] = useState<'Basic' | 'Intermediate' | 'Advanced'>('Basic');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800');

  useEffect(() => {
    // Check if user is a teacher
    const email = SupabaseMock.getCurrentUserEmail();
    const role = SupabaseMock.getCurrentUserRole();
    if (!email || role !== 'teacher') {
      router.push('/');
      return;
    }

    setStats(SupabaseMock.getTeacherStats());
    setCourses(SupabaseMock.getCourses());
    setLeads(SupabaseMock.getDiagnostics());
  }, [router]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const newCourseItem: Course = {
      id: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTitle,
      description: newDesc,
      category: newCategory,
      difficulty: newDifficulty,
      coverUrl: newCover,
      modules: [
        {
          id: 'modulo-intro',
          title: 'Módulo 1: Introdução Geral',
          videos: [
            { id: `v-${Math.random()}`, title: '1.1 Boas-vindas e Planejamento de Estudos', duration: 300, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
          ]
        }
      ]
    };

    const updated = [...courses, newCourseItem];
    SupabaseMock.saveCourses(updated);
    setCourses(updated);
    
    // Reset form
    setNewTitle('');
    setNewDesc('');
    
    // Refresh stats
    setStats(SupabaseMock.getTeacherStats());
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Tem certeza que deseja remover este curso do catálogo?')) {
      const updated = courses.filter(c => c.id !== courseId);
      SupabaseMock.saveCourses(updated);
      setCourses(updated);
      setStats(SupabaseMock.getTeacherStats());
    }
  };

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
              style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} 
              onClick={() => router.push('/')}
            >
              {/* Logo do Professor */}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, fontFamily: 'var(--font-title)' }}>
                <span style={{ 
                  fontSize: '8px', 
                  fontWeight: 700, 
                  color: '#7a8b9e', 
                  letterSpacing: '2.5px', 
                  textTransform: 'uppercase',
                  marginBottom: '2px'
                }}>
                  PROFESSOR
                </span>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: 900, 
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#ffffff' }}>CLAUDIO</span>
                  <span style={{ color: '#c9a84c', margin: '0 1px', fontWeight: 900, transform: 'translateY(1px)' }}>_</span>
                  <span style={{ color: '#c9a84c' }}>BRUM</span>
                </span>
              </div>

              {/* Separador */}
              <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }}></div>

              {/* Nome da Plataforma */}
              <span style={{ 
                fontSize: '20px', 
                fontWeight: 800, 
                fontFamily: 'var(--font-title)', 
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ffffff' }}>CLUBE</span>
                <span style={{ color: '#c9a84c' }}>FLIX</span>
              </span>
            </div>
            <div style={{ height: '18px', width: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 14px' }}></div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Painel do Professor
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Prof. Cláudio Brum</span>
            <span style={{ fontSize: 10, color: 'var(--accent)' }}>Administrador SaaS</span>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/claudio_brum.jpg" alt="CB" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main style={{ flex: 1, padding: '40px 5%', display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Statistics Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Users size={16} color="var(--accent)" /> Alunos Cadastrados
            </span>
            <strong style={{ fontSize: 28 }}>{stats.totalUsers}</strong>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Leads + Assinantes</span>
          </div>

          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={16} color="#7928ca" /> Assinaturas Recorrentes
            </span>
            <strong style={{ fontSize: 28, color: '#22c55e' }}>{stats.activeSubscriptions}</strong>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>MRR ativo estimado</span>
          </div>

          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <FileSpreadsheet size={16} color="#3b82f6" /> Leads Diagnósticos
            </span>
            <strong style={{ fontSize: 28 }}>{stats.totalDiagnosticLeads}</strong>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Prospects de Funil</span>
          </div>

          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <LineChart size={16} color="#eab308" /> Taxa de Conclusão Geral
            </span>
            <strong style={{ fontSize: 28 }}>{stats.completionsRate}%</strong>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Engajamento de vídeos</span>
          </div>
        </section>

        {/* Content & Lead split grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
          
          {/* Left Column: Course Creator & Catalog list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Create course glass form */}
            <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderPlus size={20} color="var(--accent)" /> Publicar Novo Curso
              </h3>

              <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Título do Curso</label>
                    <input 
                      type="text" 
                      required 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: Física III: Eletromagnetismo Avançado" 
                      className="input-field" 
                      style={{ padding: '10px 14px', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Imagem de Capa (URL)</label>
                    <input 
                      type="text" 
                      required 
                      value={newCover}
                      onChange={(e) => setNewCover(e.target.value)}
                      placeholder="Ex: https://capa-url.com" 
                      className="input-field" 
                      style={{ padding: '10px 14px', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Descrição Detalhada</label>
                  <textarea 
                    required 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Resumo do curso para a vitrine..." 
                    className="input-field" 
                    style={{ minHeight: 60, padding: '10px 14px', fontSize: 14, resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Categoria</label>
                    <select 
                      value={newCategory} 
                      onChange={(e: any) => setNewCategory(e.target.value)} 
                      className="input-field"
                      style={{ padding: '10px 14px', fontSize: 14, background: '#0e0e16' }}
                    >
                      <option value="Physics">Física</option>
                      <option value="Math">Matemática</option>
                      <option value="Logic">Raciocínio Lógico</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Dificuldade</label>
                    <select 
                      value={newDifficulty} 
                      onChange={(e: any) => setNewDifficulty(e.target.value)} 
                      className="input-field"
                      style={{ padding: '10px 14px', fontSize: 14, background: '#0e0e16' }}
                    >
                      <option value="Basic">Básico</option>
                      <option value="Intermediate">Intermediário</option>
                      <option value="Advanced">Avançado</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '12px 0', fontSize: 14, display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <Plus size={16} /> Adicionar Curso com Vídeo de Boas-Vindas
                </button>
              </form>
            </div>

            {/* Courses Catalog Published */}
            <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 20 }}>Cursos Publicados ({courses.length})</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    style={{
                      padding: 16, borderRadius: 12, border: '1px solid var(--border-glass)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10, background: 'var(--accent)', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold', marginRight: 8 }}>
                        {course.category}
                      </span>
                      <strong style={{ fontSize: 15 }}>{course.title}</strong>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {course.modules.length} Módulo(s) • {course.modules.reduce((acc, m) => acc + m.videos.length, 0)} Aula(s)
                      </p>
                    </div>

                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      style={{
                        background: 'rgba(201, 168, 76, 0.1)', color: 'var(--accent)', cursor: 'pointer',
                        padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 168, 76, 0.25)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Diagnostic Quiz Leads captured */}
          <div className="glass" style={{ padding: 32, borderRadius: 20, display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileSpreadsheet size={20} color="#3b82f6" /> Leads do Diagnóstico Grátis
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 20 }}>
              Estudantes capturados no funil de vendas. Entre em contato para incentivar a conversão!
            </p>

            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                Nenhum lead registrado no funil ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {leads.map((lead) => (
                  <div 
                    key={lead.id} 
                    style={{
                      padding: 14, borderRadius: 10, border: '1px solid var(--border-glass)',
                      background: 'rgba(0,0,0,0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 14 }}>{lead.name}</strong>
                      <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 'bold' }}>
                        Nota {lead.score}/3 RLM
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 12, margin: '6px 0' }}>
                      <Mail size={12} />
                      <span>{lead.email}</span>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, marginTop: 6 }}>
                      Trilha Sugerida: <strong style={{ color: '#fff' }}>{lead.recommendedCourseId}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
