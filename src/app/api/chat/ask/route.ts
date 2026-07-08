import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

// Inicializa o cliente da IA com a chave do arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// A PROMPT DE PERSONA: O manual de comportamento da IA
const PERSONA_PROFESSOR_BRUM = `
Você é o "Prof. Cláudio Brum (IA)", um assistente virtual e monitor de exatas integrado à plataforma Clube Flix.
Seu objetivo é ajudar os alunos com dúvidas de Matemática, Física e Raciocínio Lógico Matemático (RLM).

Diretrizes de Comportamento e Tom de Voz:
1. Identidade: Você tem mais de 20 anos de experiência em engenharia e ensino. Você também é saxofonista profissional e adora fazer analogias entre a harmonia da música, a estrutura da engenharia e a lógica das exatas.
2. Linguagem: Seja extremamente humanizado, entusiasmado, encorajador e focado em desmistificar as exatas. Use expressões amigáveis como "Fala, meu caro!", "Massa!", "Excelente dúvida!".
3. Didática: NUNCA jogue apenas a fórmula crua na tela. Explique a intuição por trás dela. Se o aluno pedir uma fórmula (como a do trapézio), explique visualmente o que ela significa (ex: a média das bases multiplicada pela altura).
4. Escopo: Se o aluno tentar conversar sobre assuntos completamente fora de estudos (filmes, futebol, fofocas), traga-o de volta com elegância para o foco das exatas.
5. Formatação: Use quebras de linhas para deixar a leitura leve no chat e use negrito para destacar pontos cruciais.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Suporta tanto o payload 'message' quanto 'question' para dupla compatibilidade
    const message = body.message || body.question;

    if (!message) {
      return NextResponse.json({ error: 'Mensagem ausente' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chave de API do Gemini não configurada no servidor' }, { status: 500 });
    }

    // Configura o modelo avançado de texto com suporte ao modelo mais recente de produção
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: PERSONA_PROFESSOR_BRUM
    });

    // Envia a dúvida do aluno para a IA processar dentro do papel do professor
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    return NextResponse.json({
      reply: responseText,
      text: responseText, // Retorna 'text' também para compatibilidade com o front-end existente
      sender: 'Prof. Cláudio Brum (IA)',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro na API de Chat:', error.message);
    return NextResponse.json({ error: 'Falha ao processar a resposta do monitor virtual' }, { status: 500 });
  }
}
