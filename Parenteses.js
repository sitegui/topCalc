// Representa um parênteses (sequência de expressões)
function Parenteses() {
	this.expressoes = []
}

// Retorna um clone raso do parênteses
Parenteses.prototype.clonar = function () {
	var retorno = new Parenteses
	retorno.expressoes = this.expressoes.clonar()
	return retorno
}

// Retorna a representação em string
Parenteses.prototype.toString = function () {
	return this.expressoes.join(", ")
}
