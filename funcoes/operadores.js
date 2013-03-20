"use strict";

// Funções que são operadores
Funcao.registrar("+", "+a ou a+b\nRetorna o valor ou a soma de dois valores", function (a, b) {
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
Funcao.registrar("-", "-a ou a-b\nRetorna o oposto do valor ou a diferença entre dois valores", function (a, b) {
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
Funcao.registrar("*", "a*b\nRetorna o produto entre dois valores", function (a, b) {
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
	else if (a instanceof Matriz && b instanceof Vetor) {
		b = new Matriz(b.expressoes, 1)
		return new Vetor(a.multiplicar(b).expressoes)
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("/", "a/b\nRetorna a razão entre dois valores", function (a, b) {
	var info
	if (eNumerico(a) && eNumerico(b))
		return dividir(a, b)
	else if (a instanceof Vetor && eNumerico(b))
		return a.dividir(b)
	else if (b instanceof Vetor && eNumerico(a))
		return b.dividir(a)
	else if (a instanceof Matriz && b instanceof Matriz) {
		if (b.linhas != b.colunas)
			throw 0
		info = {}
		b = Matriz.justapor(b, Matriz.identidade(b.linhas))
		b = b.eliminar(true, info)
		if (!info.sucesso)
			throw 0
		for (i=0; i<info.fatores.length; i++)
			if (!eNumerico(info.fatores[i]))
				Console.echoInfo("Assumindo "+info.fatores[i]+" não nulo")
		return a.multiplicar(b.separar(-b.linhas))
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("%", "a% ou a%b\nRetorna o valor em porcentagem ou o resto da divisão de um valor por outro", function (a, b) {
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
Funcao.registrar("^", "a^b\nRetorna um valor elevado a outro", function (a, b) {
	var retorno, i
	if (eNumerico(a) && eNumerico(b))
		return pow(a, b)
	else if (a instanceof Matriz && eNumerico(b)) {
		b = getNum(b)
		if (!eIntSeguro(b))
			throw 0
		if (a.linhas != a.colunas)
			throw 0
		retorno = Matriz.identidade(a.linhas)
		for (i=Math.abs(b); i>0; i--)
			retorno = retorno.multiplicar(a)
		if (b<0)
			return Funcao.executar("inverse", [retorno])
		return retorno
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("factorial", "n!\nRetorna o resultado de n*(n-1)*...*1", function (a) {
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
Funcao.registrar("=", "x='... ou f(x)='... ou 1_x=... ou {x,y}='... ou [x,y]='...\nDefine ou redefine uma variável, função ou unidade", function (a, b) {
	var that = this
	var definir = function (a, b) {
		var retorno, i, len, params = [], unidades = {}, temp, funcao
		a = unbox(a)
		if (a instanceof Variavel) {
			retorno = that.executarPuroNoEscopo(b)
			Variavel.valores[a.nome] = retorno
		} else if (a instanceof Funcao && a.nome == "_") {
			a.args[0] = unbox(a.args[0])
			a.args[1] = unbox(a.args[1])
			if (!(a.args[0] instanceof Fracao) || a.args[0].n != 1 || a.args[0].d != 1)
				throw "O valor tem de ser 1"
			if (!(a.args[1] instanceof Variavel))
				throw "A unidade deve ser simples"
			retorno = that.executarNoEscopo(b)
			if (!(retorno instanceof ValorComUnidade))
				throw "O valor deve ser associado a unidades"
			Unidade.unidades[a.args[1].nome] = [retorno.unidade.getBases(), multiplicar(retorno.valor, retorno.unidade.getFator())]
		} else if (a instanceof Funcao) {
			len = a.args.length
			
			for (i=0; i<len; i++) {
				temp = unbox(a.args[i])
				if (temp instanceof Funcao && temp.nome == "_" && temp.args[0] instanceof Variavel) {
					params.push(temp.args[0].nome)
					unidades[temp.args[0].nome] = Unidade.interpretar(temp.args[1])
				} else if (temp instanceof Variavel)
					params.push(temp.nome)
				else
					throw "Parâmetro inválido na declaração da função"
			}
			retorno = that.executarPuroNoEscopo(b, params)
			funcao = Funcao.gerar(params, unidades, retorno)
			funcao.definicao = String(that)
			Funcao.funcoes[a.nome] = funcao
		} else
			throw "Definição inválida"
		return retorno.clonar()
	}
	var i, len, retorno
	
	if (a instanceof Lista || a instanceof Vetor) {
		len = a.expressoes.length
		retorno = new a.constructor
		b = this.executarNoEscopo(b)
		if (b instanceof a.constructor) {
			if (b.expressoes.length != len)
				throw "Tamanhos incompatíveis"
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

Funcao.registrar("getAt", "lista[i] ou matriz[i, j]\nRetorna o elemento na posição de uma lista ou matriz", function (lista, i, j) {
	if (lista instanceof Lista || lista instanceof Vetor) {
		if (j !== undefined)
			throw 0
		if (eNumerico(i)) {
			i = getNum(i)
			if (eIntSeguro(i) && i > 0 && i <= lista.expressoes.length)
				return lista.expressoes[i-1]
			else if (eIntSeguro(i) && i < 0 && i >= -lista.expressoes.length)
				return lista.expressoes[lista.expressoes.length+i]
			throw 0
		} else if (eDeterminado(i))
			throw 0
	} else if (lista instanceof Matriz) {
		if (j === undefined)
			throw 0
		if (eNumerico(i) && eNumerico(j)) {
			i = getNum(i)
			j = getNum(j)
			if (i < 0)
				i += lista.linhas+1
			if (j < 0)
				j += lista.colunas+1
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

Funcao.registrar("_", "valor_unidade\nConverter o valor para a unidade desejada", function (valor, unidade) {
	this.args[0] = valor = this.executarNoEscopo(valor)
	if (!(unidade instanceof Unidade))
		unidade = Unidade.interpretar(unidade)
	
	if (eNumerico(valor)) {
		if (eInfinito(valor))
			return valor
		if (valor instanceof ValorComUnidade)
			return valor.converter(unidade)
		return new ValorComUnidade(valor, unidade)
	} else if (eDeterminado(valor))
		throw 0
}, true, true)

// Funções lógicas
Funcao.registrar("!", "!a\nRetorna 1 para valores nulos, 0 para o restante", function (a) {
	if (eNumerico(a))
		return new Fracao(eZero(a) ? 1 : 0, 1)
	else if (eDeterminado(a))
		throw 0
}, true)
Funcao.registrar("<", "a<b\nRetorna se a é menor que b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(!eIgual(a, b) && eIdentico(max(a, b), b) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar(">", "a>b\nRetorna se a é maior que b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(!eIgual(a, b) && eIdentico(max(a, b), a) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("<=", "a<=b\nRetorna se a é menor ou igual a b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIdentico(max(a, b), b) || eIgual(a, b) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar(">=", "a>=b\nRetorna se a é maior ou igual a b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIdentico(max(a, b), a) || eIgual(a, b) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("==", "a==b\nRetorna se a tem o mesmo valor de b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIgual(a, b) ? 1 : 0, 1)
	else if (a instanceof Vetor && b instanceof Vetor)
		return a.igual(b)
	else if (a instanceof Matriz && b instanceof Matriz)
		return a.igual(b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("!=", "a!=b\nRetorna se a não tem o mesmo valor de b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIgual(a, b) ? 0 : 1, 1)
	else if (a instanceof Vetor && b instanceof Vetor)
		return a.diferente(b)
	else if (a instanceof Matriz && b instanceof Matriz)
		return a.diferente(b)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("&&", "a&&b\nRetorna se a e b são não nulos", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eZero(a) || eZero(b) ? 0 : 1, 1)
	else if ((eNumerico(a) && eZero(a)) || (eNumerico(b) && eZero(b)))
		return new Fracao(0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("||", "a||b\nRetorna se a ou b são não nulos", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eZero(a) && eZero(b) ? 0 : 1, 1)
	else if ((eNumerico(a) && !eZero(a)) || (eNumerico(b) && !eZero(b)))
		return new Fracao(1, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)

// Operadores de atribuição compostos
;(function () {
	var ops = ["+", "-", "*", "/", "%", "&&", "||", "_"]
	ops.forEach(function (op) {
		Funcao.registrar(op+"=", "a"+op+"=b\nMesmo que a = a"+op+"b", function (a, b) {
			return this.executarNoEscopo(new Funcao("=", [a, new Funcao(op, [a, b])]))
		}, false, true)
	})
})()
