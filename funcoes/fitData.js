"use strict";

Funcao.registrar("linFit", "linFit(X, Y)\nRetorna a expressão a+b*x que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y) {
	return fitData(X, Y, false, false)
})
Funcao.registrar("logFit", "logFit(X, Y)\nRetorna a expressão a+b*ln(x) que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y) {
	return fitData(X, Y, true, false)
})
Funcao.registrar("expFit", "expFit(X, Y)\nRetorna a expressão a*exp(b*x) que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y) {
	return fitData(X, Y, false, true)
})
Funcao.registrar("powFit", "powFit(X, Y)\nRetorna a expressão a+x^b que melhor se aproxima dos valores dados nas listas X e Y", function (X, Y) {
	return fitData(X, Y, true, true)
})

// Função de auxílio para linFit, logFit, expFit, powFit
// X e Y são os argumentos para essas funções
// lnX e lnY são booleanos
function fitData(X, Y, lnX, lnY) {
	var M, A, X2, Y2, a, b
	
	// Valida os argumentos
	if (!eDeterminado(X) || !eDeterminado(Y))
		return
	if (!(X instanceof Lista) || !(Y instanceof Lista))
		throw "Os argumentos devem ser listas"
	if (X.expressoes.length != Y.expressoes.length)
		throw "As duas listas devem ter o mesmo tamanho"
	if (!X.expressoes.every(eNumerico) || !Y.expressoes.every(eNumerico))
		return
	
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
		return new Funcao("*", [a, new Funcao("^", [new Variavel("x"), b])])
	if (lnX && !lnY)
		return new Funcao("+", [a, new Funcao("*", [b, new Funcao("ln", [new Variavel("x")])])])
	if (lnY)
		return new Funcao("*", [a, new Funcao("exp", [new Funcao("*", [b, new Variavel("x")])])])
	return new Funcao("+", [a, new Funcao("*", [b, new Variavel("x")])])
}
