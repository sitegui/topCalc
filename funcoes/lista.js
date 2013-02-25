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
}, false, true)

Funcao.registrar("length", "length(lista)\nRetorna o tamanho de uma lista ou vetor", function (lista) {
	if (lista instanceof Lista || lista instanceof Vetor)
		return lista.expressoes.length
	else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("pop", "pop(lista)\nRemove o último termo da lista ou vetor e o retorna", function (lista) {
	var variavel = this.acharVariavel(lista, function (valor) {
		return valor instanceof Lista || valor instanceof Vetor
	})
	
	if (variavel !== null) {
		// Achou uma variável ainda indefinida ou com uma lista dentro
		this.args[0] = variavel
		lista = this.getVariavelDireto(variavel)
		if (lista === null)
			// Variável indefinida
			return
		else if (lista.expressoes.length > 0)
			// Variável definida e com lista não vazia
			return Variavel.valores[variavel.nome].expressoes.pop()
		else
			// Variável definida e com lista vazia
			throw 0
	} else {
		// O argumento não é um valor puro (não referenciado por uma variável)
		this.args[0] = lista = this.executarNoEscopo(lista)
		if (lista instanceof Lista || lista instanceof Vetor) {
			if (lista.expressoes.length > 0)
				return lista.expressoes.pop()
			else
				throw 0
		} else if (eDeterminado(lista))
			throw 0
	}
}, false, true)

Funcao.registrar("shift", "shift(lista)\nRemove o primeiro termo da lista ou vetor e o retorna", function (lista) {
	var variavel = this.acharVariavel(lista, function (valor) {
		return valor instanceof Lista || valor instanceof Vetor
	})
	
	if (variavel !== null) {
		// Achou uma variável ainda indefinida ou com uma lista dentro
		this.args[0] = variavel
		lista = this.getVariavelDireto(variavel)
		if (lista === null)
			// Variável indefinida
			return
		else if (lista.expressoes.length > 0)
			// Variável definida e com lista não vazia
			return Variavel.valores[variavel.nome].expressoes.shift()
		else
			// Variável definida e com lista vazia
			throw 0
	} else {
		// O argumento não é um valor puro (não referenciado por uma variável)
		this.args[0] = lista = this.executarNoEscopo(lista)
		if (lista instanceof Lista || lista instanceof Vetor) {
			if (lista.expressoes.length > 0)
				return lista.expressoes.shift()
			else
				throw 0
		} else if (eDeterminado(lista))
			throw 0
	}
}, false, true)

Funcao.registrar("sort", "sort(lista)\nOrdena uma lista numérica", function (lista) {
	var args
	lista = unbox(lista)
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
}, false)

Funcao.registrar("push", "push(lista, a1, a2, ...)\nAdiciona os valores na lista e retorna seu novo tamanho", function (lista /*, ...args*/) {
	var variavel, valor
	
	variavel = this.acharVariavel(lista, function (x) {
		return x instanceof Lista || x instanceof Vetor
	})
	
	if (variavel === null)
		throw 0
	
	this.args = [variavel].concat(this.args.slice(1).map(this.executarNoEscopo, this))
	
	if (valor = this.getVariavelDireto(variavel))
		return valor.expressoes.push.apply(valor.expressoes, this.args.slice(1))
}, false, true, true)

Funcao.registrar("reverse", "reverse(lista)\nReverte uma lista e a retorna", function (lista) {
	var variavel, valor
	variavel = this.acharVariavel(lista, function (x) {
		return x instanceof Lista
	})
	if (variavel === null) {
		this.args[0] = lista = this.executarNoEscopo(lista)
		if (lista instanceof Lista) {
			lista.expressoes.reverse()
			return lista
		} else if (eDefinido(lista))
			throw 0
	} else {
		this.args[0] = variavel
		if (valor = this.getVariavelDireto(variavel)) {
			valor.expressoes.reverse()
			return valor
		}
	}
}, false, true)

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
