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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
    let answer = "";
    const qLower = question.toLowerCase();

    if (qLower.includes('primeira lei') || qLower.includes('1ª lei') || qLower.includes('inércia') || qLower.includes('inercia')) {
      answer = `A **Primeira Lei de Newton (Lei da Inércia)** diz que todo corpo tende a permanecer em seu estado de repouso ou de movimento retilíneo uniforme, a menos que uma força resultante externa atue sobre ele.

Na minha analogia favorita: pense na inércia como a **pausa na música**. A pausa (silêncio) quer continuar sendo silêncio, e uma nota longa sustentada quer continuar soando no mesmo tom, até que você mude o sopro (aplique uma força). Ficou claro como o silêncio e o movimento uniforme se parecem?`;
    } else if (qLower.includes('segunda lei') || qLower.includes('2ª lei') || qLower.includes('f = m') || qLower.includes('aceleração') || qLower.includes('aceleracao')) {
      answer = `A **Segunda Lei de Newton (Princípio Fundamental da Dinâmica)** estabelece que a força resultante aplicada a um corpo é igual ao produto de sua massa pela aceleração: 
      
> **F = m * a**

Na música, pense no **sopro do saxofone**: quanto mais força (F) você coloca no ar, mais rápida é a variação da coluna de ar, gerando uma aceleração sonora (a). A massa (m) seria a resistência mecânica da palheta do sax. Qual exercício dessa fórmula está te desafiando agora?`;
    } else if (qLower.includes('terceira lei') || qLower.includes('3ª lei') || qLower.includes('ação e reação') || qLower.includes('acao e reacao')) {
      answer = `A **Terceira Lei de Newton (Ação e Reação)** afirma que para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto.
      
Pense nisso como um **dueto musical**: quando você pressiona a chave do instrumento (ação), a mola exerce exatamente a mesma força contra o seu dedo (reação). Lembre-se: essas forças NUNCA se anulam, pois atuam em corpos diferentes!`;
    } else if (qLower.includes('lei') && qLower.includes('newton')) {
      answer = `As **Leis de Newton** regem a mecânica clássica:
1. **1ª Lei (Inércia)**: Um corpo mantém seu estado até que uma força o perturbe.
2. **2ª Lei (Dinâmica)**: A força resultante é massa vezes aceleração (F = m * a).
3. **3ª Lei (Ação e Reação)**: Toda força gera uma força oposta de igual intensidade.

Qual dessas três leis você gostaria que eu destrinchasse em detalhes com você?`;
    } else if (qLower.includes('limite') || qLower.includes('indeterminação') || qLower.includes('indeterminac')) {
      answer = `Um **limite** estuda o comportamento de uma função quando nos aproximamos de um ponto. Quando encontramos uma indeterminação como 0/0 ou infinito/infinito, significa apenas que a resposta está oculta.
      
Na música, é como um acorde dissonante: precisamos 'fatorar' ou simplificar a partitura (usando fatoração clássica ou a Regra de L'Hôpital) para encontrar a harmonia oculta. Tem algum limite específico de limite que queira resolver?`;
    } else if (qLower.includes('derivada') || qLower.includes('taxa de variação') || qLower.includes('taxa de variac')) {
      answer = `A **derivada** representa a taxa de variação instantânea de uma função. 
      
Pense na música: a melodia é uma curva contínua. A derivada em um ponto é a inclinação dessa curva (o ritmo de mudança da nota). Se a nota sobe rápido, a derivada é positiva e alta. Se a nota se mantém constante, a derivada é zero (silêncio de variação). Qual regra de derivação está te travando?`;
    } else if (qLower.includes('tabela verdade') || qLower.includes('lógica') || qLower.includes('logica') || qLower.includes('proposição')) {
      answer = `No **Raciocínio Lógico (RLM)**, as proposições são notas puras: ou são verdadeiras (V) ou falsas (F). 
      
A condicional **P -> Q** (Se P, então Q) é a mais cobrada. Lembre-se do padrão: ela só é Falsa no caso 'Vera Fischer' (V antecedente e F consequente). Todos os outros casos são Verdadeiros. Qual operador lógico você gostaria de analisar?`;
    } else {
      answer = `Olá! Sou o Cláudio Brum Digital. Como físico, matemático e saxofonista, vejo as exatas como uma grande partitura baseada em padrões. 

Se você praticar a repetição estratégica, seu cérebro automatiza as soluções. Me diga: qual fórmula ou conceito dessa aula de "${videoTitle || 'Exatas'}" você gostaria de destrinchar comigo hoje?`;
    }

    return NextResponse.json({ text: answer });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
