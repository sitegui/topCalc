"use strict";

// Representa uma unidade (sem o valor)
function Unidade() {
	this.unidades = {}
}

// Guarda os prefixos aceitos e seus valores
Unidade.prefixos = (function () {
	var i, r, r2
	r = {
		Y: 24,
		Z: 21,
		E: 18,
		P: 15,
		T: 12,
		G: 9,
		M: 6,
		k: 3,
		h: 2,
		da: 1,
		"": 0,
		d: -1,
		c: -2,
		m: -3,
		u: -6,
		n: -9,
		p: -12,
		f: -15,
		a: -18,
		z: -21,
		y: -24
	}
	r2 = {
		Yi: 90,
		Zi: 70,
		Ei: 60,
		Pi: 50,
		Ti: 40,
		Gi: 30,
		Mi: 20,
		ki: 10
	}
	for (i in r)
		r[i] = pow(new Fracao(10, 1), new Fracao(r[i], 1))
	for (i in r2)
		r[i] = pow(new Fracao(2, 1), new Fracao(r2[i], 1))
	return r
})()

// Guarda todas as unidades aceitas
Unidade.unidades = {
	// Básicas
	m: [{L: 1}, new Fracao(1, 1)],
	g: [{M: 1}, new Fracao(1, 1000)],
	s: [{T: 1}, new Fracao(1, 1)],
	A: [{I: 1}, new Fracao(1, 1)],
	K: [{θ: 1}, new Fracao(1, 1)],
	mol: [{N: 1}, new Fracao(1, 1)],
	cd: [{J: 1}, new Fracao(1, 1)],
	// Compostas
	rad: [{}, new Fracao(1, 1)],
	sr: [{}, new Fracao(1, 1)],
	kat: [{N: 1, T: -1}, new Fracao(1, 1)],
	Bq: [{T: -1}, new Fracao(1, 1)],
	F: [{I: 2, T: 4, M: -1, L: -2}, new Fracao(1, 1)],
	C: [{I: 1, T: 1}, new Fracao(1, 1)],
	S: [{I: 2, T: 3, M: -1, L: -2}, new Fracao(1, 1)],
	Gy: [{L: 2, T: -2}, new Fracao(1, 1)],
	Sv: [{L: 2, T: -2}, new Fracao(1, 1)],
	J: [{M: 1, L: 2, T: -2}, new Fracao(1, 1)],
	lm: [{J: 1}, new Fracao(1, 1)],
	Wb: [{M: 1, L: 2, T: -2, I: -1}, new Fracao(1, 1)],
	N: [{M: 1, L: 1, T: -2}, new Fracao(1, 1)],
	Hz: [{T: -1}, new Fracao(1, 1)],
	H: [{M: 1, L: 2, T: -2, I: -2}, new Fracao(1, 1)],
	T: [{M: 1, T: -2, I: -1}, new Fracao(1, 1)],
	lx: [{J: 1, T: -2}, new Fracao(1, 1)],
	W: [{M: 1, L: 2, T: -3}, new Fracao(1, 1)],
	Pa: [{M: 1, L: -1, T: -2}, new Fracao(1, 1)],
	ohm: [{M: 1, L: 2, T: -3, I: -2}, new Fracao(1, 1)],
	"ºC": [{θ: 1}, new Fracao(1, 1)],
	V: [{M: 1, L: 2, T: -3, I: -1}, new Fracao(1, 1)],
	// Comprimento
	yd: [{L: 1}, new Fracao(1143, 1250)],
	ft: [{L: 1}, new Fracao(381, 1250)],
	"in": [{L: 1}, new Fracao(127, 5000)],
	ly: [{L: 1}, 9460730472580800],
	AU: [{L: 1}, new Fracao(149597870700, 1)],
	mi: [{L: 1}, new Fracao(201168, 125)],
	nmi: [{L: 1}, new Fracao(1852, 1)],
	rd: [{L: 1}, new Fracao(12573, 2500)],
	ftUS: [{L: 1}, new Fracao(1200, 3937)],
	mil: [{L: 1}, new Fracao(127, 5000000)],
	Ao: [{L: 1}, new Fracao(1, 10000000000)],
	// Área
	b: [{L: 2}, 1e-28],
	ha: [{L: 2}, new Fracao(10000, 1)],
	a: [{L: 2}, new Fracao(100, 1)],
	acre: [{L: 2}, new Fracao(316160658, 78125)],
	// Volume
	L: [{L: 3}, new Fracao(1, 1000)],
	galUK: [{L: 3}, new Fracao(454609, 100000000)],
	gal: [{L: 3}, 4.40488377086e-3],
	qt: [{L: 3}, 946.352946e-6],
	pt: [{L: 3}, 568.26125e-6],
	c: [{L: 3}, 236.5882365e-6],
	ozfl: [{L: 3}, 29.5735295625e-6],
	ozUK: [{L: 3}, 28.4130625e-6],
	bbl: [{L: 3}, 0.158987294928],
	pk: [{L: 3}, 9.09218e-3],
	// Ângulo
	"º": [{}, Math.PI/180],
	grad: [{}, Math.PI/200],
	// Temperatura
	"ºF": [{θ: 1}, new Fracao(5, 9)],
	"R": [{θ: 1}, new Fracao(5, 9)],
	// Massa
	lb: [{M: 1}, new Fracao(45359237, 100000)],
	oz: [{M: 1}, new Fracao(45359237, 1600000)],
	slug: [{M: 1}, 14593.903],
	lbt: [{M: 1}, new Fracao(58319019, 156250)],
	ton: [{M: 1}, new Fracao(45359237, 50)],
	tonUK: [{M: 1}, new Fracao(635029318, 625)],
	t: [{M: 1}, new Fracao(1000000, 1)],
	ozt: [{M: 1}, new Fracao(19439673, 625000)],
	kt: [{M: 1}, 0.205196548333],
	gr: [{M: 1}, new Fracao(6479891, 100000000)],
	u: [{M: 1}, 1.66053873e-27],
	// Tempo
	min: [{T: 1}, new Fracao(60, 1)],
	h: [{T: 1}, new Fracao(3600, 1)],
	d: [{T: 1}, new Fracao(86400, 1)],
	yr: [{T: 1}, new Fracao(31557600, 1)],
	// Frequência
	rpm: [{T: -1}, new Fracao(1, 60)],
	// Pressão
	atm: [{M: 1, L: -1, T: -2}, new Fracao(101325, 1)],
	bar: [{M: 1, L: -1, T: -2}, new Fracao(100000, 1)],
	mmHg: [{M: 1, L: -1, T: -2}, 133.3224],
	// Energia
	BTU: [{M: 1, L: 2, T: -2}, 1.05505585262e3],
	cal: [{M: 1, L: 2, T: -2}, new Fracao(10467, 2500)],
	eV: [{M: 1, L: 2, T: -2}, 1.60217733e-19],
	// Informação
	B: [{}, new Fracao(1, 1)]
	
}

