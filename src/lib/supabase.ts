// Types & Schemas
export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'parent';
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  duration: number; // in seconds
  videoUrl: string; // Bunny.net / Panda Video simulation link
}

export interface Module {
  id: string;
  title: string;
  videos: Video[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Physics' | 'Math' | 'Logic';
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  coverUrl: string;
  modules: Module[];
}

export interface Progress {
  videoId: string;
  courseId: string;
  watchedSeconds: number;
  completed: boolean;
  updatedAt: string;
}

export interface Enrollment {
  userEmail: string;
  status: 'active' | 'canceled';
  createdAt: string;
}

export interface Note {
  id: string;
  userEmail: string;
  videoId: string;
  timestamp: number; // seconds into the video
  text: string;
  createdAt: string;
}

export interface DiagnosticResult {
  id: string;
  email: string;
  name: string;
  answers: Record<number, string>;
  score: number; // number of correct answers
  recommendedCourseId: string;
  createdAt: string;
}

// Initial Mock Data (Professor Cláudio Brum's Curriculum)
export const initialCourses: Course[] = [
  {
    id: 'mecanica-geral',
    title: 'Física I: Mecânica Geral para Vestibulares e Concursos',
    description: 'Domine as Leis de Newton, Cinemática Vetorial, Dinâmica de Corpos e Conservação de Energia com resoluções práticas detalhadas.',
    category: 'Physics',
    difficulty: 'Intermediate',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    modules: [
      {
        id: 'cinematica',
        title: 'Módulo 1: Cinemática Vetorial e Movimento Circular',
        videos: [
          { id: 'm1-v1', title: '1.1 Grandezas Vetoriais e Decomposição de Forças', duration: 720, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'm1-v2', title: '1.2 Movimento Uniformemente Variado (MUV) Graficamente', duration: 900, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'm1-v3', title: '1.3 Dinâmica do Movimento Circular Uniforme', duration: 1100, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
        ]
      },
      {
        id: 'leis-newton',
        title: 'Módulo 2: Forças de Atrito e Leis de Newton Aplicadas',
        videos: [
          { id: 'm2-v1', title: '2.1 Análise de Sistemas de Blocos com Atrito Estático/Cinético', duration: 840, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'm2-v2', title: '2.2 Força Elástica e Trabalho de Força Não Conservativa', duration: 960, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'raciocinio-logico',
    title: 'Raciocínio Lógico Matemático Extremo (RLM)',
    description: 'O curso definitivo para gabaritar a prova de RLM em qualquer concurso público de alto nível. Equivalências, tabelas-verdade e diagramas lógicos.',
    category: 'Logic',
    difficulty: 'Basic',
    coverUrl: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&q=80&w=800',
    modules: [
      {
        id: 'proposicoes',
        title: 'Módulo 1: Proposições Lógicas e Operadores',
        videos: [
          { id: 'rl-m1-v1', title: '1.1 O que é Proposição e Negação de Conectivos', duration: 600, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'rl-m1-v2', title: '1.2 A verdade por trás da Condicional (Se... então)', duration: 750, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
        ]
      },
      {
        id: 'tabela-verdade',
        title: 'Módulo 2: Construindo Tabelas Verdade e Tautologias',
        videos: [
          { id: 'rl-m2-v1', title: '2.1 Análise de Argumentos e Falácias Clássicas', duration: 880, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'rl-m2-v2', title: '2.2 Resolução de Questões da banca CESPE/Cebraspe', duration: 1050, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'calculo-limites',
    title: 'Cálculo Diferencial e Integral: Limites e Derivadas',
    description: 'Ideal para alunos de engenharia, física e matemática. Uma abordagem intuitiva e rigorosa sobre taxas de variação, otimização e integrais.',
    category: 'Math',
    difficulty: 'Advanced',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
    modules: [
      {
        id: 'limites',
        title: 'Módulo 1: Noção de Limites e Indeterminações',
        videos: [
          { id: 'c-m1-v1', title: '1.1 Introdução Geométrica aos Limites e Continuidade', duration: 900, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'c-m1-v2', title: '1.2 Como Resolver Indeterminações Tipo 0/0 e Infinito/Infinito', duration: 1200, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
        ]
      },
      {
        id: 'derivadas',
        title: 'Módulo 2: Regra da Cadeia e Problemas de Otimização',
        videos: [
          { id: 'c-m2-v1', title: '2.1 Derivada como Reta Tangente e Regras de Derivação', duration: 980, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
          { id: 'c-m2-v2', title: '2.2 Otimização: Minimizando Custos e Maximizando Áreas', duration: 1300, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
        ]
      }
    ]
  }
];

// Helper methods storing in localStorage
const IS_SERVER = typeof window === 'undefined';

export const SupabaseMock = {
  // Authentication / User Profiles
  getCurrentUserEmail: (): string | null => {
    if (IS_SERVER) return null;
    return localStorage.getItem('clube_flix_user_email');
  },

  getCurrentUserRole: (): 'student' | 'teacher' | 'parent' | null => {
    if (IS_SERVER) return null;
    return localStorage.getItem('clube_flix_user_role') as any;
  },

  getCurrentUserName: (): string | null => {
    if (IS_SERVER) return null;
    return localStorage.getItem('clube_flix_user_name') || 'Visitante';
  },

  login: (email: string, fullName: string, role: 'student' | 'teacher' | 'parent') => {
    if (IS_SERVER) return;
    localStorage.setItem('clube_flix_user_email', email.toLowerCase().trim());
    localStorage.setItem('clube_flix_user_role', role);
    localStorage.setItem('clube_flix_user_name', fullName);
    
    // Auto active subscription for teacher & parent (bypass payment)
    if (role === 'teacher' || role === 'parent') {
      SupabaseMock.enrollUser(email, 'active');
    }
  },

  logout: () => {
    if (IS_SERVER) return;
    localStorage.removeItem('clube_flix_user_email');
    localStorage.removeItem('clube_flix_user_role');
    localStorage.removeItem('clube_flix_user_name');
  },

  // Enrollments (SaaS active users checking)
  isEnrolled: (email: string): boolean => {
    if (IS_SERVER) return false;
    const enrollments = JSON.parse(localStorage.getItem('clube_flix_enrollments') || '[]');
    const match = enrollments.find((e: any) => e.userEmail.toLowerCase() === email.toLowerCase());
    return match ? match.status === 'active' : false;
  },

  enrollUser: (email: string, status: 'active' | 'canceled' = 'active') => {
    if (IS_SERVER) return;
    const enrollments = JSON.parse(localStorage.getItem('clube_flix_enrollments') || '[]');
    const cleanEmail = email.toLowerCase().trim();
    const existingIdx = enrollments.findIndex((e: any) => e.userEmail === cleanEmail);

    if (existingIdx > -1) {
      enrollments[existingIdx].status = status;
    } else {
      enrollments.push({ userEmail: cleanEmail, status, createdAt: new Date().toISOString() });
    }
    localStorage.setItem('clube_flix_enrollments', JSON.stringify(enrollments));
  },

  // Courses & Content
  getCourses: (): Course[] => {
    if (IS_SERVER) return initialCourses;
    const local = localStorage.getItem('clube_flix_courses');
    if (!local) {
      localStorage.setItem('clube_flix_courses', JSON.stringify(initialCourses));
      return initialCourses;
    }
    return JSON.parse(local);
  },

  saveCourses: (courses: Course[]) => {
    if (IS_SERVER) return;
    localStorage.setItem('clube_flix_courses', JSON.stringify(courses));
  },

  // Progress Persisting
  getProgress: (email: string): Progress[] => {
    if (IS_SERVER) return [];
    const cleanEmail = email.toLowerCase().trim();
    const allProgress = JSON.parse(localStorage.getItem('clube_flix_progress') || '{}');
    return allProgress[cleanEmail] || [];
  },

  updateProgress: (email: string, videoId: string, courseId: string, watchedSeconds: number, completed: boolean) => {
    if (IS_SERVER) return;
    const cleanEmail = email.toLowerCase().trim();
    const allProgress = JSON.parse(localStorage.getItem('clube_flix_progress') || '{}');
    const userProgress: Progress[] = allProgress[cleanEmail] || [];
    
    const existingIdx = userProgress.findIndex((p) => p.videoId === videoId);
    if (existingIdx > -1) {
      userProgress[existingIdx].watchedSeconds = Math.max(userProgress[existingIdx].watchedSeconds, watchedSeconds);
      userProgress[existingIdx].completed = userProgress[existingIdx].completed || completed;
      userProgress[existingIdx].updatedAt = new Date().toISOString();
    } else {
      userProgress.push({
        videoId,
        courseId,
        watchedSeconds,
        completed,
        updatedAt: new Date().toISOString()
      });
    }
    allProgress[cleanEmail] = userProgress;
    localStorage.setItem('clube_flix_progress', JSON.stringify(allProgress));
  },

  // Notes
  getNotes: (email: string, videoId: string): Note[] => {
    if (IS_SERVER) return [];
    const cleanEmail = email.toLowerCase().trim();
    const allNotes: Note[] = JSON.parse(localStorage.getItem('clube_flix_notes') || '[]');
    return allNotes.filter(n => n.userEmail === cleanEmail && n.videoId === videoId);
  },

  saveNote: (email: string, videoId: string, timestamp: number, text: string) => {
    if (IS_SERVER) return;
    const cleanEmail = email.toLowerCase().trim();
    const allNotes: Note[] = JSON.parse(localStorage.getItem('clube_flix_notes') || '[]');
    
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      userEmail: cleanEmail,
      videoId,
      timestamp,
      text,
      createdAt: new Date().toISOString()
    };
    allNotes.push(newNote);
    localStorage.setItem('clube_flix_notes', JSON.stringify(allNotes));
  },

  // Diagnostic Test Leads
  saveDiagnostic: (name: string, email: string, answers: Record<number, string>, score: number, recommendedCourseId: string) => {
    if (IS_SERVER) return;
    const leads: DiagnosticResult[] = JSON.parse(localStorage.getItem('clube_flix_diagnostics') || '[]');
    const newLead: DiagnosticResult = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase().trim(),
      answers,
      score,
      recommendedCourseId,
      createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    localStorage.setItem('clube_flix_diagnostics', JSON.stringify(leads));
  },

  getDiagnostics: (): DiagnosticResult[] => {
    if (IS_SERVER) return [];
    return JSON.parse(localStorage.getItem('clube_flix_diagnostics') || '[]');
  },

  // Parent Student Link
  linkParentStudent: (parentEmail: string, studentEmail: string) => {
    if (IS_SERVER) return;
    const links = JSON.parse(localStorage.getItem('clube_flix_parent_student') || '[]');
    links.push({ parentEmail: parentEmail.toLowerCase().trim(), studentEmail: studentEmail.toLowerCase().trim() });
    localStorage.setItem('clube_flix_parent_student', JSON.stringify(links));
  },

  getParentStudents: (parentEmail: string): string[] => {
    if (IS_SERVER) return [];
    const links = JSON.parse(localStorage.getItem('clube_flix_parent_student') || '[]');
    return links
      .filter((l: any) => l.parentEmail === parentEmail.toLowerCase().trim())
      .map((l: any) => l.studentEmail);
  },

  // Analytics for dashboards
  getTeacherStats: () => {
    if (IS_SERVER) return { totalUsers: 0, activeSubscriptions: 0, totalDiagnosticLeads: 0, completionsRate: 0 };
    const enrollments = JSON.parse(localStorage.getItem('clube_flix_enrollments') || '[]');
    const active = enrollments.filter((e: any) => e.status === 'active').length;
    const leads = JSON.parse(localStorage.getItem('clube_flix_diagnostics') || '[]');
    const allProgress = JSON.parse(localStorage.getItem('clube_flix_progress') || '{}');
    
    let totalVideosWatched = 0;
    let completedVideosCount = 0;
    Object.values(allProgress).forEach((userProg: any) => {
      userProg.forEach((prog: any) => {
        totalVideosWatched++;
        if (prog.completed) completedVideosCount++;
      });
    });

    const completionRate = totalVideosWatched > 0 ? Math.round((completedVideosCount / totalVideosWatched) * 100) : 0;

    return {
      totalUsers: enrollments.length + leads.length,
      activeSubscriptions: active,
      totalDiagnosticLeads: leads.length,
      completionsRate: completionRate
    };
  }
};
