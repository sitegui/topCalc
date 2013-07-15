"use strict";

// Aplica simplificações básicas nas expressões
// Recebe um objeto matemático e retorna sua versão simplificada
// Obs: o novo objeto pode conter referências para o antigo
var Simplificar = function (exp) {
	// Traduz a árvore para o novo formato, já aplicando as simplificações, no sentido bottom-up
	var traduzir = function (exp) {
		if (exp instanceof Parenteses || exp instanceof Lista || exp instanceof Vetor || exp instanceof Matriz)
			exp.expressoes = exp.expressoes.map(traduzir)
		else if (exp instanceof Funcao) {
			exp.args = exp.args.map(traduzir)
			if (exp.nome == "+" && exp.args.length == 1)
				return exp.args[0]
			else if (exp.nome == "+" && exp.args.length == 2)
				return Simplificar.somar(exp.args[0], exp.args[1])
			else if (exp.nome == "-" && exp.args.length == 1)
				return Simplificar.multiplicar(new Fracao(-1, 1), exp.args[0])
			else if (exp.nome == "-" && exp.args.length == 2)
				return Simplificar.somar(exp.args[0], Simplificar.multiplicar(new Fracao(-1, 1), exp.args[1]))
			else if (exp.nome == "*")
				return Simplificar.multiplicar(exp.args[0], exp.args[1])
			else if (exp.nome == "/")
				return Simplificar.multiplicar(exp.args[0], Simplificar.elevar(exp.args[1], new Fracao(-1, 1)))
			else if (exp.nome == "^")
				return Simplificar.elevar(exp.args[0], exp.args[1])
		}
		return exp
	}
	
	return Simplificar.destraduzir(traduzir(exp))
}

// Executa a soma de dois valores
Simplificar.somar = function (a, b) {
	var i, r
	
	if (a instanceof Simplificar.Soma && b instanceof Simplificar.Soma) {
		a = a.clonar()
		for (i in b.termos)
			Simplificar.somarTermo(a, b.termos[i], i)
		return a
	} else if (a instanceof Simplificar.Soma)
		return Simplificar.somarTermo(a.clonar(), b, Simplificar.getHashSoma(b))
	else if (b instanceof Simplificar.Soma)
		return Simplificar.somarTermo(b.clonar(), a, Simplificar.getHashSoma(a))
	else {
		r = new Simplificar.Soma
		r.termos[Simplificar.getHashSoma(a)] = a
		return Simplificar.somarTermo(r, b, Simplificar.getHashSoma(b))
	}
}

// Executa a multiplicação de dois valores
Simplificar.multiplicar = function (a, b) {
	var r, termosA, termosB, i, j, termo
	
	if (a instanceof Simplificar.Soma || b instanceof Simplificar.Soma) {
		r = new Simplificar.Soma
		if (a instanceof Simplificar.Soma) {
			termosA = []
			for (i in a.termos)
				termosA.push(a.termos[i])
		} else
			termosA = [a]
		if (b instanceof Simplificar.Soma) {
			termosB = []
			for (i in b.termos)
				termosB.push(b.termos[i])
		} else
			termosB = [b]
		for (i=0; i<termosA.length; i++) {
			for (j=0; j<termosB.length; j++) {
				termo = Simplificar.multiplicar(termosA[i], termosB[j])
				Simplificar.somarTermo(r, termo, Simplificar.getHashSoma(termo))
			}
		}
		return r
	} else if (a instanceof Simplificar.Produto && b instanceof Simplificar.Produto) {
		a = a.clonar()
		a.num = multiplicar(a.num, b.num)
		for (i in b.termos)
			Simplificar.multiplicarTermo(a, b.termos[i], i)
		return a
	} else if (a instanceof Simplificar.Produto)
		return Simplificar.multiplicarTermo(a.clonar(), b, Simplificar.getHashProduto(b))
	else if (b instanceof Simplificar.Produto)
		return Simplificar.multiplicarTermo(b.clonar(), a, Simplificar.getHashProduto(a))
	else if (eNumerico(a) && eNumerico(b))
		return multiplicar(a, b)
	else {
		r = new Simplificar.Produto
		if (eNumerico(a))
			r.num = a
		else {
			r.num = new Fracao(1, 1)
			r.termos[Simplificar.getHashProduto(a)] = a
		}
		return Simplificar.multiplicarTermo(r, b, Simplificar.getHashProduto(b))
	}
}

// Executa a potenciação de dois valores
Simplificar.elevar = function (a, b) {
	var r, i, p
	
	if (eNumerico(a) && eNumerico(b))
		return pow(a, b)
	else if (a instanceof Simplificar.Produto) {
		r = new Simplificar.Produto
		if (eNumerico(b))
			r.num = pow(a.num, b)
		else {
			r.num = new Fracao(1, 1)
			p = new Simplificar.Potencia
			p.base = a.num
			p.expoente = b
			r.termos[Simplificar.getHashProduto(p)] = p
		}
		for (i in a.termos) {
			p = Simplificar.elevar(a.termos[i], b)
			r.termos[Simplificar.getHashProduto(p)] = p
		}
		return r
	} else if (a instanceof Simplificar.Potencia && (b instanceof Fracao || typeof b == "number") && eIntSeguro(getNum(b))) {
		r = new Simplificar.Potencia
		r.base = a.base
		r.expoente = Funcao.executar("*", [b, a.expoente])
		return r
	} else {
		r = new Simplificar.Potencia
		r.base = a
		r.expoente = b
		return r
	}
}

