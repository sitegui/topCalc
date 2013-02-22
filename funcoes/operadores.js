// Funções que são operadores
Funcao.registrar("+", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a) || a instanceof Vetor)
			return a
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return somar(a, b)
		else if (a instanceof Vetor && b instanceof Vetor)
			return a.somar(b, this.escopo)
		else if (eDeterminado(a) && eDeterminado(b))
			throw 0
	}
}, true, false, true)
Funcao.registrar("-", "", function (a, b) {
	if (b === undefined) {
		if (eNumerico(a))
			return subtrair(new Fracao(0, 1), a)
		else if (a instanceof Vetor)
			return a.oposto(this.escopo)
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return subtrair(a, b)
		else if (a instanceof Vetor && b instanceof Vetor)
			return a.subtrair(b, this.escopo)
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
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
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
			return a.dividir(new Fracao(100, 1), this.escopo)
		else if (eDeterminado(a))
			throw 0
	} else {
		if (eNumerico(a) && eNumerico(b))
			return modulo(a, b)
		else if (a instanceof Vetor && eNumerico(b))
			return a.modulo(b, this.escopo)
		else if (b instanceof Vetor && eNumerico(a))
			return b.modulo(a, this.escopo)
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
	else if (a instanceof Vetor && b instanceof Vetor)
		return a.igual(b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("!=", "", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIgual(a, b) ? 0 : 1, 1)
	else if (a instanceof Vetor && b instanceof Vetor)
		return a.diferente(b)
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

