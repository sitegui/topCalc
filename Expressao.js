"use strict";

// Representa uma expressão matemática (sequência de outros objetos)
function Expressao() {
	this.elementos = arguments.length>0 ? arguments[0] : []
	this.puro = false
}

// Retorna um clone raso da expressão
Expressao.prototype.clonar = function () {
	var retorno = new Expressao
	retorno.elementos = this.elementos.clonar()
	retorno.puro = this.puro
	return retorno
}

// Retorna a representação em string
Expressao.prototype.toMathString = function (mathML) {
	var i, els
	els = []
	for (i=0; i<this.elementos.length; i++)
		els.push(this.elementos[i].toMathString(mathML))
	return (this.puro ? (mathML ? "<mo>'</mo>" : "'") : "")+els.join(mathML ? "<mo>, </mo>" : ", ")
}
