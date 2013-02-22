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

// Soma esse vetor com outro e retorna o resultado
Vetor.prototype.somar = function (outro, escopo) {
	var i, r = new Vetor
	if (this.expressoes.length != outro.expressoes.length)
		throw "Tamanhos inconsistentes"
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(executar(new Funcao("+", [this.expressoes[i], outro.expressoes[i]]), escopo))
	return r
}

// Subtrai outro vetor deste e retorna o resultado
Vetor.prototype.subtrair = function (outro, escopo) {
	var i, r = new Vetor
	if (this.expressoes.length != outro.expressoes.length)
		throw "Tamanhos inconsistentes"
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(executar(new Funcao("-", [this.expressoes[i], outro.expressoes[i]]), escopo))
	return r
}

// Retorna -this
Vetor.prototype.oposto = function (escopo) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(executar(new Funcao("-", [this.expressoes[i]]), escopo))
	return r
}

// Retorna a multiplicação desse vetor com um número
Vetor.prototype.multiplicar = function (num, escopo) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(executar(new Funcao("*", [this.expressoes[i], num]), escopo))
	return r
}

// Retorna a divisão desse vetor com um número
Vetor.prototype.dividir = function (num, escopo) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(executar(new Funcao("/", [this.expressoes[i], num]), escopo))
	return r
}

// Retorna o módulo desse vetor com um número
Vetor.prototype.modulo = function (num, escopo) {
	var i, r = new Vetor
	for (i=0; i<this.expressoes.length; i++)
		r.expressoes.push(executar(new Funcao("%", [this.expressoes[i], num]), escopo))
	return r
}

// Retorna se dois vetores são iguais
Vetor.prototype.igual = function (outro, escopo) {
	var i, r, igual
	if (this.expressoes.length != outro.expressoes.length)
		return new Fracao(0, 1)
	if (this.expressoes.length == 0)
		return new Fracao(1, 1)
	r = new Expressao
	for (i=0; i<this.expressoes.length; i++) {
		igual = new Funcao("==", [this.expressoes[i], outro.expressoes[i]])
		if (i)
			r.elementos = [new Funcao("&&", [r.elementos[0], igual])]
		else
			r.elementos.push(igual)
	}
	return executar(r, escopo)
}

// Retorna se dois vetores são diferentes
Vetor.prototype.diferente = function (outro, escopo) {
	var i, r, igual
	if (this.expressoes.length != outro.expressoes.length)
		return new Fracao(1, 1)
	if (this.expressoes.length == 0)
		return new Fracao(0, 1)
	r = new Expressao
	for (i=0; i<this.expressoes.length; i++) {
		igual = new Funcao("!=", [this.expressoes[i], outro.expressoes[i]])
		if (i)
			r.elementos = [new Funcao("||", [r.elementos[0], igual])]
		else
			r.elementos.push(igual)
	}
	return executar(r, escopo)
}
