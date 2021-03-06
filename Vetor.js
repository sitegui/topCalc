"use strict";

// Representa um vetor (sequência de expressões)
function Vetor() {
	this.expressoes = arguments.length>0 ? arguments[0] : []
}

// Clona um vetor
Vetor.prototype.clonar = function () {
	return new Vetor(this.expressoes.clonar())
}

// Cria a configuração para imprimir vetores
Config.registrar("vetorEmVersores", "Define se os vetores até 3D serão impressos na forma de soma de versores I, J e K", false, Config.setters.bool)

// Transforma em string
Vetor.prototype.toMathString = function (mathML) {
	var soma = null, i, termo, vars = "IJK", els
	if (Config.get("vetorEmVersores") && this.expressoes.length <= 3) {
		for (i=0; i<this.expressoes.length; i++) {
			if (eNumerico(this.expressoes[i]) && eZero(this.expressoes[i]))
				continue
			if (eNumerico(this.expressoes[i]) && eUm(this.expressoes[i]))
				termo = new Variavel(vars[i])
			else
				termo = new Funcao("*", [this.expressoes[i], new Variavel(vars[i])])
			soma = soma ? new Funcao("+", [soma, termo]) : termo
		}
		return soma ? soma.toMathString(mathML) : (mathML ? "<mn>0</mn><mo>*</mo><mi>I</mi>" : "0*I")
	} else {
		els = []
		for (i=0; i<this.expressoes.length; i++)
			els.push(this.expressoes[i].toMathString(mathML))
		return mathML ? "<mrow><mo>[</mo>"+els.join("<mo>,</mo> ")+"<mo>]</mo></mrow>" : "["+els.join(", ")+"]"
	}
}

// Soma esse vetor com outro e retorna o resultado
Vetor.prototype.somar = function (outro) {
	var i, r = new Vetor
	if (this.expressoes.length != outro.expressoes.length)
		throw "Tamanhos inconsistentes"
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(Funcao.executar("+", [this.expressoes[i], outro.expressoes[i]]))
	return r
}

// Subtrai outro vetor deste e retorna o resultado
Vetor.prototype.subtrair = function (outro) {
	var i, r = new Vetor
	if (this.expressoes.length != outro.expressoes.length)
		throw "Tamanhos inconsistentes"
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(Funcao.executar("-", [this.expressoes[i], outro.expressoes[i]]))
	return r
}

// Retorna -this
Vetor.prototype.oposto = function () {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(Funcao.executar("-", [this.expressoes[i]]))
	return r
}

// Retorna a multiplicação desse vetor com um número
Vetor.prototype.multiplicar = function (num) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(Funcao.executar("*", [this.expressoes[i], num]))
	return r
}

// Retorna a divisão desse vetor com um número
Vetor.prototype.dividir = function (num) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(Funcao.executar("/", [this.expressoes[i], num]))
	return r
}

// Retorna o módulo desse vetor com um número
Vetor.prototype.modulo = function (num) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(Funcao.executar("%", [this.expressoes[i], num]))
	return r
}

// Retorna se dois vetores são iguais
Vetor.prototype.igual = function (outro) {
	var i, r, igual
	if (this.expressoes.length != outro.expressoes.length)
		return new Fracao(0, 1)
	if (this.expressoes.length == 0)
		return new Fracao(1, 1)
	for (i=0; i<this.expressoes.length; i++) {
		igual = Funcao.executar("==", [this.expressoes[i], outro.expressoes[i]])
		if (i)
			r = Funcao.executar("&&", [r, igual])
		else
			r = igual
	}
	return r
}

// Retorna se dois vetores são diferentes
Vetor.prototype.diferente = function (outro) {
	var i, r, igual
	if (this.expressoes.length != outro.expressoes.length)
		return new Fracao(1, 1)
	if (this.expressoes.length == 0)
		return new Fracao(0, 1)
	for (i=0; i<this.expressoes.length; i++) {
		igual = Funcao.executar("!=", [this.expressoes[i], outro.expressoes[i]])
		if (i)
			r = Funcao.executar("||", [r, igual])
		else
			r = igual
	}
	return r
}

// Retorna a norma de um vetor
Vetor.prototype.abs = function () {
	return Funcao.executar("sqrt", [this.absSqr()])
}

// Retorna a norma ao quadrado de um vetor
Vetor.prototype.absSqr = function () {
	var soma, termo, i
	if (this.expressoes.length == 0)
		return new Fracao(0, 1)
	for (i=0; i<this.expressoes.length; i++) {
		termo = Funcao.executar("*", [this.expressoes[i], Funcao.executar("conj", [this.expressoes[i]])])
		if (i)
			soma = Funcao.executar("+", [soma, termo])
		else
			soma = termo
	}
	return soma
}
