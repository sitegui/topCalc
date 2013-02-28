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
Funcao.gerar = function (params, definicao) {
	// Renomeia as variáveis para evitar conflito com variáveis externas
	var i
	var tratar = function (obj) {
		var r = obj.clonar()
		if (r instanceof Expressao)
			r.elementos = r.elementos.map(tratar)
		else if (r instanceof Parenteses || r instanceof Lista || r instanceof Vetor)
			r.expressoes = r.expressoes.map(tratar)
		else if (r instanceof Funcao)
			r.args = r.args.map(tratar)
		else if (r instanceof Variavel && params.indexOf(r.nome) != -1)
			r.nome = "_"+r.nome
		return r
	}
	definicao = tratar(definicao)
	for (i=0; i<params.length; i++)
		params[i] = "_"+params[i]
	
	var retorno = function () {
		var escopoPai = {}, i, retorno
		for (i in Variavel.valores)
			escopoPai[i] = Variavel.valores[i]
		
		if (arguments.length != params.length)
			throw "Número incorreto de parâmetros"
		
		for (i=0; i<arguments.length; i++)
			Variavel.valores[params[i]] = arguments[i]
		
		retorno = this.executarNoEscopo(definicao)
		
		Variavel.valores = escopoPai
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
// TODO: corrigir a/(b*c) (levar em conta a associatividade)
Funcao.prototype.toString = function () {
	var a, b
	var operadores = {
		"factorial": 0, "%": 0,
		"!": 1, "+": 1, "-": 1
	}
	var operadores2 = {
		"^": 0,
		"*": 1, "/": 1, "%": 1,
		"+": 2, "-": 2,
		"<": 3, "<=": 3, ">": 3, ">=": 3,
		"==": 4, "!=": 4,
		"&&": 5,
		"||": 6,
		"=": 7
	}
	if (this.nome in operadores && this.args.length == 1) {
		if (this.nome == "factorial")
			return this.args[0]+"!"
		if (this.nome == "%")
			return this.args[0]+"%"
		return this.nome+this.args[0]
	}
	if (this.nome in operadores2 && this.args.length == 2) {
		a = unbox(this.args[0])
		b = unbox(this.args[1])
		if (a instanceof Funcao && ((a.nome in operadores && a.args.length == 1)
			|| (a.nome in operadores2 && a.args.length == 2 && operadores2[a.nome]>operadores2[this.nome])))
			a = "("+this.args[0]+")"
		else
			a = String(this.args[0])
		if (b instanceof Funcao && ((b.nome in operadores && b.args.length == 1)
			|| (b.nome in operadores2 && b.args.length == 2 && operadores2[b.nome]>operadores2[this.nome])))
			b = "("+this.args[1]+")"
		else
			b = String(this.args[1])
		return a+this.nome+b
	}
	return this.nome+"("+this.args.join(", ")+")"
}

// Executa uma função
Funcao.prototype.executar = function (vars) {
	var retorno, funcao, copia
	if (this.nome in Funcao.funcoes) {
		funcao = Funcao.funcoes[this.nome]
		if (!funcao.dimVariavel && funcao.dim != this.args.length)
			throw "Quantidade inválida de parâmetros para "+this.nome+", recebido "+this.args.length+" e esperado "+funcao.dim
		if (!funcao.entradaPura)
			copia = new Funcao(this.nome, this.args.map(function (x) {
				if (ePuro(x))
					return x.clonar()
				return executar(x, vars)
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
			if (ePuro(x))
				return x.clonar()
			return executar(x, vars)
		}))
}

// Executa uma expressão no escopo atual
Funcao.prototype.executarNoEscopo = function (obj, subvars) {
	if (subvars)
		return executar(obj, this.escopo.concat(subvars))
	else
		return executar(obj, this.escopo)
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

// Segue os caminhos das variáveis até a condição ser atingida
// Retorna a variável cujo conteúdo bateu com a condição (ou quando está indefinida)
// Retorna null caso no caminho não se ache nada
Funcao.prototype.acharVariavel = function(expressao, condicao) {
	var abertas = [], valor
	while ((expressao = unbox(expressao)) instanceof Variavel) {
		if (abertas.indexOf(expressao.nome) == -1) {
			abertas.push(expressao.nome)
			valor = expressao.getDireto(this.escopo)
			if (valor === null || condicao(valor))
				return expressao
			expressao = valor
		} else
			return null
	}
	return null
}
