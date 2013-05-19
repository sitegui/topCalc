"use strict";

// Funções para lidar com números

Funcao.registrar("random", "random()\nRetorna um valor pseudo-aleatório 0 <= x < 1", Math.random)

Funcao.registrar("rand", "rand(min, max)\nRetorna um valor pseudo-aleatório inteiro min <= x <= max", function (a, b) {
	if (eNumerico(a) && eNumerico(b)) {
		a = getNum(a)
		b = getNum(b)
		if (!eIntSeguro(a) || !eIntSeguro(b))
			throw 0
		return new Fracao(a+Math.floor(Math.random()*(b-a+1)), 1)
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
})

Funcao.registrar("q", "q(x)\nRetorna, se possível, o formato exato do número em forma de fração", function (x) {
	var toFracao = function (x) {
		if (x instanceof Fracao || x instanceof BigNum)
			return x.clonar()
		else if (typeof x == "number")
			return Fracao.toFracao(x)
		else if (x instanceof Complexo)
			return new Complexo(toFracao(x.a), toFracao(x.b))
		else if (x instanceof ValorComUnidade)
			return new Unidade(toFracao(x.valor), x.unidade.clonar())
	}
	if (eNumerico(x))
		return toFracao(x)
	else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("sqrt", "sqrt(x)\nRetorna x^(1/2)", function (x) {
	if (eNumerico(x))
		return pow(x, new Fracao(1, 2))
	else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("abs", "abs(x)\nRetorna o módulo (ou norma) de x", function (x) {
	if (eNumerico(x))
		return abs(x)
	else if (x instanceof Vetor)
		return x.abs()
	else if (eDeterminado(x))
		throw 0
}, true)

;["acos", "asin", "atan", "cos", "sin", "tan", "exp", "floor", "ceil", "round", "ln"].forEach(function (x) {
	Funcao.registrar(x, x+"(x)\nRetorna Math."+x+"(x)", function (y) {
		if (eNumerico(y))
			return window[x](y)
		else if (eDeterminado(y))
			throw 0
	}, true)
})

;["atan2", "pow"].forEach(function (x) {
	Funcao.registrar(x, x+"(a, b)\nRetorna Math."+x+"(a, b)", function (y, z) {
		if (eNumerico(y) && eNumerico(z))
			return window[x](y, z)
		else if (eDeterminado(y) && eDeterminado(z))
			throw 0
	}, true)
})

Funcao.registrar("log", "log(num, base)\nRetorna o log de num na base indicada", function (num, base) {
	if (eNumerico(num) && eNumerico(base))
			return log(num, base)
		else if (eDeterminado(num) && eDeterminado(base))
			throw 0
}, true)

Funcao.registrar("log10", "log10(num)\nRetorna o log de num na base 10", function (num) {
	if (eNumerico(num))
			return log(num, new Fracao(10, 1))
		else if (eDeterminado(num))
			throw 0
}, true)

Funcao.registrar("cis", "cis(x)\nRetorna cos(x)+i*sin(x)", function (x) {
	var c, i, s
	c = Funcao.executar("cos", [x])
	i = new Complexo(new Fracao(0, 1), new Fracao(1, 1))
	s = Funcao.executar("sin", [x])
	return Funcao.executar("+", [c, Funcao.executar("*", [i, s])])
}, true)

Funcao.registrar("cosh", "cosh(x)\nRetorna o cosseno hiperbólico de x", function (x) {
	var ex
	if (eNumerico(x)) {
		ex = exp(x)
		return dividir(somar(ex, dividir(1, ex)), 2)
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("sinh", "sinh(x)\nRetorna o seno hiperbólico de x", function (x) {
	var ex
	if (eNumerico(x)) {
		ex = exp(x)
		return dividir(subtrair(ex, dividir(1, ex)), 2)
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("tanh", "tanh(x)\nRetorna a tangente hiperbólico de x", function (x) {
	var e2x
	if (eNumerico(x)) {
		e2x = exp(multiplicar(2, x))
		return dividir(subtrair(e2x, 1), somar(e2x, 1))
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("acosh", "acosh(x)\nRetorna o arco cosseno hiperbólico de x", function (x) {
	var a, b
	if (eNumerico(x)) {
		a = pow(somar(x, 1), .5)
		b = pow(subtrair(x, 1), .5)
		return ln(somar(x, multiplicar(a, b)))
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("asinh", "asinh(x)\nRetorna o arco sino hiperbólico de x", function (x) {
	var a
	if (eNumerico(x)) {
		a = pow(somar(1, multiplicar(x, x)), .5)
		return ln(somar(x, a))
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("atanh", "atanh(x)\nRetorna o arco tangente hiperbólico de x", function (x) {
	var a, b
	if (eNumerico(x)) {
		a = ln(somar(1, x))
		b = ln(subtrair(1, x))
		return dividir(subtrair(a, b), 2)
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("max", "max(n1, n2, ...)\nRetorna o maior valor dentre os argumentos", function () {
	var args, numerico, determinado, i, r
	args = Funcao.getFlatArgs(arguments)
	numerico = args.every(function (x) {
		return eNumerico(x)
	})
	if (numerico) {
		if (args.length == 0)
			throw 0
		r = args[0]
		for (i=1; i<args.length; i++)
			r = max(r, args[i])
		return r
	} else {
		determinado = args.every(function (x) {
			return !eNumerico(x) && eDeterminado(x)
		})
		if (determinado)
			throw 0
	}
}, false, false, true)

Funcao.registrar("min", "min(n1, n2, ...)\nRetorna o menor valor dentre os argumentos", function () {
	var args, numerico, determinado, i, r
	args = Funcao.getFlatArgs(arguments)
	numerico = args.every(function (x) {
		return eNumerico(x)
	})
	if (numerico) {
		if (args.length == 0)
			throw 0
		r = args[0]
		for (i=1; i<args.length; i++)
			r = min(r, args[i])
		return r
	} else {
		determinado = args.every(function (x) {
			return !eNumerico(x) && eDeterminado(x)
		})
		if (determinado)
			throw 0
	}
}, false, false, true)

Funcao.registrar("num", "num(x)\nRetorna o valor numérico de x", function (x) {
	if (eNumerico(x)) {
		if (x instanceof Complexo)
			return new Complexo(getNum(x.a), getNum(x.b))
		if (x instanceof ValorComUnidade)
			return Funcao.executar("num", [x.valor])
		return getNum(x)
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("prime", "prime(n)\nRetorna o nº primo", function (n) {
	var r, i
	if (eNumerico(n)) {
		n = getNum(n)
		if (!eIntSeguro(n) || n <= 0)
			throw 0
		if (n == 1)
			return new Fracao(2, 1)
		r = 1
		n--
		while (n && eIntSeguro(r)) {
			r += 2
			if (ePrimo(r))
				n--
		}
		if (eIntSeguro(r))
			return new Fracao(r, 1)
	} else if (eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("isPrime", "isPrime(n)\nRetorna se um dado número é primo", function (n) {
	if (eNumerico(n)) {
		n = getNum(n)
		if (!eIntSeguro(n))
			return new Fracao(0, 1)
		return new Fracao(ePrimo(n) ? 1 : 0, 1)
	} else if (eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("nextPrime", "nextPrime(n)\nRetorna o menor primo maior que n", function (n) {
	if (eNumerico(n)) {
		n = getNum(floor(n))+1
		while (eIntSeguro(n)) {
			if (ePrimo(Math.abs(n)))
				return new Fracao(n, 1)
			n++
		}
		throw 0
	} else if (eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("prevPrime", "prevPrime(n)\nRetorna o maior primo menor que n", function (n) {
	if (eNumerico(n)) {
		n = getNum(ceil(n))-1
		while (eIntSeguro(n)) {
			if (ePrimo(Math.abs(n)))
				return new Fracao(n, 1)
			n--
		}
		throw 0
	} else if (eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("factor", "factor(n)\nRetorna a fatoração da fração n", function (n) {
	var fatores, i, r, grupo
	if (eNumerico(n)) {
		if (eZero(n))
			throw 0
		if (!(n instanceof Fracao)) {
			n = getNum(n)
			if (!eIntSeguro(n))
				throw 0
			n = new Fracao(n, 1)
		}
		fatores = n.fatorar()
		r = new Lista
		for (i in fatores) {
			grupo = new Lista
			grupo.expressoes.push(new Fracao(i, 1))
			grupo.expressoes.push(new Fracao(fatores[i], 1))
			r.expressoes.push(grupo)
		}
		return r
	} else if (eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("sgn", "sgn(x)\nRetorna o sinal de x (-1, 0 ou 1)", function (x) {
	if (eNumerico(x)) {
		if (x instanceof Fracao)
			return new Fracao(x.n==0 ? 0 : (x.n<0 ? -1 : 1), 1)
		if (typeof x == "number")
			return new Fracao(x==0 ? 0 : (x<0 ? -1 : 1), 1)
		if (x instanceof BigNum)
			return new Fracao(x.zero ? 0 : (x.negativo ? -1 : 1), 1)
		throw 0
	} else if (eDeterminado(x))
		throw 0
}, true)

Funcao.registrar("re", "re(z)\nRetorna a parte real de z", function (z) {
	if (eNumerico(z)) {
		if (z instanceof Complexo)
			return z.a
		return z
	} else if (eDeterminado(z))
		throw 0
}, true)

Funcao.registrar("img", "img(z)\nRetorna a parte imaginária de z", function (z) {
	if (eNumerico(z)) {
		if (z instanceof Complexo)
			return z.b
		if (eInfinito(z))
			return z
		return new Fracao(0, 1)
	} else if (eDeterminado(z))
		throw 0
}, true)

Funcao.registrar("conj", "conj(z)\nRetorna o conjugado a-bi do imaginário a+bi", function (z) {
	if (eNumerico(z)) {
		if (z instanceof Complexo)
			return new Complexo(z.a, subtrair(0, z.b))
		return z
	} else if (eDeterminado(z))
		throw 0
}, true)

Funcao.registrar("arg", "arg(z)\nRetorna o argumento do imaginário z", function (z) {
	if (eNumerico(z)) {
		if (eZero(z))
			throw 0
		if (z instanceof Complexo)
			return z.arg()
		if (z instanceof Fracao)
			return z.n>0 ? new Fracao(0, 1) : Math.PI
		if (typeof z == "number")
			return z>0 ? new Fracao(0, 1) : Math.PI
		if (z instanceof BigNum)
			return !z.negativo ? new Fracao(0, 1) : Math.PI
		throw 0
	} else if (eDeterminado(z))
		throw 0
}, true)

Funcao.registrar("perm", "perm(m, n)\nRetorna o número de permutações de m n-a-n = m!/(m-n)!", function (m, n) {
	var i, r, termo
	if (eNumerico(m) && eNumerico(n)) {
		n = getNum(n)
		if (!eIntSeguro(n) || n < 0)
			throw 0
		if (n == 0)
			return new Fracao(1, 1)
		for (i=0; i<n; i++) {
			termo = Funcao.executar("-", [m, new Fracao(i, 1)])
			if (i)
				r = Funcao.executar("*", [r, termo])
			else
				r = termo
		}
		return r
	} else if (eDeterminado(m) && eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("comb", "comb(m, n)\nRetorna o número de combinações de m n-a-n = m!/(n!*(m-n)!)", function (m, n) {
	var i, r, termo
	if (eNumerico(m) && eNumerico(n)) {
		n = getNum(n)
		if (!eIntSeguro(n) || n < 0)
			throw 0
		if (n == 0)
			return new Fracao(1, 1)
		for (i=0; i<n; i++) {
			termo = Funcao.executar("-", [m, new Fracao(i, 1)])
			if (i)
				r = Funcao.executar("*", [r, termo])
			else
				r = termo
		}
		r = Funcao.executar("/", [r, Funcao.executar("factorial", [new Fracao(n, 1)])])
		return r
	} else if (eDeterminado(m) && eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("gcd", "gcd(n1, n2, ...)\nRetorna o maior divisor comum dos números", function () {
	var args, fracao, determinado, i, r, fatores, f, iniciado
	args = Funcao.getFlatArgs(arguments)
	fracao = args.every(function (x) {
		return x instanceof Fracao
	})
	if (fracao) {
		r = {}
		iniciado = false
		for (i=0; i<args.length; i++) {
			if (eZero(args[i]))
				continue
			fatores = args[i].abs().fatorar()
			if (iniciado) {
				for (f in r)
					if (!(f in fatores))
						fatores[f] = 0
				for (f in fatores)
					r[f] = Math.min(f in r ? r[f] : 0, fatores[f])
			} else {
				r = fatores
				iniciado = true
			}
		}
		return Fracao.fromFatores(r)
	} else {
		determinado = args.every(function (x) {
			return !(x instanceof Fracao) && eDeterminado(x)
		})
		if (determinado)
			throw 0
	}
}, false, false, true)

Funcao.registrar("lcm", "lcm(n1, n2, ...)\nRetorna o menor múltiplo comum dos números", function () {
	var args, fracao, determinado, i, r, fatores, f, iniciado
	args = Funcao.getFlatArgs(arguments)
	fracao = args.every(function (x) {
		return x instanceof Fracao
	})
	if (fracao) {
		r = {}
		iniciado = false
		for (i=0; i<args.length; i++) {
			if (eZero(args[i]))
				return new Fracao(0, 1)
			fatores = args[i].abs().fatorar()
			if (iniciado) {
				for (f in r)
					if (!(f in fatores))
						fatores[f] = 0
				for (f in fatores)
					r[f] = Math.max(f in r ? r[f] : 0, fatores[f])
			} else {
				r = fatores
				iniciado = true
			}
		}
		return Fracao.fromFatores(r)
	} else {
		determinado = args.every(function (x) {
			return !(x instanceof Fracao) && eDeterminado(x)
		})
		if (determinado)
			throw 0
	}
}, false, false, true)

Funcao.registrar("toBase", "toBase(num, base)\nRetorna o número inteiro num escrito na base desejada", function (num, base) {
	if (eNumerico(num) && eNumerico(base)) {
		num = getNum(num)
		if (!eIntSeguro(num) || !eIntSeguro(base) || base < 2)
			throw 0
		return new Fracao(num, 1, base)
	} else if (eDeterminado(num) && eDeterminado(base))
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
Variavel.valores.g = (function () {
	var u = new Unidade
	u.unidades["m"] = {"": new Fracao(1, 1)}
	u.unidades["s"] = {"": new Fracao(-2, 1)}
	return new ValorComUnidade(9.807, u)
})()
Variavel.valores.c = (function () {
	var u = new Unidade
	u.unidades["m"] = {"": new Fracao(1, 1)}
	u.unidades["s"] = {"": new Fracao(-1, 1)}
	return new ValorComUnidade(299792458, u)
})()
Variavel.valores.G = (function () {
	var u = new Unidade
	u.unidades["m"] = {"": new Fracao(3, 1)}
	u.unidades["g"] = {"k": new Fracao(-1, 1)}
	u.unidades["s"] = {"": new Fracao(-2, 1)}
	return new ValorComUnidade(6.6738480e-11, u)
})()
Variavel.valores.h = (function () {
	var u = new Unidade
	u.unidades["J"] = {"": new Fracao(1, 1)}
	u.unidades["s"] = {"": new Fracao(1, 1)}
	return new ValorComUnidade(6.6260695729e-34, u)
})()
Variavel.valores.q = (function () {
	var u = new Unidade
	u.unidades["C"] = {"": new Fracao(1, 1)}
	return new ValorComUnidade(1.60217656535e-19, u)
})()
Variavel.valores.Na = (function () {
	var u = new Unidade
	u.unidades["mol"] = {"": new Fracao(-1, 1)}
	return new ValorComUnidade(6.0221412927e23, u)
})()
Variavel.valores.R = (function () {
	var u = new Unidade
	u.unidades["J"] = {"": new Fracao(1, 1)}
	u.unidades["K"] = {"": new Fracao(-1, 1)}
	u.unidades["mol"] = {"": new Fracao(-1, 1)}
	return new ValorComUnidade(8.314462175, u)
})()

Variavel.valores.maxvalue = Number.MAX_VALUE
Variavel.valores.minvalue = Number.MIN_VALUE
Variavel.valores.inf = Number.POSITIVE_INFINITY
Variavel.valores["Infinity"] = Infinity

Variavel.valores.i = new Complexo(new Fracao(0, 1), new Fracao(1, 1))

Variavel.valores["false"] = new Fracao(0, 1)
Variavel.valores["true"] = new Fracao(1, 1)

/*

= Funções de apoio =

*/

// Retorna se um dado inteiro seguro positivo é primo
function ePrimo(n) {
	var i, max
	max = Math.sqrt(n)
	if (n == 1)
		return false
	if (n == 2)
		return true
	if (n%2 == 0)
		return false
	for (i=3; i<=max; i+=2)
		if (n%i == 0)
			return false
	return true
}
