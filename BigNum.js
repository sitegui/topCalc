/*

Representa números realmente muito grandes com uma precisão razoável
Os números são armazenados como uma torre de potências de 10
ex: 10^10^10^3.1415

Algumas operações (como pow(-4,.5)) caem no campo dos números complexos, retornando um número complexo
Outras operações podem causar overflow (como 1/0), retornando Infinity ou -Infinity

Operações não definidas (como 0/0) lançam exceções

*/

// Cria um novo BigNum com valor inicial 1
function BigNum() {
	this.zero = false // Indica se é zero
	this.negativo = false
	this.pequeno = false // Indica o sinal do expoente do primeiro 10^
	this.nivel = 0 // Indica o número de 10^
	this.expoente = 1 // Indica o expoente do último 10^ (1 <= expoente < 10)
}

// Retorna uma cópia desse BigNum
BigNum.prototype.clonar = function () {
	var r = new BigNum
	r.zero = this.zero
	r.negativo = this.negativo
	r.pequeno = this.pequeno
	r.nivel = this.nivel
	r.expoente = this.expoente
	return r
}

// Retorna uma representação em forma de string
BigNum.prototype.toString = function () {
	var r = "", i
	if (this.zero)
		return "0"
	if (this.negativo)
		r += "-"
	if (this.pequeno)
		r += "1/"
	i = this.nivel
	while (i--)
		r += "10^"
	r += this.expoente
	return r
}

/*

= Operações binárias =

*/
BigNum.prototype.somar = function (outro) {
	var vt, vo
	if (outro.zero)
		return this.clonar()
	if (this.zero)
		return outro.clonar()
	if (this.nivel < 3 && outro.nivel < 3) {
		vt = this.getNum()
		vo = outro.getNum()
		if (Math.abs(vt) != Infinity && Math.abs(vo) != Infinity && vt != 0 && vo != 0)
			return BigNum.fromNumber(vt+vo)
	}
	return outro.multiplicar(BigNum.somarUm(this.dividir(outro)))
}
BigNum.prototype.subtrair = function (outro) {
	outro = outro.clonar()
	outro.negativo = !outro.negativo
	return this.somar(outro)
}
BigNum.prototype.multiplicar = function (outro) {
	var tabs, oabs, r
	if (this.zero || outro.zero)
		return BigNum.zero()
	tabs = this.abs()
	oabs = outro.abs()
	r = tabs.log10().somar(oabs.log10()).pow10()
	if (this.negativo ^ outro.negativo)
		r.negativo = true
	return r
}
BigNum.prototype.dividir = function (outro) {
	var tabs, oabs, r
	if (outro.zero && this.zero)
		throw "0/0 é indefinido"
	if (this.zero)
		return BigNum.zero()
	if (outro.zero)
		return Infinity
	tabs = this.abs()
	oabs = outro.abs()
	r = tabs.log10().subtrair(oabs.log10()).pow10()
	if (this.negativo ^ outro.negativo)
		r.negativo = true
	return r
}
BigNum.prototype.modulo = function (outro) {
	var temp = this.dividir(outro)
	temp = multiplicar(outro, floor(temp))
	return subtrair(this, temp)
}
BigNum.prototype.atan2 = function (outro) {
	return atan2(this.getNum(), outro.getNum())
}
BigNum.prototype.pow = function (outro) {
	var r
	if (this.zero && outro.zero)
		throw "0^0 é indefinido"
	if (this.zero)
		if (outro.negativo)
			return Infinity
		else
			return BigNum.zero()
	if (this.negativo)
		return toComplexo(Number(this)).pow(toComplexo(outro))
	return this.log10().multiplicar(outro).pow10()
}
BigNum.prototype.log = function (base) {
	return dividir(this.ln(), base.ln())
}
BigNum.prototype.max = function (outro) {
	if (this.zero) {
		if (outro.zero || outro.negativo)
			return BigNum.zero()
		return outro.clonar()
	}
	if (outro.zero) {
		if (this.negativo)
			return BigNum.zero()
		return this.clonar()
	}
	if (this.negativo && !outro.negativo)
		return outro.clonar()
	if (!this.negativo && outro.negativo)
		return this.clonar()
	if (this.pequeno && !outro.pequeno) {
		if (this.negativo)
			return this.clonar()
		return outro.clonar()
	}
	if (!this.pequeno && outro.pequeno) {
		if (this.negativo)
			return outro.clonar()
		return this.clonar()
	}
	if (this.nivel > outro.nivel) {
		if (this.negativo == this.pequeno)
			return this.clonar()
		return outro.clonar()
	}
	if (outro.nivel > this.nivel) {
		if (outro.negativo == outro.pequeno)
			return outro.clonar()
		return this.clonar()
	}
	if (this.negativo == this.pequeno)
		return this.clonar()
	return outro.clonar()
}
BigNum.prototype.min = function (outro) {
	if (this.zero) {
		if (outro.zero || !outro.negativo)
			return BigNum.zero()
		return outro.clonar()
	}
	if (outro.zero) {
		if (!this.negativo)
			return BigNum.zero()
		return this.clonar()
	}
	if (this.negativo && !outro.negativo)
		return this.clonar()
	if (!this.negativo && outro.negativo)
		return outro.clonar()
	if (this.pequeno && !outro.pequeno) {
		if (this.negativo)
			return outro.clonar()
		return this.clonar()
	}
	if (!this.pequeno && outro.pequeno) {
		if (this.negativo)
			return this.clonar()
		return outro.clonar()
	}
	if (this.nivel > outro.nivel) {
		if (this.negativo == this.pequeno)
			return outro.clonar()
		return this.clonar()
	}
	if (outro.nivel > this.nivel) {
		if (outro.negativo == outro.pequeno)
			return this.clonar()
		return outro.clonar()
	}
	if (this.negativo == this.pequeno)
		return outro.clonar()
	return this.clonar()
}

