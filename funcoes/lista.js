"use strict";

// Funções para listas

Funcao.registrar("for", "for(variavel, inicio, fim, expressao)\nRetorna uma lista dos valores da expressão executada para os diferentes valores inteiros da variável entre o início e fim (incluindo extremos)", function (variavel, inicio, fim, expressao) {
	var lista, i, antes
	
	this.args[0] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	this.args[1] = inicio = this.executarNoEscopo(inicio)
	this.args[2] = fim = this.executarNoEscopo(fim)
	
	variavel = variavel.nome
	if (!ePuro(expressao))
		this.args[3] = expressao = this.executarNoEscopo(expressao, [variavel])
	
	if (eNumerico(inicio) && eNumerico(fim)) {
		inicio = getNum(inicio)
		fim = getNum(fim)
		if (!eIntSeguro(inicio) || !eIntSeguro(fim))
			throw 0
		lista = new Lista
		antes = Variavel.backup(variavel)
		
		for (i=inicio; i<=fim; i++) {
			Variavel.valores[variavel] = new Fracao(i, 1)
			lista.expressoes.push(this.executarNoEscopo(expressao))
		}
		
		Variavel.restaurar(antes)
		return lista
	} else if (eDeterminado(inicio) && eDeterminado(fim))
		throw 0
}, true, true)

