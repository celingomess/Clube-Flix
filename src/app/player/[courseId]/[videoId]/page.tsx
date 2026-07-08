'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SupabaseMock, Course, Video, Note, Progress } from '@/lib/supabase';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  BookOpen, 
  Edit3, 
  FileText, 
  CheckCircle, 
  Lock, 
  Volume2, 
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const videoId = params.videoId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'chat_ia'>('content');

  // IA Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Olá! Sou o Cláudio Brum Digital, seu monitor de exatas 24 horas por dia. Qual dúvida de física ou matemática você gostaria de descomplicar hoje?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Video player controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  // Security Watermark state
  const [watermarkPos, setWatermarkPos] = useState({ top: 30, left: 30 });

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Course Progress state (for list checkmarks)
  const [userProgress, setUserProgress] = useState<Progress[]>([]);

  // Load Course and Video Details
  useEffect(() => {
    const email = SupabaseMock.getCurrentUserEmail();
    if (!email) {
      router.push('/');
      return;
    }
    setUserEmail(email);

    const foundCourse = SupabaseMock.getCourses().find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      
      // Find the correct video
      let foundVideo: Video | null = null;
      for (const m of foundCourse.modules) {
        const vid = m.videos.find(v => v.id === videoId);
        if (vid) {
          foundVideo = vid;
          break;
        }
      }
      
      if (foundVideo) {
        setCurrentVideo(foundVideo);
        setNotes(SupabaseMock.getNotes(email, foundVideo.id));
      } else {
        // Fallback to first video if invalid
        const firstVid = foundCourse.modules[0]?.videos[0];
        if (firstVid) {
          router.push(`/player/${courseId}/${firstVid.id}`);
        }
      }

      // Load progress
      setUserProgress(SupabaseMock.getProgress(email));
    }
  }, [courseId, videoId, router]);

  // Periodic Auto-Save Progress & Watermark Random Moving (Anti-piracy simulator)
  useEffect(() => {
    if (!videoRef.current || !currentVideo || !userEmail) return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const curSeconds = videoRef.current.currentTime;
        const totalSec = videoRef.current.duration || currentVideo.duration;
        const isFinished = curSeconds / totalSec >= 0.9; // 90% watched = completed

        // Save to LocalStorage/Supabase
        SupabaseMock.updateProgress(userEmail, currentVideo.id, courseId, Math.floor(curSeconds), isFinished);
        
        // Refresh local progress list
        setUserProgress(SupabaseMock.getProgress(userEmail));

        // Randomize watermark coordinates
        setWatermarkPos({
          top: Math.floor(Math.random() * 80) + 10, // 10% - 90%
          left: Math.floor(Math.random() * 80) + 10
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentVideo, userEmail, courseId]);

  // Handle Confetti on Video Completion
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentVideo) return;
    
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || currentVideo.duration;
    setCurrentTime(curr);
    setDuration(dur);
    setProgressPercent((curr / dur) * 100);

    // Confetti trigger at 90% progress
    if (curr / dur >= 0.9 && !confettiTriggered) {
      setConfettiTriggered(true);
      
      // Fire confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c9a84c', '#ff7a00', '#ffffff', '#7928ca']
      });

      // Save complete progress immediately
      SupabaseMock.updateProgress(userEmail, currentVideo.id, courseId, Math.floor(dur), true);
      setUserProgress(SupabaseMock.getProgress(userEmail));
    }
  };

  // Reset confetti block when changing videos
  useEffect(() => {
    setConfettiTriggered(false);
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setPlaybackRate(1);
    }
  }, [videoId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log('Player error:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    videoRef.current.currentTime = clickPercent * duration;
  };

  const handleExportNotesPDF = () => {
    if (notes.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para exportar o caderno.');
      return;
    }
    
    const notesHtml = notes.map(n => `
      <div class="note-card">
        <div class="timestamp">Tempo: ${formatTime(n.timestamp)}</div>
        <div class="note-text">${n.text.replace(/\n/g, '<br/>')}</div>
        <div class="note-date">Criado em: ${new Date(n.createdAt).toLocaleDateString('pt-BR')}</div>
      </div>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Caderno de Estudos - ${currentVideo?.title || 'Aula'}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #c9a84c;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-title {
              font-size: 24px;
              font-weight: 800;
              color: #040814;
            }
            .brand-sub {
              font-size: 11px;
              color: #7a8b9e;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .meta-info {
              margin-bottom: 30px;
              font-size: 13px;
              color: #475569;
              background: #f8fafc;
              padding: 16px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .note-card {
              border-bottom: 1px solid #e2e8f0;
              padding: 16px 0;
              margin-bottom: 16px;
            }
            .timestamp {
              display: inline-block;
              background: #040814;
              color: #c9a84c;
              font-size: 11px;
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 4px;
              margin-bottom: 8px;
            }
            .note-text {
              font-size: 14px;
              color: #1e293b;
            }
            .note-date {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 6px;
              text-align: right;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-title">CLUBE FLIX</div>
              <div class="brand-sub">MÉTODO PROFESSOR CLÁUDIO BRUM</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Caderno de Estudos Digital
            </div>
          </div>
          
          <div class="meta-info">
            <strong>Curso:</strong> ${course?.title || ''}<br/>
            <strong>Aula:</strong> ${currentVideo?.title || ''}<br/>
            <strong>Aluno:</strong> ${userEmail}<br/>
            <strong>Total de Anotações:</strong> ${notes.length}
          </div>
          
          <div class="notes-container">
            ${notesHtml}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Notes actions
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentVideo) return;

    const noteTimestamp = Math.floor(currentTime);
    SupabaseMock.saveNote(userEmail, currentVideo.id, noteTimestamp, newNoteText);
    
    // Refresh notes list
    setNotes(SupabaseMock.getNotes(userEmail, currentVideo.id));
    setNewNoteText('');
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    
    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          courseTitle: course?.title || 'Exatas',
          videoTitle: currentVideo?.title || 'Aula'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: 'Desculpe, tive um probleminha para me conectar aos servidores de IA. Pode tentar perguntar novamente?' }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Erro de conexão. Verifique sua internet e tente novamente.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const isVideoCompleted = (vidId: string) => {
    return userProgress.some(p => p.videoId === vidId && p.completed);
  };

  if (!course || !currentVideo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Carregando player seguro...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020204' }}>
      {/* Mini top bar */}
      <header className="glass" style={{
        padding: '12px 3%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <button 
          onClick={() => router.push('/vitrine')} 
          style={{
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ChevronLeft size={16} /> Voltar à Vitrine
        </button>

        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-title)' }}>
          {course.title}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
          <Lock size={12} color="#22c55e" />
          <span> Bunny.net Criptografado</span>
        </div>
      </header>

      {/* Main player layout */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 0 }}>
        
        {/* Left - Video Frame & Control bar */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Simulated secure video player frame */}
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000',
            borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-glass)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            {/* The Video Element */}
            <video 
              ref={videoRef}
              src={currentVideo.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
            />

            {/* SECURITY WATERMARK - Panda / Bunny style anti-screen recording overlay */}
            <div style={{
              position: 'absolute',
              top: `${watermarkPos.top}%`,
              left: `${watermarkPos.left}%`,
              transform: 'translate(-50%, -50%)',
              color: 'rgba(255, 255, 255, 0.12)',
              fontSize: 13,
              fontWeight: 600,
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'all 2s ease-in-out',
              whiteSpace: 'nowrap',
              zIndex: 5
            }}>
              {userEmail} • CLUBE FLIX PROTECT
            </div>

            {/* Big Centered Play Overlay if paused */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 4
                }}
              >
                <div style={{
                  background: 'var(--accent-gradient)', width: 64, height: 64, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(201, 168, 76, 0.4)'
                }}>
                  <Play size={28} fill="white" style={{ marginLeft: 4 }} />
                </div>
              </div>
            )}
          </div>

          {/* Player controls */}
          <div className="glass" style={{ padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* progress bar track */}
            <div 
              onClick={handleProgressBarClick}
              style={{
                width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3,
                cursor: 'pointer', position: 'relative'
              }}
            >
              <div style={{
                width: `${progressPercent}%`, height: '100%', background: 'var(--accent)',
                borderRadius: 3, position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', right: -4, top: -2, width: 10, height: 10,
                  borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}></div>
              </div>
            </div>

            {/* Play/Pause & Speed and Timing */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button 
                  onClick={togglePlay} 
                  style={{ background: 'transparent', cursor: 'pointer', color: '#fff' }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} fill="white" />}
                </button>
                
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {formatTime(currentTime)} / {formatTime(duration || currentVideo.duration)}
                </span>
              </div>

              {/* Speed selectors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Velocidade:</span>
                {[1, 1.25, 1.5, 2].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => handleSpeedChange(sp)}
                    style={{
                      background: playbackRate === sp ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                      color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '4px 8px', borderRadius: 4,
                      cursor: 'pointer', transition: 'var(--transition-smooth)'
                    }}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title & Description of current video */}
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 8, fontFamily: 'var(--font-title)' }}>
              {currentVideo.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
              Assista à aula assíncrona gravada pelo Professor Cláudio Brum. Adicione notas marcadas no tempo correspondente para consolidar sua aprendizagem e revisitar posteriormente.
            </p>
          </div>
        </div>

        {/* Right - Tabs Panel for notes and modules */}
        <div style={{
          borderLeft: '1px solid var(--border-glass)', background: '#09090e',
          display: 'flex', flexDirection: 'column', height: 'calc(100vh - 58px)'
        }}>
          {/* Tab selectors */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setActiveTab('content')}
              style={{
                flex: 1, padding: '16px 0', background: 'transparent', cursor: 'pointer',
                color: activeTab === 'content' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 13, borderBottom: activeTab === 'content' ? '2px solid var(--accent)' : 'none'
              }}
            >
              Conteúdo
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              style={{
                flex: 1, padding: '16px 0', background: 'transparent', cursor: 'pointer',
                color: activeTab === 'notes' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 13, borderBottom: activeTab === 'notes' ? '2px solid var(--accent)' : 'none'
              }}
            >
              Anotações ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('chat_ia')}
              style={{
                flex: 1, padding: '16px 0', background: 'transparent', cursor: 'pointer',
                color: activeTab === 'chat_ia' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 13, borderBottom: activeTab === 'chat_ia' ? '2px solid var(--accent)' : 'none'
              }}
            >
              Tira-Dúvidas IA
            </button>
          </div>

          {/* Tab contents */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'content' && (
              /* Course modules listing */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {course.modules.map((m) => (
                  <div key={m.id}>
                    <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <BookOpen size={14} /> {m.title}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {m.videos.map((v) => {
                        const active = v.id === videoId;
                        const done = isVideoCompleted(v.id);
                        return (
                          <div
                            key={v.id}
                            onClick={() => router.push(`/player/${courseId}/${v.id}`)}
                            style={{
                              padding: 12, borderRadius: 8, cursor: 'pointer',
                              background: active ? 'rgba(201, 168, 76, 0.08)' : 'rgba(255,255,255,0.01)',
                              border: active ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              transition: 'var(--transition-smooth)'
                            }}
                            onMouseEnter={(e) => {
                              if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                            onMouseLeave={(e) => {
                              if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'var(--text-secondary)' }}>
                              {v.title}
                            </span>
                            {done ? (
                              <CheckCircle size={14} color="#22c55e" />
                            ) : (
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(v.duration)}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              /* Student Notes list & entry form */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Edit3 size={16} color="var(--accent)" /> Anotações Integradas
                    </h3>
                    {notes.length > 0 && (
                      <button 
                        onClick={handleExportNotesPDF}
                        className="btn-secondary" 
                        style={{ fontSize: 11, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <FileText size={12} color="var(--accent)" /> Exportar Caderno
                      </button>
                    )}
                  </div>

                  {notes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '40px 0' }}>
                      Nenhuma anotação nesta aula ainda. Digite abaixo para criar uma!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {notes.map((n) => (
                        <div 
                          key={n.id} 
                          className="glass"
                          onClick={() => seekTo(n.timestamp)}
                          style={{
                            padding: 12, borderRadius: 8, cursor: 'pointer',
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                            background: 'rgba(255,255,255,0.02)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                        >
                          <div style={{
                            background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 'bold',
                            padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2
                          }}>
                            <Clock size={8} /> {formatTime(n.timestamp)}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{n.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form at the bottom */}
                <form onSubmit={handleAddNote} style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 16, marginTop: 20 }}>
                  <textarea
                    required
                    placeholder="Digite sua anotação... (Ex: Revisar esta fórmula de dinâmica)"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="input-field"
                    style={{ minHeight: 80, resize: 'none', fontSize: 13, marginBottom: 12 }}
                  />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
                    Salvar no Tempo {formatTime(currentTime)}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'chat_ia' && (
              /* Tira-Dúvidas com IA Chat */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="var(--accent)" /> Cláudio Brum Digital
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {chatMessages.map((msg, index) => {
                      const isAi = msg.role === 'assistant';
                      return (
                        <div 
                          key={index}
                          style={{
                            alignSelf: isAi ? 'flex-start' : 'flex-end',
                            background: isAi ? 'rgba(255, 255, 255, 0.02)' : 'rgba(201, 168, 76, 0.1)',
                            border: isAi ? '1px solid var(--border-glass)' : '1px solid rgba(201, 168, 76, 0.2)',
                            borderRadius: 12,
                            padding: 12,
                            maxWidth: '90%',
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: '#fff'
                          }}
                        >
                          <span style={{ fontSize: 9, color: isAi ? 'var(--accent)' : 'var(--text-muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>
                            {isAi ? 'Professor Cláudio Brum' : 'Você'}
                          </span>
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                      );
                    })}
                    {chatLoading && (
                      <div style={{
                        alignSelf: 'flex-start',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 12,
                        padding: 12,
                        fontSize: 13,
                        color: 'var(--text-muted)'
                      }}>
                        Digitando...
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSendChatMessage} style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 16 }}>
                  <input
                    type="text"
                    required
                    placeholder="Pergunte sobre física, limites, RLM..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 13, marginBottom: 12, width: '100%' }}
                    disabled={chatLoading}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '10px 0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    disabled={chatLoading}
                  >
                    <Sparkles size={14} /> Enviar Pergunta
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
