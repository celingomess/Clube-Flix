import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, courseTitle, videoTitle } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    const systemPrompt = `Você é o "Cláudio Brum Digital", a versão em inteligência artificial do Professor Cláudio Brum, mentor de Física e Matemática do Clube Flix.
Você é graduado em Física e Matemática, especialista em Psicopedagogia e ex-saxofonista. 
Sua didática é focada em descomplicar o aprendizado, ensinando o aluno a enxergar padrões (como na música) para resolver questões de forma automática e estratégica.

Diretrizes de resposta:
1. Responda sempre em português.
2. Seja prestativo, didático e incentive o raciocínio lógico. 
3. Sempre que puder, faça analogias com música ou padrões rítmicos/disciplina para fixar conceitos matemáticos/físicos.
4. Não entregue a resposta final de uma questão de bandeja se puder guiar o aluno passo a passo para que ELE resolva.
5. Seja empático (psicopedagogia) e retire a ansiedade das exatas.

Contexto da aula atual:
- Curso: ${courseTitle || 'Exatas de Elite'}
- Aula/Vídeo atual: ${videoTitle || 'Geral'}

Pergunta do Aluno: "${question}"`;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] }
          ]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ text });
        }
      }
    }

    // Fallback: Mock AI responder based on keyword matching to maintain full functionality off-grid
    let answer = `Olá! Sou o Cláudio Brum Digital. Como físico, matemático e saxofonista, vejo a física como uma grande partitura. `;
    const qLower = question.toLowerCase();

    if (qLower.includes('força') || qLower.includes('newton') || qLower.includes('bloco') || qLower.includes('dinâmica')) {
      answer += `Para entender as Leis de Newton, pense no ritmo: a inércia é o silêncio que quer continuar em silêncio. A força ($F = m \\cdot a$) é o golpe de ar no saxofone que gera a nota (aceleração). Se temos atrito, é uma resistência no caminho do som. Qual parte da decomposição de forças na rampa está te travando?`;
    } else if (qLower.includes('limite') || qLower.includes('derivada') || qLower.includes('calculo') || qLower.includes('taxa')) {
      answer += `O cálculo estuda a variação contínua. Pense na música como uma onda sonora contínua (derivada) e as notas individuais como limites discretos. Uma indeterminação do tipo $0/0$ é como um acorde dissonante: precisamos simplificar a partitura (fatorar ou usar L'Hôpital) para encontrar a harmonia. Qual limite você está tentando resolver agora?`;
    } else if (qLower.includes('lógica') || qLower.includes('tabela') || qLower.includes('proposição') || qLower.includes('se')) {
      answer += `O raciocínio lógico é a matemática pura dos silêncios e sons. Uma condicional $P \\rightarrow Q$ (Se... então) só é falsa se tivermos som ($P$ verdadeiro) e silêncio ($Q$ falso) logo em seguida (a clássica 'Vera Fischer'). É um padrão fixo. Qual operador lógico está te confundindo?`;
    } else {
      answer += `A física e a matemática são linguagens baseadas em padrões, assim como a música. Se você praticar a repetição estratégica, seu cérebro automatiza as soluções. Me diga: qual fórmula ou conceito dessa aula de "${videoTitle || 'Exatas'}" você gostaria de destrinchar comigo hoje?`;
    }

    return NextResponse.json({ text: answer });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
