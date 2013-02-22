// Funções para listas e vetores
Funcao.registrar("[]", "", function (lista, pos) {
	if (lista instanceof Lista || lista instanceof Vetor)
		if (eNumerico(pos)) {
			pos = getNum(pos)
			if (eIntSeguro(pos) && pos >=0 && pos < lista.expressoes.length)
				return lista.expressoes[pos]
			else
				throw 0
		} else if (eDeterminado(pos))
			throw 0
	else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("for", "for(variavel, inicio, fim, expressao)\nRetorna uma lista dos valores da expressão executada para os diferentes valores inteiros da variável entre o início e fim (incluindo extremos)", function (variavel, inicio, fim, expressao) {
	var lista, i, antes
	
	this.args[0] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	this.args[1] = inicio = this.executarNoEscopo(inicio)
	this.args[2] = fim = this.executarNoEscopo(fim)
	
	variavel = variavel.nome
	if (!Expressao.ePuro(expressao))
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
	var retorno, i
	lista = unbox(lista)
	if (lista instanceof Lista) {
		retorno = new Lista
		for (i=0; i<lista.expressoes.length; i++)
			if (!eNumerico(unbox(lista.expressoes[i])))
				return
		return retorno
	} else if (eDeterminado(lista))
		throw 0
}, false, true)

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
			retorno.expressoes.push(this.executarNoEscopo(new Funcao("-", [lista.expressoes[i+1], lista.expressoes[i]])))
		return retorno
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("sum", "sum(lista)\nRetorna a soma de todos os elementos da lista", function (lista) {
	var retorno, i
	if (lista instanceof Lista) {
		retorno = new Fracao(0, 1)
		for (i=0; i<lista.expressoes.length; i++)
			retorno = this.executarNoEscopo(new Funcao("+", [retorno, lista.expressoes[i]]))
		return retorno
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("avg", "avg(lista)\nRetorna a média dos elementos da lista", function (lista) {
	var soma, i
	if (lista instanceof Lista) {
		soma = new Fracao(0, 1)
		for (i=0; i<lista.expressoes.length; i++)
			soma = this.executarNoEscopo(new Funcao("+", [soma, lista.expressoes[i]]))
		return this.executarNoEscopo(new Funcao("/", [soma, new Fracao(lista.expressoes.length, 1)]))
	} else if (eDeterminado(lista))
		throw 0
})

Funcao.registrar("product", "product(lista)\nRetorna o produto de todos os elementos da lista", function (lista) {
	var retorno, i
	if (lista instanceof Lista) {
		retorno = new Fracao(1, 1)
		for (i=0; i<lista.expressoes.length; i++)
			retorno = this.executarNoEscopo(new Funcao("*", [retorno, lista.expressoes[i]]))
		return retorno
	} else if (eDeterminado(lista))
		throw 0
})