// Interpreta as unidades numa expressão
// Retorna um novo objeto Unidade ou throw em caso de erro
Unidade.interpretar = function (expressao) {
	var arg0, arg1, r
	expressao = unbox(expressao)
	if (expressao instanceof Funcao) {
		// Executa *, / e ^
		if (expressao.nome == "*" || expressao.nome == "/") {
			arg0 = Unidade.interpretar(expressao.args[0])
			arg1 = Unidade.interpretar(expressao.args[1])
			if (expressao.nome == "/")
				arg1 = arg1.pow(new Fracao(-1, 1))
			return arg0.multiplicar(arg1)
		} else if (expressao.nome == "^") {
			arg0 = Unidade.interpretar(expressao.args[0])
			arg1 = executar(expressao.args[1])
			if (!eNumerico(arg1))
				throw "Expoente inválido"
			return arg0.pow(arg1)
		} else
			throw "Expressão inválida para a unidade"
	} else if (expressao instanceof Variavel) {
		// Lê o nome da unidade e seu prefixo
		if (expressao.nome in Unidade.unidades) {
			r = new Unidade
			r.unidades[expressao.nome] = {"": new Fracao(1, 1)}
			return r
		}
		arg0 = expressao.nome.charAt(0)
		arg1 = expressao.nome.substr(1)
		if (arg0 in Unidade.prefixos && arg1 in Unidade.unidades) {
			r = new Unidade
			r.unidades[arg1] = {}
			r.unidades[arg1][arg0] = new Fracao(1, 1)
			return r
		}
		arg0 = expressao.nome.substr(0, 2)
		arg1 = expressao.nome.substr(2)
		if (arg0 in Unidade.prefixos && arg1 in Unidade.unidades) {
			r = new Unidade
			r.unidades[arg1] = {}
			r.unidades[arg1][arg0] = new Fracao(1, 1)
			return r
		}
		throw "Unidade "+expressao.nome+" desconhecida"
	} else if (expressao instanceof Parenteses && expressao.expressoes.length == 1)
		return Unidade.interpretar(expressao.expressoes[0])
	else
		throw "Unidade inválida"
}

// Retorna o fator multiplicativo para transformar a unidade em termos das bases
Unidade.prototype.getFator = function () {
	var i, j, fator, r = new Fracao(1, 1)
	for (i in this.unidades) {
		for (j in this.unidades[i]) {
			fator = multiplicar(Unidade.unidades[i][1], Unidade.prefixos[j])
			fator = pow(fator, this.unidades[i][j])
			r = multiplicar(r, fator)
		}
	}
	return r
}

