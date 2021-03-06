"use strict";

// Representa uma variável
function Variavel(nome) {
	this.nome = nome
}

// Guarda as variáveis
Variavel.valores = {}

// Faz backup de uma variável com o nome dado
// variavel pode ser uma string, um vetor de strings ou omitido para backup geral
// Retorna um valor que deve ser passado à Variavel.restaurar()
Variavel.backup = function (variavel) {
	var i, retorno = {}
	if (variavel === undefined)
		variavel = Object.keys(Variavel.valores)
	else if (typeof variavel == "string")
		variavel = [variavel]
	for (i=0; i<variavel.length; i++)
		retorno[variavel[i]] = Variavel.valores[variavel[i]]
	return retorno
}

// Restaura os valores salvos com Variavel.backup
Variavel.restaurar = function (backup) {
	var i
	for (i in backup) {
		if (backup[i] === undefined)
			delete Variavel.valores[i]
		else
			Variavel.valores[i] = backup[i]
	}
}

// Clona um objeto variável
Variavel.prototype.clonar = function () {
	return new Variavel(this.nome)
}

// Transforma em string
Variavel.prototype.toMathString = function (mathML) {
	return mathML ? "<mi>"+this.nome+"</mi>" : this.nome
}

// Retorna o valor de uma variável
// vars contém uma lista de variáveis que devem ser tidas como indefinidas
Variavel.prototype.get = function (vars) {
	var r, antes
	
	vars = vars===undefined ? [] : vars
	if (vars.indexOf(this.nome) == -1 && this.nome in Variavel.valores) {
		antes = executar.preExecutar
		vars = vars.clonar()
		vars.push(this.nome)
		if (antes == 1)
			executar.preExecutar = 0
		r = executar(Variavel.valores[this.nome], vars)
		if (antes == 1)
			executar.preExecutar = 1
		return r
	} else
		return this.clonar()
}

// Retorna o valor mais imediato de uma variável (sem executá-lo)
// vars contém uma lista de variáveis que devem ser tidas como indefinidas
Variavel.prototype.getDireto = function () {
	if (this.nome in Variavel.valores)
		return Variavel.valores[this.nome]
	else
		return null
}
