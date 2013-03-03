"use strict";

// Módulo para desenhar gráficos no console

Funcao.registrar("plotar", "plotar(funcao, vMin, vMax)\nDesenha uma função (ou várias) na tela", function (funcao, vMin, vMax) {
	var funcs, variavel, determinado, i, j, valores, xss, yss, yMax, yMin, canvas, w, h, passos, cntxt, dX, dY, x, y, div, retorno
	
	// Calcula os valores para uma função
	// Retorna [xs, ys, yMax, yMin]
	var calcularValores = function (funcao) {
		var xs, ys, x, y, ys2, i, salto, yMax, yMin
		xs = []
		ys = []
		for (x=vMin; x<=vMax; x+=(vMax-vMin)/passos) {
			y = Funcao.executar(funcao.nome, [x])
			if (eNumerico(y) && !(y instanceof Complexo)) {
				xs.push(x)
				ys.push(getNum(y))
			}
		}
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
	
	this.args[0] = funcao = unbox(funcao)
	this.args[1] = vMin = this.executarNoEscopo(vMin)
	this.args[2] = vMax = this.executarNoEscopo(vMax)
	funcs = funcao instanceof Lista ? funcao.expressoes.map(unbox) : [funcao]
	variavel = funcs.every(function (x) {
		return x instanceof Variavel
	})
	determinado = funcs.every(eDeterminado)
	if (funcs.length && variavel && eNumerico(vMin) && eNumerico(vMax)) {
		// Calcula os valores
		vMin = getNum(vMin)
		vMax = getNum(vMax)
		if (vMin >= vMax)
			throw 0
		passos = 300
		xss = []
		yss = []
		yMax = -Infinity
		yMin = Infinity
		retorno = new Lista
		for (i=0; i<funcs.length; i++) {
			if (!(funcs[i].nome in Funcao.funcoes))
				return
			retorno.expressoes.push(Funcao.executar(funcs[i].nome, [new Variavel("_x")]))
			valores = calcularValores(funcs[i])
			xss.push(valores[0])
			yss.push(valores[1])
			yMax = Math.max(yMax, valores[2])
			yMin = Math.min(yMin, valores[3])
		}
		
		// Cria o canvas
		canvas = document.createElement("canvas")
		w = canvas.width = 4*Math.round(document.documentElement.clientWidth/8)
		h = canvas.height = 9*w/16
		
		// Ajusta os valores
		dX = (vMax-vMin)*1.1
		vMax = (2.1*vMax-.1*vMin)/2
		vMin = vMax-dX
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
		if (vMin<0 && vMax>0) {
			cntxt.beginPath()
			x = -w*vMin/(vMax-vMin)
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
				x = w*(xss[i][j]-vMin)/(vMax-vMin)
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
		return funcao instanceof Lista ? retorno : retorno.expressoes[0]
	} else if (determinado && eDeterminado(vMin) && eDeterminado(vMax))
		throw 0
}, false, true)
