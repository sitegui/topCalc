// Funções matemáticas básicas
Funcao.registrar("random", "random()\nRetorna um valor pseudo-aleatório", Math.random)
Funcao.registrar("sqrt", "sqrt(x)\nRetorna x^(1/2)", function (x) {
	if (eNumerico(x))
		return pow(x, new Fracao(1, 2))
	else if (eDeterminado(x))
		throw 0
}, true)
;["acos", "asin", "atan", "cos", "sin", "tan", "exp", "abs", "floor", "ceil", "round", "ln"].forEach(function (x) {
	Funcao.registrar(x, x+"(x)\nRetorna Math."+x+"(x)", function (y) {
		if (eNumerico(y))
			return window[x](y)
		else if (eDeterminado(y))
			throw 0
	}, true)
})
;["atan2", "pow", "log", "max", "min"].forEach(function (x) {
	Funcao.registrar(x, x+"(a, b)\nRetorna Math."+x+"(a, b)", function (y, z) {
		if (eNumerico(y) && eNumerico(z))
			return window[x](y, z)
		else if (eDeterminado(y) && eDeterminado(z))
			throw 0
	}, true)
})
Funcao.registrar("num", "num(x)\nRetorna o valor numérico de x", function (x) {
	if (eNumerico(x)) {
		if (x instanceof Complexo)
			return new Complexo(getNum(x.a), getNum(x.b))
		return getNum(x)
	} else if (eDeterminado(x))
		throw 0
}, true)

// Constantes
Variavel.valores.e = Math.E
Variavel.valores.ln2 = Math.LN2
Variavel.valores.ln10 = Math.LN10
Variavel.valores.log2e = Math.LOG2E
Variavel.valores.log10e = Math.LOG10E
Variavel.valores.pi = Math.PI
Variavel.valores.sqrt12 = Math.SQRT1_2
Variavel.valores.sqrt2 = Math.SQRT2

Variavel.valores.maxvalue = Number.MAX_VALUE
Variavel.valores.minvalue = Number.MIN_VALUE
Variavel.valores.inf = Number.POSITIVE_INFINITY
Variavel.valores["Infinity"] = Infinity

Variavel.valores.i = new Complexo(new Fracao(0, 1), new Fracao(1, 1))

Variavel.valores["false"] = new Fracao(0, 1)
Variavel.valores["true"] = new Fracao(1, 1)
