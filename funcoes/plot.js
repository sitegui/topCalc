"use strict";

// Módulo para desenhar gráficos no console

Funcao.registrar("plot", "plot(variavel, inicio, fim, expressao)\nDesenha uma função (ou várias) na tela", function (variavel, inicio, fim, expressao) {
	var funcs, xMin, xMax, passos, xss, yss, yMax, yMin, i, j, canvas, cntxt, w, h, dX, dY, that, valores, x, y, div
	
	// Calcula os valores para uma função
	// Retorna [xs, ys, yMax, yMin]
	that = this
	var calcularValores = function (exp) {
		var xs, ys, x, y, ys2, i, salto, yMax, yMin, antes
		xs = []
		ys = []
		antes = Variavel.backup(variavel)
		for (x=xMin; x<=xMax; x+=(xMax-xMin)/passos) {
			Variavel.valores[variavel] = x
			y = that.executarNoEscopo(exp)
			if (eNumerico(y) && !(y instanceof Complexo)) {
				xs.push(x)
				ys.push(getNum(y))
			}
		}
		Variavel.restaurar(antes)
		ys2 = []
		for (i=1; i<ys.length; i++) {
			salto = (ys[i]-ys[i-1])/(xs[i]-xs[i-1])
			if (Math.abs(salto) < 1e3) {
				if (i==0)
					ys2.push(ys[0])
				ys2.push(ys[i])
			}
		}
		yMax = ys2.reduce(function (a, b) {
			return Math.max(a, b)
		}, -Infinity)
		yMin = ys2.reduce(function (a, b) {
			return Math.min(a, b)
		}, Infinity)
		return [xs, ys, yMax, yMin]
	}
	
	// Trata os argumentos
	this.args[0] = variavel = unbox(variavel)
	if (!(variavel instanceof Variavel))
		throw 0
	this.args[1] = inicio = this.executarNoEscopo(inicio)
	this.args[2] = fim = this.executarNoEscopo(fim)
	variavel = variavel.nome
	if (!ePuro(expressao))
		this.args[3] = expressao = this.executarNoEscopo(expressao, [variavel])
	else
		expressao = unbox(expressao)
	
	funcs = expressao instanceof Lista ? expressao.expressoes : [expressao]
	if (eNumerico(inicio) && eNumerico(fim)) {
		// Calcula os valores
		xMin = getNum(inicio)
		xMax = getNum(fim)
		if (xMin >= xMax)
			throw 0
		passos = 300
		xss = []
		yss = []
		yMax = -Infinity
		yMin = Infinity
		
		for (i=0; i<funcs.length; i++) {
			valores = calcularValores(funcs[i])
			xss.push(valores[0])
			yss.push(valores[1])
			yMax = Math.max(yMax, valores[2])
			yMin = Math.min(yMin, valores[3])
		}
		
		// Cria o canvas
		canvas = document.createElement("canvas")
		w = canvas.width = 4*Math.round(document.body.clientWidth/8)
		h = canvas.height = 9*w/16
		
		// Ajusta os valores
		dX = (xMax-xMin)*1.1
		xMax = (2.1*xMax-.1*xMin)/2
		xMin = xMax-dX
		dY = (yMax-yMin)*1.1
		yMax = (2.1*yMax-.1*yMin)/2
		yMin = yMax-dY
		
		// Desenha o fundo
		cntxt = canvas.getContext("2d")
		cntxt.fillStyle = "black"
		cntxt.fillRect(0, 0, w, h)
		
		// Desenha os eixos
		cntxt.strokeStyle = "white"
		cntxt.lineWidth = 1
		if (yMin<0 && yMax>0) {
			cntxt.beginPath()
			y = h*yMax/(yMax-yMin)
			cntxt.moveTo(0, y)
			cntxt.lineTo(w, y)
			cntxt.moveTo(w-5, y-5)
			cntxt.lineTo(w, y)
			cntxt.moveTo(w-5, y+5)
			cntxt.lineTo(w, y)
			cntxt.stroke()
		}
		if (xMin<0 && xMax>0) {
			cntxt.beginPath()
			x = -w*xMin/(xMax-xMin)
			cntxt.moveTo(x, h)
			cntxt.lineTo(x, 0)
			cntxt.moveTo(x-5, 5)
			cntxt.lineTo(x, 0)
			cntxt.moveTo(x+5, 5)
			cntxt.lineTo(x, 0)
			cntxt.stroke()
		}
		
		// Desenha a curva
		cntxt.lineWidth = 3
		for (i=0; i<xss.length; i++) {
			cntxt.strokeStyle = "rgba(255,255,255,"+(1-i/xss.length)+")"
			cntxt.beginPath()
			for (j=0; j<xss[i].length; j++) {
				x = w*(xss[i][j]-xMin)/(xMax-xMin)
				y = h*(yMax-yss[i][j])/(yMax-yMin)
				if (j)
					cntxt.lineTo(x, y)
				else
					cntxt.moveTo(x, y)
			}
			cntxt.stroke()
		}
		
		// Mostra na tela
		div = document.createElement("div")
		div.appendChild(canvas)
		Console.echoDiv(div)
		return expressao
	} else if (determinado && eDeterminado(xMin) && eDeterminado(xMax))
		throw 0
}, false, true)
