"use strict";

// Representa um operador (usado temporariamente, depois é transformado em função)
function Operador(valor) {
	this.valor = valor
}

// Retorna um clone do operador
Operador.prototype.clonar = function () {
	return new Operador(this.valor)
}

// Retorna como string
Operador.prototype.toMathString = function (mathML) {
	var op = Console.escaparHTML(this.valor)
	return mathML ? "<mo>"+op+"</mo>" : op
}
