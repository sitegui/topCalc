// Funções que são operadores
Funcao.registrar("+", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a) || a instanceof Vetor || a instanceof Matriz)
			return a
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return somar(a, b)
		else if (a instanceof Vetor && b instanceof Vetor)
			return a.somar(b)
		else if (a instanceof Matriz && b instanceof Matriz)
			return a.somar(b)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
Funcao.registrar("-", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a))
			return subtrair(new Fracao(0, 1), a)
		else if (a instanceof Vetor || a instanceof Matriz)
			return a.oposto()
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return subtrair(a, b)
		else if (a instanceof Vetor && b instanceof Vetor)
			return a.subtrair(b)
		else if (a instanceof Matriz && b instanceof Matriz)
			return a.subtrair(b)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
Funcao.registrar("*", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return multiplicar(a, b)
	else if (a instanceof Vetor && eNumerico(b))
		return a.multiplicar(b)
	else if (b instanceof Vetor && eNumerico(a))
		return b.multiplicar(a)
	else if (a instanceof Vetor && b instanceof Vetor)
		return Funcao.executar("dot", [a,b])
	else if (a instanceof Matriz && b instanceof Matriz)
		return a.multiplicar(b)
	else if (a instanceof Matriz && eNumerico(b))
		return a.multiplicarNum(b)
	else if (b instanceof Matriz && eNumerico(a))
		return b.multiplicarNum(a)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
// TODO: matriz/matriz
Funcao.registrar("/", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return dividir(a, b)
	else if (a instanceof Vetor && eNumerico(b))
		return a.dividir(b)
	else if (b instanceof Vetor && eNumerico(a))
		return b.dividir(a)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("%", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a))
			return dividir(a, new Fracao(100, 1))
		else if (a instanceof Vetor)
			return a.dividir(new Fracao(100, 1))
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return modulo(a, b)
		else if (a instanceof Vetor && eNumerico(b))
			return a.modulo(b)
		else if (b instanceof Vetor && eNumerico(a))
			return b.modulo(a)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
// TODO: matriz^n
Funcao.registrar("^", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return pow(a, b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("factorial", "factorial(n)\nRetorna o resultado de n*(n-1)*...*1", function (a) {
	var r, i
	if (eNumerico(a)) {
		if (eIntSeguro(a) && a>=0 && a<1e6) {
			r = new Fracao(1, 1)
			for (i=2; i<=a; i++)
				r = multiplicar(r, new Fracao(i, 1))
			return r
		}
	} else if (eDeterminado(a))
		throw 0
}, true)
Funcao.registrar("=", "", function (a, b) {
	var that = this
	var definir = function (a, b) {
		var retorno, i, len, params = [], temp, funcao
		a = unbox(a)
		if (a instanceof Variavel) {
			retorno = ePuro(b) ? b.clonar() : that.executarNoEscopo(b)
			Variavel.valores[a.nome] = retorno
		} else if (a instanceof Funcao) {
			len = a.args.length
			
			for (i=0; i<len; i++) {
				temp = unbox(a.args[i])
				if (temp instanceof Variavel)
					params.push(temp.nome)
				else
					throw "Parâmetro inválido na declaração da função"
			}
			retorno = ePuro(b) ? b.clonar() : that.executarNoEscopo(b, params)
			funcao = Funcao.gerar(params, retorno)
			funcao.definicao = String(that)
			Funcao.funcoes[a.nome] = funcao
		} else
			throw "Definição inválida"
		return retorno.clonar()
	}
	var i, len, retorno
	
	if (a instanceof Lista) {
		len = a.expressoes.length
		retorno = new Lista
		if (b instanceof Lista) {
			if (b.expressoes.length != len)
				throw "Tamanhos incompatíveis de listas"
			for (i=0; i<len; i++)
				retorno.expressoes.push(definir(a.expressoes[i], b.expressoes[i]))
		} else {
			for (i=0; i<len; i++)
				retorno.expressoes.push(definir(a.expressoes[i], b))
		}
	} else
		retorno = definir(a, b)
	
	return retorno
}, false, true)

Funcao.registrar("getAt", "getAt(lista, i) ou getAt(matriz, i, j)\nRetorna o elemento na posição de uma lista ou matriz", function (lista, i, j) {
	if (lista instanceof Lista || lista instanceof Vetor) {
		if (j !== undefined)
			throw 0
		if (eNumerico(i)) {
			i = getNum(i)
			if (eIntSeguro(i) && i > 0 && i <= lista.expressoes.length)
				return lista.expressoes[i-1]
			throw 0
		} else if (eDeterminado(i))
			throw 0
	} else if (lista instanceof Matriz) {
		if (j === undefined)
			throw 0
		if (eNumerico(i) && eNumerico(j)) {
			i = getNum(i)
			j = getNum(j)
			if (eIntSeguro(i) && i > 0 && i <= lista.linhas && j > 0 && j <= lista.colunas)
				return lista.get(i, j)
			throw 0
		} else if (eDeterminado(i) && eDeterminado(j))
			throw 0
	} else if (eNumerico(lista)) {
		// Trata o caso ambíguo de pi[2] = pi*[2]
		if (j === undefined)
			return Funcao.executar("*", [lista, new Vetor([i])])
		return Funcao.executar("*", [lista, new Vetor([i, j	])])
	} else if (eDeterminado(lista))
		throw 0
}, false, false, true)

// Funções lógicas
Funcao.registrar("!", "", function (a) {
	if (eNumerico(a))
		return new Fracao(eZero(a) ? 1 : 0, 1)
	else if (eDeterminado(a))
		throw 0
}, true)
Funcao.registrar("<", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(!eIgual(a, b) && eIdentico(max(a, b), b) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar(">", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(!eIgual(a, b) && eIdentico(max(a, b), a) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("<=", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIdentico(max(a, b), b) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar(">=", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIdentico(max(a, b), a) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("==", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIgual(a, b) ? 1 : 0, 1)
	else if (a instanceof Vetor && b instanceof Vetor)
		return a.igual(b)
	else if (a instanceof Matriz && b instanceof Matriz)
		return a.igual(b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("!=", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIgual(a, b) ? 0 : 1, 1)
	else if (a instanceof Vetor && b instanceof Vetor)
		return a.diferente(b)
	else if (a instanceof Matriz && b instanceof Matriz)
		return a.diferente(b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("&&", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eZero(a) || eZero(b) ? 0 : 1, 1)
	else if ((eNumerico(a) && eZero(a)) || (eNumerico(b) && eZero(b)))
		return new Fracao(0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("||", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eZero(a) && eZero(b) ? 0 : 1, 1)
	else if ((eNumerico(a) && !eZero(a)) || (eNumerico(b) && !eZero(b)))
		return new Fracao(1, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)

