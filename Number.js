/*

Trabalha com números double, expandindo o objeto nativo Number
Os valores NaN, Infinity e -Infinity não devem ser usados nas operações definidas aqui

Algumas operações (como pow(-4,.5)) caem no campo dos números complexos, retornando um Complexo
Algumas operações podem causar overflow da capacidade do Number (como pow(10, 1e100)), retornando um BigNum
Outras operações podem causar overflow independente da capacidade (como 1/0), retornando Infinity ou -Infinity

Operações não definidas (como 0/0) lançam exceções

*/

// Cria uma cópia dessa fração
Number.prototype.clonar = function () {
	return this
}

/*

= Operações binárias =

*/
Number.prototype.somar = function (outro) {
	var r = this+outro
	if (Math.abs(r) == Infinity || (r == 0 && this != -outro))
		return toBigNum(Number(this)).somar(toBigNum(outro))
	return r
}
Number.prototype.subtrair = function (outro) {
	var r = this-outro
	if (Math.abs(r) == Infinity || (r == 0 && this != outro))
		return toBigNum(Number(this)).subtrair(toBigNum(outro))
	return r
}
Number.prototype.multiplicar = function (outro) {
	var r = this*outro
	if (Math.abs(r) == Infinity || (r == 0 && this != 0 && outro != 0))
		return toBigNum(Number(this)).multiplicar(toBigNum(outro))
	return r
}
Number.prototype.dividir = function (outro) {
	var r = this/outro
	if (this == 0 && outro == 0)
		throw "0/0 é indefinido"
	if ((Math.abs(r) == Infinity && outro != 0) || (r == 0 && this != 0))
		return toBigNum(Number(this)).dividir(toBigNum(outro))
	return r
}
Number.prototype.modulo = function (outro) {
	var temp = this.dividir(outro)
	temp = multiplicar(outro, floor(temp))
	return subtrair(this, temp)
}
Number.prototype.atan2 = function (outro) {
	if (this == 0 && outro == 0)
		throw "atan2(0, 0) é indefinido"
	return Math.atan2(this, outro)
}
Number.prototype.pow = function (outro) {
	var r = Math.pow(this, outro)
	if (this == 0 && outro == 0)
		throw "0^0 indefinido"
	if (this < 0 && Math.round(outro) != outro)
		return toComplexo(Number(this)).pow(toComplexo(outro))
	if ((Math.abs(r) == Infinity && (this != 0 || outro >= 0)) || (r == 0 && this != 0))
		return toBigNum(Number(this)).pow(toBigNum(outro))
	return r
}
Number.prototype.log = function (base) {
	return dividir(this.ln(), base.ln())
}
Number.prototype.max = function (outro) {
	return Math.max(this, outro)
}
Number.prototype.min = function (outro) {
	return Math.min(this, outro)
}

/*

= Operações unárias =

*/
Number.prototype.acos = function () {
	if (this < -1 || this > 1)
		return toComplexo(Number(this)).acos()
	return Math.acos(this)
}
Number.prototype.asin = function () {
	if (this < -1 || this > 1)
		return toComplexo(Number(this)).asin()
	return Math.asin(this)
}
;["atan", "cos", "sin", "tan", "exp", "abs", "floor", "ceil", "round"].forEach(function (op) {
	Number.prototype[op] = function () {
		return Math[op](this)
	}
})
Number.prototype.ln = function () {
	var r = Math.log(this)
	if (isNaN(r))
		return toComplexo(Number(this)).ln()
	return r
}
