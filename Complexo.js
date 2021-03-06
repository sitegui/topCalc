"use strict";

/*

Trabalha com números complexos
Eles são armazenados na forma a+bi com a, b reais (Fracao, Number ou BigNum)

Operações não definidas (como 0/0) lançam exceções

*/

// Cria um novo complexo a+bi
function Complexo(a, b) {
	this.a = a
	this.b = b
}

// Retorna uma cópia desse complexo
Complexo.prototype.clonar = function () {
	return new Complexo(this.a.clonar(), this.b.clonar())
}

// Retorna uma representação em forma de string
Complexo.prototype.toMathString = function (mathML) {
	var i, i2
	if (eZero(this.b))
		return this.a.toMathString(mathML)
	i = this.b.toMathString(false)
	if (i == "1")
		i2 = mathML ? "<mi>i</mi>" : "i"
	else if (i == "-1")
		i2 = mathML ? "<mo>-</mo><mi>i</mi>" : "-i"
	else
		i2 = mathML ? this.b.toMathString(true)+"<mi>i</mi>" : i+"i"
	if (eZero(this.a))
		return i2
	return this.a.toMathString(mathML)+(i.charAt(0)=="-" ? i2 : (mathML ? "<mo>+</mo>" : "+")+i2)
}

/*

= Operações binárias =

*/
Complexo.prototype.somar = function (outro) {
	return new Complexo(somar(this.a, outro.a), somar(this.b, outro.b))
}
Complexo.prototype.subtrair = function (outro) {
	return new Complexo(subtrair(this.a, outro.a), subtrair(this.b, outro.b))
}
Complexo.prototype.multiplicar = function (outro) {
	var a = subtrair(multiplicar(this.a, outro.a), multiplicar(this.b, outro.b))
	var b = somar(multiplicar(this.a, outro.b), multiplicar(this.b, outro.a))
	return new Complexo(a, b)
}
Complexo.prototype.dividir = function (outro) {
	var den = somar(multiplicar(outro.a, outro.a), multiplicar(outro.b, outro.b))
	var a = dividir(somar(multiplicar(this.a, outro.a), multiplicar(this.b, outro.b)), den)
	var b = dividir(subtrair(multiplicar(this.b, outro.a), multiplicar(this.a, outro.b)), den)
	return new Complexo(a, b)
}
Complexo.prototype.modulo = function (outro) {
	var temp = this.dividir(outro)
	temp = multiplicar(outro, floor(temp))
	return subtrair(this, temp)
}
// TODO: como?
Complexo.prototype.atan2 = function (outro) {
	return atan(this.dividir(outro))
	
}
Complexo.prototype.pow = function (outro) {
	return exp(multiplicar(outro, this.ln()))
}
Complexo.prototype.log = function (base) {
	return dividir(this.ln(), base.ln())
}
Complexo.prototype.max = function (outro) {
	var tabs, oabs
	tabs = this.abs()
	oabs = outro.abs()
	if (max(tabs, oabs) == tabs)
		return this.clonar()
	return outro.clonar()
}
Complexo.prototype.min = function (outro) {
	var tabs, oabs
	tabs = this.abs()
	oabs = outro.abs()
	if (min(tabs, oabs) == tabs)
		return this.clonar()
	return outro.clonar()
}

/*

= Operações unárias =

*/
Complexo.prototype.acos = function () {
	var a, b
	// acos(x) = pi/2+i*ln(i*x+sqrt(1-x^2))
	a = pow(subtrair(1, this.multiplicar(this)), .5)
	b = ln(somar(this.multiplicar(new Complexo(0, 1)), a))
	return somar(Math.PI/2, multiplicar(new Complexo(0, 1), b))
}
Complexo.prototype.asin = function () {
	var a, b
	// asin(x) = -i*ln(i*x+sqrt(1-x^2))
	a = pow(subtrair(1, this.multiplicar(this)), .5)
	b = ln(somar(this.multiplicar(new Complexo(0, 1)), a))
	return multiplicar(new Complexo(0, -1), b)
}
Complexo.prototype.atan = function () {
	var a, b, c
	// atan(x) = i/2*(ln(1-i*x)-ln(1+i*x))
	a = ln(subtrair(1, this.multiplicar(new Complexo(0, 1))))
	b = ln(somar(1, this.multiplicar(new Complexo(0, 1))))
	return multiplicar(new Complexo(0, 1/2), subtrair(a, b))
}
Complexo.prototype.cos = function () {
	var a, b
	// cos(x) = (exp(x*i)+exp(-x*i))/2
	a = exp(this.multiplicar(new Complexo(0, 1)))
	b = exp(this.multiplicar(new Complexo(0, -1)))
	return dividir(somar(a, b), 2)
}
Complexo.prototype.sin = function () {
	var a, b
	// sin(x) = (exp(x*i)-exp(-x*i))/(2*i)
	a = exp(this.multiplicar(new Complexo(0, 1)))
	b = exp(this.multiplicar(new Complexo(0, -1)))
	return dividir(subtrair(a, b), new Complexo(0, 2))
}
Complexo.prototype.tan = function () {
	// tan(x) = sin(x)/cos(x)
	return dividir(this.sin(), this.cos())
}
Complexo.prototype.exp = function () {
	var ea = exp(this.a)
	// exp(a+bi) = exp(a)*cos(b)+i*exp(a)*sin(b)
	return new Complexo(multiplicar(ea, cos(this.b)), multiplicar(ea, sin(this.b)))
}
Complexo.prototype.abs = function () {
	var a
	// abs(a+bi) = sqrt(a*a+b*b)
	a = somar(multiplicar(this.a, this.a), multiplicar(this.b, this.b))
	return pow(a, .5)
}
Complexo.prototype.floor = function () {
	return new Complexo(floor(this.a), floor(this.b))
}
Complexo.prototype.ceil = function () {
	return new Complexo(ceil(this.a), ceil(this.b))
}
Complexo.prototype.round = function () {
	return new Complexo(round(this.a), round(this.b))
}
Complexo.prototype.ln = function () {
	// ln(x) = ln(abs(x))+i*arg(x)
	if (eZero(this))
		return -Infinity
	return new Complexo(ln(this.abs()), this.arg())
}
Complexo.prototype.arg = function () {
	return atan2(this.b, this.a)
}
