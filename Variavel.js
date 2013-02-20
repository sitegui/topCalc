// Representa uma variável
function Variavel(nome) {
	this.nome = nome
}

// Guarda as variáveis
Variavel.valores = {}

// Clona um objeto variável
Variavel.prototype.clonar = function () {
	return new Variavel(this.nome)
}

// Transforma em string
Variavel.prototype.toString = function () {
	return this.nome
}

// Retorna o valor de uma variável
// vars contém uma lista de variáveis que devem ser tidas como indefinidas
Variavel.prototype.get = function (vars) {
	vars = vars===undefined ? [] : vars
	if (vars.indexOf(this.nome) == -1 && this.nome in Variavel.valores) {
		vars = vars.clonar()
		vars.push(this.nome)
		return executar(Variavel.valores[this.nome], vars)
	} else
		return this.clonar()
}

// Retorna o valor mais imediato de uma variável (sem executá-lo)
// vars contém uma lista de variáveis que devem ser tidas como indefinidas
Variavel.prototype.getDireto = function (vars) {
	vars = vars===undefined ? [] : vars
	if (vars.indexOf(this.nome) == -1 && this.nome in Variavel.valores)
		return Variavel.valores[this.nome]
	else
		return null
}
