// Implementa funções para lidar com polinômios

Funcao.registrar("pol", "pol(x, coef)\nRetorna um polinômio no valor desejado com os coeficientes dados na forma de uma lista {a0, a1, ...}", function (x, coef) {
	var i, r, potencia
	
	if (coef instanceof Lista || coef instanceof Vetor) {
		coef = coef.expressoes
		r = null
		for (i=0; i<coef.length; i++) {
			if (i == 0)
				r = coef[0]
			else if (i == 1)
				r = Funcao.executar("+", [r, Funcao.executar("*", [coef[1], x])])
			else
				r = Funcao.executar("+", [r, Funcao.executar("*", [coef[i], Funcao.executar("^", [x, new Fracao(i, 1)])])])
		}
		if (coef.length)
			return r
		return new Fracao(0, 1)
	}
})

Funcao.registrar("roots", "roots(coef)\nRetorna todas as raízes complexas de um polinômio dado por uma lista numérica {a0, a1, ...}", function (coef) {
	var pol
	if (coef instanceof Lista || coef instanceof Vetor) {
		coef = coef.expressoes
		if (coef.every(eNumerico)) {			
			pol = new Polinomio(coef)
			return new Lista(pol.getRaizes())
		}
	}
})
