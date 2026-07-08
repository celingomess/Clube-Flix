'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseMock, Course, Progress } from '@/lib/supabase';
import { 
  Play, 
  Search, 
  BookOpen, 
  Clock, 
  Award, 
  LogOut, 
  User, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle 
} from 'lucide-react';

export default function VitrinePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  useEffect(() => {
    const email = SupabaseMock.getCurrentUserEmail();
    const name = SupabaseMock.getCurrentUserName();
    
    if (!email) {
      router.push('/');
      return;
    }
    
    setUserEmail(email);
    setUserName(name || 'Estudante');

    setCourses(SupabaseMock.getCourses());
    setProgress(SupabaseMock.getProgress(email));
  }, [router]);

  const handleLogout = () => {
    SupabaseMock.logout();
    document.cookie = 'clube_flix_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'clube_flix_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'clube_flix_is_subscribed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    router.push('/');
  };

  // Helper to calculate course-level progress
  const getCourseProgressPercentage = (course: Course) => {
    const courseVideoIds = course.modules.flatMap(m => m.videos.map(v => v.id));
    if (courseVideoIds.length === 0) return 0;

    const completedInCourse = progress.filter(
      p => courseVideoIds.includes(p.videoId) && p.completed
    ).length;

    return Math.round((completedInCourse / courseVideoIds.length) * 100);
  };

  // Helper to find the last watched video for "Continue Assistindo"
  const getContinueWatchingList = () => {
    if (progress.length === 0) return [];
    
    // Sort progress by updatedAt descending
    const sortedProgress = [...progress].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return sortedProgress.map(p => {
      const course = courses.find(c => c.id === p.courseId);
      if (!course) return null;
      
      // Find video details
      let videoTitle = '';
      let videoIdx = 1;
      for (const m of course.modules) {
        const idx = m.videos.findIndex(v => v.id === p.videoId);
        if (idx > -1) {
          videoTitle = m.videos[idx].title;
          break;
        }
      }

      return {
        course,
        videoId: p.videoId,
        videoTitle,
        percentage: getCourseProgressPercentage(course),
        completed: p.completed
      };
    }).filter(Boolean) as Array<{ course: Course; videoId: string; videoTitle: string; percentage: number; completed: boolean }>;
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const continueWatching = getContinueWatchingList();

  // Progress stats overview
  const totalVideos = courses.flatMap(c => c.modules.flatMap(m => m.videos)).length;
  const completedVideos = progress.filter(p => p.completed).length;
  const studentLevel = Math.max(1, Math.floor(completedVideos * 1.5) + 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass" style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/vitrine')}>
            <div style={{
              background: 'var(--accent)', width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>CF</div>
            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              CLUBE<span className="gradient-text">FLIX</span>
            </span>
          </div>

          <nav style={{ display: 'flex', gap: 20, fontSize: 14 }}>
            <span style={{ color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Vitrine</span>
            <span onClick={() => router.push('/')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Início</span>
            <span onClick={() => router.push('/dashboard/parent')} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Relatório Pais</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Buscar cursos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass" 
              style={{
                padding: '8px 16px 8px 36px', borderRadius: 20, fontSize: 13,
                color: '#fff', width: 200, transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.currentTarget.style.width = '260px'}
              onBlur={(e) => e.currentTarget.style.width = '200px'}
            />
            <Search size={14} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
          </div>

          {/* User info & logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'rgba(255,255,255,0.08)', width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={16} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{userName}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 5% 80px 5%', display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Student Progress Overview Banner */}
        <section className="glass" style={{
          padding: 24, borderRadius: 20,
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 24, alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(22, 22, 34, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)'
        }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={24} color="var(--accent)" />
              Painel de Desempenho Visual
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Monitore sua evolução diária. Complete os módulos para avançar níveis e gerar seu certificado do Brum.
            </p>
          </div>

          {/* Progress gauge */}
          <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: 24 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Progresso Geral</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 'bold' }}>{completedVideos}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {totalVideos} aulas</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <div style={{
                width: `${totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0}%`,
                height: '100%', background: 'var(--accent)', borderRadius: 3
              }}></div>
            </div>
          </div>

          {/* Level card */}
          <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              background: 'var(--accent-gradient)', width: 48, height: 48, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Award size={26} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Nível de Estudos</span>
              <strong style={{ fontSize: 16 }}>Nível {studentLevel}</strong>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>
                {completedVideos >= totalVideos ? 'Mestre de Exatas' : `${totalVideos - completedVideos} aulas para subir de nível`}
              </span>
            </div>
          </div>
        </section>

        {/* Billboard Hero Card */}
        {courses.length > 0 && searchQuery === '' && filterCategory === 'All' && (
          <section className="glass floating" style={{
            height: 380, borderRadius: 24, overflow: 'hidden', position: 'relative',
            backgroundImage: `linear-gradient(to right, rgba(6, 6, 9, 0.95) 30%, rgba(6, 6, 9, 0.2) 70%), url(${courses[0].coverUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center',
            padding: '0 60px', border: '1px solid var(--border-glass)'
          }}>
            <div style={{ maxWidth: 500 }}>
              <span style={{
                background: 'var(--accent)', padding: '4px 10px', borderRadius: 4,
                fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, display: 'inline-block'
              }}>
                DESTAQUE DO MÊS
              </span>
              <h1 style={{ fontSize: 36, marginBottom: 12, fontFamily: 'var(--font-title)', lineHeight: 1.2 }}>
                {courses[0].title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                {courses[0].description}
              </p>

              <button 
                onClick={() => router.push(`/player/${courses[0].id}/${courses[0].modules[0].videos[0].id}`)}
                className="btn-primary" 
                style={{ padding: '14px 32px' }}
              >
                <Play size={16} fill="white" /> Começar Assistir
              </button>
            </div>
          </section>
        )}

        {/* Categories Bar */}
        <section style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {['All', 'Physics', 'Math', 'Logic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="glass"
              style={{
                padding: '8px 20px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                background: filterCategory === cat ? 'var(--accent)' : 'var(--bg-card)',
                borderColor: filterCategory === cat ? 'var(--accent)' : 'var(--border-glass)',
                color: '#fff', fontWeight: 600, transition: 'var(--transition-smooth)'
              }}
            >
              {cat === 'All' ? 'Todos os Cursos' : cat === 'Physics' ? 'Física' : cat === 'Math' ? 'Matemática' : 'Raciocínio Lógico'}
            </button>
          ))}
        </section>

        {/* Continue Watching Row (Dynamic based on progress) */}
        {continueWatching.length > 0 && searchQuery === '' && (
          <section>
            <h3 style={{ fontSize: 20, marginBottom: 16, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Continue Assistindo
            </h3>
            <div className="carousel-track" style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16 }}>
              {continueWatching.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => router.push(`/player/${item.course.id}/${item.videoId}`)}
                  className="glass"
                  style={{
                    flex: '0 0 280px', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    transition: 'var(--transition-smooth)', position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ height: 140, backgroundImage: `url(${item.course.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Play size={28} fill="white" />
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 'bold' }}>{item.course.category}</span>
                    <h4 style={{ fontSize: 13, margin: '4px 0 8px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.videoTitle}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>Trilha: {item.course.title.substring(0, 18)}...</span>
                      <span>{item.percentage}% concluído</span>
                    </div>
                    {/* progress line */}
                    <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 1.5, marginTop: 12 }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: 'var(--accent)' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Courses Grid / Rows */}
        <section>
          <h3 style={{ fontSize: 20, marginBottom: 20, fontFamily: 'var(--font-title)' }}>
            {searchQuery || filterCategory !== 'All' ? 'Resultados da Busca' : 'Catálogo Completo'}
          </h3>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24
          }}>
            {filteredCourses.map((course) => {
              const progPercent = getCourseProgressPercentage(course);
              return (
                <div 
                  key={course.id}
                  onClick={() => router.push(`/player/${course.id}/${course.modules[0].videos[0].id}`)}
                  className="glass"
                  style={{
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    transition: 'var(--transition-smooth)', border: '1px solid var(--border-glass)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                  }}
                >
                  <div style={{
                    height: 160, backgroundImage: `url(${course.coverUrl})`, backgroundSize: 'cover',
                    backgroundPosition: 'center', position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold'
                    }}>
                      {course.difficulty}
                    </span>
                    <span style={{
                      position: 'absolute', top: 12, right: 12, background: 'var(--accent)',
                      padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold'
                    }}>
                      {course.category}
                    </span>
                  </div>

                  <div style={{ padding: 20 }}>
                    <h4 style={{ fontSize: 16, marginBottom: 8, fontFamily: 'var(--font-title)' }}>{course.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.4, height: 50, overflow: 'hidden', marginBottom: 16 }}>
                      {course.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <BookOpen size={12} /> {course.modules.length} Módulos
                      </span>

                      {progPercent > 0 ? (
                        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={12} /> {progPercent}% Concluído
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                          Iniciar Aula <ChevronRight size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Nenhum curso encontrado correspondente aos critérios.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
