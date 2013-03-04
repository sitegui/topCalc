"use strict";

// Funções diversas

// Retorna o valor de uma variável
Funcao.registrar("get", "get(x) ou get(f())\nRetorna o valor de uma variável ou a definição de uma função", function (variavel) {
	var valor
	this.args[0] = variavel = unbox(variavel)
	if (variavel instanceof Variavel) {
		valor = this.getVariavelDireto(variavel)
		if (valor !== null) {
			Console.echoInfo(valor)
			return new Expressao
		}
	} else if (variavel instanceof Funcao) {
		valor = variavel.getDefinicao()
		if (valor !== null) {
			Console.echoInfo("Módulo "+Funcao.funcoes[variavel.nome].modulo+"\n"+valor)
			return new Expressao
		}
	} else if (eDeterminado(variavel))
		throw 0
}, false, true)

Funcao.registrar("if", "if(oq, casoSim, casoNao)\nRetorna um valor ou outro dependendo da condição", function (oq, sim, nao) {
	var r
	this.args[0] = oq = this.executarNoEscopo(oq)
	if (!ePuro(sim))
		this.args[1] = sim = this.executarNoEscopo(sim)
	if (!ePuro(nao))
		this.args[2] = nao = this.executarNoEscopo(nao)
	if (eNumerico(oq)) {
		r = eZero(oq) ? nao : sim
		if (ePuro(r))
			return this.executarNoEscopo(r)
		return r
	} else if (eDeterminado(oq))
		throw 0
}, false, true)

// Remove a definição de uma variável ou função
Funcao.registrar("unset", "unset(x) ou unset(f())\nExclui uma variável ou função", function (variavel) {
	this.args[0] = variavel = unbox(variavel)
	if (variavel instanceof Variavel) {
		delete Variavel.valores[variavel.nome]
		return new Expressao
	} else if (variavel instanceof Funcao) {
		delete Funcao.funcoes[variavel.nome]
		return new Expressao
	} else if (eDeterminado(variavel))
		throw 0
}, false, true)

// Exibe a ajuda
var ajudaInfo = {
"": "Essa é uma calculadora feita para ser rápida de se usar e bem ampla\n"+
	"Basta digitar a expressão que deseja executar, como (1/8)^(-1/3)\n"+
	"Essa calculadora não é simbólica, ou seja, não executa simplificações sobre símbolos (como x+x = 2x)\n"+
	"Acesse o código fonte: https://github.com/sitegui/topCalc/\n\n"+
	"Para obter mais ajuda sobre um dos temas abaixo, use help(tema)\n"+
	"- numeros\n- operadores\n- variaveis\n- funcoes\n- listas\n- vetores\n- matrizes\n- graficos",
"numeros": "Os valores numéricos são representados de 4 formas:\n"+
	"- Fracao: um valor racional exato, com numerador e denominador inteiros\n"+
	"- Number: um valor real aproximado, armazenado como double\n"+
	"- BigNum: um valor real muito aproximado e capaz de representar números muito grandes\n"+
	"- Infinity: representa o valor 'infinito' (real e complexo), como o obtido em 1/0\n"+
	"- Complexo: um valor complexo na forma a+b*i (com a e b reais)\n"+
	"Os números são encaixados em cada tipo automaticamente, como for melhor\n\n"+
	"As formas de se escrever um número como entrada são:\n"+
	"- double, exemplos: 2, 2.7, 1e100, .12e-7 Formalmente: \\d*(\\.\\d+)?(e[+-]?\\d+)?\n"+
	"- inteiro hexadecimal, exemplo: 0x2F805B Formalmente: 0x[0-9a-f]+\n"+
	"- inteiro binário, exemplo: 0b10101001 Formalmente: 0b[01]+\n"+
	"- inteiro em outra base, exemplo: gui_36 Formalmente: [0-9a-z]+_\\d+",
"operadores": "Os operadores são internamente tratados como funções normais\n"+
	"Os operadores disponíveis são:\n"+
	"- aritméticos: a+b, a-b, a*b, a/b, a^b (elevado), a%b (resto da divisão), +n, -n\n"+
	"- comparação: a<b, a>b, a<=b, a>=b, a==b, a!=b (diferente)\n"+
	"- lógicos: !a (not), a&&b (e), a||b (ou)\n"+
	"- outros: n! (fatorial), n% (porcentagem, a=b (definição), v[n] (entrada do vetor), m[i, j] (entrada da matriz)",
"variaveis": "Variáveis são definidas na forma x=valor (como x=2 ou x=a+1)\n"+
	"Algumas variáveis já existem por padrão, como pi, e, inf, i\n"+
	"Para pegar o valor direto de uma variável, use get(x)\n"+
	"Para remover uma variável, use unset(x)\n"+
	"Para ver a lista de todas as variáveis definidas, use vars()",
"funcoes": "Funções podem ser definidas na forma f(x)=valor (como f(x)=x^2 ou g(a,b)=a!/b!)\n"+
	"Várias funções já existem por padrão, como os operadores, sqrt(x), for(var,ini,fim,exp), num(valor)\n"+
	"Para pegar a definição de uma função, use get(f())\n"+
	"Para remover uma função, use unset(f())\n"+
	"Para ver a lista de todas as funções definidas, use funcs()",
"listas": "Uma lista é escrita na forma {a, b, c} e pode ter quantos elementos desejar\n"+
	"A grande maioria das funções e operadores distribuem sobre listas:\n"+
	"{3, 14}+15 = {18, 29}\n"+
	"{1, 2}+{3, 4}={4, 6}\n"+
	"Use lista[n] para acessar o nº termo da lista\n"+
	"Use funcs(lista) para ver as funções especiais para listas",
"vetores": "Um vetor é escrito na forma [a, b, c] e pode ter quantas dimensões desejar\n"+
	"Use vetor[n] para acessar o nº componente do vetor\n"+
	"Use funcs(vetor) para ver as funções especiais para lidar com vetores",
"matrizes": "Uma matriz 3x3 é escrita na forma |a,b,c;d,e,f;g,h,i|\n"+
	"Uma matriz não pode ser vazia (zero entradas)\n"+
	"Use matriz[i, j] para obter a entrada na linha i e coluna j da matriz\n"+
	"Use funcs(matriz) para ver as funções específicas para lidar com matrizes",
"graficos": "Para plotar gráficos, use a função plot, exemplos:\n"+
	"plot(x, -3, 5, x*sin(x^2))\n"+
	"plot(x, -pi, pi, {sin(x), cos(x)})\n"+
	"plot(t, -3, 3, {abs(asin(t)), arg(asin(t))})\n"+
	"plot(x, -3, 2, x^x)\n"+
	"animate(a,1/10,10,x,0,pi,sin(x)^a)"
}
Funcao.registrar("help", "help(tema)\nEsse você já sabe!", function (tema) {
	if (tema) {
		tema = unbox(tema)
		if (tema instanceof Variavel) {
			if (tema.nome in ajudaInfo)
				setTimeout(function () {
					Console.echoInfo(ajudaInfo[tema.nome])
				}, 250)
			else
				throw 0
		} else
			throw 0
	} else
		setTimeout(function () {
			Console.echoInfo(ajudaInfo[""])
		}, 250)
	return new Expressao
}, false, true, true)
Variavel.valores["help"] = new Funcao("help", [])

