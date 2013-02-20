// Funções diversas

// Retorna o valor de uma variável
Funcao.registrar("get", "get(x) ou get(f())\nRetorna o valor de uma variável ou a definição de uma função", function (variavel) {
	var valor
	this.args[0] = variavel = unbox(variavel)
	if (variavel instanceof Variavel) {
		valor = this.getVariavelDireto(variavel)
		if (valor !== null)
			return valor
	} else if (variavel instanceof Funcao) {
		valor = variavel.getDefinicao()
		if (valor !== null)
			return valor
	} else if (eDeterminado(variavel))
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
	"- numeros\n- operadores\n- variaveis\n- funcoes",
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
	"- outros: n! (fatorial), n% (porcentagem, a=b (definição)",
"variaveis": "Variáveis são definidas na forma x=valor (como x=2 ou x=a+1)\n"+
	"Algumas variáveis já existem por padrão, como pi, e, inf, i\n"+
	"Para pegar o valor direto de uma variável, use get(x)\n"+
	"Para remover uma variável, use unset(x)\n"+
	"Para ver a lista de todas as variáveis definidas, use vars()",
"funcoes": "Funções podem ser definidas na forma f(x)=valor (como f(x)=x^2 ou g(a,b)=a!/b!)\n"+
	"Várias funções já existem por padrão, como os operadores, sqrt(x), for(var,ini,fim,exp), num(valor)\n"+
	"Para pegar a definição de uma função, use get(f())\n"+
	"Para remover uma função, use unset(f())\n"+
	"Para ver a lista de todas as funções definidas, use funcs()"
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
Funcao.registrar("funcs", "funcs()\nMostra uma lista de todas as funções definidas", function () {
	setTimeout(function () {
		Console.echoInfo(Object.keys(Funcao.funcoes).sort().join("\n"))
	}, 250)
	return new Expressao
})

// Liga ou desliga o debug
var _debug = false
Funcao.registrar("debug", "debug(estado)\nLiga ou desliga informações de debug", function (estado) {
	if (eNumerico(estado)) {
		_debug = !eZero(estado)
		Console.echoInfo("Debug "+(_debug ? "ligado" : "desligado"))
		return new Expressao
	} else if (eDeterminado(estado))
		throw 0
})

// Limpa o console
Funcao.registrar("limpar", "limpar()\nLimpa o console", function () {
	setTimeout(Console.limpar, 250)
	return new Expressao
})
