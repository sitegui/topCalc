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
Funcao.registrar("²", "a²\nRetorna a^2", function (a) {
	return Funcao.executar("^", [a, new Fracao(2, 1)])
}, true)
Funcao.registrar("³", "a³\nRetorna a^3", function (a) {
	return Funcao.executar("^", [a, new Fracao(3, 1)])
}, true)
Funcao.registrar("\u221A", "\u221Ax\nRetorna a raiz de x, ou seja, x^(1/2)", function (x) {
	if (eNumerico(x))
		return pow(x, new Fracao(1, 2))
	else if (eDeterminado(x))
		throw 0
}, true)
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
Funcao.registrar("\u2A2F", "a\u2A2Fb\nRetorna o produto vetorial de dois vetores de 2 ou 3 dimensôes", function (a, b) {
	var termo, lenA, lenB, ae, be, i, j, k
	if (a instanceof Vetor && b instanceof Vetor) {
		lenA = a.expressoes.length
		lenB = b.expressoes.length
		if (lenA < 2 || lenA > 3 || lenB < 2 || lenB > 3)
			throw 0
		if (lenA == 2)
			a = new Vetor(a.expressoes.concat([0]))
		if (lenB == 2)
			b = new Vetor(b.expressoes.concat([0]))
		ae = a.expressoes
		be = b.expressoes
		i = Funcao.executar("-", [Funcao.executar("*", [ae[1], be[2]]), Funcao.executar("*", [ae[2], be[1]])])
		j = Funcao.executar("-", [Funcao.executar("*", [ae[2], be[0]]), Funcao.executar("*", [ae[0], be[2]])])
		k = Funcao.executar("-", [Funcao.executar("*", [ae[0], be[1]]), Funcao.executar("*", [ae[1], be[0]])])
		return new Vetor([i, j, k])
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("/", "a/b\nRetorna a razão entre dois valores", function (a, b) {
	var info
	if (eNumerico(a) && eNumerico(b))
		return dividir(a, b)
	else if (a instanceof Vetor && eNumerico(b))
		return a.dividir(b)
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
				Console.echoInfo("Assumindo "+info.fatores[i]+" não nulo", true)
		return a.multiplicar(b.separar(-b.linhas))
	} else if (a instanceof Matriz && eNumerico(b)) {
		return a.dividirNum(b)
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
		a = getNum(a)
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
	var i, includes, r, temp, params, unidades, funcao, valor, j
	
	// Trata os argumentos
	this.args[0] = a = unbox(a)
	this.args[1] = b = unbox(b)
	
	// Verifica se está se usando o operador ":"
	includes = []
	if (a instanceof Funcao && a.nome == ":") {
		// Trata o segundo argumento de a
		a.args[1] = unbox(a.args[1])
		includes = a.args[1] instanceof Parenteses ? a.args[1].expressoes : [a.args[1]]
		for (i=0; i<includes.length; i++) {
			includes[i] = unbox(includes[i])
			if (includes[i] instanceof Variavel)
				includes[i] = includes[i].nome
			else
				throw "Os valores importados com : devem ser variáveis"
		}
		a = unbox(a.args[0])
	}
	
	// Distribui sobre os elementos do vetor/matriz
	if (a instanceof Vetor || a instanceof Matriz || a instanceof Lista) {
		b = this.executarNoEscopo(b, includes)
		if (a instanceof Vetor || a instanceof Lista) {
			if (!(b instanceof Lista || b instanceof Vetor) || b.expressoes.length != a.expressoes.length)
				throw "Dimensões inválidas"
			r = new a.constructor
		} else if (a instanceof Matriz) {
			if (!(b instanceof Matriz) || b.linhas != a.linhas || b.colunas != a.colunas)
				throw "Dimensões inválidas"
			r = new Matriz
			r.linhas = a.linhas
			r.colunas = a.colunas
		}
		
		for (i=0; i<a.expressoes.length; i++)
			r.expressoes.push(this.executarNoEscopo(new Funcao("=", [a.expressoes[i], b.expressoes[i]]), includes))
		return r
	}
	
	if (a instanceof Variavel)
		// Caso mais simples: a = 2
		return Variavel.valores[a.nome] = this.executarNoEscopo(b, includes)
	else if (a instanceof Funcao) {
		if (a.nome == "_") {
			// Define uma unidade
			a.args[0] = unbox(a.args[0])
			a.args[1] = unbox(a.args[1])
			if (!(a.args[0] instanceof Fracao) || a.args[0].n != 1 || a.args[0].d != 1)
				throw "O valor tem de ser 1"
			if (!(a.args[1] instanceof Variavel))
				throw "A unidade deve ser simples"
			r = this.executarNoEscopo(b, includes)
			if (!(r instanceof ValorComUnidade))
				throw "O valor deve ser associado a unidades"
			Unidade.unidades[a.args[1].nome] = [r.unidade.getBases(), multiplicar(r.valor, r.unidade.getFator())]
			return r
		} else if (a.nome == "getAt") {
			// Define uma posição de uma lista, vetor ou matriz
			r = this.executarNoEscopo(b, includes)
			
			// Trata a variável
			a.args[0] = unbox(a.args[0])
			if (!(a.args[0] instanceof Variavel))
				throw "Definição inválida"
			valor = Variavel.valores[a.args[0].nome]
			if (a.args.length == 2 && !(valor instanceof Lista || valor instanceof Vetor))
				throw "A variável deve ser uma lista ou vetor"
			else if (a.args.length == 3 && !(valor instanceof Matriz))
				throw "A variável deve ser uma matriz"
			
			// Trata o índice
			a.args[1] = this.executarNoEscopo(a.args[1])
			if (!eDeterminado(a.args[1]))
				return
			if (!eNumerico(a.args[1]))
				throw "Índice inválido"
			i = getNum(a.args[1])
			if (a.args.length == 2) {
				// Caso de lista ou vetor
				if (i < 0)
					i += valor.expressoes.length+1
				if (eIntSeguro(i) && i > 0 && i <= valor.expressoes.length)
					valor.expressoes[i-1] = r
				else
					throw "Índice inválido"
			} else {
				// Caso de matriz
				a.args[2] = this.executarNoEscopo(a.args[2])
				if (!eDeterminado(a.args[2]))
					return
				if (!eNumerico(a.args[2]))
					throw "Índice inválido"
				if (i < 0)
					i += valor.linhas+1
				j = getNum(a.args[2])
				if (j < 0)
					j += valor.colunas+1
				if (eIntSeguro(i) && i > 0 && i <= valor.linhas && eIntSeguro(j) && j > 0 && j <= valor.colunas)
					valor.set(i, j, r)
				else
					throw "Índice inválido"
			}
			return r
		} else {
			// Definição de uma nova função
			params = []
			unidades = []
			for (i=0; i<a.args.length; i++) {
				temp = unbox(a.args[i])
				if (temp instanceof Funcao && temp.nome == "_" && temp.args[0] instanceof Variavel) {
					params.push(temp.args[0].nome)
					unidades[temp.args[0].nome] = Unidade.interpretar(temp.args[1])
				} else if (temp instanceof Variavel)
					params.push(temp.nome)
				else
					throw "Parâmetro inválido na declaração da função"
			}
			r = this.executarPuroNoEscopo(b, params.concat(includes))
			funcao = Funcao.gerar(params, unidades, r)
			funcao.definicao = new Funcao("=", [a, r]).toMathString(false)
			Funcao.funcoes[a.nome] = funcao
			return r
		}
	}
	
	throw "Definição inválida"
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
	var retorno, i, tam, vL, uL, args
	
	// Trata os parâmetros
	this.args[0] = valor = this.executarNoEscopo(valor)
	this.args[1] = unidade = unbox(unidade)
	vL = valor instanceof Lista
	uL = unidade instanceof Lista
	if (uL) {
		for (i=0; i<unidade.expressoes.length; i++)
			if (!(unidade.expressoes[i] instanceof Unidade))
				unidade.expressoes[i] = Unidade.interpretar(unidade.expressoes[i])
	} else if (!(unidade instanceof Unidade))
		unidade = Unidade.interpretar(unidade)
	
	if (vL || uL) {
		// Distribui sobre listas
		if (vL && uL)
			if (valor.expressoes.length != unidade.expressoes.length)
				throw 0
			else
				tam = valor.expressoes.length
		else if (vL)
			tam = valor.expressoes.length
		else
			tam = unidade.expressoes.length
		retorno = new Lista
		for (i=0; i<tam; i++) {
			args = []
			args.push(vL ? valor.expressoes[i] : valor)
			args.push(uL ? unidade.expressoes[i] : unidade)
			retorno.expressoes.push(Funcao.executar("_", args))
		}
		return retorno
	} else if (eNumerico(valor)) {
		if (eInfinito(valor))
			return valor
		if (valor instanceof ValorComUnidade)
			return valor.converter(unidade)
		return new ValorComUnidade(valor, unidade)
	} else if (eDeterminado(valor))
		throw 0
}, false, true)

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
	return Funcao.executar("\u2264", [a, b])
}, true)
Funcao.registrar(">=", "a>=b\nRetorna se a é maior ou igual a b", function (a, b) {
	return Funcao.executar("\u2265", [a, b])
}, true)
Funcao.registrar("\u2264", "a\u2264b\nRetorna se a é menor ou igual a b", function (a, b) {
	if (eNumerico(a) && eNumerico(b))
		return new Fracao(eIdentico(max(a, b), b) || eIgual(a, b) ? 1 : 0, 1)
	else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
Funcao.registrar("\u2265", "a\u2265b\nRetorna se a é maior ou igual a b", function (a, b) {
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
	return Funcao.executar("\u2260", [a, b])
}, true)
Funcao.registrar("\u2260", "a\u2260b\nRetorna se a não tem o mesmo valor de b", function (a, b) {
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
	var ops = ["+", "-", "*", "/", "%", "&&", "||", "_", "^"]
	ops.forEach(function (op) {
		Funcao.registrar(op+"=", "a"+op+"=b\nMesmo que a = a"+op+"b", function (a, b) {
			return this.executarNoEscopo(new Funcao("=", [a, new Funcao(op, [a, b])]))
		}, false, true)
	})
})()
