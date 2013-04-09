"use strict";

// Representa um polinômio de coeficientes numéricos e tem métodos para lidar com eles
// termos é uma array com os termos: [a0, a1, a2, ...] = a0+a1*x+a2*x^2+...
// Todos os valores numéricos são do tipo double
function Polinomio(termos) {
	this.termos = termos===undefined ? [] : termos
}

// Retorna um objeto clone do polinômio
Polinomio.prototype.clonar = function () {
	return new Polinomio(this.termos.map(clonar))
}

// Mostra o polinômio na forma de string
Polinomio.prototype.toString = function () {
	var i, termos = []
	for (i=0; i<this.termos.length; i++)
		termos.push(this.termos[i]+(i==0 ? "" : (i==1 ? "x" : "x^"+i)))
	return termos.join("+")
}

// Calcula o valor do polinômio para um dado valor numérico x
Polinomio.prototype.avaliar = function (x) {
	var r, i, t
	if (this.termos.length == 0)
		return 0
	r = this.termos[this.termos.length-1]
	for (i=this.termos.length-2; i>=0; i--) {
		r = multiplicar(r, x)
		r = somar(r, this.termos[i])
	}
	return r
}

// Calcula o valor do polinômio para um dado valor numérico a+bi
Polinomio.prototype.avaliarAB = function (a, b) {
	var i = new Complexo(0, 1)
	return this.avaliar(somar(a, multiplicar(b, i)))
}

// Retorna o polinômio que é a derivada
Polinomio.prototype.derivar = function () {
	var r = [], i
	for (i=1; i<this.termos.length; i++)
		r.push(multiplicar(this.termos[i], i))
	return new Polinomio(r)
}

// Retorna a derivada do polinômio de p(a+bi) em a
Polinomio.prototype.derivarA = function () {
	return this.derivar()
}

// Retorna a derivada do polinômio de p(a+bi) em b
Polinomio.prototype.derivarB = function () {
	var r = [], i, f
	for (i=1; i<this.termos.length; i++) {
		f = new Complexo(0, i)
		r.push(multiplicar(this.termos[i], f))
	}
	return new Polinomio(r)
}

// Calcula uma raiz do polinômio
// Usa o método de Newton alterado para números complexos e retorna valores aproximados
Polinomio.prototype.getRaiz = function () {
	var a, b, i, fa, fb, ma, mb, a2, b2, r
	
	// Chutes iniciais
	a = 1.7
	b = 1.7
	fa = this.derivarA()
	fb = this.derivarB()
	
	// Itera, obtendo valores mais próximos
	for (i=0; i<100; i++) {
		a2 = a
		b2 = b
		a = subtrair(a, dividir(this.avaliarAB(a, b), fa.avaliarAB(a, b)))
		b = subtrair(b, dividir(this.avaliarAB(a, b), fb.avaliarAB(a, b)))
		ma = abs(subtrair(a, a2))
		mb = abs(subtrair(b, b2))
		if (Math.max(ma, mb) < _epsilon)
			break
	}
	
	// Retorna o valor
	r = somar(a, multiplicar(b, new Complexo(0, 1)))
	return multiplicar(_epsilon, round(dividir(r, _epsilon)))
}

// Retorna um polinômio com a raiz dada a menos (divide por x-a)
Polinomio.prototype.removerRaiz = function (a) {
	var r = [], i, t
	
	if (this.termos.length == 0)
		throw "Impossível dividir polinômios"
	
	t = this.termos[this.termos.length-1]
	for (i=this.termos.length-2; i>=0; i--) {
		r[i] = t
		t = multiplicar(t, a)
		t = somar(t, this.termos[i])
	}
	r[i] = t
	
	return new Polinomio(r)
}

// Calcula todas as raízes de um polinômio
Polinomio.prototype.getRaizes = function () {
	var r = [], i, n, raiz, p
	
	n = this.termos.length-1
	p = this
	for (i=0; i<n; i++) {
		raiz = p.getRaiz()
		p = p.removerRaiz(raiz)
		r.push(raiz)
	}
	
	return r
}

// Retorna o polinômio que é a subtração desse por outro
Polinomio.prototype.subtrair = function (outro) {
	var r = [], max, i
	
	max = Math.max(this.termos.length, outro.termos.length)
	for (i=0; i<max; i++) {
		if (i < this.termos.length && i < outro.termos.length)
			r.push(subtrair(this.termos[i], outro.termos[i]))
		else if (i < outro.termos.length)
			r.push(subtrair(0, outro.termos[i]))
		else
			r.push(this.termos[i])
	}
	
	return new Polinomio(r)
}

// Retorna o polinômio que é o produto desse por a*x^n
Polinomio.prototype.multiplicarTermo = function (a, n) {
	var i, r = []
	for (i=0; i<this.termos.length; i++)
		r[i+n] = multiplicar(this.termos[i], a)
	for (i=0; i<n; i++)
		r[i] = 0
	return new Polinomio(r)
}

// Retorna o polinômio que é o produto desse por outro
Polinomio.prototype.multiplicar = function (outro) {
	var r = [], i, j, t
	
	for (i=0; i<this.termos.length; i++)
		for (j=0; j<outro.termos.length; j++) {
			t = multiplicar(this.termos[i], outro.termos[j])
			r[i+j] = (i+j) in r ? somar(r[i+j], t) : t
		}
	
	return new Polinomio(r)
}

// Retorna o polinômio que é o resultado "inteiro" da divisão desse por outro
Polinomio.prototype.dividir = function (outro) {
	var g, i, r = [], d, j
	
	g = this.termos.length-outro.termos.length
	d = this
	for (i=g; i>=0; i--) {
		r[i] = dividir(d.termos[d.termos.length-1], outro.termos[outro.termos.length-1])
		d = d.subtrair(outro.multiplicarTermo(r[i], i))
		d.termos.pop()
	}
	
	return new Polinomio(r)
}

// TODO: colocar num lugar melhor
Funcao.registrar("roots", "roots(a0, a1, ...)", function () {
	var p = new Polinomio([].slice.call(arguments, 0))
	return new Lista(p.getRaizes())
}, false, false, true)
Funcao.registrar("pol", "pol(x, a0, a1, ...)", function (x) {
	var p = new Polinomio([].slice.call(arguments, 1))
	return p.avaliar(x)
}, false, false, true)
