"use strict";

// Representa um valor numérico com unidade
function ValorComUnidade(valor, unidade) {
	this.valor = valor
	this.unidade = unidade
}

// Retorna um clone do objeto
ValorComUnidade.prototype.clonar = function () {
	return new ValorComUnidade(this.valor.clonar(), this.unidade.clonar())
}

// Retorna a representação de string do objeto
ValorComUnidade.prototype.toString = function () {
	var valor = String(this.valor)
	valor = valor.indexOf("+") != -1 || valor.indexOf("-", 1) != -1 ? "("+valor+")" : valor
	return valor+"_"+this.unidade
}

// Retorna o valor com unidade convertido para outra unidade
ValorComUnidade.prototype.converter = function (unidade) {
	var base1, base2, fator1, fator2, fator
	
	base1 = this.unidade.getBases()
	base2 = unidade.getBases()
	if (!Unidade.saoBasesIdenticas(base1, base2))
		throw "Erro na conversão de unidades"
	
	fator1 = this.unidade.getFator()
	fator2 = unidade.getFator()
	fator = dividir(fator1, fator2)
	return new ValorComUnidade(multiplicar(this.valor, fator), unidade.clonar())
}

/*

= Operações binárias =

*/
ValorComUnidade.prototype.somar = function (outro) {
	outro = outro.converter(this.unidade)
	return new ValorComUnidade(somar(this.valor, outro.valor), this.unidade)
}
ValorComUnidade.prototype.subtrair = function (outro) {
	outro = outro.converter(this.unidade)
	return new ValorComUnidade(subtrair(this.valor, outro.valor), this.unidade)
}
ValorComUnidade.prototype.multiplicar = function (outro) {
	var v = multiplicar(this.valor, outro.valor)
	var u = this.unidade.multiplicar(outro.unidade)
	return new ValorComUnidade(v, u)
}
ValorComUnidade.prototype.dividir = function (outro) {
	var v = dividir(this.valor, outro.valor)
	var u = this.unidade.multiplicar(outro.unidade.pow(new Fracao(-1, 1)))
	return new ValorComUnidade(v, u)
}
ValorComUnidade.prototype.pow = function (num) {
	return new ValorComUnidade(pow(this.valor, num), this.unidade.pow(num))
}
ValorComUnidade.prototype.atan2 = function (outro) {
	outro = outro.converter(this.unidade)
	return atan2(this.valor, outro.valor)
}
ValorComUnidade.prototype.max = function (outro) {
	var outro2 = outro.converter(this.unidade)
	if (eIdentico(max(this.valor, outro2.valor), this.valor))
		return this.clonar()
	return outro.clonar()
}
ValorComUnidade.prototype.min = function (outro) {
	var outro2 = outro.converter(this.unidade)
	if (eIdentico(min(this.valor, outro2.valor), this.valor))
		return this.clonar()
	return outro.clonar()
}

/*

= Operações unárias =

*/
ValorComUnidade.prototype.abs = function () {
	return new ValorComUnidade(this.valor.abs(), this.unidade.clonar())
}
ValorComUnidade.prototype.floor = function () {
	return new ValorComUnidade(this.valor.floor(), this.unidade.clonar())
}
ValorComUnidade.prototype.ceil = function () {
	return new ValorComUnidade(this.valor.ceil(), this.unidade.clonar())
}
ValorComUnidade.prototype.round = function () {
	return new ValorComUnidade(this.valor.round(), this.unidade.clonar())
}
