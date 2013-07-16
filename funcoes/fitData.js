"use strict";

Funcao.registrar("linFit", "linFit(X, Y, var=x)\nRetorna a expressão a+b*x que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y, x) {
	return fitData(this, X, Y, x, false, false)
}, false, true, true)
Funcao.registrar("logFit", "logFit(X, Y, var=x)\nRetorna a expressão a+b*ln(x) que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y, x) {
	return fitData(this, X, Y, x, true, false)
}, false, true, true)
Funcao.registrar("expFit", "expFit(X, Y, var=x)\nRetorna a expressão a*exp(b*x) que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y, x) {
	return fitData(this, X, Y, x, false, true)
}, false, true, true)
Funcao.registrar("powFit", "powFit(X, Y, var=x)\nRetorna a expressão a+x^b que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y, x) {
	return fitData(this, X, Y, x, true, true)
}, false, true, true)
Funcao.registrar("bestFit", "bestFit(X, Y, var=x)\nRetorna a melhor aproximação dentre a+b*x, a+b*ln(x), a*exp(b*x), a+x^b para os valores dados nas listas X e Y", function (X, Y, x) {
	var fits = [], erro, i, min, minI, antes, that = this
	
	// Valida os argumentos
	if (x !== undefined && !(x instanceof Variavel))
		throw "O terceiro argumento deve ser uma variável"
	x = x instanceof Variavel ? x.nome : "x"
	this.args[0] = X = this.executarNoEscopo(X)
	this.args[1] = Y = this.executarNoEscopo(Y)
	if (!eDeterminado(X) || !eDeterminado(Y))
		return
	if (!(X instanceof Lista) || !(Y instanceof Lista))
		throw "Os argumentos devem ser listas"
	if (X.expressoes.length != Y.expressoes.length)
		throw "As duas listas devem ter o mesmo tamanho"
	if (!X.expressoes.every(eNumerico) || !Y.expressoes.every(eNumerico))
		return
	
	// Calcula cada uma das opções
	fits[0] = fitData2(X, Y, x, false, false) // linFit
	fits[1] = fitData2(X, Y, x, true, false) // logFit
	fits[2] = fitData2(X, Y, x, false, true) // expFit
	fits[3] = fitData2(X, Y, x, true, true) // powFit
	
	// Calcula o erro de cada opção e seleciona a melhor
	var calcularErro = function (exp, X, Y, x) {
		var i, total = 0, num
		for (i=0; i<X.expressoes.length; i++) {
			Variavel.valores[x] = X.expressoes[i]
			num = that.executarNoEscopo(exp, null, [x])
			num = Funcao.executar("abs", [Funcao.executar("-", [num, Y.expressoes[i]])])
			num = getNum(num)
			total += num*num
		}
		return total
	}
	min = Infinity
	minI = -1
	antes = Variavel.backup(x)
	try {
		for (i=0; i<fits.length; i++) {
			erro = calcularErro(fits[i], X, Y, x)
			if (erro < min) {
				min = erro
				minI = i
			}
		}
	} finally {
		Variavel.restaurar(antes)
	}
	
	// Retorna a melhor opção
	return fits[minI]
}, false, true, true)

// Função de auxílio para linFit, logFit, expFit, powFit
// that é o this dentro de uma função
// X, Y e x são os argumentos para essas funções
// lnX e lnY são booleanos
function fitData(that, X, Y, x, lnX, lnY) {
	// Valida os argumentos
	if (x !== undefined && !(x instanceof Variavel))
		throw "O terceiro argumento deve ser uma variável"
	x = x instanceof Variavel ? x.nome : "x"
	that.args[0] = X = that.executarNoEscopo(X)
	that.args[1] = Y = that.executarNoEscopo(Y)
	if (!eDeterminado(X) || !eDeterminado(Y))
		return
	if (!(X instanceof Lista) || !(Y instanceof Lista))
		throw "Os argumentos devem ser listas"
	if (X.expressoes.length != Y.expressoes.length)
		throw "As duas listas devem ter o mesmo tamanho"
	if (!X.expressoes.every(eNumerico) || !Y.expressoes.every(eNumerico))
		return
	
	// Calcula e retorna o resultado
	return fitData2(X, Y, x, lnX, lnY)
}

// Função de auxílio para fitData e bestFit
// X e Y devem ser uma lista de mesmo tamanho
// x deve ser uma string
// lnX e lnY devem ser boolean
function fitData2(X, Y, x, lnX, lnY) {
	var M, A, X2, Y2, a, b
	
	// Calcula os ln(X) e ln(Y) se necessário
	X2 = lnX ? Funcao.executar("ln", [X]) : X
	Y2 = lnY ? Funcao.executar("ln", [Y]) : Y
	
	// Gera a matriz 2x2 M
	M = new Matriz
	M.linhas = 2
	M.colunas = 2
	M.expressoes.push(new Fracao(X.expressoes.length, 1))
	M.expressoes.push(Funcao.executar("sum", [X2]))
	M.expressoes.push(M.expressoes[1])
	M.expressoes.push(Funcao.executar("sum", [Funcao.executar("^", [X2, new Fracao(2, 1)])]))
	M = Funcao.executar("inverse", [M])
	
	// Gera a matriz 2x1 A
	A = new Matriz
	A.linhas = 2
	A.colunas = 1
	A.expressoes.push(Funcao.executar("sum", [Y2]))
	A.expressoes.push(Funcao.executar("sum", [Funcao.executar("*", [X2, Y2])]))
	
	// Calcula os coeficientes |a; b| e retorna a expressão a+b*x
	A = Funcao.executar("*", [M, A])
	a = lnY ? Funcao.executar("exp", [A.expressoes[0]]) : A.expressoes[0]
	b = A.expressoes[1]
	if (lnX && lnY)
		return new Funcao("*", [a, new Funcao("^", [new Variavel(x), b])])
	if (lnX && !lnY)
		return new Funcao("+", [a, new Funcao("*", [b, new Funcao("ln", [new Variavel(x)])])])
	if (lnY)
		return new Funcao("*", [a, new Funcao("exp", [new Funcao("*", [b, new Variavel(x)])])])
	return new Funcao("+", [a, new Funcao("*", [b, new Variavel(x)])])
}

// Define o comportamento da pré-execução
Funcao.funcoes.linFit.preExecucao =
Funcao.funcoes.logFit.preExecucao =
Funcao.funcoes.expFit.preExecucao =
Funcao.funcoes.powFit.preExecucao = 
Funcao.funcoes.bestFit.preExecucao = function () {
	this.args[0] = this.executarNoEscopo(this.args[0])
	this.args[1] = this.executarNoEscopo(this.args[1])
}
