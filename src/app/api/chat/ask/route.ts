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
3. Sempre que puder, faça analogias com música ou padrões rítmicos para fixar conceitos.
4. Não entregue a resposta final de uma questão de bandeja se puder guiar o aluno passo a passo para que ele resolva por conta própria.
5. Seja empático e retire a ansiedade das exatas.
6. Evite formatações excessivas de markdown, como o uso recorrente de asteriscos para negrito em frases inteiras, excesso de barras ou caracteres matemáticos complexos. Escreva de forma limpa, natural e fácil de ler.

Contexto da aula atual:
- Curso: ${courseTitle || 'Exatas de Elite'}
- Aula ou vídeo atual: ${videoTitle || 'Geral'}

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
      answer = `A Primeira Lei de Newton, também conhecida como Lei da Inércia, diz que todo corpo tende a permanecer em seu estado de repouso ou de movimento retilíneo uniforme, a menos que uma força resultante externa atue sobre ele.

Na minha analogia favorita, pense na inércia como a pausa na música. A pausa, ou seja, o silêncio, quer continuar sendo silêncio, e uma nota longa sustentada quer continuar soando no mesmo tom, até que você mude o sopro e aplique uma força. Ficou claro como o silêncio e o movimento uniforme se parecem?`;
    } else if (qLower.includes('triângulo') || qLower.includes('triangulo') || qLower.includes('equilátero') || qLower.includes('equilatero') || qLower.includes('geometria') || qLower.includes('área') || qLower.includes('area')) {
      answer = `Um triângulo equilátero é uma figura geométrica plana que possui todos os três lados com medidas exatamente iguais. 
      
Como consequência direta dessa simetria, todos os seus três ângulos internos também são iguais e medem exatamente 60 graus. 

Na música, pense no triângulo equilátero como um acorde maior perfeito: todos os intervalos de notas estão em perfeita consonância e equilíbrio. Qual fórmula de área ou perímetro de figuras planas você gostaria de revisar agora?`;
    } else if (qLower.includes('seno') || qLower.includes('cosseno') || qLower.includes('tangente') || qLower.includes('trigonometria') || qLower.includes('ângulo') || qLower.includes('angulo')) {
      answer = `A trigonometria estuda as relações entre os lados e os ângulos de um triângulo retângulo. 
      
O seno é a razão entre o cateto oposto e a hipotenusa; o cosseno é a razão entre o cateto adjacente e a hipotenusa; e a tangente é a divisão do cateto oposto pelo adjacente. 

Pensando como músico: os valores trigonométricos oscilam perfeitamente entre 1 e -1, desenhando ondas senoidais puras que são a exata assinatura física de uma nota de saxofone pura no ar. Qual desses conceitos está te gerando dúvidas?`;
    } else if (qLower.includes('equação') || qLower.includes('equacao') || qLower.includes('fração') || qLower.includes('fracao') || qLower.includes('álgebra') || qLower.includes('algebra')) {
      answer = `A álgebra é a linguagem de encontrar números desconhecidos que chamamos de variáveis (como o clássico x). 
      
Trabalhar com equações é como afinar um saxofone: o que você faz de um lado para alterar o tom, deve fazer exatamente igual do outro lado para manter o equilíbrio e a afinação. Qual equação ou fração está travando sua resolução?`;
    } else if (qLower.includes('segunda lei') || qLower.includes('2ª lei') || qLower.includes('f = m') || qLower.includes('aceleração') || qLower.includes('aceleracao')) {
      answer = `A Segunda Lei de Newton, ou Princípio Fundamental da Dinâmica, estabelece que a força resultante aplicada a um corpo é igual ao produto de sua massa pela aceleração, expressa pela fórmula simples: Força é igual a massa multiplicada por aceleração.

Na música, pense no sopro do saxofone: quanto mais força você coloca no ar, mais rápida é a variação da coluna de ar, gerando uma aceleração sonora. A massa seria a resistência mecânica da palheta do sax. Qual exercício dessa fórmula está te desafiando agora?`;
    } else if (qLower.includes('terceira lei') || qLower.includes('3ª lei') || qLower.includes('ação e reação') || qLower.includes('acao e reacao')) {
      answer = `A Terceira Lei de Newton, a famosa lei da Ação e Reação, afirma que para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto.
      
Pense nisso como um dueto musical: quando você pressiona a chave do instrumento, a mola exerce exatamente a mesma força contra o seu dedo. Lembre-se de que essas forças nunca se anulam, pois atuam em corpos diferentes!`;
    } else if (qLower.includes('lei') && qLower.includes('newton')) {
      answer = `As Leis de Newton regem a mecânica clássica. 

A primeira lei trata da inércia, onde um corpo mantém seu estado até que uma força externa o perturbe. A segunda lei aborda a dinâmica, mostrando que a força resultante é massa vezes aceleração. E a terceira lei apresenta a ação e reação, onde toda força gera uma força oposta de igual intensidade.

Qual dessas três leis você gostaria que eu detalhasse com você?`;
    } else if (qLower.includes('limite') || qLower.includes('indeterminação') || qLower.includes('indeterminac')) {
      answer = `Um limite estuda o comportamento de uma função quando nos aproximamos de um ponto. Quando encontramos uma indeterminação como zero sobre zero, ou infinito sobre infinito, significa apenas que a resposta está oculta.
      
Na música, é como um acorde dissonante: precisamos simplificar a partitura, usando fatoração clássica ou a regra de L'Hôpital, para encontrar a harmonia oculta. Tem algum exercício específico de limite que queira resolver?`;
    } else if (qLower.includes('derivada') || qLower.includes('taxa de variação') || qLower.includes('taxa de variac')) {
      answer = `A derivada representa a taxa de variação instantânea de uma função. 
      
Pense na música: a melodia é uma curva contínua. A derivada em um ponto é a inclinação dessa curva, representando o ritmo de mudança da nota. Se a nota sobe rápido, a derivada é positiva e alta. Se a nota se mantém constante, a derivada é zero, indicando silêncio de variação. Qual regra de derivação está te travando?`;
    } else if (qLower.includes('tabela verdade') || qLower.includes('lógica') || qLower.includes('logica') || qLower.includes('proposição')) {
      answer = `No Raciocínio Lógico Matemático, as proposições são notas puras: ou são verdadeiras ou falsas. 
      
A condicional se P, então Q é a mais cobrada. Lembre-se do padrão: ela só é Falsa no caso em que a primeira parte é verdadeira e a segunda é falsa, a clássica regra da Vera Fischer. Todos os outros casos são verdadeiros. Qual operador lógico você gostaria de analisar?`;
    } else {
      answer = `Olá! Sou o Cláudio Brum Digital. Como físico, matemático e saxofonista, vejo as exatas como uma grande partitura baseada em padrões. 

Se você praticar a repetição estratégica, seu cérebro automatiza as soluções. Me diga: qual fórmula ou conceito dessa aula de exatas você gostaria de destrinchar comigo hoje?`;
    }

    return NextResponse.json({ text: answer });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
