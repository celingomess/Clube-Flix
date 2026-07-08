import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clube Flix | Streaming Educacional do Professor Cláudio Brum',
  description: 'Acelere sua aprovação em física, matemática e raciocínio lógico. Aulas assíncronas, player de vídeo seguro contra gravação de tela, anotações de aula e painel exclusivo para acompanhamento dos pais.',
  keywords: 'EdTech, LMS, streaming educacional, física para vestibular, matemática concursos, Cláudio Brum, Panda Video, Bunny.net',
  authors: [{ name: 'Professor Cláudio Brum' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
