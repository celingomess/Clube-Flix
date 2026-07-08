import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, courseTitle, videoTitle } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    const systemPrompt = `Você é o "Cláudio Brum Digital", a versão em inteligência artificial do Professor Cláudio Brum, mentor de Física e Matemática do Clube Flix.
Você é graduado em Física e Matemática e especialista em Psicopedagogia.
Sua didática é focada em descomplicar o aprendizado, ensinando o aluno a enxergar padrões e resolver questões de forma objetiva, automática e estratégica.

Diretrizes de resposta:
1. Responda sempre em português.
2. Seja prestativo, didático e incentive o raciocínio lógico. 
3. Não use analogias com música ou instrumentos musicais. Em vez disso, prefira exemplos do cotidiano, aplicações industriais ou simulações mecânicas/geométricas simples.
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

Fórmula conceitual: Fr = 0 (quando a força resultante é igual a zero, a aceleração é zero).

Por exemplo, quando um veículo freia bruscamente, os passageiros são projetados para frente porque seus corpos tendem a continuar o movimento que já estavam realizando. Ficou claro como a inércia atua no nosso dia a dia?`;
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
    } else if (qLower.includes('segunda lei') || qLower.includes('2ª lei') || qLower.includes('f = m') || qLower.includes('aceleração') || qLower.includes('aceleracao')) {
      answer = `A Segunda Lei de Newton, ou Princípio Fundamental da Dinâmica, estabelece que a força resultante aplicada a um corpo é igual ao produto de sua massa pela aceleração.

Expressão matemática: F = m * a (Força resultante = massa multiplicada pela aceleração).

Na prática, significa que se você empurrar um carrinho de compras vazio (massa menor) aplicará uma aceleração muito maior do que se empurrar o mesmo carrinho cheio (massa maior) aplicando a mesma força. Qual exercício dessa fórmula está te desafiando agora?`;
    } else if (qLower.includes('terceira lei') || qLower.includes('3ª lei') || qLower.includes('ação e reação') || qLower.includes('acao e reacao')) {
      answer = `A Terceira Lei de Newton, a famosa lei da Ação e Reação, afirma que para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto.
      
Expressão matemática: F_A = -F_B (a força que o corpo A exerce em B é igual em intensidade e direção, mas oposta em sentido à força que o corpo B exerce em A).

Um exemplo clássico é o caminhar: quando empurramos o chão para trás com nossos pés (ação), o chão nos empurra para frente com a mesma força (reação). Lembre-se de que essas forças nunca se anulam, pois atuam em corpos diferentes!`;
    } else if (qLower.includes('lei') && qLower.includes('newton')) {
      answer = `As Leis de Newton regem a mecânica clássica. 

1. 1ª Lei (Inércia): Um corpo mantém seu estado até que uma força externa o perturbe (Fr = 0).
2. 2ª Lei (Dinâmica): A força resultante é massa vezes aceleração (F = m * a).
3. 3ª Lei (Ação e Reação): Toda força gera uma força oposta de igual intensidade (F_A = -F_B).

Qual dessas três leis você gostaria que eu detalhasse com você?`;
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

    return NextResponse.json({ text: answer });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