// Retorna se duas bases são idênticas
Unidade.saoBasesIdenticas = function (base1, base2) {
	var i
	for (i in base1) {
		if (!(i in base2))
			return false
		if (!eIdentico(base1[i], base2[i]))
			return false
	}
	for (i in base2)
		if (!(i in base1))
			return false
	return true
}

// Clona a unidade
Unidade.prototype.clonar = function () {
	var r = new Unidade, i, j
	for (i in this.unidades) {
		r.unidades[i] = {}
		for (j in this.unidades[i])
			r.unidades[i][j] = this.unidades[i][j].clonar()
	}
	return r
}

// Retorna a unidade numa string inteligível
Unidade.prototype.toString = function () {
	var r = [], i, j, exp
	for (i in this.unidades)
		for (j in this.unidades[i]) {
			exp = this.unidades[i][j]
			if (exp instanceof Fracao && exp.n == 1 && exp.d == 1)
				r.push(j+i)
			else
				r.push(j+i+"^"+exp)
		}
	return r.join("*")
}

// Retorna se é identico à outra unidade
Unidade.prototype.eIdentico = function (outra) {
	var i, j
	for (i in this.unidades) {
		if (!(i in outra.unidades))
			return false
		for (j in this.unidades[i]) {
			if (!(j in outra.unidades[i]))
				return false
			if (!eIdentico(this.unidades[i][j], outra.unidades[i][j]))
				return false
		}
		for (j in outra.unidades[i])
			if (!(j in this.unidades[i]))
				return false
	}
	for (i in outra.unidades)
		if (!(i in this.unidades))
			return false
	return true
}

// Normaliza a própria unidade (retira elementos com 0)
// Retorna o próprio objeto
Unidade.prototype.normalizar = function () {
	var i, j, ok
	for (i in this.unidades) {
		ok = false
		for (j in this.unidades[i])
			if (eZero(this.unidades[i][j]))
				delete this.unidades[i][j]
			else
				ok = true
		if (!ok)
			delete this.unidades[i]
	}
	return this
}

// Eleva a unidade a um valor numérico
// Retorna um novo objeto Unidade
Unidade.prototype.pow = function (num) {
	var i, j, r = new Unidade
	for (i in this.unidades) {
		r.unidades[i] = {}
		for (j in this.unidades[i])
			r.unidades[i][j] = multiplicar(this.unidades[i][j], num)
	}
	return r.normalizar()
}

// Une duas unidades, multiplicando-as
// Retorna um novo objeto Unidade com a resposta
Unidade.prototype.multiplicar = function (outra) {
	var i, j, r = this.clonar()
	for (i in outra.unidades) {
		if (!(i in r.unidades))
			r.unidades[i] = {}
		for (j in outra.unidades[i]) {
			if (j in r.unidades[i])
				r.unidades[i][j] = somar(r.unidades[i][j], outra.unidades[i][j])
			else
				r.unidades[i][j] = outra.unidades[i][j].clonar()
		}
	}
	return r.normalizar()
}

// Retorna a notação em unidades base da unidade
Unidade.prototype.getBases = function () {
	var i, j, soma, base, r = {}
	for (i in this.unidades) {
		// Pega o expoente total da unidade
		soma = new Fracao(0, 1)
		for (j in this.unidades[i])
			soma = somar(soma, this.unidades[i][j])
		
		// Pega isso em termos de unidades base e junta à resposta
		for (j in Unidade.unidades[i][0]) {
			base = multiplicar(new Fracao(Unidade.unidades[i][0][j], 1), soma)
			if (j in r)
				r[j] = somar(r[j], base)
			else
				r[j] = base
		}
	}
	
	// Simplifica (remove zeros)
	for (i in r)
		if (eZero(r[i]))
			delete r[i]
	
	return r
}

// Verifica se a unidade é uma temperatura simples
// Retorna false caso não seja
// Retorna o nome da unidade caso seja
Unidade.prototype.eTemperatura = function () {
	var i, j, um = false, unidades = ["K", "ºC", "ºF", "R"]
	
	// Verifica se tem alguma outra unidade (ou mais de uma)
	for (i in this.unidades) {
		if (um || unidades.indexOf(i) == -1)
			return false
		um = true
	}
	if (!um)
		return false
	
	// Verifica se tem somente um fator de temperatura
	for (j in this.unidades[i])
		if (j != "")
			return false
	
	// Verifica se o expoente é 1
	if (!eUm(this.unidades[i][""]))
		return false
	return i
}
