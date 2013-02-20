// Representa uma expressão matemática (sequência de outros objetos)
function Expressao() {
	this.elementos = []
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
Expressao.prototype.toString = function () {
	if (this.puro)
		return "'"+this.elementos.join(", ")
	else
		return this.elementos.join(", ")
}

// Retorna se um dado objeto é uma expressão pura
Expressao.ePuro = function (obj) {
	if (obj instanceof Expressao && obj.puro)
		return true
	if (obj instanceof Parenteses && obj.expressoes.length == 1 && obj.expressoes[0].puro)
		return true
	return false
}