// Exibe as variáveis definidas
Funcao.registrar("vars", "vars()\nMostra uma lista de todas as variáveis definidas", function () {
	setTimeout(function () {
		Console.echoInfo(Object.keys(Variavel.valores).sort().join("\n"))
	}, 250)
	return new Expressao
})

// Exibe as variáveis definidas
Funcao.registrar("funcs", "funcs() ou funcs(modulo)\nMostra uma lista de todas as funções definidas num módulo", function (modulo) {
	var itens, i
	if (modulo === undefined) {
		// Lista os módulos
		itens = {}
		for (i in Funcao.funcoes)
			itens["- "+Funcao.funcoes[i].modulo] = true
		itens = Object.keys(itens)
		setTimeout(function () {
			Console.echoInfo("Para listar as funções de um dos módulos abaixo, use funcs(modulo):\n")
			Console.echoInfo(itens.sort().join("\n"))
		}, 250)
	} else {
		// Lista as funções do módulo
		modulo = unbox(modulo)
		if (!(modulo instanceof Variavel))
			throw 0
		itens = []
		for (i in Funcao.funcoes)
			if (Funcao.funcoes[i].modulo == modulo.nome)
				itens.push("- "+Funcao.funcoes[i].definicao.replace(/\n/, "\n\t"))
		setTimeout(function () {
			Console.echoInfo("Funções do módulo "+modulo.nome+":\n")
			Console.echoInfo(itens.sort().join("\n"))
		}, 250)
	}
	return new Expressao
}, false, true, true)

// Liga ou desliga o debug
Funcao.registrar("debug", "debug(estado)\nLiga ou desliga informações de debug", function (estado) {
	if (eNumerico(estado)) {
		_debug = !eZero(estado)
		Console.echoInfo("Debug "+(_debug ? "ligado" : "desligado"))
		return new Expressao
	} else if (eDeterminado(estado))
		throw 0
})

// Limpa o console
Funcao.registrar("clear", "clear()\nLimpa o console", function () {
	setTimeout(Console.limpar, 250)
	return new Expressao
})
