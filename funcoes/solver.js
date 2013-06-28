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
