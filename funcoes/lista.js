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
		antes = Variavel.valores[variavel]
		
		for (i=inicio; i<=fim; i++) {
			Variavel.valores[variavel] = new Fracao(i, 1)
			lista.expressoes.push(this.executarNoEscopo(expressao))
		}
		
		if (antes === undefined)
			delete Variavel.valores[variavel]
		else
			Variavel.valores[variavel] = antes
		
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

Funcao.registrar("sort", "sort(lista)\nOrdena uma lista numérica", function (lista) {
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

Funcao.registrar("juntar", "juntar(lista1, lista2, ...)\nRetorna a lista resultante da junção dos argumentos", function () {
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

Funcao.registrar("fatiar", "fatiar(lista, inicio) ou fatiar(lista, inicio, tamanho)\nRetorna uma fatia da lista", function (lista, inicio, tamanho) {
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
		return new Lista(lista.expressoes.slice(inicio-1, inicio+tamanho))
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

Funcao.registrar("reverter", "reverter(lista)\nRetorna a lista invertida", function (lista) {
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

Funcao.registrar("soma", "soma(n1, n2, ...)\nRetorna a soma de todos os elementos", function () {
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

Funcao.registrar("media", "media(n1, n2, ...)\nRetorna a média de todos os elementos", function () {
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

Funcao.registrar("produto", "produto(n1, n2, ...)\nRetorna o produto de todos os elementos", function () {
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

Funcao.registrar("todos", "todos(lista, funcao)\nRetorna zero se funcao(lista[i]) retorna zero para algum i", function (lista, funcao) {
	var i, cada, retorno
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = funcao = unbox(funcao)
	if (lista instanceof Lista && funcao instanceof Variavel) {
		retorno = null
		for (i=0; i<lista.expressoes.length; i++) {
			cada = Funcao.executar(funcao.nome, [lista.expressoes[i]])
			if (eNumerico(cada))
				if (eZero(cada))
					return new Fracao(0, 1)
				else
					continue
			retorno = retorno===null ? cada : Funcao.executar("&&", [retorno, cada])
		}
		if (retorno === null)
			return new Fracao(1, 1)
		return retorno
	} else if (eDeterminado(lista) && eDeterminado(funcao))
		throw 0
}, false, true)

Funcao.registrar("algum", "algum(lista, funcao)\nRetorna zero se funcao(lista[i]) não retorna zero para todo i", function (lista, funcao) {
	var i, cada, retorno
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = funcao = unbox(funcao)
	if (lista instanceof Lista && funcao instanceof Variavel) {
		retorno = null
		for (i=0; i<lista.expressoes.length; i++) {
			cada = Funcao.executar(funcao.nome, [lista.expressoes[i]])
			if (eNumerico(cada))
				if (!eZero(cada))
					return new Fracao(1, 1)
				else
					continue
			retorno = retorno===null ? cada : Funcao.executar("||", [retorno, cada])
		}
		if (retorno === null)
			return new Fracao(0, 1)
		return retorno
	} else if (eDeterminado(lista) && eDeterminado(funcao))
		throw 0
}, false, true)

Funcao.registrar("filtrar", "filtrar(lista, funcao)\nRetorna uma lista somente com os elementos que funcao(lista[i]) é não nulo", function (lista, funcao) {
	var i, cada, retorno
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = funcao = unbox(funcao)
	if (lista instanceof Lista && funcao instanceof Variavel) {
		retorno = new Lista
		for (i=0; i<lista.expressoes.length; i++) {
			cada = Funcao.executar(funcao.nome, [lista.expressoes[i]])
			if (!eNumerico(cada))
				return
			if (!eZero(cada))
				retorno.expressoes.push(lista.expressoes[i])
		}
		return retorno
	} else if (eDeterminado(lista) && eDeterminado(funcao))
		throw 0
}, false, true)

Funcao.registrar("aplicar", "aplicar(lista, funcao)\nRetorna uma lista com os retornos da função aplicada sobre os elementos da lista", function (lista, funcao) {
	var i, retorno
	this.args[0] = lista = this.executarNoEscopo(lista)
	this.args[1] = funcao = unbox(funcao)
	if (lista instanceof Lista && funcao instanceof Variavel) {
		retorno = new Lista
		for (i=0; i<lista.expressoes.length; i++)
			retorno.expressoes.push(Funcao.executar(funcao.nome, [lista.expressoes[i]]))
		return retorno
	} else if (eDeterminado(lista) && eDeterminado(funcao))
		throw 0
}, false, true)
