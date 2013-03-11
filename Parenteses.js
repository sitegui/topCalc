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
Parenteses.prototype.toString = function () {
	return "("+this.expressoes.join(", ")+")"
}
