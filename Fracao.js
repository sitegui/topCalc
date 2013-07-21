"use strict";

/*

Trabalha com frações com precisão infinita
Uma fração é definida como n/d com:
* n, d naturais
* d > 0
* mdc(n, d) = 1

Algumas operações (como pow(-4,1/2)) caem no campo dos números complexos, retornando um número complexo
Algumas operações podem causar overflow da capacidade da Fracao (como pow(10, 100)), retornando um objeto Number ou BigNum
Outras operações podem causar overflow independente da capacidade (como 1/0), retornando Infinity ou -Infinity

Operações não definidas (como 0/0) lançam exceções

*/

// Cria uma nova fração com numerador e denominador dados
function Fracao(n, d, base) {
	this.n = n
	this.d = d===undefined ? 1 : d
	this.base = base===undefined ? 10 : base
}

// Cria uma cópia dessa fração
Fracao.prototype.clonar = function () {
	return new Fracao(this.n, this.d, this.base)
}

// Retorna uma representação em forma de string
Fracao.prototype.toMathString = function (mathML) {
	if (this.d == 1)
		if (this.base == 10)
			return mathML ? "<mn>"+this.n+"</mn>" : String(this.n)
		else if (this.base == 2)
			return mathML ? "<msub><mn>"+this.n.toString(2).toUpperCase()+"</mn><mn>2</mn></msub>" : "0b"+this.n.toString(2).toUpperCase()
		else if (this.base == 16)
			return mathML ? "<msub><mn>"+this.n.toString(16).toUpperCase()+"</mn><mn>16</mn></msub>" : "0x"+this.n.toString(16).toUpperCase()
		else
			return mathML ? "<msub><mn>"+this.n.toString(this.base).toUpperCase()+"</mn><mn>"+this.base+"</mn></msub>" : this.n.toString(this.base).toUpperCase()+"_"+this.base
	return mathML ? "<mfrac><mn>"+this.n+"</mn><mn>"+this.d+"</mn></mfrac>" : String(this.n)+"/"+String(this.d)
}

