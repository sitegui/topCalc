"use strict";

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

// Define a expressão na posição (i, j)
Matriz.prototype.set = function (i, j, valor) {
	this.expressoes[(i-1)*this.colunas+j-1] = valor
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
	if (this.linhas != outra.linhas || this.colunas != outra.colunas)
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
	if (this.linhas != outra.linhas || this.colunas != outra.colunas)
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

// Executa o algoritmo de eliminação de Gauss e retorna o resultado
// Se completo for true, elimina também acima dos pivôs
// info é um parâmetro opcional que deve ser um objeto vazio.
// Após a execução da função, info irá ter as propriedades:
// - fatores: fatores pelos quais as linhas foram divididas
// - trocas: número de trocas de linhas
// - sucesso: se a eliminação foi concluída completamente
Matriz.prototype.eliminar = function (completo, info) {
	var max, i, pivos, j, melhor, retorno, temp, fator, k
	
	max = Math.min(this.linhas, this.colunas)
	retorno = this.clonar()
	if (info === undefined)
		info = {}
	info.fatores = []
	info.trocas = 0
	info.sucesso = false
	for (i=1; i<=max; i++) {
		// Para cada linha, pega um pivô
		pivos = []
		for (j=i; j<=max; j++)
			pivos.push(retorno.get(j, i))
		melhor = Matriz.escolherPivo(pivos)
		if (melhor === null)
			return retorno
		
		// Coloca o pivô na posição
		if (melhor != 0) {
			for (j=1; j<=retorno.colunas; j++) {
				temp = retorno.get(i, j)
				retorno.set(i, j, retorno.get(i+melhor, j))
				retorno.set(i+melhor, j, temp)
			}
			info.trocas++
		}
		
		// Divide a linha pelo pivô
		fator = retorno.get(i, i)
		info.fatores.push(fator)
		for (j=i+1; j<=retorno.colunas; j++)
			retorno.set(i, j, Funcao.executar("/", [retorno.get(i, j), fator]))
		retorno.set(i, i, new Fracao(1, 1))
		
		// Elimina as entradas da mesma coluna nas linhas acima e abaixo
		for (k=completo ? 1 : i+1; k<=max; k++) {
			if (k==i)
				continue
			for (j=i+1; j<=retorno.colunas; j++) {
				fator = Funcao.executar("*", [retorno.get(i, j), retorno.get(k, i)])
				retorno.set(k, j, Funcao.executar("-", [retorno.get(k, j), fator]))
			}
			retorno.set(k, i, new Fracao(0, 1))
		}
	}
	
	info.sucesso = true
	return retorno
}

// Retorna a fatoração LU (com pivoteamento parcial) da matriz
// Retorna uma array com três elementos: L, U, P
Matriz.prototype.fatorarLU = function () {
	var L, U, P, i, pivos, j, melhor, temp, k, fator
	if (this.linhas != this.colunas)
		throw "Matriz não quadrada"
	U = this.clonar()
	P = Matriz.identidade(U.linhas)
	for (i=1; i<=U.linhas; i++) {
		pivos = []
		for (j=i; j<=U.linhas; j++)
			pivos.push(U.get(j, i))
		melhor = Matriz.escolherPivo(pivos)
		if (melhor === null)
			throw "Operação abortada por falta de pivô"
		
		if (melhor != 0) {
			for (j=1; j<=U.colunas; j++) {
				temp = U.get(i, j)
				U.set(i, j, U.get(i+melhor, j))
				U.set(i+melhor, j, temp)
				temp = P.get(i, j)
				P.set(i, j, P.get(i+melhor, j))
				P.set(i+melhor, j, temp)
			}
		}
		
		for (k=i+1; k<=U.linhas; k++) {
			fator = Funcao.executar("/", [U.get(k, i), U.get(i, i)])
			for (j=i+1; j<=U.linhas; j++)
				U.set(k, j, Funcao.executar("-", [U.get(k, j), Funcao.executar("*", [fator, U.get(i, j)])]))
			U.set(k, i, fator)
		}
	}
	L = Matriz.identidade(U.linhas)
	for (i=1; i<=U.linhas; i++)
		for (j=1; j<i; j++) {
			L.set(i, j, U.get(i, j))
			U.set(i, j, new Fracao(0, 1))
		}
	return [L, U, P]
}

// Recebe uma array de possíveis pivô e retorna o índice do melhor
// Retorna null caso não tenha um pivô adequado
// Caso o melhor pivô não seja numérico, assume ele como não nulo e mostra um aviso no console
Matriz.escolherPivo = function (pivos) {
	var i, melhor, melhorAbs, pivoAbs
	melhor = null
	
	// Busca o maior (em módulo) pivô numérico não nulo
	for (i=0; i<pivos.length; i++) {
		if (eNumerico(pivos[i]) && !eZero(pivos[i])) {
			pivoAbs = abs(pivos[i])
			if (melhor === null || eIdentico(max(melhorAbs, pivoAbs), pivoAbs)) {
				melhor = i
				melhorAbs = pivoAbs
			}
		}
	}
	if (melhor !== null)
		return melhor
	
	// Pega o primeiro não numérico e assume que é nulo
	for (i=0; i<pivos.length; i++)
		if (!eNumerico(pivos[i]))
			return i
	
	// Nada encontrado
	return null
}

// Retorna uma matriz identidade de ordem n
Matriz.identidade = function (n) {
	var expressoes = [], i, j
	for (i=1; i<=n; i++)
		for (j=1; j<=n; j++)
			expressoes.push(new Fracao(i==j ? 1 : 0, 1))
	return new Matriz(expressoes, n)
}

// Retorna uma matriz justaposta a outra
Matriz.justapor = function (mA, mB) {
	var retorno, i, j
	if (mA.linhas != mB.linhas)
		throw "Tamanhos incompatíveis"
	retorno = []
	for (i=1; i<=mA.linhas; i++) {
		for (j=1; j<=mA.colunas; j++)
			retorno.push(mA.get(i, j))
		for (j=1; j<=mB.colunas; j++)
			retorno.push(mB.get(i, j))
	}
	return new Matriz(retorno, mA.colunas+mB.colunas)
}

// Retorna as n primeiras (ou n últimas para n<0) colunas da matriz
Matriz.prototype.separar = function (n) {
	var retorno, i, j, nAbs
	if (!eIntSeguro(n) || Math.abs(n) > this.colunas)
		throw "Tamanho inválido"
	retorno = []
	nAbs = Math.abs(n)
	for (i=1; i<=this.linhas; i++)
		for (j=1; j<=nAbs; j++)
			retorno.push(this.get(i, n>0 ? j : this.colunas+n+j))
	return new Matriz(retorno, nAbs)
}
