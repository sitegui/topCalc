"use strict";

// Representa uma função (args é uma Array de objetos matemáticos)
function Funcao(nome, args) {
	this.nome = nome
	this.args = args
	this.escopo = []
}

// Guarda as funções definidas
Funcao.funcoes = {}

// Guarda o módulo atual
Funcao.moduloAtual = ""

// Registra uma nova função
Funcao.registrar = function (nome, definicao, funcao, aceitaListas, entradaPura, dimVariavel) {
	aceitaListas = Boolean(aceitaListas)
	if (aceitaListas)
		funcao = Funcao.fazerAceitarListas(funcao)
	else
		funcao.dim = funcao.length
	funcao.aceitaListas = aceitaListas
	funcao.definicao = definicao
	funcao.entradaPura = Boolean(entradaPura)
	funcao.dimVariavel = Boolean(dimVariavel)
	funcao.modulo = Funcao.moduloAtual
	Funcao.funcoes[nome] = funcao
}

// Aplica uma dada função para os argumentos enviados (aceita listas)
// funcao é uma function
// that é um objeto Funcao
// args é uma array com os argumentos da função
Funcao.aplicarNasListas = function (funcao, that, args) {
	var i, len, temLista, tamLista, retorno, j, args2, temp
	len = args.length
	temLista = false
	tamLista = 0
	for (i=0; i<len; i++) {
		if (args[i] instanceof Lista) {
			if (!temLista)
				tamLista = args[i].expressoes.length
			else if (tamLista != args[i].expressoes.length)
				throw "Tamanhos incompatíveis de listas"
			temLista = true
		}
	}
	
	if (!temLista)
		return funcao.apply(that, args)
	else {
		retorno = new Lista
		for (i=0; i<tamLista; i++) {
			args2 = []
			for (j=0; j<len; j++)
				if (args[j] instanceof Lista)
					args2.push(args[j].expressoes[i])
				else
					args2.push(args[j])
			temp = funcao.apply(that, args2)
			temp = temp===undefined ? new Funcao(that.nome, args2) : temp
			retorno.expressoes.push(temp)
		}
		return retorno
	}
}

// Transforma a função para aceitar listas facilmente
Funcao.fazerAceitarListas = function (funcaoBase) {
	var retorno = function () {
		return Funcao.aplicarNasListas(funcaoBase, this, arguments)
	}
	retorno.dim = funcaoBase.length
	return retorno
}

// Gera uma função com base nos parâmetros e sua definição
Funcao.gerar = function (params, unidades, definicao) {
	var retorno = function () {
		var escopoPai, i, retorno
		
		if (arguments.length != params.length)
			throw "Número incorreto de parâmetros"
		
		try {
			escopoPai = Variavel.backup(params)
			for (i=0; i<arguments.length; i++) {
				if (params[i] in unidades)
					Variavel.valores[params[i]] = Funcao.executar("_", [arguments[i], unidades[params[i]]])
				else
					Variavel.valores[params[i]] = arguments[i]
			}
			retorno = this.executarNoEscopo(definicao, null, params)
		} finally {
			Variavel.restaurar(escopoPai)
		}
		
		return retorno
	}
	retorno.aceitaListas = false
	retorno.entradaPura = false
	retorno.dimVariavel = false
	retorno.dim = params.length
	retorno.modulo = "usuario"
	return retorno
}

// Executa uma função diretamente, sem processar os argumentos
Funcao.executar = function (nome, args) {
	var funcao, retorno, copia
	copia = new Funcao(nome, args)
	if (nome in Funcao.funcoes) {
		funcao = Funcao.funcoes[nome]
		retorno = funcao.apply(copia, args)
		return retorno===undefined ? copia : retorno
	} else
		return copia
}

// Pega todos os valores recebidos pela função, mesmo que dentro de listas
// Exemplo: f(a,{b,c},{{d,e},f}) => a,b,c,d,e,f
Funcao.getFlatArgs = function (args) {
	var i, r = []
	for (i=0; i<args.length; i++) {
		if (args[i] instanceof Lista)
			r = r.concat(Funcao.getFlatArgs(args[i].expressoes))
		else
			r.push(args[i])
	}
	return r
}

// Clona a função (não clona as argumentos em si)
Funcao.prototype.clonar = function () {
	return new Funcao(this.nome, this.args.clonar())
}

