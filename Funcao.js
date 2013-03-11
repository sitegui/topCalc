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

// Transforma a função para aceitar listas facilmente
Funcao.fazerAceitarListas = function (funcaoBase) {
	var retorno = function () {
		var i, len, temLista, tamLista, retorno, j, args, temp
		len = arguments.length
		temLista = false
		tamLista = 0
		for (i=0; i<len; i++) {
			if (ePuro(arguments[i]))
				continue
			arguments[i] = unbox(arguments[i])
			if (arguments[i] instanceof Lista) {
				if (!temLista)
					tamLista = arguments[i].expressoes.length
				else if (tamLista != arguments[i].expressoes.length)
					throw "Tamanhos incompatíveis de listas"
				temLista = true
			}
		}
		
		if (!temLista)
			return funcaoBase.apply(this, arguments)
		else {
			retorno = new Lista
			for (i=0; i<tamLista; i++) {
				args = []
				for (j=0; j<len; j++)
					if (arguments[j] instanceof Lista)
						args.push(arguments[j].expressoes[i])
					else
						args.push(arguments[j])
				temp = funcaoBase.apply(this, args)
				retorno.expressoes.push(temp===undefined ? new Funcao(this.nome, args) : temp)
			}
			return retorno
		}
	}
	retorno.dim = funcaoBase.length
	return retorno
}

// Gera uma função com base nos parâmetros e sua definição
Funcao.gerar = function (params, unidades, definicao) {
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
Funcao.prototype.toString = function () {
	var a, b, op, pre
	var operadores = {
		factorial: 0, "%": 0, // rtl
		"!": 1, "+": 1, "-": 1 // ltr
	}
	var operadores2 = {
		"^": 0, // ltr
		"*": 1, "/": 1, "%": 1, "undefined": 1, // rtl
		"_": 2, // rtl
		"+": 3, "-": 3, // rtl
		"<": 4, "<=": 4, ">": 4, ">=": 4, // rtl
		"==": 5, "!=": 5, // rtl
		"&&": 6, // rtl
		"||": 7, // rtl
		"=": 8 // ltr
	}
	var sentidos = [-1, 1, 1, 1, 1, 1, 1, 1, -1]
	var eOperador = function (x) {
		return x instanceof Funcao && x.nome in operadores && x.args.length == 1
	}
	var eOperador2 = function (x) {
		if (x instanceof Fracao && x.d != 1)
			return true
		return x instanceof Funcao && x.nome in operadores2 && x.args.length == 2
	}
	if (eOperador(this)) {
		a = unbox(this.args[0])
		if (operadores[this.nome] == 0) {
			op = this.nome=="factorial" ? "!" : this.nome
			if (eOperador2(a) || (eOperador(a) && operadores[a.nome] > 0))
				return "("+a+")"+op
			return String(a)+op
		} else {
			if (eOperador2(a))
				return this.nome+"("+a+")"
			return this.nome+a
		}
	}
	if (eOperador2(this)) {
		a = unbox(this.args[0])
		b = unbox(this.args[1])
		pre = operadores2[this.nome]
		if (eOperador2(a) && (operadores2[a.nome]>pre || (operadores2[a.nome]==pre && sentidos[pre]==-1)))
			a = "("+a+")"
		else
			a = String(a)
		if (eOperador2(b) && (operadores2[b.nome]>pre || (operadores2[b.nome]==pre && sentidos[pre]==1)))
			b = "("+b+")"
		else
			b = String(b)
		if (pre > 3)
			return a+" "+this.nome+" "+b
		return a+this.nome+b
	}
	return this.nome+"("+this.args.join(", ")+")"
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
