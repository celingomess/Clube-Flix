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
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content');
  
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
        colors: ['#e50914', '#ff7a00', '#ffffff', '#7928ca']
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
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(229, 9, 20, 0.4)'
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
                fontWeight: 600, fontSize: 14, borderBottom: activeTab === 'content' ? '2px solid var(--accent)' : 'none'
              }}
            >
              Conteúdo
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              style={{
                flex: 1, padding: '16px 0', background: 'transparent', cursor: 'pointer',
                color: activeTab === 'notes' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 14, borderBottom: activeTab === 'notes' ? '2px solid var(--accent)' : 'none'
              }}
            >
              Anotações ({notes.length})
            </button>
          </div>

          {/* Tab contents */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {activeTab === 'content' ? (
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
                              background: active ? 'rgba(229, 9, 20, 0.08)' : 'rgba(255,255,255,0.01)',
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
            ) : (
              /* Student Notes list & entry form */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Edit3 size={16} color="var(--accent)" /> Anotações Integradas
                  </h3>

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
          </div>
        </div>
      </main>
    </div>
  );
}
