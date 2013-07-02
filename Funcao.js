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
		args[i] = unbox(args[i])
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
			if (!eExpressaoVazia(temp))
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
	var i
	
	// Muda os nomes dos parâmetros de "x" para "_x"
	// Isso serve para evitar conflitos de escopo, como em:
	// f(x)=x+1, slider(x, -5pi, 5pi, f(a*x))
	var filtrar = function (exp) {
		if (exp instanceof Vetor || exp instanceof Lista || exp instanceof Parenteses)
			return new exp.constructor(exp.expressoes.map(filtrar))
		else if (exp instanceof Matriz)
			return new Matriz(exp.expressoes.map(filtrar), exp.colunas)
		else if (exp instanceof Expressao)
			return new Expressao(exp.elementos.map(filtrar))
		else if (exp instanceof Funcao)
			return new Funcao(exp.nome, exp.args.map(filtrar))
		else if (exp instanceof Variavel && params.indexOf(exp.nome) != -1)
			return new Variavel("_"+exp.nome)
		else
			return exp.clonar()
	}
	definicao = filtrar(definicao)
	
	for (i=0; i<params.length; i++)
		params[i] = "_"+params[i]
	
	var retorno = function () {
		var escopoPai, i, retorno
		escopoPai = Variavel.backup(params)
		
		if (arguments.length != params.length)
			throw "Número incorreto de parâmetros"
		
		for (i=0; i<arguments.length; i++) {
			if (params[i] in unidades)
				Variavel.valores[params[i]] = Funcao.executar("_", [arguments[i], unidades[params[i]]])
			else
				Variavel.valores[params[i]] = arguments[i]
		}
		
		retorno = this.executarNoEscopo(definicao)
		
		Variavel.restaurar(escopoPai)
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
		"!": 1, "+": 1, "-": 1, "\u221A": 1 // ltr
	}
	var operadores2 = {
		"^": 1, // ltr
		"_": 2, // rtl
		"*": 3, "/": 3, "%": 3, "\u2A2F": 3, // rtl
		"+": 4, "-": 4, // rtl
		"<": 5, "<=": 5, ">": 5, ">=": 5, "\u2264": 5, "\u2265": 5, // rtl
		"==": 6, "!=": 6, "\u2260": 6, // rtl
		"&&": 7, // rtl
		"||": 8, // rtl
		"=": 9 // ltr
	}
	var sentidos = [0, -1, 1, 1, 1, 1, 1, 1, 1, -1]
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
		a = unbox(this.args[0])
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
		a = unbox(this.args[0])
		b = unbox(this.args[1])
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
		if (pre > 4)
			return mathML ? strA+" <mo>"+nome2+"</mo> "+strB : strA+" "+nome2+" "+strB
		return mathML ? strA+"<mo>"+nome2+"</mo>"+strB : strA+nome2+strB
	}
	args = []
	for (i=0; i<this.args.length; i++)
		args.push(this.args[i].toMathString(mathML))
	return mathML ? "<mrow><mi>"+nome2+"</mi><mo>(</mo>"+args.join("<mo>,</mo> ")+"<mo>)</mo></mrow>" : nome2+"("+args.join(", ")+")"
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
				return that.executarPuroNoEscopo(x)
			}))
		else
			copia = this.clonar()
		copia.escopo = vars
		try {
			retorno = funcao.apply(copia, copia.args)
		} catch (e) {
			if (e === 0)
				throw "Resultado de "+this.nome+" indefinido"
			else
				throw e
		}
		return retorno!==undefined ? retorno : copia
	} else
		return new Funcao(this.nome, this.args.map(function (x) {
			return that.executarPuroNoEscopo(x)
		}))
}

// Executa uma expressão no escopo atual
Funcao.prototype.executarNoEscopo = function (obj, subvars) {
	if (subvars)
		return executar(obj, this.escopo.concat(subvars))
	else
		return executar(obj, this.escopo)
}

// Executa uma expressão pura no escopo atual
// Se a expressão não for pura, faz o mesmo que Funcao::executarNoEscopo
// Se for, somente as variáveis são abertas, sem executar nenhuma função
Funcao.prototype.executarPuroNoEscopo = function (obj, subvars) {
	var vars
	var trocar = function (obj) {
		var r
		if (obj instanceof Expressao) {
			r = new Expressao(obj.elementos.map(trocar))
			r.puro = obj.puro
			return r
		} else if (obj instanceof Parenteses)
			return new Parenteses(obj.expressoes.map(trocar))
		else if (obj instanceof Lista)
			return new Lista(obj.expressoes.map(trocar))
		else if (obj instanceof Vetor)
			return new Vetor(obj.expressoes.map(trocar))
		else if (obj instanceof Matriz)
			return new Matriz(obj.expressoes.map(trocar), obj.colunas)
		else if (obj instanceof Funcao)
			return new Funcao(obj.nome, obj.args.map(trocar))
		else if (obj instanceof Variavel) {
			if (obj.nome in Variavel.valores && vars.indexOf(obj.nome) == -1)
				return Variavel.valores[obj.nome]
			return new Variavel(obj.nome)
		} else
			return obj.clonar()
	}
	
	if (!ePuro(obj))
		return this.executarNoEscopo(obj, subvars)
	else {
		if (subvars)
			vars = this.escopo.concat(subvars)
		else
			vars = this.escopo
		return trocar(obj)
	}
}

// Retorna o valor de uma variável no escopo atual
// variavel deve ser uma instância de Variavel
Funcao.prototype.getVariavel = function (variavel) {
	return variavel.get(this.escopo)
}

// Retorna o valor mais imediato de uma variável no escopo atual (sem executá-lo)
// variavel deve ser uma instância de Variavel
Funcao.prototype.getVariavelDireto = function (variavel) {
	return variavel.getDireto(this.escopo)
}

// Retorna a definição de uma função (ou null caso seja nativa ou inexistente)
Funcao.prototype.getDefinicao = function () {
	if (this.nome in Funcao.funcoes)
		return Funcao.funcoes[this.nome].definicao
	else
		return null
}
