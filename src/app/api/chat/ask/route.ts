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

    const apiKey = process.env.GEMINI_API_KEY;

    // Se a chave estiver configurada, usa o SDK da API real
    if (apiKey && apiKey.trim() !== '') {
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
    }

    // Fallback inteligente offline se a chave de API não estiver configurada no .env
    let answer = "";
    const qLower = message.toLowerCase();

    if (qLower.includes('primeira lei') || qLower.includes('1ª lei') || qLower.includes('inércia') || qLower.includes('inercia')) {
      answer = `A Primeira Lei de Newton, também conhecida como Lei da Inércia, diz que todo corpo tende a permanecer em seu estado de repouso ou de movimento retilíneo uniforme, a menos que uma força resultante externa atue sobre ele.

Fórmula conceitual: Fr = 0 (quando a força resultante é igual a zero, a aceleração é zero).

Por exemplo, quando um veículo freia bruscamente, os passageiros são projetados para frente porque seus corpos tendem a continuar o movimento que já estavam realizando. Ficou claro como a inércia atua no nosso dia a dia?`;
    } else if (qLower.includes('segunda lei') || qLower.includes('2ª lei') || qLower.includes('f = m') || qLower.includes('aceleração') || qLower.includes('aceleracao')) {
      answer = `A Segunda Lei de Newton, ou Princípio Fundamental da Dinâmica, estabelece que a força resultante aplicada a um corpo é igual ao produto de sua massa pela aceleração.

Expressão matemática: F = m * a (Força resultante = massa multiplicada pela aceleração).

Na prática, significa que se você empurrar um carrinho de compras vazio (massa menor) aplicará uma aceleração muito maior do que se empurrar o mesmo carrinho cheio (massa maior) aplicando a mesma força. Qual exercício dessa fórmula está te desafiando agora?`;
    } else if (qLower.includes('terceira lei') || qLower.includes('3ª lei') || qLower.includes('ação e reação') || qLower.includes('acao e reacao')) {
      answer = `A Terceira Lei de Newton, a famosa lei da Ação e Reação, afirma que para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto.
      
Expressão matemática: F_A = -F_B (a força que o corpo A exerce em B é igual em intensidade e direção, mas oposta em sentido à força que o corpo B exerce em A).

Um exemplo clássico é o caminhar: quando empurramos o chão para trás com nossos pés (ação), o chão nos empurra para frente com a mesma força (reação). Lembre-se de que essas forças nunca se anulam, pois atuam em corpos diferentes!`;
    } else if (qLower.includes('trapézio') || qLower.includes('trapezio')) {
      answer = `A fórmula da área de um trapézio é a soma da base maior com a base menor, multiplicada pela altura, tudo isso dividido por dois.

Fórmula da Área: A = (B + b) * h / 2

Pense nisso de forma intuitiva: se você tirar a média das duas bases e esticar essa média ao longo da altura, você forma um retângulo perfeito com a mesma área do trapézio! Ficou fácil de visualizar agora?`;
    } else if (qLower.includes('triângulo') || qLower.includes('triangulo') || qLower.includes('equilátero') || qLower.includes('equilatero') || qLower.includes('geometria') || qLower.includes('área') || qLower.includes('area')) {
      answer = `Um triângulo equilátero é uma figura geométrica plana que possui todos os três lados com medidas exatamente iguais. 
      
Como consequência direta dessa simetria, todos os seus três ângulos internos também são iguais e medem exatamente 60 graus.

Fórmula da Área: A = (l² * raiz_quadrada_de_3) / 4 (onde l é a medida do lado).
Fórmula do Perímetro: P = 3 * l.

É uma das formas mais estáveis e simétricas estudadas na geometria. Qual fórmula você gostaria de revisar agora?`;
    } else if (qLower.includes('seno') || qLower.includes('cosseno') || qLower.includes('tangente') || qLower.includes('trigonometria') || qLower.includes('ângulo') || qLower.includes('angulo')) {
      answer = `A trigonometria estuda as relações entre os lados e os ângulos de um triângulo retângulo. 
      
Fórmulas básicas:
- Seno(x) = Cateto Oposto / Hipotenusa
- Cosseno(x) = Cateto Adjacente / Hipotenusa
- Tangente(x) = Cateto Oposto / Cateto Adjacente

Essas relações são aplicadas no cálculo de alturas de edifícios e trajetórias físicas. Qual desses conceitos está te gerando dúvidas?`;
    } else if (qLower.includes('equação') || qLower.includes('equacao') || qLower.includes('fração') || qLower.includes('fracao') || qLower.includes('álgebra') || qLower.includes('algebra')) {
      answer = `A álgebra é a linguagem de encontrar números desconhecidos que chamamos de variáveis (como o clássico x). 
      
Trabalhar com equações é como equilibrar uma balança de pratos: o que você adiciona ou retira de um lado, deve fazer exatamente igual do outro lado para manter a igualdade. Qual equação ou fração está travando sua resolução?`;
    } else if (qLower.includes('limite') || qLower.includes('indeterminação') || qLower.includes('indeterminac')) {
      answer = `Um limite estuda o comportamento de uma função quando nos aproximamos de um ponto.

Representação matemática: lim(x -> a) f(x) = L (limite de f(x) quando x tende a 'a' é igual a L).

Quando encontramos uma indeterminação como zero sobre zero, ou infinito sobre infinito, significa apenas que a resposta está oculta. Para resolver isso, usamos simplificações algébricas, fatoração clássica ou a regra de L'Hôpital para reescrever a função e encontrar o valor real do limite. Tem algum exercício específico que queira resolver?`;
    } else if (qLower.includes('derivada') || qLower.includes('taxa de variação') || qLower.includes('taxa de variac')) {
      answer = `A derivada representa a taxa de variação instantânea de uma função. 

Representação matemática: f'(x) ou dy/dx (a derivada da função f em relação a x).

Por exemplo, a derivada da posição em relação ao tempo nos dá a velocidade instantânea de um objeto (v = ds / dt). Graficamente, a derivada em um ponto representa a inclinação da reta tangente à curva naquele local. Qual regra de derivação está te travando?`;
    } else if (qLower.includes('tabela verdade') || qLower.includes('lógica') || qLower.includes('logica') || qLower.includes('proposição')) {
      answer = `No Raciocínio Lógico Matemático, as proposições são sentenças que podem ser classificadas unicamente como verdadeiras ou falsas. 
      
Expressão da Condicional: P -> Q (Se P, então Q).

Ela só é classificada como Falsa no caso em que a primeira proposição é verdadeira e a segunda é falsa (a clássica regra da Vera Fischer). Em todas as outras combinações, ela é considerada Verdadeira. Qual operador lógico você gostaria de analisar?`;
    } else {
      answer = `Olá! Sou o Cláudio Brum Digital. Como físico e matemático, vejo as exatas como uma grande estrutura baseada em padrões lógicos e raciocínio estratégico. 

Se você praticar a resolução sistemática de questões, seu cérebro de forma natural automatiza o caminho para a solução. Me diga: qual fórmula ou conceito dessa aula de exatas você gostaria de destrinchar comigo hoje?`;
    }

    return NextResponse.json({
      reply: answer,
      text: answer,
      sender: 'Prof. Cláudio Brum (IA)',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro na API de Chat:', error.message);
    return NextResponse.json({ error: 'Falha ao processar a resposta do monitor virtual' }, { status: 500 });
  }
}
