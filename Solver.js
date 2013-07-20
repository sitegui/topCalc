"use strict";

// Fornece vários algoritmos para a resolução numérica e simbólica de expressões
var Solver = {}

// Calcula a matriz Jacobinada de um conjunto de expressões
// vars é uma Array de strings com os nomes das variáveis
// exps é uma Array com as expressões do sistema
// valores é uma Array com os valores dos chutes de cada variável
// fsx deve ser uma Array vazia que será populada com -f(X) de cada expressão
// that é o this de um objeto Funcao
// Retorna uma Array em que cada elemento é uma Array representando uma coluna da matriz
// Esse função altera os valores das variáveis: salve o contexto antes!
Solver.calcularJacobiana = function (vars, exps, valores, fsx, that) {
	var i, j, h, fxh, k, J, epsD
	
	// Calcula os valores de cada expressão
	for (i=0; i<vars.length; i++)
		Variavel.valores[vars[i]] = valores[i]
	for (i=0; i<exps.length; i++)
		fsx.push(-getNum(that.executarNoEscopo(exps[i], null, vars)))
	
	// Monta J
	J = []
	epsD = Config.get("epsDerivada")
	for (i=0; i<vars.length; i++) {
		J.push([])
		h = epsD*(Math.abs(valores[i])+1)
		for (k=0; k<vars.length; k++)
			Variavel.valores[vars[k]] = k==i ? valores[k]+h : valores[k]
		for (j=0; j<exps.length; j++) {
			fxh = getNum(that.executarNoEscopo(exps[j], null, vars))
			J[i].push((fxh+fsx[j])/h)
		}
	}
	
	return J
}

// O mesmo de Solver.calcularJacobiana(), só que para sistemas no campo dos complexos
// valores deve ser uma Array de complexos com as propriedades "a" e "b" number
Solver.calcularJacobianaComplexa = function (vars, exps, valores, fsx, that) {
	var i, j, h, fxh, k, J, epsD, temp
	
	// Calcula os valores de cada expressão
	for (i=0; i<vars.length; i++)
		Variavel.valores[vars[i]] = valores[i]
	for (i=0; i<exps.length; i++) {
		temp = toComplexo(that.executarNoEscopo(exps[i], null, vars))
		fsx.push(-getNum(temp.a))
		fsx.push(-getNum(temp.b))
	}
	
	// Monta J
	J = []
	epsD = Config.get("epsDerivada")
	for (i=0; i<vars.length; i++) {
		J.push([])
		h = epsD*(Math.abs(valores[i].a)+1)
		for (k=0; k<vars.length; k++)
			Variavel.valores[vars[k]] = k==i ? new Complexo(valores[k].a+h, valores[k].b) : valores[k]
		for (j=0; j<exps.length; j++) {
			fxh = toComplexo(that.executarNoEscopo(exps[j], null, vars))
			J[2*i].push((getNum(fxh.a)+fsx[2*j])/h)
			J[2*i].push((getNum(fxh.b)+fsx[2*j+1])/h)
		}
		J.push([])
		h = epsD*(Math.abs(valores[i].b)+1)
		for (k=0; k<vars.length; k++)
			Variavel.valores[vars[k]] = k==i ? new Complexo(valores[k].a, valores[k].b+h) : valores[k]
		for (j=0; j<exps.length; j++) {
			fxh = toComplexo(that.executarNoEscopo(exps[j], null, vars))
			J[2*i+1].push((getNum(fxh.a)+fsx[2*j])/h)
			J[2*i+1].push((getNum(fxh.b)+fsx[2*j+1])/h)
		}
	}
	
	return J
}

// Executa a eliminação de Gauss numericamente na matriz
// A é uma Array em que cada elemento é uma Array representando uma coluna da matriz
// b é uma Array que representa uma coluna
// Altera os valores de A e b
// Retorna um objeto com as propriedades "i", "j"
// "i" e "j" são Arrays que indicam para onde foi cada linha/coluna da matriz inicial A
// "i" não necessariamente terá o mesmo nº de elementos que o nº de linhas das matrizes iniciais
// Caso o sistema não tenha solução, mas seja possível buscar por uma "falsa solução", retorna null
// Caso o sistema não tenha sulução e não seja possível buscar por uma "falsa solução", lança uma exceção
Solver.eliminarNumericamente = function (A, b) {
	var mapaI, mapaJ, i, j, i2, j2, maiorI, maiorJ, maior, eps, temp
	
	// Monta os mapas de linhas e colunas
	// Esse mapa relaciona a posição virtual com a real
	mapaJ = []
	for (j=0; j<A.length; j++)
		mapaJ.push(j)
	mapaI = []
	for (i=0; i<A[0].length; i++)
		mapaI.push(i)
	
	// Vai eliminando cada coluna
	eps = Config.get("epsilon")
	for (j=0; j<Math.min(mapaI.length, mapaJ.length); j++) {
		// Encontra o maior valor absoluto
		maior = Math.abs(A[mapaJ[j]][mapaI[j]])
		maiorI = maiorJ = j
		for (j2=j; j2<mapaJ.length; j2++)
			for (i2=j; i2<mapaI.length; i2++)
				if (Math.abs(A[mapaJ[j2]][mapaI[i2]]) > maior) {
					maior = Math.abs(A[mapaJ[j2]][mapaI[i2]])
					maiorI = i2
					maiorJ = j2
				}
		
		// Verifica se o valor não é nulo
		if (maior < eps) {
			for (i2=j; i2<mapaI.length; i2++)
				if (Math.abs(b[mapaI[i2]]) > eps)
					throw "Absurdo matemático ao tentar resolver o sistema, tente outro chute inicial"
			break
		}
		
		// Traz o valor para a posição virtual [j][j]
		if (j != maiorI) {
			temp = mapaI[j]
			mapaI[j] = mapaI[maiorI]
			mapaI[maiorI] = temp
		}
		if (j != maiorJ) {
			temp = mapaJ[j]
			mapaJ[j] = mapaJ[maiorJ]
			mapaJ[maiorJ] = temp
		}
		
		// Divide a linha j pelo elemento [j][j]
		temp = A[mapaJ[j]][mapaI[j]]
		for (j2=j+1; j2<mapaJ.length; j2++)
			A[mapaJ[j2]][mapaI[j]] /= temp
		b[mapaI[j]] /= temp
		A[mapaJ[j]][mapaI[j]] = 1
		
		// Some com os elementos acima e abaixo de [j][j]
		for (i2=0; i2<mapaI.length; i2++) {
			if (i2 == j)
				continue
			temp = A[mapaJ[j]][mapaI[i2]]
			for (j2=j+1; j2<mapaJ.length; j2++)
				A[mapaJ[j2]][mapaI[i2]] -= A[mapaJ[j2]][mapaI[j]]*temp
			b[mapaI[i2]] -= b[mapaI[j]]*temp
			A[mapaJ[j]][mapaI[i2]] = 0
		}
	}
	
	// Remove as linhas com somente zeros
	for (i=j; i<mapaI.length; i++) {
		if (Math.abs(b[mapaI[i]]) < eps) {
			mapaI.splice(i, 1)
			i--
		}
	}
	
	// Retorna
	if (j == mapaI.length)
		return {i: mapaI, j: mapaJ}
	return null
}

