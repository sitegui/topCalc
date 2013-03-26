"use strict";

// Funções diversas

// Retorna o valor de uma variável
Funcao.registrar("get", "get(x) ou get(f())\nRetorna o valor de uma variável ou a definição de uma função", function (variavel) {
	var valor
	this.args[0] = variavel = unbox(variavel)
	if (variavel instanceof Variavel) {
		valor = this.getVariavelDireto(variavel)
		if (valor !== null) {
			Console.echoInfo(valor, true)
			return new Expressao
		}
	} else if (variavel instanceof Funcao) {
		valor = variavel.getDefinicao()
		if (valor !== null) {
			Console.echoInfo("Módulo "+Funcao.funcoes[variavel.nome].modulo+"\n"+valor, true)
			return new Expressao
		}
	} else if (eDeterminado(variavel))
		throw 0
}, false, true)

Funcao.registrar("if", "if(oq, 'casoSim, 'casoNao)\nRetorna um valor ou outro dependendo da condição", function (oq, sim, nao) {
	var r
	this.args[0] = oq = this.executarNoEscopo(oq)
	this.args[1] = sim = this.executarPuroNoEscopo(sim)
	this.args[2] = nao = this.executarPuroNoEscopo(nao)
	if (eNumerico(oq)) {
		r = eZero(oq) ? nao : sim
		return this.executarNoEscopo(r)
	} else if (eDeterminado(oq))
		throw 0
}, false, true)