// Traduz de volta para a árvore normal
// Retorna null caso a tradução seja vazia
Simplificar.destraduzir = function (exp) {
	var r, i, subhashs, termo, negativo, um, termo2, paiTermo2
	
	if (exp instanceof Simplificar.Soma) {
		subhashs = []
		for (i in exp.termos)
			subhashs.push(i)
		subhashs.sort()
		
		r = null
		for (i=0; i<subhashs.length; i++) {
			termo = Simplificar.destraduzir(exp.termos[subhashs[i]])
			if (termo === null || (eNumerico(termo) && eZero(termo)))
				continue
			
			if (r === null) {
				r = termo
				continue
			}
			
			// Busca o primeiro termo de um produto
			if (termo instanceof Funcao && termo.nome == "/") {
				termo2 = termo.args[0]
				paiTermo2 = termo
			} else {
				termo2 = termo
				paiTermo2 = null
			}
			while (termo2 instanceof Funcao && termo2.nome == "*") {
				paiTermo2 = termo2
				termo2 = termo2.args[0]
			}
			
			// Verifica se ele é negativo
			negativo = true
			if (termo2 instanceof Funcao && termo2.nome == "-" && termo2.args.length == 1) {
				if (paiTermo2)
					paiTermo2.args[0] = termo2.args[0]
				else
					termo = termo.args[0]
			} else if (eNumerico(termo2) && eNegativo(termo2)) {
				if (paiTermo2)
					paiTermo2.args[0] = multiplicar(new Fracao(-1, 1), termo2)
				else
					termo = multiplicar(new Fracao(-1, 1), termo2)
			} else
				negativo = false
			
			r = negativo ? new Funcao("-", [r, termo]) : new Funcao("+", [r, termo])
		}
		
		return r
	} else if (exp instanceof Simplificar.Produto) {
		if (eZero(exp.num))
			return null
		
		subhashs = []
		for (i in exp.termos)
			subhashs.push(i)
		subhashs.sort()
		
		negativo = eNegativo(exp.num)
		um = negativo ? eUm(multiplicar(new Fracao(-1, 1), exp.num)) : eUm(exp.num)
		r = [um ? null : exp.num, null] // [numerador, denominador]
		
		for (i=0; i<subhashs.length; i++) {
			termo = Simplificar.destraduzir(exp.termos[subhashs[i]])
			if (termo === null)
				return null
			if (termo instanceof Funcao && termo.nome == "/")
				// Termo na forma 1/...
				r[1] = r[1] === null ? termo.args[1] : new Funcao("*", [r[1], termo.args[1]])
			else
				r[0] = r[0] === null ? (negativo ? new Funcao("-", [termo]) : termo) : new Funcao("*", [r[0], termo])
		}
		
		// Retorna no melhor formato
		if (r[0] === null && r[1] === null)
			// 1 ou -1
			return exp.num
		if (r[1] === null)
			return r[0]
		if (r[0] === null) {
			return new Funcao("/", [new Fracao(negativo ? -1 : 1, 1), r[1]])
		}
		return new Funcao("/", r)
	} else if (exp instanceof Simplificar.Potencia) {
		termo = Simplificar.destraduzir(exp.base)
		termo2 = Simplificar.destraduzir(exp.expoente)
		termo = termo === null ? new Fracao(0, 1) : termo
		termo2 = termo2 === null ? new Fracao(0, 1) : termo2
		if (eNumerico(termo) && eNumerico(termo2))
			return pow(termo, termo2)
		if (eNumerico(termo2) && eUm(termo2))
			return termo
		if (eNumerico(termo2) && eNegativo(termo2)) {
			termo2 = multiplicar(new Fracao(-1, 1), termo2)
			termo = eUm(termo2) ? termo : new Funcao("^", [termo, termo2])
			return new Funcao("/", [new Fracao(1, 1), termo])
		}
		return new Funcao("^", [termo, termo2])
	} else if (exp instanceof Parenteses || exp instanceof Lista || exp instanceof Vetor || exp instanceof Matriz)
		exp.expressoes = exp.expressoes.map(Simplificar.destraduzir)
	else if (exp instanceof Funcao)
		exp.args = exp.args.map(Simplificar.destraduzir)
	return exp
}