// Retorna uma representação em forma de string
Funcao.prototype.toMathString = function (mathML) {
	var a, b, op, pre, nome2, strA, strB, i, args, preA, preB
	var operadores = {
		factorial: 0, "%": 0, "²": 0, "³": 0, // rtl
		"!": 1, "+": 1, "-": 1, "\u221A": 1, "'": 1 // ltr
	}
	var operadores2 = {
		"^": 1, // rtl
		":": 2, // ltr
		"_": 3, // ltr
		"*": 4, "/": 4, "%": 4, "\u2A2F": 4, // ltr
		"+": 5, "-": 5, // ltr
		"<": 6, "<=": 6, ">": 6, ">=": 6, "\u2264": 6, "\u2265": 6, // ltr
		"==": 7, "!=": 7, "\u2260": 7, // ltr
		"&&": 8, // ltr
		"||": 9, // ltr
		"=": 10, "+=": 10, "-=": 10, "*=": 10, "/=": 10, "%=": 10, "_=": 10, "&&=": 10, "||=": 10, "^=": 10 // rtl
	}
	var sentidos = [0, -1, 1, 1, 1, 1, 1, 1, 1, 1, -1]
	var eOperador = function (x) {
		return x instanceof Funcao && x.nome in operadores && x.args.length == 1
	}
	var eOperador2 = function (x) {
		if (x instanceof Fracao && x.d != 1)
			return operadores2["/"]
		if (x instanceof Complexo && !eZero(x.b))
			return operadores2["+"]
		if (x instanceof ValorComUnidade)
			return operadores2["_"]
		if (x instanceof BigNum)
			return operadores2["^"]
		if (x instanceof Funcao && x.nome in operadores2 && x.args.length == 2)
			return operadores2[x.nome]
		return 0
	}
	nome2 = Console.escaparHTML(this.nome)
	if (eOperador(this)) {
		a = this.args[0]
		strA = a.toMathString(mathML)
		if (operadores[this.nome] == 0) {
			op = this.nome=="factorial" ? "!" : nome2
			if (eOperador2(a) || (eOperador(a) && operadores[a.nome] > 0))
				return mathML ? "<mrow><mo>(</mo>"+strA+"<mo>)</mo></mrow><mo>"+op+"</mo>" : "("+strA+")"+op
			return mathML ? strA+"<mo>"+op+"</mo>" : strA+op
		} else if (mathML && this.nome == "\u221A")
			return "<msqrt>"+strA+"</msqrt>"
		else {
			if (eOperador2(a) && a.nome != "^")
				return mathML ? "<mi>"+nome2+"</mi><mrow><mo>(</mo>"+strA+"<mo>)</mo></mrow>" : nome2+"("+strA+")"
			return mathML ? "<mo>"+nome2+"</mo>"+strA : nome2+strA
		}
	}
	if (pre = eOperador2(this)) {
		a = this.args[0]
		b = this.args[1]
		strA = a.toMathString(mathML)
		strB = b.toMathString(mathML)
		preA = eOperador2(a)
		preB = eOperador2(b)
		if (this.nome == "^" && a instanceof Funcao && ["!", "+", "-", "\u221A"].indexOf(a.nome) != -1 && a.args.length == 1)
			strA = mathML ? "<mrow><mo>(</mo>"+strA+"<mo>)</mo></mrow>" : "("+strA+")"
		else if (preA && (preA>pre || (preA==pre && sentidos[pre]==-1)) && !(mathML && this.nome == "/"))
			strA = mathML ? "<mrow><mo>(</mo>"+strA+"<mo>)</mo></mrow>" : "("+strA+")"
		if (preB && (preB>pre || (preB==pre && sentidos[pre]==1)) && !(mathML && (this.nome == "/" || this.nome == "^")))
			strB = mathML ? "<mrow><mo>(</mo>"+strB+"<mo>)</mo></mrow>" : "("+strB+")"
		if (this.nome == "_")
			strB = mathML ? "<mstyle class='unidade'>"+strB+"</mstyle>" : "<span class='unidade'>"+strB+"</span>"
		if (mathML) {
			if (this.nome == "^")
				return "<msup><mrow>"+strA+"</mrow><mrow>"+strB+"</mrow></msup>"
			else if (this.nome == "/")
				return "<mfrac><mrow>"+strA+"</mrow><mrow>"+strB+"</mrow></mfrac>"
		}
		if (pre > 5)
			return mathML ? strA+" <mo>"+nome2+"</mo> "+strB : strA+" "+nome2+" "+strB
		return mathML ? strA+"<mo>"+nome2+"</mo>"+strB : strA+nome2+strB
	}
	if (this.nome == "getAt") {
		strA = this.args[0].toMathString(mathML)
		strB = this.args[1].toMathString(mathML)
		if (mathML)
			return strA+"<mrow><mo>[</mo>"+strB+(this.args.length==3 ? "<mo>,</mo> "+this.args[2].toMathString(true) : "")+"<mo>]</mo></mrow>"
		return strA+"["+strB+(this.args.length==3 ? ", "+this.args[2].toMathString(false) : "")+"]"
	}
	args = []
	for (i=0; i<this.args.length; i++)
		args.push(this.args[i].toMathString(mathML))
	return mathML ? "<mi>"+nome2+"</mi><mrow><mo>(</mo>"+args.join("<mo>,</mo> ")+"<mo>)</mo></mrow>" : nome2+"("+args.join(", ")+")"
}