// Remove a definição de uma variável ou função
Funcao.registrar("unset", "unset(x) ou unset(f()) ou unset(1_x)\nExclui uma variável, função ou unidade", function (variavel) {
	this.args[0] = variavel = unbox(variavel)
	if (variavel instanceof Variavel) {
		delete Variavel.valores[variavel.nome]
		return new Expressao
	} else if (variavel instanceof Funcao && variavel.nome == "_") {
		variavel.args[0] = unbox(variavel.args[0])
		variavel.args[1] = unbox(variavel.args[1])
		if (!(variavel.args[0] instanceof Fracao) || variavel.args[0].n != 1 || variavel.args[0].d != 1)
			throw 0
		if (!(variavel.args[1] instanceof Variavel))
			throw 0
		delete Unidade.unidades[variavel.args[1].nome]
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
	"Basta digitar a expressão que deseja executar, como @(1/8)^(-1/3)@\n"+
	"Essa calculadora não é simbólica, ou seja, não executa simplificações sobre símbolos (como @x+x@ → 2x)\n"+
	"Acesse o código fonte: https://github.com/sitegui/topCalc/\n"+
	"Para entrar em contato, use o comando @feedback()@\n\n"+
	"Para obter mais ajuda sobre um dos temas abaixo, use help(tema)\n"+
	"- @help(numeros)@\n"+
	"- @help(operadores)@\n"+
	"- @help(variaveis)@\n"+
	"- @help(funcoes)@\n"+
	"- @help(expressoes)@\n"+
	"- @help(listas)@\n"+
	"- @help(vetores)@\n"+
	"- @help(matrizes)@\n"+
	"- @help(graficos)@\n"+
	"- @help(unidades)@",
numeros: "Os valores numéricos são representados de 4 formas:\n"+
	"- Fracao: um valor racional exato, com numerador e denominador inteiros\n"+
	"- Number: um valor real aproximado, armazenado como double\n"+
	"- BigNum: um valor real muito aproximado e capaz de representar números muito grandes\n"+
	"- Infinity: representa o valor 'infinito' (real e complexo), como o obtido em @1/0@\n"+
	"- Complexo: um valor complexo na forma @a+b*i@ (com a e b reais)\n"+
	"Os números são encaixados em cada tipo automaticamente, como for melhor\n\n"+
	"As formas de se escrever um número como entrada são:\n"+
	"- double, exemplos: @2@, @2.7@, @1e100@, @.12e-7@ Formalmente: \\d*(\\.\\d*)?(e[+-]?\\d+)?\n"+
	"- inteiro hexadecimal, exemplo: @0x2F805B@ Formalmente: 0x[0-9a-f]+\n"+
	"- inteiro binário, exemplo: @0b10101001@ Formalmente: 0b[01]+\n"+
	"- inteiro em outra base, exemplo: @gui_36@ Formalmente: [0-9a-z]+_\\d+",
operadores: "Os operadores são internamente tratados como funções normais\n"+
	"Os operadores disponíveis são:\n"+
	"- aritméticos: @a+b@, @a-b@, @a*b@, @a/b@, @a^b@ (elevado), @a%b@ (resto da divisão), @+n@, @-n@\n"+
	"- comparação: @a<b@, @a>b@, @a<=b@, @a>=b@, @a==b@, @a!=b@ (diferente)\n"+
	"- lógicos: @!a@ (not), @a&&b@ (e), @a||b@ (ou)\n"+
	"- outros: @n!@ (fatorial), @n%@ (porcentagem, @v[n]@ (entrada do vetor), @m[i, j]@ (entrada da matriz), @a_b@ (aplicador de unidade)\n"+
	"- atribuições: @a=b@, @a+=b@, @a-=b@, @a*=b@, @a/=b@, @a%=b@, @a^=b@, @a&&=b@, @a||=b@, @a_=b@",
variaveis: "Variáveis são definidas na forma @x=valor@ (como @x=2@ ou @x=a+1@)\n"+
	"Algumas variáveis já existem por padrão, como @pi@, @e@, @inf@, @i@, etc\n"+
	"Para pegar o valor direto de uma variável, use @get(x)@\n"+
	"Para remover uma variável, use @unset(x)@\n"+
	"Para ver a lista de todas as variáveis definidas, use @vars()@",
funcoes: "Funções podem ser definidas na forma @f(x)=valor@ (como @f(x)=x^2@ ou @g(a,b)=a!/b!@)\n"+
	"Várias funções já existem por padrão, como os operadores, @sqrt(x)@, @for(var,ini,fim,exp)@, @num(valor)@\n"+
	"Para pegar a definição de uma função, use @get(f())@\n"+
	"Para remover uma função, use @unset(f())@\n"+
	"Para ver a lista de todas as funções definidas, use @funcs()@\n"+
	"Na descrição da função, argumentos com um ' indicam que expressões puras serão tratadas de forma diferente",
expressoes: "Uma expressão é um conjunto de números, variáveis, operadores e funções\n\n"+
	"Uma expressão \"pura\" começa com uma aspas simples (') e indica que ela deve ser executada depois. Exemplos:\n"+
	"@for(i, 1, 3, rand(1, 6))@ → {4, 4, 4}\n@for(i, 1, 3, 'rand(1, 6))@ → {4, 5, 3}\n\n"+
	"@f(x) = {x, 2x}@\n@f(rand(1, 6))@ → {2, 4}\n@f('rand(1, 6))@ → {1, 10}\n\n"+
	"@g(n) = if(n <= 1, 1, n*g(n-1)), h(n) = if(n <= 1, 1, 'n*h(n-1))@\n@g(5), h(5)@ → Erro, 120",
listas: "Uma lista é escrita na forma @{a, b, c}@ e pode ter quantos elementos desejar\n"+
	"A grande maioria das funções e operadores distribuem sobre listas:\n"+
	"@{3, 14}+15@ → {18, 29}\n"+
	"@{1, 2}+{3, 4}@ → {4, 6}\n"+
	"Use @lista[n]@ para acessar o nº termo da lista\n"+
	"Use @funcs(lista)@ para ver as funções especiais para listas",
vetores: "Um vetor é escrito na forma @[a, b, c]@ e pode ter quantas dimensões desejar\n"+
	"Use @vetor[n]@ para acessar o nº componente do vetor\n"+
	"Use @funcs(vetor)@ para ver as funções especiais para lidar com vetores",
matrizes: "Uma matriz 3x3 é escrita na forma @|a,b,c;d,e,f;g,h,i|@\n"+
	"Uma matriz não pode ser vazia (zero entradas)\n"+
	"Use @matriz[i, j]@ para obter a entrada na linha i e coluna j da matriz\n"+
	"Use @funcs(matriz)@ para ver as funções específicas para lidar com matrizes",
graficos: "Para plotar gráficos, use a função plot, exemplos:\n"+
	"@plot(x, -3, 5, x*sin(x^2))@\n"+
	"@plot(x, -pi, pi, {sin(x), cos(x)})@\n"+
	"@plot(t, -3, 3, {abs(asin(t)), arg(asin(t))})@\n"+
	"@plot(x, -3, 2, x^x)@\n\n"+
	"Outras opções de gráficos (animados ou com parâmetros) são:\n"+
	"@animate(a, 1/10, 10, x, 0, pi, sin(x)^a)@\n"+
	"@animate(a, 1, 9, x, -2, 2, for(i, 1, round(a^2), i*x))@\n"+
	"@slider(x, -5pi, 5pi, a*sin(x)+b*sin(2x), a, -2, 2, b, -2, 2)@",
unidades: "Unidades são escritas na forma valor_unidade, exemplos:\n"+
	"@1_s@, @pi_rad@, @x_(N*m)@, @17_(kW/m^2)@\n"+
	"O operador _ aplica e transforma unidades, por exemplo: @20_ºC_ºF@ → 68_ºF\n"+
	"Para ver todas as unidades e prefixos disponíveis, use @units()@\n"+
	"Você pode definir novas unidades, exemplo: @1_x = (17/27)_m@\n"+
	"Para excluir uma unidade, use @unset(1_x)@"
}
Funcao.registrar("help", "help(tema)\nEsse você já sabe!", function (tema) {
	if (tema) {
		tema = unbox(tema)
		if (tema instanceof Variavel) {
			if (tema.nome in ajudaInfo)
				setTimeout(function () {
					Console.echoInfo(Console.escaparHTML(ajudaInfo[tema.nome]), true)
				}, 250)
			else
				throw 0
		} else
			throw 0
	} else
		setTimeout(function () {
			Console.echoInfo(Console.escaparHTML(ajudaInfo[""]), true)
		}, 250)
	return new Expressao
}, false, true, true)
Variavel.valores["help"] = new Funcao("help", [])

Funcao.registrar("feedback", "feedback()\nAbre uma janela para nos enviar uma mensagem", function () {
	window.open('/fale_conosco/?assunto=topCalc', 'janelaFaleConosco', 'width=500,height=500')
	return new Expressao()
})

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

Funcao.registrar("units", "units()\nMostra todas as unidades e prefixos válidos", function () {
	var i, str = "Prefixos:\n", base
	var base2Str = function (base) {
		var i, str = []
		for (i in base)
			if (base[i] == 1)
				str.push(i)
			else
				str.push(i+"^"+base[i])
		return str.join("*")
	}
	for (i in Unidade.prefixos)
		str += i+" → "+Unidade.prefixos[i]+"\n"
	str += "\nUnidades:\n"
	for (i in Unidade.unidades) {
		base = base2Str(Unidade.unidades[i][0])
		str += i+" → "+Unidade.unidades[i][1]+(base ? "*"+base : "")+"\n"
	}
	Console.echoInfo(str)
	return new Expressao
})

Funcao.registrar("time", "time()\nRetorna o horário atual", function () {
	var agora, uH, uMin, uS, uMs, vH, vMin, vS, vMs, h, min, s, ms
	agora = new Date
	
	uH = new Unidade
	uH.unidades["h"] = {"": new Fracao(1, 1)}
	vH = new Fracao(agora.getHours(), 1)
	h = new ValorComUnidade(vH, uH)
	
	uMin = new Unidade
	uMin.unidades["min"] = {"": new Fracao(1, 1)}
	vMin = new Fracao(agora.getMinutes(), 1)
	min = new ValorComUnidade(vMin, uMin)
	
	uS = new Unidade
	uS.unidades["s"] = {"": new Fracao(1, 1)}
	vS = new Fracao(agora.getSeconds(), 1)
	s = new ValorComUnidade(vS, uS)
	
	uMs = new Unidade
	uMs.unidades["s"] = {"m": new Fracao(1, 1)}
	vMs = new Fracao(agora.getMilliseconds(), 1)
	ms = new ValorComUnidade(vMs, uMs)
	return new Funcao("+", [new Funcao("+", [new Funcao("+", [h, min]), s]), ms])
})

;(function () {
	var backup = null
	Funcao.registrar("backup", "backup()\nFaz um backup de todas as variáveis e funções criadas", function () {
		var i
		backup = {funcoes: {}, variaveis: {}}
		for (i in Funcao.funcoes)
			backup.funcoes[i] = Funcao.funcoes[i]
		for (i in Variavel.valores)
			backup.variaveis[i] = Variavel.valores[i]
		return new Expressao
	})
	Funcao.registrar("restaurar", "restaurar()\nRestaura o estado do backup", function () {
		var i
		if (backup === null)
			throw 0
		Funcao.funcoes = backup.funcoes
		Variavel.valores = backup.variaveis
		backup = null
	})
})()