/*

= Operações binárias =

*/
Fracao.prototype.somar = function (outro) {
	var dcom, f1, f2, retorno
	dcom = mmc(this.d, outro.d)
	if (!eIntSeguro(dcom))
		return this.getNum().somar(outro.getNum())
	f1 = dcom/this.d
	f2 = dcom/outro.d
	return Fracao.simplificar(this.n*f1+outro.n*f2, dcom, this.base)
}
Fracao.prototype.subtrair = function (outro) {
	var dcom, f1, f2, retorno
	dcom = mmc(this.d, outro.d)
	if (!eIntSeguro(dcom))
		return this.getNum().subtrair(outro.getNum())
	f1 = dcom/this.d
	f2 = dcom/outro.d
	return Fracao.simplificar(this.n*f1-outro.n*f2, dcom, this.base)
}
Fracao.prototype.multiplicar = function (outro) {
	return Fracao.simplificar(this.n*outro.n, this.d*outro.d, this.base)
}
Fracao.prototype.dividir = function (outro) {
	if (this.getNum() == 0 && outro.getNum() == 0)
		throw "0/0 é indefinido"
	return Fracao.simplificar(this.n*outro.d, this.d*outro.n, this.base)
}
Fracao.prototype.modulo = function (outro) {
	var temp = this.dividir(outro)
	temp = multiplicar(outro, floor(temp))
	return subtrair(this, temp)
}
Fracao.prototype.atan2 = function (outro) {
	if (this.getNum() == 0)
		if (outro.n == 0)
			throw "atan2(0, 0) é indefinido"
		else if (outro.n > 0)
			return new Fracao(0, 1, this.base)
		else
			return Math.PI
	return this.getNum().atan2(outro.getNum())
}
Fracao.prototype.pow = function (outro) {
	var intPow, tn, td, mod, pot, rn, rd, r
	
	// Trata os casos de zero
	if (this.n == 0)
		if (outro.n == 0)
			throw "0^0 é indefinido"
		else if (outro.n > 0)
			return new Fracao(0, 1, this.base)
		else
			return Infinity
	if (outro.n == 0)
		return new Fracao(1, 1, this.base)
	
	// Calcula x^(f.n/f.d) com x, f.n, f.d inteiros positivos
	// Caso o resultado não seja inteiro, retorna null
	intPow = function (x, f) {
		var fatores, i, r, j
		fatores = fatorar(x)
		r = 1
		for (i in fatores)
			if (i == -1) {
				if (f.n%2 == 1)
					r *= -1
			} else {
				if (fatores[i]%f.d != 0)
					return null
				for (j=fatores[i]/f.d*f.n; j>0; j--) {
					r *= i
					if (!eIntSeguro(r))
						return null
				}
			}
		return r
	}
	
	// Trata o caso de expoente negativo
	if (outro.n < 0)
		if (this.n < 0)
			tn = -this.d, td = -this.n
		else
			tn = this.d, td = this.n
	else
		tn = this.n, td = this.d
	pot = outro.abs()
	
	// Trata o caso de base negativa
	if (tn < 0) {
		mod = pot.modulo(new Fracao(2, 1))
		if (mod.n == 0) mod = 0 // 1
		else if (mod.n == 1 && mod.d == 2) mod = 1 // i
		else if (mod.n == 1 && mod.d == 1) mod = 2 // -1
		else if (mod.n == 3 && mod.d == 2) mod = 3 // -i
		else return toComplexo(this).pow(toComplexo(outro))
		tn = -tn
	} else
		mod = 0
	
	// Calcula o numerador e denominador da resposta
	if ((rn = intPow(tn, pot)) === null || (rd = intPow(td, pot)) == null)
		// Resultado não exato
		r = (tn/td).pow(pot.getNum())
	else
		r = new Fracao(rn, rd, this.base)
	
	// Retorna o resultado
	switch (mod) {
	case 0: return r
	case 1: return new Complexo(new Fracao(0, 1), r)
	case 2: return subtrair(new Fracao(0, 1), r)
	case 3: return new Complexo(new Fracao(0, 1), subtrair(new Fracao(0, 1), r))
	}
}
Fracao.prototype.log = function (base) {
	var tnum, bnum, ft, fb, i, r, sinalok
	tnum = this.getNum()
	bnum = base.getNum()
	if (tnum == 0 && bnum == 0)
		throw "inf/inf é indefinido"
	if (tnum == 0)
		return -Infinity
	if (bnum == 0)
		return new Fracao(0, 1, this.base)
	if (tnum == 1 && bnum == 1)
		return "0/0 é indefinido"
	if (bnum == 1)
		return Infinity
	ft = this.abs().fatorar()
	fb = base.abs().fatorar()
	r = null
	for (i in ft) {
		// A proporção entre os expoentes dos fatores primos deve ser constante
		if (!(i in fb))
			return this.getNum().log(base.getNum())
		if (r === null) {
			r = Fracao.simplificar(ft[i], fb[i], this.base)
			if (r === null)
				return this.getNum().log(base.getNum())
			// Valida os valores do sinais
			sinalok = true
			if (bnum > 0) {
				if (tnum < 0)
					sinalok = false
			} else if (r.d%2 == 0)
				sinalok = false
			else if (r.n%2 == 0) {
				if (tnum < 0)
					sinalok = false
			} else if (tnum > 0)
				sinalok = false
			if (!sinalok)
				return toComplexo(Number(this)).log(toComplexo(base))
		}
		if (r.n*fb[i] != r.d*ft[i])
			return this.getNum().log(base.getNum())
		delete fb[i]
	}
	for (i in fb)
		// Os fatores primos devem ser os mesmos
		return this.getNum().log(base.getNum())
	return r
}
Fracao.prototype.max = function (outro) {
	if (this.getNum() > outro.getNum())
		return this.clonar()
	return outro.clonar()
}
Fracao.prototype.min = function (outro) {
	if (this.getNum() < outro.getNum())
		return this.clonar()
	return outro.clonar()
}

