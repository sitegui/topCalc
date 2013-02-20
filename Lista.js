// Representa uma lista (sequência de expressões)
function Lista() {
	this.expressoes = arguments.length>0 ? arguments[0] : []
}

// Retorna um clone raso da lista
Lista.prototype.clonar = function () {
	return new Lista(this.expressoes.clonar())
}

// Retorna a representação em string
Lista.prototype.toString = function () {
	return "{"+this.expressoes.join(", ")+"}"
}