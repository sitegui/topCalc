"use strict";

// Módulo para resolver equações numericamente

Config.registrar("epsDerivada", "Passo usado para calcular a derivada de uma expressão", 1e-8, Config.setters.double)
Config.registrar("epsilon", "Precisão buscada pelos métodos numéricos", 1e-14, Config.setters.double)
Config.registrar("maxPassos", "Número máximo de iterações feitas pelos métodos numéricos", 100, Config.setters.int)

Funcao.registrar("derivate", "derivate(variavel, expressao, ponto)\nRetorna a derivada aproximada da expressão num dado ponto", function (variavel, expressao, valor) {
	var antes, epsD
	
	// Trata os argumentos
	this.args[0] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.executarNoEscopo(expressao, [variavel])
	this.args[2] = valor = this.executarNoEscopo(valor)
	epsD = Config.get("epsDerivada")
	
	try {
		// Cria o sub-escopo
		antes = Variavel.backup(variavel)
		return Funcao.aplicarNasListas(function (expressao, valor) {
			var h, x, fx, fxh
			
			if (eNumerico(valor)) {
				x = getNum(valor)
				h = epsD*(Math.abs(x)+1)
				Variavel.valores[variavel] = x
				fx = getNum(this.executarNoEscopo(expressao))
				Variavel.valores[variavel] = x+h
				fxh = getNum(this.executarNoEscopo(expressao))
				return (fxh-fx)/h
			} else if (eDeterminado(valor))
				throw 0
		}, this, [expressao, valor])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

Funcao.registrar("findZero", "findZero(variavel, 'expressao, chute)\nEncontra um valor real que zera uma expressão real usando o chute inicial dado", function (variavel, expressao, chute) {
	var antes, maxI, epsD, eps, debug
	
	// Trata os argumentos
	this.args[0] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.executarPuroNoEscopo(expressao, [variavel])
	this.args[2] = chute = this.executarNoEscopo(chute)
	maxI = Config.get("maxPassos")
	epsD = Config.get("epsDerivada")
	eps = Config.get("epsilon")
	
	try {
		// Cria o sub-escopo
		antes = Variavel.backup(variavel)
		debug = Config.get("debug")
		Config.set("debug", false, true)
		return Funcao.aplicarNasListas(function (expressao, chute) {
			var i, h, x, fx, fxh, x2
			if (eNumerico(chute)) {
				x = getNum(chute)
				for (i=0; i<maxI; i++) {
					// Calcula o próximo valor x2 = x - f(x)/f'(x)
					h = epsD*(Math.abs(x)+1)
					Variavel.valores[variavel] = x
					fx = getNum(this.executarNoEscopo(expressao))
					Variavel.valores[variavel] = x+h
					fxh = getNum(this.executarNoEscopo(expressao))
					x2 = x-(h*fx)/(fxh-fx)
					if (Math.abs(x2) == Infinity || isNaN(x2))
						throw "Erro ao calcular na iteração, tente outro valor inicial"
					
					// Verifica a condição de parada
					if (Math.abs(x2-x) < eps || Math.abs(fx) < eps)
						break
					x = x2
				}
				
				// Retorna o resultado
				if (i == maxI)
					Console.echoErro("Número máximo de iterações atingido (o resultado pode não fazer sentido)")
				return x
			} else if (eDeterminado(chute))
				throw 0
		}, this, [expressao, chute])
	} finally {
		Variavel.restaurar(antes)
		Config.set("debug", debug, true)
	}
}, false, true)

Funcao.registrar("solve", "solve(vars, exps, chute)\nResolve um conjunto de m expressões (em forma de vetor ou matriz) nas variáveis. vars e chute são um vetor de n posições.", function (vars, exps, chute) {
	var i, antes, debug, maxI, eps, that
	
	// Pega os nomes das variáveis
	that = this
	this.args[0] = vars = unbox(vars)
	if (!eDeterminado(vars))
		return
	else if (!(vars instanceof Vetor))
		throw 0
	vars = []
	for (i=0; i<this.args[0].expressoes.length; i++) {
		this.args[0].expressoes[i] = unbox(this.args[0].expressoes[i])
		if (this.args[0].expressoes[i] instanceof Variavel)
			vars.push(this.args[0].expressoes[i].nome)
		else
			throw 0
	}
	
	// Trata os outros argumentos
	this.args[1] = exps = this.executarNoEscopo(exps, vars)
	this.args[2] = chute = this.executarNoEscopo(chute)
	maxI = Config.get("maxPassos")
	eps = Config.get("epsilon")
	eps *= eps
	
	// Cria o sub-escopo
	try {
		antes = Variavel.backup(vars)
		debug = Config.get("debug")
		Config.set("debug", false, true)
		
		// Aplica a cada combinação de listas
		return Funcao.aplicarNasListas(function (exps, chute) {
			var xs, i, jacob, fsx, dsx, j, mapa, deltas, indeps, deps
			
			// Trata as expressões
			if (!eDeterminado(exps))
				return
			else if (!(exps instanceof Matriz) && !(exps instanceof Vetor))
				throw 0
			exps = exps.expressoes
			
			// Pega os valores iniciais
			if (!eDeterminado(chute))
				return
			else if (!(chute instanceof Vetor) || chute.expressoes.length != vars.length)
				throw 0
			xs = []
			for (i=0; i<vars.length; i++) {
				if (eNumerico(chute.expressoes[i]))
					xs.push(getNum(chute.expressoes[i]))
				else if (eDeterminado(chute.expressoes[i]))
					throw 0
				else
					return
			}
			
			// Aplica as iterações
			for (i=0; i<maxI; i++) {
				fsx = []
				jacob = Solver.calcularJacobiana(vars, exps, xs, fsx, that)
				mapa = Solver.eliminarNumericamente(jacob, fsx)
				indeps = Solver.determinarIndependentes(jacob, fsx, mapa)
				deps = Solver.determinarDependentes(jacob, fsx, mapa, indeps)
				deltas = Solver.ordenarVars(mapa, deps, indeps)
				for (j=0; j<deltas.length; j++)
					xs[j] += deltas[j]
				
				// Condição de parada
				if (Solver.getModuloQuadrado(deltas) < eps || Solver.getModuloQuadrado(fsx) < eps)
					break
			}
				
			// Retorna o resultado
			if (i == maxI)
				Console.echoErro("Número máximo de iterações atingido (o resultado pode não fazer sentido)")
			return new Vetor(xs)
		}, this, [exps, chute])
	} finally {
		Variavel.restaurar(antes)
		Config.set("debug", debug, true)
	}
}, false, true)

// Objeto com várias funções usadas por esse módulo
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
		fsx.push(-getNum(that.executarNoEscopo(exps[i])))
	
	// Monta J
	J = []
	epsD = Config.get("epsDerivada")
	for (i=0; i<vars.length; i++) {
		J.push([])
		h = epsD*(Math.abs(valores[i])+1)
		for (k=0; k<vars.length; k++)
			Variavel.valores[vars[k]] = k==i ? valores[k]+h : valores[k]
		for (j=0; j<exps.length; j++) {
			fxh = getNum(that.executarNoEscopo(exps[j]))
			J[i].push((fxh+fsx[j])/h)
		}
	}
	
	return J
}

// Executa a eliminação de Gauss numericamente na matriz
// A é uma Array em que cada elemento é uma Array representando uma coluna da matriz
// b é uma Array que representa uma coluna
// Altera os valores de A e b
// Retorna um objeto com as propriedades "i", "j" e "num"
// "i" e "j" são Arrays que indicam para onde foi cada linha/coluna da matriz inicial A
// "num" indica até qual coluna a eliminação foi feita
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
	for (j=0; j<Math.min(A.length, A[0].length); j++) {
		// Encontra o maior valor absoluto
		maior = Math.abs(A[mapaJ[j]][mapaI[j]])
		maiorI = maiorJ = j
		for (j2=j; j2<A.length; j2++)
			for (i2=j; i2<A[0].length; i2++)
				if (Math.abs(A[mapaJ[j2]][mapaI[i2]]) > maior) {
					maior = Math.abs(A[mapaJ[j2]][mapaI[i2]])
					maiorI = i2
					maiorJ = j2
				}
		
		// Verifica se o valor não é nulo
		if (maior < eps) {
			for (i2=j; i2<A[0].length; i2++)
				if (Math.abs(b[mapaI[i2]]) > eps)
					throw "Absurdo matemático ao tentar resolver o sistema"
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
		for (j2=j+1; j2<A.length; j2++)
			A[mapaJ[j2]][mapaI[j]] /= temp
		b[mapaI[j]] /= temp
		A[mapaJ[j]][mapaI[j]] = 1
		
		// Some com os elementos acima e abaixo de [j][j]
		for (i2=0; i2<A[0].length; i2++) {
			if (i2 == j)
				continue
			temp = A[mapaJ[j]][mapaI[i2]]
			for (j2=j+1; j2<A.length; j2++) {
				A[mapaJ[j2]][mapaI[i2]] -= A[mapaJ[j2]][mapaI[j]]*temp
			}
			b[mapaI[i2]] -= b[mapaI[j]]*temp
			A[mapaJ[j]][mapaI[i2]] = 0
		}
	}
	
	return {i: mapaI, j: mapaJ, num: j}
}

// Determina os melhores valores para as variáveis independentes de um sistema A*x = b
// A e b devem ser tratadas com Solver.eliminarNumericamente() antes
// mapa é o retorno da função Solver.eliminarNumericamente()
// Retorna uma Array com os valores, são (A.length-mapa.num) valores
Solver.determinarIndependentes = function (A, b, mapa) {
	var i, j, A2, b2, mapa2, r
	
	// Produto escalar entre dois vetores (representados por Arrays)
	var produto = function (a, b) {
		var r = 0, i
		for (i=0; i<a.length; i++)
			r += a[i]*b[i]
		return r
	}
	
	// Monta as matrizes A2 e b2
	// Elas formarão um sistema linear quadrado A2*x2 = b2
	if (mapa.num == A.length)
		return []
	A2 = []
	b2 = []
	for (j=mapa.num; j<A.length; j++) {
		A2.push([])
		for (i=mapa.num; i<A.length; i++)
			A2[j-mapa.num].push(produto(A[mapa.j[i]], A[mapa.j[j]])+(i==j))
		b2.push(produto(b, A[mapa.j[j]]))
	}
	
	// Resolve o sistema
	mapa2 = Solver.eliminarNumericamente(A2, b2)
	if (A2.length != mapa2.num)
		throw "Falha ao tentar resolver"
	
	// Monta o retorno na ordem correta
	r = []
	for (i=0; i<b2.length; i++)
		r.push(b2[mapa2.i[i]])
	return r
}

// Determina os valores dependentes de A*x=b com base nos independentes
// A, b e mapa são os mesmos valores gerados por Solver.eliminarNumericamente()
// Retorna uma Array com os valores, são (mapa.num) valores
Solver.determinarDependentes = function(A, b, mapa, indeps) {
	var i, r, soma, j
	r = []
	for (i=0; i<mapa.num; i++) {
		soma = b[mapa.i[i]]
		for (j=0; j<indeps.length; j++)
			soma -= A[mapa.j[j+mapa.num]][mapa.i[i]]*indeps[j]
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
		if (pos < mapa.num)
			r.push(deps[pos])
		else
			r.push(indeps[pos-mapa.num])
	}
	return r
}

// Retorna o quadrado do módulo de um vetor (uma Array)
Solver.getModuloQuadrado = function (v) {
	var r = 0, i
	for (i=0; i<v.length; i++)
		r += v[i]*v[i]
	return r
}
