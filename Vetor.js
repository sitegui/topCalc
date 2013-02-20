// Representa um vetor (sequência de expressões)
function Vetor() {
	this.expressoes = arguments.length>0 ? arguments[0] : []
}

// Clona um vetor
Vetor.prototype.clonar = function () {
	return new Vetor(this.expressoes.clonar())
}

// Transforma em string
Vetor.prototype.toString = function () {
	return "["+this.expressoes.join(", ")+"]"
}