// Determina os melhores valores para as variáveis independentes de um sistema A*x = b
// A e b devem ser tratadas com Solver.eliminarNumericamente() antes
// mapa é o retorno da função Solver.eliminarNumericamente()
// Retorna uma Array com os valores, são (A.length-mapa.num) valores
Solver.determinarIndependentes = function (A, b, mapa) {
	var i, j, A2, b2, mapa2
	
	// Produto escalar entre duas colunas
	var produto = function (a, b) {
		var r = 0, i
		for (i=0; i<mapa.i.length; i++)
			r += a[mapa.i[i]]*b[mapa.i[i]]
		return r
	}
	
	// Monta as matrizes A2 e b2
	// Elas formarão um sistema linear quadrado A2*x2 = b2
	if (mapa.i.length == mapa.j.length)
		return []
	A2 = []
	b2 = []
	for (j=mapa.i.length; j<mapa.j.length; j++) {
		A2.push([])
		for (i=mapa.i.length; i<mapa.j.length; i++)
			A2[j-mapa.i.length].push(produto(A[mapa.j[i]], A[mapa.j[j]])+(i==j))
		b2.push(produto(b, A[mapa.j[j]]))
	}
	
	// Resolve o sistema
	mapa2 = Solver.eliminarNumericamente(A2, b2)
	if (!mapa2 || mapa2.i.length != mapa2.j.length)
		throw "Falha ao tentar resolver, tente outro chute inicial"
	
	return b2
}

// Determina os valores dependentes de A*x=b com base nos independentes
// A, b e mapa são os mesmos valores gerados por Solver.eliminarNumericamente()
// Retorna uma Array com os valores, são (mapa.num) valores
Solver.determinarDependentes = function(A, b, mapa, indeps) {
	var i, r, soma, j
	r = []
	for (i=0; i<mapa.i.length; i++) {
		soma = b[mapa.i[i]]
		for (j=0; j<indeps.length; j++)
			soma -= A[mapa.j[j+mapa.i.length]][mapa.i[i]]*indeps[j]
		r.push(soma)
	}
	return r
}

// Retorna uma Array com os valores na ordem correta
// mapa é o retorno de Solver.eliminarNumericamente()
// deps é o retorno de Solver.determinarDependentes()
// indeps é o retorno de Solver.determinarIndependentes()
Solver.ordenarVars = function (mapa, deps, indeps) {
	var r, i, pos
	r = []
	for (i=0; i<mapa.j.length; i++) {
		pos = mapa.j.indexOf(i)
		if (pos < mapa.i.length)
			r.push(deps[pos])
		else
			r.push(indeps[pos-mapa.i.length])
	}
	return r
}

// Em caso de nenhuma solução, busca pela melhor pseudo-solução
// jacob e fsx são os valores obtidos com Solver.calcularJacobiana
Solver.determinarPseudoSolucao = function (jacob, fsx) {
	var i, j, A, b, mapa
	
	// Produto escalar entre duas colunas
	var produto = function (a, b) {
		var r = 0, i
		for (i=0; i<a.length; i++)
			r += a[i]*b[i]
		return r
	}
	
	// Monta as matrizes A e b
	// Elas formarão um sistema linear quadrado A*x = b
	A = []
	b = []
	for (j=0; j<jacob.length; j++) {
		A.push([])
		for (i=0; i<jacob.length; i++)
			A[j].push(produto(jacob[i], jacob[j]))
		b.push(produto(fsx, jacob[j]))
	}
	
	// Resolve o sistema
	mapa = Solver.eliminarNumericamente(A, b)
	if (!mapa || mapa.i.length != mapa.j.length)
		throw "Falha ao tentar resolver, tente outro chute inicial"
	
	return b
}

// Retorna o quadrado do módulo de um vetor (uma Array)
Solver.getModuloQuadrado = function (v) {
	var r = 0, i
	for (i=0; i<v.length; i++)
		r += v[i]*v[i]
	return r
}