Funcao.registrar("length", "length(lista) ou length(matriz)\nRetorna o tamanho de uma lista/vetor ou matriz", function (lista) {
	if (lista instanceof Lista || lista instanceof Vetor)
		return lista.expressoes.length
	else if (lista instanceof Matriz)
		return new Lista([new Fracao(lista.linhas, 1), new Fracao(lista.colunas, 1)])
	else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("pop", "pop(lista)\nRetorna o último termo da lista", function (lista) {
	if (lista instanceof Lista) {
		if (lista.expressoes.length)
			return lista.expressoes[lista.expressoes.length-1]
		throw 0
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("push", "push(lista, a1, a2, ...)\nRetorna a lista com os valores adicionados no fim", function (lista /*, ...args*/) {
	var retorno
	if (lista instanceof Lista) {
		retorno = lista.expressoes.clonar()
		retorno.push.apply(retorno, [].slice.call(arguments, 1))
		return new Lista(retorno)
	} else if (eDeterminado(lista))
		throw 0
}, false, false, true)

Funcao.registrar("shift", "shift(lista)\nRetorna o primeiro termo da lista", function (lista) {
	if (lista instanceof Lista) {
		if (lista.expressoes.length)
			return lista.expressoes[0]
		throw 0
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("unshift", "unshift(lista, a1, a2, ...)\nAdiciona os termos no início da lista", function (lista) {
	var retorno
	if (lista instanceof Lista) {
		retorno = lista.expressoes.clonar()
		retorno.unshift.apply(retorno, [].slice.call(arguments, 1))
		return new Lista(retorno)
	} else if (eDeterminado(lista))
		throw 0
}, false, false, true)

Funcao.registrar("sort", "sort(lista)\nOrdena uma lista numérica do menor para o maior", function (lista) {
	var args
	if (lista instanceof Lista) {
		args = lista.expressoes.map(unbox)
		if (args.every(eNumerico)) {
			args.sort(function (a, b) {
				return eIdentico(max(a, b), a) ? 1 : -1
			})
			return new Lista(args)
		}
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("rsort", "rsort(lista)\nOrdena uma lista numérica do maior para o menor", function (lista) {
	var args
	if (lista instanceof Lista) {
		args = lista.expressoes.map(unbox)
		if (args.every(eNumerico)) {
			args.sort(function (a, b) {
				return eIdentico(min(a, b), a) ? 1 : -1
			})
			return new Lista(args)
		}
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("concat", "concat(lista1, lista2, ...)\nRetorna a lista resultante da junção dos argumentos", function () {
	var args, lista, determinado
	args = [].slice.call(arguments, 0)
	lista = args.every(function (x) {
		return x instanceof Lista
	})
	determinado = args.some(function (x) {
		return !(x instanceof Lista) && eDeterminado(x)
	})
	if (lista) {
		return new Lista([].concat.apply([], args.map(function (x) {
			return x.expressoes
		})))
	} else if (determinado)
		throw 0
}, false, false, true)

Funcao.registrar("slice", "slice(lista, inicio) ou slice(lista, inicio, tamanho)\nRetorna uma fatia da lista", function (lista, inicio, tamanho) {
	if (arguments.length < 2 || arguments.length > 3)
		throw 0
	if (lista instanceof Lista && eNumerico(inicio) && (tamanho === undefined || eNumerico(tamanho))) {
		inicio = getNum(inicio)
		tamanho = tamanho===undefined ? lista.expressoes.length : getNum(tamanho)
		if (!eIntSeguro(inicio) || inicio == 0 || !eIntSeguro(tamanho))
			throw 0
		if (inicio < 0)
			inicio += lista.expressoes.length+1
		if (inicio < 0)
			inicio = 0
		if (tamanho < 0)
			tamanho += lista.expressoes.length-inicio
		return new Lista(lista.expressoes.slice(inicio-1, inicio+tamanho-1))
	} else if (eDeterminado(lista) && eDeterminado(inicio) && (tamanho === undefined || eDeterminado(tamanho)))
		throw 0
	
	if (lista instanceof Lista && eNumerico(inicio) && eNumerico(tamanho)) {
		inicio = getNum(inicio)
		tamanho = getNum(tamanho)
		if (!eIntSeguro(inicio) || !eIntSeguro(tamanho))
			throw 0
		
	} else if (eDeterminado(lista) && eDeterminado(inicio) && eDeterminado(tamanho))
		throw 0
}, false, false, true)

Funcao.registrar("reverse", "reverse(lista)\nRetorna a lista invertida", function (lista) {
	if (lista instanceof Lista)
		return new Lista(lista.expressoes.clonar().reverse())
	else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("delta", "delta(lista)\nRetorna uma lista com as diferenças entre os elementos", function (lista) {
	var retorno, i
	if (lista instanceof Lista && lista.expressoes.length > 0) {
		retorno = new Lista
		for (i=0; i<lista.expressoes.length-1; i++)
			retorno.expressoes.push(Funcao.executar("-", [lista.expressoes[i+1], lista.expressoes[i]]))
		return retorno
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("sum", "sum(n1, n2, ...)\nRetorna a soma de todos os elementos", function () {
	var args, i, r
	args = Funcao.getFlatArgs(arguments)
	if (args.every(eNumerico)) {
		r = new Fracao(0, 1)
		for (i=0; i<args.length; i++)
			r = Funcao.executar("+", [r, args[i]])
		return r
	} else if (args.every(eDeterminado))
		throw 0
}, false, false, true)

Funcao.registrar("avg", "avg(n1, n2, ...)\nRetorna a média de todos os elementos", function () {
	var args, i, r
	args = Funcao.getFlatArgs(arguments)
	if (args.every(eNumerico)) {
		r = new Fracao(0, 1)
		for (i=0; i<args.length; i++)
			r = Funcao.executar("+", [r, args[i]])
		return Funcao.executar("/", [r, new Fracao(args.length, 1)])
	} else if (args.every(eDeterminado))
		throw 0
}, false, false, true)

Funcao.registrar("product", "product(n1, n2, ...)\nRetorna o produto de todos os elementos", function () {
	var args, i, r
	args = Funcao.getFlatArgs(arguments)
	if (args.every(eNumerico)) {
		r = new Fracao(1, 1)
		for (i=0; i<args.length; i++)
			r = Funcao.executar("*", [r, args[i]])
		return r
	} else if (args.every(eDeterminado))
		throw 0
}, false, false, true)

Funcao.registrar("every", "every(lista, variavel, expressao)\nRetorna zero se expressao avalia para zero para algum elemento", function (lista, variavel, expressao) {
	var i, cada, retorno, antes
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	if (!ePuro(expressao))
		this.args[2] = expressao = this.executarNoEscopo(expressao, [variavel])
	if (lista instanceof Lista) {
		retorno = null
		antes = Variavel.backup(variavel)
		for (i=0; i<lista.expressoes.length; i++) {
			Variavel.valores[variavel] = lista.expressoes[i]
			cada = this.executarNoEscopo(expressao)
			if (eNumerico(cada))
				if (eZero(cada))
					return new Fracao(0, 1)
				else
					continue
			retorno = retorno===null ? cada : Funcao.executar("&&", [retorno, cada])
		}
		Variavel.restaurar(antes)
		if (retorno === null)
			return new Fracao(1, 1)
		return retorno
	} else if (eDeterminado(lista))
		throw 0
}, false, true)

Funcao.registrar("some", "some(lista, variavel, expressao)\nRetorna zero se expressao não avalia para zero para todos os elementos", function (lista, variavel, expressao) {
	var i, cada, retorno, antes
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	if (!ePuro(expressao))
		this.args[2] = expressao = this.executarNoEscopo(expressao, [variavel])
	if (lista instanceof Lista) {
		retorno = null
		antes = Variavel.backup(variavel)
		for (i=0; i<lista.expressoes.length; i++) {
			Variavel.valores[variavel] = lista.expressoes[i]
			cada = this.executarNoEscopo(expressao)
			if (eNumerico(cada))
				if (!eZero(cada))
					return new Fracao(1, 1)
				else
					continue
			retorno = retorno===null ? cada : Funcao.executar("||", [retorno, cada])
		}
		Variavel.restaurar(antes)
		if (retorno === null)
			return new Fracao(0, 1)
		return retorno
	} else if (eDeterminado(lista))
		throw 0
}, false, true)

Funcao.registrar("filter", "filter(lista, variavel, expressao)\nRetorna uma lista somente com os elementos que expressao não avalia como nulo", function (lista, variavel, expressao) {
	var i, cada, retorno, antes
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	if (!ePuro(expressao))
		this.args[2] = expressao = this.executarNoEscopo(expressao, [variavel])
	if (lista instanceof Lista) {
		retorno = new Lista
		antes = Variavel.backup(variavel)
		for (i=0; i<lista.expressoes.length; i++) {
			Variavel.valores[variavel] = lista.expressoes[i]
			cada = this.executarNoEscopo(expressao)
			if (!eNumerico(cada))
				return
			if (!eZero(cada))
				retorno.expressoes.push(lista.expressoes[i])
		}
		Variavel.restaurar(antes)
		return retorno
	} else if (eDeterminado(lista))
		throw 0
}, false, true)

Funcao.registrar("map", "map(lista, variavel, expressao)\nRetorna uma lista com os valores de expressao avaliado sobre cada elemento da lista", function (lista, variavel, expressao) {
	var i, retorno, antes
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	if (!ePuro(expressao))
		this.args[2] = expressao = this.executarNoEscopo(expressao, [variavel])
	if (lista instanceof Lista) {
		retorno = new Lista
		antes = Variavel.backup(variavel)
		for (i=0; i<lista.expressoes.length; i++) {
			Variavel.valores[variavel] = lista.expressoes[i]
			retorno.expressoes.push(this.executarNoEscopo(expressao))
		}
		Variavel.restaurar(antes)
		return retorno
	} else if (eDeterminado(lista))
		throw 0
}, false, true)

Funcao.registrar("reduce", "reduce(lista, varA, varB, expressao) ou reduce(lista, varA, varB, expressao, inicio)\nAplica uma função sobre um acumulador e cada valor da lista para reduzir a um único valor", function (lista, varA, varB, expressao, inicio) {
	var i, ini, antes
	if (arguments.length < 4 || arguments.length > 5)
		throw 0
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = varA = unbox(varA)
	this.args[2] = varB = unbox(varB)
	if (!(varA instanceof Variavel) || !(varB instanceof Variavel))
		throw 0
	varA = varA.nome
	varB = varB.nome
	if (!ePuro(expressao))
		this.args[3] = expressao = this.executarNoEscopo(expressao, [varA, varB])
	if (inicio !== undefined)
		this.args[4] = inicio = this.executarNoEscopo(inicio)
	if (lista instanceof Lista) {
		ini = inicio==undefined ? 1 : 0
		if (inicio === undefined)
			if (lista.expressoes.length)
				inicio = lista.expressoes[0]
			else
				throw 0
		antes = Variavel.backup([varA, varB])
		for (i=ini; i<lista.expressoes.length; i++) {
			Variavel.valores[varA] = inicio
			Variavel.valores[varB] = lista.expressoes[i]
			inicio = this.executarNoEscopo(expressao)
		}
		Variavel.restaurar(antes)
		return inicio
	} else if (eDeterminado(lista))
		throw 0
}, false, true, true)

Funcao.registrar("reduceRight", "reduceRight(lista, varA, varB, expressao) ou reduceRight(lista, varA, varB, expressao, inicio)\nAplica uma função sobre um acumulador e cada valor da lista para reduzir a um único valor", function (lista, varA, varB, expressao, inicio) {
	var i, ini, antes
	if (arguments.length < 4 || arguments.length > 5)
		throw 0
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = varA = unbox(varA)
	this.args[2] = varB = unbox(varB)
	if (!(varA instanceof Variavel) || !(varB instanceof Variavel))
		throw 0
	varA = varA.nome
	varB = varB.nome
	if (!ePuro(expressao))
		this.args[3] = expressao = this.executarNoEscopo(expressao, [varA, varB])
	if (inicio !== undefined)
		this.args[4] = inicio = this.executarNoEscopo(inicio)
	if (lista instanceof Lista) {
		ini = inicio==undefined ? lista.expressoes.length-2 : lista.expressoes.length-1
		if (inicio === undefined)
			if (lista.expressoes.length)
				inicio = lista.expressoes[lista.expressoes.length-1]
			else
				throw 0
		antes = Variavel.backup([varA, varB])
		for (i=ini; i>=0; i--) {
			Variavel.valores[varA] = inicio
			Variavel.valores[varB] = lista.expressoes[i]
			inicio = this.executarNoEscopo(expressao)
		}
		Variavel.restaurar(antes)
		return inicio
	} else if (eDeterminado(lista))
		throw 0
}, false, true, true)
