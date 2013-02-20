// Funções que são operadores
Funcao.registrar("+", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a))
			return a
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return somar(a, b)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
Funcao.registrar("-", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a))
			return subtrair(new Fracao(0, 1), a)
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return subtrair(a, b)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
Funcao.registrar("*", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return multiplicar(a, b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("/", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return dividir(a, b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("%", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a))
			return dividir(a, new Fracao(100, 1))
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return modulo(a, b)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
Funcao.registrar("^", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return pow(a, b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("factorial", "factorial(n)\nRetorna o resultado de n*(n-1)*...*1", function (a) {
	var fact = function (n) {
		return n==0 ? new Fracao(1, 1) : multiplicar(new Fracao(n, 1), fact(n-1))
	}
	if (eNumerico(a)) {
		if (eIntSeguro(a) && a>=0 && a<1000)
			return fact(a)
	} else if (eDeterminado(a))
		throw 0
}, true)
Funcao.registrar("=", "", function (a, b) {
	var that = this
	var definir = function (a, b) {
		var retorno, i, len, params = [], temp, funcao
		a = unbox(a)
		if (a instanceof Variavel) {
			retorno = Expressao.ePuro(b) ? b.clonar() : that.executarNoEscopo(b)
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
			retorno = Expressao.ePuro(b) ? b.clonar() : that.executarNoEscopo(b, params)
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
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("!=", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIgual(a, b) ? 0 : 1, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("&&", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eZero(a) || eZero(b) ? 0 : 1, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("||", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eZero(a) && eZero(b) ? 0 : 1, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)