/*

= Operações unárias =

*/
Fracao.prototype.acos = function () {
	return this.getNum().acos()
}
Fracao.prototype.asin = function () {
	return this.getNum().asin()
}
Fracao.prototype.atan = function () {
	return this.getNum().atan()
}
Fracao.prototype.cos = function () {
	return this.getNum().cos()
}
Fracao.prototype.sin = function () {
	return this.getNum().sin()
}
Fracao.prototype.tan = function () {
	return this.getNum().tan()
}
Fracao.prototype.exp =  function () {
	return this.getNum().exp()
}
Fracao.prototype.ln = function () {
	return this.getNum().ln()
}
Fracao.prototype.abs = function () {
	return new Fracao(Math.abs(this.n), this.d, this.base)
}
Fracao.prototype.floor = function () {
	return new Fracao(Math.floor(this.getNum()), 1, this.base)
}
Fracao.prototype.ceil = function () {
	return new Fracao(Math.ceil(this.getNum()), 1, this.base)
}
Fracao.prototype.round = function () {
	return new Fracao(Math.round(this.getNum()), 1, this.base)
}
Fracao.prototype.getNum = function () {
	return this.n/this.d
}

// Retorna a fração na forma fatorada (um objeto na forma {fator:potência})
Fracao.prototype.fatorar = function () {
	var f, fd, i
	f = fatorar(this.n)
	fd = fatorar(this.d)
	for (i in fd)
		f[i] = -fd[i]
	return f
}

// Retorna um objeto simplificado para o numerador e denominador dados
// Se não for representável como fração, retorna Number
Fracao.simplificar = function (n, d, base) {
	var fcom
	
	if (!eIntSeguro(n) || !eIntSeguro(d) || d == 0)
		return n/d
	
	if (isNaN(n) || isNaN(d))
		throw "Fração inválida para simplificar"
	
	if (n == 0)
		return new Fracao(0, 1, base)
	
	fcom = mdc(n, d)
	n /= fcom
	d /= fcom
	
	if (d < 0) {
		n *= -1
		d *= -1
	}
	
	return new Fracao(n, d, base)
}

// Cria uma fração com base em fatores
Fracao.fromFatores = function (fatores) {
	var i, n, f, r = new Fracao(1, 1)
	for (i in fatores) {
		f = new Fracao(Number(i), 1)
		n = fatores[i]
		if (n > 0)
			while (n--)
				r = multiplicar(r, f)
		else if (n < 0)
			while (n++)
				r = dividir(r, f)
	}
	return r
}

// Tenta transformar um valor em fração
Fracao.toFracao = function (num, base) {
	var n, d
	if (num instanceof Fracao)
		return num
	n = num
	d = 1
	while (Math.abs(Math.round(n)-n) > 1e-6 && eIntSeguro(d)) {
		n *= 10
		d *= 10
	}
	return Fracao.simplificar(n, d, base)
}

/*

= Funções auxiliares =

*/

// Calcula o mmc entre dois inteiros seguros
function mmc(a, b) {
	var r = 1, i = 3
	
	if (!eIntSeguro(a) || !eIntSeguro(b) || a == 0 || b == 0)
		return null
	
	a = Math.abs(a)
	b = Math.abs(b)
	
	if (a*b == 0)
		return 0
	
	while (a+b != 2)
		if (a%2 == 0) {
			r *= 2
			a /= 2
			if (b%2 == 0)
				b /= 2
		} else if (b%2 == 0) {
			r *= 2
			b /= 2
		} else
			break
	
	while (a+b != 2) {
		if (a%i == 0) {
			r *= i
			a /= i
			if (b%i == 0)
				b /= i
			if (a == 1 || b == 1)
				return r*a*b
		} else if (b%i == 0) {
			r *= i
			b /= i
			if (a == 1 || b == 1)
				return r*a*b
		} else
			i += 2
	}
	
	return r
}

// Calcula o mdc entre dois inteiros seguros não nulos
function mdc(a, b) {
	var D, r, d
	
	if (!eIntSeguro(a) || !eIntSeguro(b) || a == 0 || b == 0)
		return null
	
	a = Math.abs(a)
	b = Math.abs(b)
	D = Math.max(a, b)
	r = Math.min(a, b)
	while (r != 0) {
		d = D
		D = r
		r = d%D
	}
	return D
}

// Retorna a fatoração em fatores primos de um inteiro não nulo
function fatorar(n) {
	var i = 3, fatores = {}
	var put = function (fact) {
		if (fact in fatores)
			fatores[fact]++
		else
			fatores[fact] = 1
	}
	if (n < 0) {
		put(-1)
		n = -n
	}
	while (n != 1)
		if (n%2 == 0) {
			n /= 2
			put(2)
		} else
			break
	while (n != 1)
		if (n%i == 0) {
			n /= i
			put(i)
		} else
			i += 2
	return fatores
}