// Executa uma função
Funcao.prototype.executar = function (vars) {
	var retorno, funcao, copia, that
	that = this
	this.escopo = vars
	if (this.nome in Funcao.funcoes) {
		funcao = Funcao.funcoes[this.nome]
		if (!funcao.dimVariavel && funcao.dim != this.args.length)
			throw "Quantidade inválida de parâmetros para "+this.nome+", recebido "+this.args.length+" e esperado "+funcao.dim
		if (!funcao.entradaPura)
			copia = new Funcao(this.nome, this.args.map(function (x) {
				return that.executarNoEscopo(x)
			}))
		else
			copia = this.clonar()
		copia.escopo = vars
		try {
			if (executar.preExecutar != 2)
				retorno = funcao.apply(copia, copia.args)
			else if (funcao.preExecucao)
				retorno = funcao.preExecucao.apply(copia)
		} catch (e) {
			if (e === 0)
				throw "Resultado de "+this.nome+" indefinido"
			else
				throw e
		}
		return retorno!==undefined ? retorno : copia
	} else
		return new Funcao(this.nome, this.args.map(function (x) {
			return that.executarNoEscopo(x)
		}))
}

// Executa uma expressão no escopo atual
// exp é a expressão a ser executada
// escopo é uma Array com os nomes das variáveis a serem incluídas no escopo (opcional)
// antiEscopo é uma Array com os nomes das variáveis a serem excluídas do escopo (opcional)
Funcao.prototype.executarNoEscopo = function (exp, escopo, antiEscopo) {
	var debug, r, subescopo, i
	
	// Desativa o debug caso não se deseje saber passo-a-passo
	debug = Config.get("debug")
	if (debug == 1 && antiEscopo)
		Config.set("debug", 0, true)
	
	escopo = escopo ? this.escopo.concat(escopo) : this.escopo
	if (antiEscopo) {
		subescopo = []
		for (i=0; i<escopo.length; i++)
			if (antiEscopo.indexOf(escopo[i]) == -1)
				subescopo.push(escopo[i])
	} else
		subescopo = escopo
	
	r = executar(exp, subescopo)
	
	if (debug == 1 && antiEscopo)
		Config.set("debug", 1, true)
	
	return r
}

// Pré-executa uma expressão no escopo atual
// A diferença entre pré-executar e executar, é que pré-executar somente substitui as variáveis pelo seu valor no escopo atual
// exp é a expressão a ser executada
// escopo é uma Array com os nomes das variáveis a serem incluídas no escopo (opcional)
Funcao.prototype.preExecutarNoEscopo = function (exp, escopo) {
	var r, antes
	
	try {
		antes = executar.preExecutar
		if (executar.preExecutar == 0)
			executar.preExecutar = 1
		r = executar(exp, escopo ? this.escopo.concat(escopo) : this.escopo)
	} finally {
		executar.preExecutar = antes
	}
	
	return r
}

// Retorna a definição de uma função (ou null caso seja nativa ou inexistente)
Funcao.prototype.getDefinicao = function () {
	if (this.nome in Funcao.funcoes)
		return Funcao.funcoes[this.nome].definicao
	else
		return null
}

// Função de pre-execução básica
// vars é uma Array com índices dos argumentos que devem ser tratados como variáveis
// exp é o índice do argumento que deve ser executada no subescopo das variáveis definidas por vars
Funcao.gerarPreExecucao = function (vars, exp) {
	return function () {
		var i, subescopo = []
		
		// Valida e pega os nomes das variáveis
		for (i=0; i<vars.length; i++) {
			if (!(this.args[vars[i]] instanceof Variavel))
				throw 0
			subescopo.push(this.args[vars[i]].nome)
		}
		
		// Trata todos os argumentos
		for (i=0; i<this.args.length; i++)
			if (i == exp)
				this.args[i] = this.executarNoEscopo(this.args[i], subescopo)
			else if (vars.indexOf(i) == -1)
				this.args[i] = this.executarNoEscopo(this.args[i])
	}
}
