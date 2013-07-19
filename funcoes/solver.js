"use strict";

// Módulo para resolver equações numericamente

Config.registrar("epsDerivada", "Passo usado para calcular a derivada de uma expressão", 1e-7, Config.setters.double)
Config.registrar("epsilon", "Precisão buscada pelos métodos numéricos", 1e-14, Config.setters.double)
Config.registrar("maxPassos", "Número máximo de iterações feitas pelos métodos numéricos", 100, Config.setters.int)

Funcao.registrar("derivate", "derivate(variavel, expressao, ponto)\nRetorna a derivada aproximada da expressão num dado ponto", function (variavel, expressao, valor) {
	var antes, epsD
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	this.args[2] = valor = this.executarNoEscopo(valor)
	epsD = Config.get("epsDerivada")
	
	try {
		// Cria o sub-escopo
		antes = Variavel.backup(variavel)
		return Funcao.aplicarNasListas(function (expressao, valor) {
			var h, x, fx, fxh
			
			if (eNumerico(valor)) {
				h = multiplicar(epsD, somar(abs(valor), 1))
				Variavel.valores[variavel] = valor
				fx = this.executarNoEscopo(expressao, null, [variavel])
				Variavel.valores[variavel] = somar(valor, h)
				fxh = this.executarNoEscopo(expressao, null, [variavel])
				return Funcao.executar("/", [Funcao.executar("-", [fxh, fx]), h])
			} else if (eDeterminado(valor))
				throw 0
		}, this, [expressao, valor])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

Funcao.registrar("derivate2", "derivate2(variavel, expressao, ponto)\nRetorna a segunda derivada aproximada da expressão num dado ponto", function (variavel, expressao, valor) {
	var antes, epsD
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	this.args[2] = valor = this.executarNoEscopo(valor)
	epsD = Config.get("epsDerivada")
	
	try {
		// Cria o sub-escopo
		antes = Variavel.backup(variavel)
		return Funcao.aplicarNasListas(function (expressao, valor) {
			var h1, h2, x, fx, fxh, fxhh, a, b
			
			if (eNumerico(valor)) {
				h1 = multiplicar(epsD, somar(abs(valor), 1))
				h2 = multiplicar(epsD, somar(abs(valor+h1), 1))
				Variavel.valores[variavel] = valor
				fx = this.executarNoEscopo(expressao, null, [variavel])
				Variavel.valores[variavel] = somar(valor, h1)
				fxh = this.executarNoEscopo(expressao, null, [variavel])
				Variavel.valores[variavel] = somar(somar(valor, h1), h2)
				fxhh = this.executarNoEscopo(expressao, null, [variavel])
				a = Funcao.executar("/", [Funcao.executar("-", [fxhh, fxh]), h2])
				b = Funcao.executar("/", [Funcao.executar("-", [fxh, fx]), h1])
				return Funcao.executar("/", [Funcao.executar("-", [a, b]), h1])
			} else if (eDeterminado(valor))
				throw 0
		}, this, [expressao, valor])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

Funcao.registrar("findZero", "findZero(variavel, expressao, chute)\nEncontra um valor real que zera uma expressão real usando o chute inicial dado", function (variavel, expressao, chute) {
	var antes, maxI, epsD, eps
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	this.args[2] = chute = this.executarNoEscopo(chute)
	maxI = Config.get("maxPassos")
	epsD = Config.get("epsDerivada")
	eps = Config.get("epsilon")
	
	try {
		// Cria o sub-escopo
		antes = Variavel.backup(variavel)
		return Funcao.aplicarNasListas(function (varVar, expressao, chute) {
			var i, h, x, fx, fxh, x2
			if (eNumerico(chute)) {
				x = getNum(chute)
				for (i=0; i<maxI; i++) {
					// Calcula o próximo valor x2 = x - f(x)/f'(x)
					h = epsD*(Math.abs(x)+1)
					Variavel.valores[variavel] = x
					fx = getNum(this.executarNoEscopo(expressao, null, [variavel]))
					
					// Verifica a condição de parada
					if (Math.abs(fx) < eps)
						break
					
					Variavel.valores[variavel] = x+h
					fxh = getNum(this.executarNoEscopo(expressao, null, [variavel]))
					x2 = x-(h*fx)/(fxh-fx)
					if (Math.abs(x2) == Infinity || isNaN(x2))
						throw "Erro ao calcular a derivada, tente outro valor inicial"
					
					// Verifica a condição de parada
					if (Math.abs(x2-x) < eps)
						break
					x = x2
				}
				
				// Retorna o resultado
				if (i == maxI)
					Console.echoErro("Número máximo de iterações atingido (o resultado pode não fazer sentido)")
				return x
			} else if (eDeterminado(chute))
				throw 0
		}, this, [this.args[0], expressao, chute])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

Funcao.registrar("solve", "solve(vars, exps, chute)\nResolve um conjunto de m expressões (em forma de vetor ou matriz) nas variáveis reais. vars e chute são um vetor de n posições.", function (vars, exps, chute) {
	var i, antes, maxI, eps, that
	
	// Pega os nomes das variáveis
	that = this
	if (!(vars instanceof Vetor))
		throw 0
	vars = []
	for (i=0; i<this.args[0].expressoes.length; i++) {
		if (this.args[0].expressoes[i] instanceof Variavel)
			vars.push(this.args[0].expressoes[i].nome)
		else
			throw 0
	}
	
	// Trata os outros argumentos
	this.args[1] = exps = this.preExecutarNoEscopo(exps, vars)
	this.args[2] = chute = this.executarNoEscopo(chute)
	maxI = Config.get("maxPassos")
	eps = Config.get("epsilon")
	eps *= eps
	
	// Cria o sub-escopo
	try {
		antes = Variavel.backup(vars)
		
		// Aplica a cada combinação de listas
		return Funcao.aplicarNasListas(function (vecVars, exps, chute) {
			var xs, i, jacob, fsx, dsx, j, mapa, deltas, indeps, deps, jacob2, fsx2
			
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
				
				// Condição de parada
				if (Solver.getModuloQuadrado(fsx) < eps)
					break
				
				// Faz uma cópia dos valores para caso seja necessário utiliza-los novamente
				jacob2 = jacob.map(clonar)
				fsx2 = fsx.clonar()
				
				mapa = Solver.eliminarNumericamente(jacob, fsx)
				if (mapa) {
					// Infinitas soluções ou 1 solução
					indeps = Solver.determinarIndependentes(jacob, fsx, mapa)
					deps = Solver.determinarDependentes(jacob, fsx, mapa, indeps)
					deltas = Solver.ordenarVars(mapa, deps, indeps)
				} else
					// Nenhuma solução, busca pela melhor pseudo-solução
					deltas = Solver.determinarPseudoSolucao(jacob2, fsx2)
				
				for (j=0; j<deltas.length; j++)
					xs[j] += deltas[j]
				
				// Condição de parada
				if (Solver.getModuloQuadrado(deltas) < eps)
					break
			}
				
			// Retorna o resultado
			if (i == maxI)
				Console.echoErro("Número máximo de iterações atingido (o resultado pode não fazer sentido)")
			return new Vetor(xs)
		}, this, [this.args[0], exps, chute])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

Funcao.registrar("findComplexZero", "findComplexZero(variavel, expressao, chute)\nEncontra um valor complexo que zera uma expressão usando o chute inicial dado", function (variavel, expressao, chute) {
	var antes, maxI, epsD, eps, that
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	this.args[2] = chute = this.executarNoEscopo(chute)
	maxI = Config.get("maxPassos")
	eps = Config.get("epsilon")
	eps *= eps
	that = this
	
	try {
		// Cria o sub-escopo
		antes = Variavel.backup(variavel)
		return Funcao.aplicarNasListas(function (varVar, expressao, chute) {
			var i, fsx, jacob, mapa, indeps, deps, deltas, xs
			
			// Extrai a parte real e imaginária do chute inicial
			if (!eDeterminado(chute))
				return
			else if (!eNumerico(chute))
				throw 0
			xs = [toComplexo(chute)]
			xs[0].a = getNum(xs[0].a)
			xs[0].b = getNum(xs[0].b)
			
			// Aplica as iterações
			for (i=0; i<maxI; i++) {
				fsx = []
				jacob = Solver.calcularJacobianaComplexa([variavel], [expressao], xs, fsx, that)
				
				// Condição de parada
				if (fsx[0]*fsx[0]+fsx[1]*fsx[1] < eps)
					break
				
				mapa = Solver.eliminarNumericamente(jacob, fsx)
				if (!mapa || mapa.i.length != mapa.j.length)
					throw "Falha ao tentar resolver, tente outro chute inicial"
				xs[0].a += fsx[0]
				xs[0].b += fsx[1]
				
				// Condição de parada
				if (fsx[0]*fsx[0]+fsx[1]*fsx[1] < eps)
					break
			}
				
			// Retorna o resultado
			if (i == maxI)
				Console.echoErro("Número máximo de iterações atingido (o resultado pode não fazer sentido)")
			return xs[0]
		}, this, [this.args[0], expressao, chute])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

Funcao.registrar("solveComplex", "solveComplex(vars, exps, chute)\nResolve um conjunto de m expressões (em forma de vetor ou matriz) nas variáveis complexas. vars e chute são um vetor de n posições.", function (vars, exps, chute) {
	var i, antes, maxI, eps, that
	
	// Pega os nomes das variáveis
	that = this
	if (!(vars instanceof Vetor))
		throw 0
	vars = []
	for (i=0; i<this.args[0].expressoes.length; i++) {
		if (this.args[0].expressoes[i] instanceof Variavel)
			vars.push(this.args[0].expressoes[i].nome)
		else
			throw 0
	}
	
	// Trata os outros argumentos
	this.args[1] = exps = this.preExecutarNoEscopo(exps, vars)
	this.args[2] = chute = this.executarNoEscopo(chute)
	maxI = Config.get("maxPassos")
	eps = Config.get("epsilon")
	eps *= eps
	
	// Cria o sub-escopo
	try {
		antes = Variavel.backup(vars)
		
		// Aplica a cada combinação de listas
		return Funcao.aplicarNasListas(function (vecVars, exps, chute) {
			var xs, i, jacob, fsx, dsx, j, mapa, deltas, indeps, deps, temp
			
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
				if (eNumerico(chute.expressoes[i])) {
					temp = toComplexo(chute.expressoes[i])
					xs.push(new Complexo(getNum(temp.a), getNum(temp.b)))
				} else if (eDeterminado(chute.expressoes[i]))
					throw 0
				else
					return
			}
			
			// Aplica as iterações
			for (i=0; i<maxI; i++) {
				fsx = []
				jacob = Solver.calcularJacobianaComplexa(vars, exps, xs, fsx, that)
				
				// Condição de parada
				if (Solver.getModuloQuadrado(fsx) < eps)
					break
				
				// Faz uma cópia dos valores para caso seja necessário utiliza-los novamente
				jacob2 = jacob.map(clonar)
				fsx2 = fsx.clonar()
				
				mapa = Solver.eliminarNumericamente(jacob, fsx)
				if (mapa) {
					// Infinitas soluções ou 1 solução
					indeps = Solver.determinarIndependentes(jacob, fsx, mapa)
					deps = Solver.determinarDependentes(jacob, fsx, mapa, indeps)
					deltas = Solver.ordenarVars(mapa, deps, indeps)
				} else
					// Nenhuma solução, busca pela melhor pseudo-solução
					deltas = Solver.determinarPseudoSolucao(jacob2, fsx2)
				
				for (j=0; j<deltas.length/2; j++) {
					xs[j].a += deltas[2*j]
					xs[j].b += deltas[2*j+1]
				}
				
				// Condição de parada
				if (Solver.getModuloQuadrado(deltas) < eps)
					break
			}
				
			// Retorna o resultado
			if (i == maxI)
				Console.echoErro("Número máximo de iterações atingido (o resultado pode não fazer sentido)")
			return new Vetor(xs)
		}, this, [this.args[0], exps, chute])
	} finally {
		Variavel.restaurar(antes)
	}
}, false, true)

// Define os comportamentos de pre-execução
Funcao.funcoes.derivate.preExecucao = 
Funcao.funcoes.derivate2.preExecucao = 
Funcao.funcoes.findComplexZero.preExecucao = 
Funcao.funcoes.findZero.preExecucao = Funcao.gerarPreExecucao([0], 1)
Funcao.funcoes.solve.preExecucao = 
Funcao.funcoes.solveComplex.preExecucao = function () {
	var vars = [], i
	
	if (!(this.args[0] instanceof Vetor))
		throw 0
	for (i=0; i<this.args[0].expressoes.length; i++) {
		if (this.args[0].expressoes[i] instanceof Variavel)
			vars.push(this.args[0].expressoes[i].nome)
		else
			throw 0
	}
	
	// Trata os outros argumentos
	this.args[1] = this.executarNoEscopo(this.args[1], vars)
	this.args[2] = this.executarNoEscopo(this.args[2])
}

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