// Adiciona um novo termo (não deve ser uma Soma) na soma (Simplificar.Soma)
// Altera soma e também a retorna
Simplificar.somarTermo = function (soma, termo, hash) {
	var termo2, n, n2, p
	if (hash in soma.termos) {
		// Agrupa dois termos
		termo2 = soma.termos[hash]
		if (eNumerico(termo) && eNumerico(termo2))
			soma.termos[hash] = somar(termo, termo2)
		else {
			if (termo2 instanceof Simplificar.Produto)
				p = termo2.clonar()
			else {
				p = new Simplificar.Produto
				p.num = new Fracao(1, 1)
				p.termos[Simplificar.getHashProduto(termo2)] = termo2
			}
			p.num = somar(p.num, termo instanceof Simplificar.Produto ? termo.num : new Fracao(1, 1))
			soma.termos[hash] = p
		}
	} else
		soma.termos[hash] = termo
	return soma
}

// Adiciona um novo termo (não deve ser uma Soma nem Produto) no produto
// Altera produto e também o retorna
Simplificar.multiplicarTermo = function (produto, termo, hash) {
	var p, termo2
	
	if (eNumerico(termo))
		produto.num = multiplicar(produto.num, termo)
	else if (hash in produto.termos) {
		// Agrupa dois termos
		termo2 = produto.termos[hash]
		if (termo2 instanceof Simplificar.Potencia)
			p = termo2.clonar()
		else {
			p = new Simplificar.Potencia
			p.base = termo2
			p.expoente = new Fracao(1, 1)
		}
		p.expoente = Funcao.executar("+", [p.expoente, termo instanceof Simplificar.Potencia ? termo.expoente : new Fracao(1, 1)])
		produto.termos[hash] = p
	} else {
		produto.termos[hash] = termo
	}
	return produto
}

// Retorna a hash de um objeto matemático para ser usada no agrupamento de somas
Simplificar.getHashSoma = function (obj) {
	if (obj instanceof Simplificar.Produto)
		return obj.getHash(true)
	else if (eNumerico(obj))
		return ""
	return Simplificar.getHash(obj)
}

// Retorna a hash de um objeto matemático para ser usada no agrupamento de produtos
Simplificar.getHashProduto = function (obj) {
	if (obj instanceof Simplificar.Potencia)
		return obj.getHash(true)
	return Simplificar.getHash(obj)
}

// Retorna a hash de um objeto matemático
Simplificar.getHash = function (obj) {
	if (obj instanceof Simplificar.Soma || obj instanceof Simplificar.Produto || obj instanceof Simplificar.Potencia)
		return obj.getHash()
	else
		return obj.toMathString(false)
}

/*
Classes auxiliares
*/

// Representa uma soma de vários termos (nenhum deles é uma outra Soma)
// Cada termo é armazenado indexado pela sua hash de soma
Simplificar.Soma = function () {
	this.termos = {}
}

// Retorna a hash da soma toda
Simplificar.Soma.prototype.getHash = function () {
	var i, subhashs = []
	for (i in this.termos)
		subhashs.push(i)
	subhashs.sort()
	for (i=0; i<subhashs.length; i++)
		subhashs[i] = Simplificar.getHash(this.termos[subhashs[i]])
	return subhashs.join("+")
}
Simplificar.Soma.prototype.toMathString = function () {
	return this.getHash()
}

// Representa um produto de um valor numérico por outros termos (nenhum deles é uma Soma ou outro Produto)
// Cada termo é armazenado indexado pela sua hash de produto
Simplificar.Produto = function () {
	this.num = null
	this.termos = {}
}

// Retorna a hash do produto todo
// Se excluirNum for true, não leva em conta o termo numérico
Simplificar.Produto.prototype.getHash = function (excluirNum) {
	var i, subhashs
	subhashs = []
	for (i in this.termos)
		subhashs.push(i)
	subhashs.sort()
	for (i=0; i<subhashs.length; i++)
		subhashs[i] = Simplificar.getHash(this.termos[subhashs[i]])
	if (excluirNum)
		return subhashs.join("*")
	return [this.num.toMathString(false)].concat(subhashs).join("*")
}
Simplificar.Produto.prototype.toMathString = function () {
	return this.getHash()
}

// Representa uma potência
Simplificar.Potencia = function () {
	this.base = null
	this.expoente = null
}

// Retorna a hash da potência toda
// Se excluirExpoente for true, não leva em conta o expoente
Simplificar.Potencia.prototype.getHash = function (excluirExpoente) {
	var base = Simplificar.getHash(this.base)
	if (excluirExpoente)
		return base
	return base+"^("+Simplificar.getHash(this.expoente)+")"
}
Simplificar.Potencia.prototype.toMathString = function () {
	return this.getHash()
}

// Retorna um clone raso do objeto
Simplificar.Soma.prototype.clonar = function () {
	var i, r = new Simplificar.Soma
	for (i in this.termos)
		r.termos[i] = this.termos[i]
	return r
}
Simplificar.Produto.prototype.clonar = function () {
	var i, r = new Simplificar.Produto
	r.num = this.num
	for (i in this.termos)
		r.termos[i] = this.termos[i]
	return r
}
Simplificar.Potencia.prototype.clonar = function () {
	var r = new Simplificar.Potencia
	r.base = this.base
	r.expoente = this.expoente
	return r
}
