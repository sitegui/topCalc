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
	for (i=0; i<this.linhas; i++) {
		if (i)
			r += "; "
		for (j=0; j<this.colunas; j++) {
			if (j)
				r += ", "
			r += this.get(i, j)
		}
	}
	r += "|"
	return r
}

// Retorna a expressão na posição (i, j)
Matriz.prototype.get = function (i, j) {
	return this.expressoes[i*this.colunas+j]
}
