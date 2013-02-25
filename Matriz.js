// Representa uma matriz (tabela de expressões)
// Para construir uma matriz vazia, use new Matriz()
function Matriz(expressoes, colunas) {
	// Sempre this.linhas*this.colunas == this.expressoes.length
	if (expressoes !== undefined && colunas !== undefined) {
		this.expressoes = expressoes // linearizado
		this.linhas = expressoes.length/colunas
		this.colunas = colunas
	} else {
		this.expressoes = [] // linearizado
		this.linhas = 0
		this.colunas = 0
	}
}

// Retorna um clone raso da matriz
Matriz.prototype.clonar = function () {
	var r = new Matriz
	r.expressoes = this.expressoes.clonar()
	r.linhas = this.linhas
	r.colunas = this.colunas
	return r
}

// Retorna a representação em string
Matriz.prototype.toString = function () {
	var i, j, r = "|"
	for (i=1; i<=this.linhas; i++) {
		if (i-1)
			r += "; "
		for (j=1; j<=this.colunas; j++) {
			if (j-1)
				r += ", "
			r += this.get(i, j)
		}
	}
	r += "|"
	return r
}

// Retorna a expressão na posição (i, j)
Matriz.prototype.get = function (i, j) {
	return this.expressoes[(i-1)*this.colunas+j-1]
}

// Retorna a soma de outra matriz com essa
Matriz.prototype.somar = function (outra) {
	var expressoes = [], i
	if (this.linhas != outra.linhas || this.colunas != outra.colunas)
		throw "Dimensões incompatíveis"
	for (i=0; i<this.expressoes.length; i++)
		expressoes.push(Funcao.executar("+", [this.expressoes[i], outra.expressoes[i]]))
	return new Matriz(expressoes, this.colunas)
}

// Retorna -this
Matriz.prototype.oposto = function (outra) {
	var expressoes = [], i
	for (i=0; i<this.expressoes.length; i++)
		expressoes.push(Funcao.executar("-", [this.expressoes[i]]))
	return new Matriz(expressoes, this.colunas)
}

// Retorna a subtração de outra matriz dessa
Matriz.prototype.subtrair = function (outra) {
	var expressoes = [], i
	if (this.linhas != outra.linhas || this.colunas != outra.colunas)
		throw "Dimensões incompatíveis"
	for (i=0; i<this.expressoes.length; i++)
		expressoes.push(Funcao.executar("-", [this.expressoes[i], outra.expressoes[i]]))
	return new Matriz(expressoes, this.colunas)
}

// Retorna o produto dessa matriz por outra
Matriz.prototype.multiplicar = function (outra) {
	var expressoes = [], i, j, k, exp, fator
	if (this.colunas != outra.linhas)
		throw "Dimensões incompatíveis"
	for (i=1; i<=this.linhas; i++) {
		for (j=1; j<=outra.colunas; j++) {
			for (k=1; k<=this.colunas; k++) {
				fator = Funcao.executar("*", [this.get(i, k), outra.get(k, j)])
				if (k==1)
					exp = fator
				else
					exp = Funcao.executar("+", [exp, fator])
			}
			expressoes.push(exp)
		}
	}
	return new Matriz(expressoes, outra.colunas)
}

// Retorna a multiplicação dessa matriz por um número
Matriz.prototype.multiplicarNum = function (num) {
	var expressoes = [], i
	for (i=0; i<this.expressoes.length; i++)
		expressoes.push(Funcao.executar("*", [this.expressoes[i], num]))
	return new Matriz(expressoes, this.colunas)
}

// Retorna se outra matriz é igual a essa
Matriz.prototype.igual = function (outra) {
	var i, r, igual
	if (this.linhas != outra.linhas || this.colunas != outra.linhas)
		return new Fracao(0, 1)
	for (i=0; i<this.expressoes.length; i++) {
		igual = Funcao.executar("==", [this.expressoes[i], outra.expressoes[i]])
		if (i)
			r = Funcao.executar("&&", [r, igual])
		else
			r = igual
	}
	return r
}

// Retorna se outra matriz é diferente dessa
Matriz.prototype.diferente = function (outra) {
	var i, r, igual
	if (this.linhas != outra.linhas || this.colunas != outra.linhas)
		return new Fracao(1, 1)
	for (i=0; i<this.expressoes.length; i++) {
		igual = Funcao.executar("!=", [this.expressoes[i], outra.expressoes[i]])
		if (i)
			r = Funcao.executar("||", [r, igual])
		else
			r = igual
	}
	return r
}