/*

= Operações unárias =

*/
BigNum.prototype.acos = function () {
	return acos(this.getNum())
}
BigNum.prototype.asin = function () {
	return asin(this.getNum())
}
BigNum.prototype.atan = function () {
	return atan(this.getNum())
}
BigNum.prototype.cos = function () {
	return cos(this.getNum())
}
BigNum.prototype.sin = function () {
	return sin(this.getNum())
}
BigNum.prototype.tan = function () {
	return tan(this.getNum())
}
BigNum.prototype.exp =  function () {
	return pow(Math.E, this)
}
BigNum.prototype.ln = function () {
	if (this.zero)
		return -Infinity
	if (this.negativo)
		return toComplexo(Number(this)).ln()
	return multiplicar(Math.LN10, this.log10())
}
BigNum.prototype.abs = function () {
	var r = this.clonar()
	r.negativo = false
	return r
}
// TODO: floor, ceil e round
BigNum.prototype.floor = function () {
	return BigNum.fromNumber(Math.floor(this.getNum()))
}
BigNum.prototype.ceil = function () {
	return BigNum.fromNumber(Math.ceil(this.getNum()))
}
BigNum.prototype.round = function () {
	return BigNum.fromNumber(Math.round(this.getNum()))
}

/*

= Funções auxiliares =

*/
BigNum.somarUm = function (x) {
	var valor = x.getNum()
	if (valor == 0)
		return new BigNum
	if (eInfinito(valor))
		return x.clonar()
	return BigNum.fromNumber(valor+1)
}
BigNum.fromNumber = function (valor) {
	var r = new BigNum
	if (valor == 0) {
		r.zero = true
		return r
	}
	if (valor < 0) {
		valor = -valor
		r.negativo = true
	}
	if (valor < 1) {
		valor = 1/valor
		r.pequeno = true
	}
	while (valor >= 10) {
		r.nivel++
		valor = Math.log(valor)/Math.LN10
	}
	r.expoente = valor
	return r
}
BigNum.zero = function () {
	var r = new BigNum
	r.zero = true
	return r
	
}
BigNum.prototype.log10 = function () {
	var r
	if (this.zero || this.negativo)
		throw "Erro em BigNum.log10()"
	if (this.nivel == 0)
		return BigNum.fromNumber(Math.log(this.getNum())/Math.LN10)
	r = this.clonar()
	r.negativo = r.pequeno
	r.pequeno = false
	r.nivel--
	return r
}
BigNum.prototype.getNum = function () {
	var valor, nivel
	if (this.zero)
		return 0
	nivel = this.nivel
	valor = this.expoente
	while (nivel > 0) {
		nivel--
		valor = Math.pow(10, valor)
	}
	if (this.negativo)
		valor = -valor
	if (this.pequeno)
		valor = 1/valor
	return valor
}
BigNum.prototype.pow10 = function () {
	var r
	if (this.zero)
		return new BigNum
	r = new BigNum
	r.pequeno = this.negativo
	if (this.pequeno) {
		// TODO: deixar o expoente normalizado
		r.expoente = this.abs().getNum()
		r.nivel = 1
		return r
	}
	r.nivel = this.nivel+1
	r.expoente = this.expoente
	return r
}
