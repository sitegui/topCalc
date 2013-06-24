"use strict";

// Representa uma lista (sequência de expressões)
function Lista() {
	this.expressoes = arguments.length>0 ? arguments[0] : []
}

// Retorna um clone raso da lista
Lista.prototype.clonar = function () {
	return new Lista(this.expressoes.clonar())
}

// Retorna a representação em string
Lista.prototype.toMathString = function (mathML) {
	var i, els
	els = []
	for (i=0; i<this.expressoes.length; i++)
		els.push(this.expressoes[i].toMathString(mathML))
	return mathML ? "<mrow><mo>{</mo>"+els.join("<mo>,</mo> ")+"<mo>}</mo></mrow>" : "{"+els.join(", ")+"}"
}