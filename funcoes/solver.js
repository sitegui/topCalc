"use strict";

// Módulo para resolver equações numericamente
Config.registrar("epsDerivada", "Passo usado para calcular a derivada de uma expressão", 1e-7, Config.setters.double)
Config.registrar("epsilon", "Precisão buscada pelos métodos numéricos", 1e-14, Config.setters.double)
Config.registrar("maxPassos", "Número máximo de iterações feitas pelos métodos numéricos", 100, Config.setters.int)

Funcao.registrar("derivate", "derivate(variavel, expressao, ponto=variavel)\nRetorna a derivada simbólica da expressão num dado ponto", function (variavel, expressao, ponto) {
	var antes
	
	if (Funcao.funcoes.derivate.derivando)
		// Evita recursão infinita
		return
	
	// Trata os argumentos
	if (this.args.length != 2 && this.args.length != 3)
		throw 0
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	if (this.args.length == 3)
		this.args[2] = ponto = this.executarNoEscopo(ponto)
	else
		ponto = new Variavel(variavel)
	
	try {
		// Cria o subescopo
		antes = Variavel.backup(variavel)
		Funcao.funcoes.derivate.derivando = true
		return Funcao.aplicarNasListas(function (vVar, expressao, ponto) {
			expressao = Simplificar(Solver.derivar(expressao, variavel, function (expressao) {
				// Deixa indicado
				return new Funcao("derivate", [vVar, expressao, ponto])
			}))
			Variavel.valores[variavel] = ponto
			return this.executarNoEscopo(expressao, null, [variavel])
		}, this, [new Variavel(variavel), expressao, ponto])
	} finally {
		Variavel.restaurar(antes)
		delete Funcao.funcoes.derivate.derivando
	}
}, false, true, true)

Funcao.registrar("derivateNum", "derivateNum(variavel, expressao, ponto)\nRetorna a derivada aproximada da expressão num dado ponto", function (variavel, expressao, ponto) {
	var antes, epsD, derivarFolha
	
	if (Funcao.funcoes.derivateNum.derivando)
		// Evita recursão infinita
		return
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel))
		throw 0
	variavel = variavel.nome
	this.args[1] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	this.args[2] = ponto = this.executarNoEscopo(ponto)
	epsD = Config.get("epsDerivada")
	
	try {
		// Cria o subescopo
		antes = Variavel.backup(variavel)
		Funcao.funcoes.derivateNum.derivando = true
		return Funcao.aplicarNasListas(function (vVar, expressao, ponto) {
			var h, that = this
			
			// Define como as expressões não deriváveis simbolicamente serão tratadas
			if (eNumerico(ponto)) {
				h = multiplicar(epsD, somar(abs(ponto), 1))
				derivarFolha = function (expressao) {
					// Derivada aproximada
					var x, fx, fxh
					Variavel.valores[variavel] = ponto
					fx = that.executarNoEscopo(expressao, null, [variavel])
					Variavel.valores[variavel] = somar(ponto, h)
					fxh = that.executarNoEscopo(expressao, null, [variavel])
					return Funcao.executar("/", [Funcao.executar("-", [fxh, fx]), h])
				}
			} else if (eDeterminado(ponto))
				throw 0
			else
				derivarFolha = function (expressao) {
					// Deixa indicado
					return new Funcao("derivateNum", [vVar, expressao, ponto])
				}
				
			expressao = Simplificar(Solver.derivar(expressao, variavel, derivarFolha))
			Variavel.valores[variavel] = ponto
			return this.executarNoEscopo(expressao, null, [variavel])
		}, this, [new Variavel(variavel), expressao, ponto])
	} finally {
		Variavel.restaurar(antes)
		delete Funcao.funcoes.derivateNum.derivando
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
			var xs, i, jacob, fsx, j, mapa, deltas, indeps, deps, jacob2, fsx2
			
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
			var i, fsx, jacob, mapa, indeps, deps, deltas, xs, jacob2, fsx2
			
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
				
				xs[0].a += deltas[0]
				xs[0].b += deltas[1]
				
				// Condição de parada
				if (deltas[0]*deltas[0]+deltas[1]*deltas[1] < eps)
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
			var xs, i, temp, fsx, jacob, jacob2, fsx2, mapa, indeps, deps, deltas, j
			
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
Funcao.funcoes.derivateNum.preExecucao = 
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
