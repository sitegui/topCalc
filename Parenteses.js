"use strict";

// Representa um parênteses (sequência de expressões)
function Parenteses() {
	this.expressoes = arguments.length>0 ? arguments[0] : []
}

// Retorna um clone raso do parênteses
Parenteses.prototype.clonar = function () {
	return new Parenteses(this.expressoes.clonar())
}

// Retorna a representação em string
Parenteses.prototype.toMathString = function (mathML) {
	var i, els
	els = []
	for (i=0; i<this.expressoes.length; i++)
		els.push(this.expressoes[i].toMathString(mathML))
	return mathML ? "<mrow><mo>(</mo>"+els.join("<mo>,</mo> ")+"<mo>)</mo></mrow>" : "("+els.join(", ")+")"
}
