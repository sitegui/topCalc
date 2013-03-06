"use strict";

// Módulo para desenhar gráficos no console

Funcao.registrar("plot", "plot(variavel, inicio, fim, expressao)\nDesenha uma função (ou várias) na tela", function (variavel, inicio, fim, expressao) {
	var funcs, xMin, xMax, canvas, that, div
	
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
	
	if (eNumerico(inicio) && eNumerico(fim)) {
		// Calcula os valores
		xMin = getNum(inicio)
		xMax = getNum(fim)
		if (xMin >= xMax)
			throw 0
		that = this
		funcs = expressao instanceof Lista ? expressao.expressoes : [expressao]
		
		// Plota
		canvas = plot2canvas(that, variavel, xMin, xMax, funcs)
		
		// Mostra na tela
		div = document.createElement("div")
		div.appendChild(canvas)
		Console.echoDiv(div)
		return expressao
	} else if (determinado && eDeterminado(xMin) && eDeterminado(xMax))
		throw 0
}, false, true)

Funcao.registrar("animate", "animate(variavel, inicio, fim, variavelX, inicioX, fimX, expressao)\nMostra uma animação dos gráficos gerados com plot(variavelX, inicioX, fimX, expressao)", function (variavel, inicio, fim, variavelX, inicioX, fimX, expressao) {
	var funcs, xMin, xMax, canvas, that, div, quadros, antes, i, datas, img, pos, trocar, t0, iniciarTrocas, funcs2
	
	// Trata os argumentos
	this.args[0] = variavel = unbox(variavel)
	this.args[3] = variavelX = unbox(variavelX)
	if (!(variavel instanceof Variavel) || !(variavelX instanceof Variavel))
		throw 0
	this.args[1] = inicio = this.executarNoEscopo(inicio)
	this.args[2] = fim = this.executarNoEscopo(fim)
	this.args[4] = inicioX = this.executarNoEscopo(inicioX)
	this.args[5] = fimX = this.executarNoEscopo(fimX)
	variavel = variavel.nome
	variavelX = variavelX.nome
	if (!ePuro(expressao))
		this.args[6] = expressao = this.executarNoEscopo(expressao, [variavel, variavelX])
	else
		expressao = unbox(expressao)
	
	if (eNumerico(inicio) && eNumerico(fim) && eNumerico(inicioX) && eNumerico(fimX)) {
		// Calcula os valores
		inicio = getNum(inicio)
		fim = getNum(fim)
		xMin = getNum(inicioX)
		xMax = getNum(fimX)
		if (xMin >= xMax)
			throw 0
		that = this
		quadros = 50
		funcs = expressao instanceof Lista ? expressao.expressoes : [expressao]
		antes = Variavel.backup(variavel)
		datas = []
		
		for (i=inicio; i<=fim; i+=(fim-inicio)/quadros) {
			// Plota
			Variavel.valores[variavel] = i
			funcs2 = funcs.map(function (x) {
				if (ePuro(x))
					return x
				return that.executarNoEscopo(x, [variavelX])
			})
			canvas = plot2canvas(that, variavelX, xMin, xMax, funcs2)
			canvas.getContext("2d").fillStyle = "white"
			canvas.getContext("2d").font = "15px sans-serif"
			canvas.getContext("2d").fillText(variavel+" = "+i.toPrecision(2), 7, 15)
			datas.push(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height))
		}
		Variavel.restaurar(antes)
		
		// Mostra na tela
		div = document.createElement("div")
		div.appendChild(canvas)
		Console.echoDiv(div)
		
		// Troca a cada quadro
		pos = 0
		iniciarTrocas = function (evento) {
			t0 = Date.now()
			canvas.onclick = null
			canvas.title = ""
			canvas.style.cursor = ""
			trocar()
		}
		canvas.onmousedown = function (evento) {
			evento.stopPropagation()
		}
		trocar = function () {
			var p = pos/3, len = datas.length
			if (Date.now()-t0 > 10e3) {
				canvas.title = "Clique para continuar"
				canvas.style.cursor = "pointer"
				canvas.onclick = iniciarTrocas
				return
			}
			if (pos%3 == 0)
				canvas.getContext("2d").putImageData(datas[p<len ? p : len-p%len-1], 0, 0)
			pos = (pos+1)%(6*len)
			window.mozRequestAnimationFrame(trocar)
		}
		iniciarTrocas()
		
		return expressao
	} else if (determinado && eDeterminado(xMin) && eDeterminado(xMax))
		throw 0
}, false, true)

/*

= Funções auxiliares =

*/

// Plota uma array de expressões num canvas
// that é o this dentro de uma função executada
// variavel é uma string com o nome da variável iterada
// xMin e xMax são Number
// funcs é uma array de expressões matemáticas
// Retorna um canvas com o desenho
function plot2canvas(that, variavel, xMin, xMax, funcs) {
	var passos, xss, yss, yMax, yMin, i, j, canvas, cntxt, w, h, dX, dY, valores, x, y
	
	// Calcula os valores para uma função
	// Retorna [xs, ys, xsC, ysC, yMax, yMin]
	var calcularValores = function (exp) {
		var xs, ys, x, y, ys2, i, salto, yMax, yMin, antes, xsC, ysC, complexo
		xs = []
		ys = []
		xsC = []
		ysC = []
		antes = Variavel.backup(variavel)
		complexo = false
		
		// Executa a expressão para cada valor de x e salva os resultados
		for (x=xMin; x<=xMax; x+=(xMax-xMin)/passos) {
			Variavel.valores[variavel] = x
			y = that.executarNoEscopo(exp)
			if (eNumerico(y)) {
				if (y instanceof Complexo) {
					xsC.push(x)
					ysC.push(getNum(y.b))
					y = y.a
					complexo = true
				} else {
					xsC.push(x)
					ysC.push(0)
				}
				xs.push(x)
				ys.push(getNum(y))
			}
		}
		if (!complexo) {
			xsC = []
			ysC = []
		}
		Variavel.restaurar(antes)
		
		// Escolhe a escala vertical
		ys2 = []
		for (i=1; i<ys.length; i++) {
			salto = (ys[i]-ys[i-1])/(xs[i]-xs[i-1])
			if (Math.abs(salto) < 1e3) {
				if (i==0)
					ys2.push(ys[0])
				ys2.push(ys[i])
			}
		}
		for (i=1; i<ysC.length; i++) {
			salto = (ysC[i]-ysC[i-1])/(xsC[i]-xsC[i-1])
			if (Math.abs(salto) < 1e3) {
				if (i==0)
					ys2.push(ysC[0])
				ys2.push(ysC[i])
			}
		}
		yMax = ys2.reduce(function (a, b) {
			return Math.max(a, b)
		}, -Infinity)
		yMin = ys2.reduce(function (a, b) {
			return Math.min(a, b)
		}, Infinity)
		return [xs, ys, xsC, ysC, yMax, yMin]
	}
	
	passos = 300
	xss = []
	yss = []
	yMax = -Infinity
	yMin = Infinity
	
	funcs = Funcao.getFlatArgs(funcs)
	for (i=0; i<funcs.length; i++) {
		valores = calcularValores(funcs[i])
		valores[0].i = i
		valores[0].real = true
		xss.push(valores[0])
		yss.push(valores[1])
		if (valores[2].length) {
			valores[2].i = i
			valores[2].real = false
			xss.push(valores[2])
			yss.push(valores[3])
		}
		yMax = Math.max(yMax, valores[4])
		yMin = Math.min(yMin, valores[5])
	}
	
	// Cria o canvas
	canvas = document.createElement("canvas")
	w = canvas.width = 4*Math.round(document.body.clientWidth/8)
	h = canvas.height = 9*w/16
	
	// Ajusta os valores
	if (yMax == yMin) {
		yMax++
		yMin--
	}
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
		if (xss[i].real)
			cntxt.strokeStyle = "rgba(255,255,255,"+(1-xss[i].i/funcs.length)+")"
		else
			cntxt.strokeStyle = "rgba(255,0,0,"+(1-xss[i].i/funcs.length)+")"
		cntxt.beginPath()
		for (j=0; j<xss[i].length; j++) {
			x = w*(xss[i][j]-xMin)/(xMax-xMin)
			y = h*(yMax-yss[i][j])/(yMax-yMin)
			if (Math.abs(x) == Infinity || Math.abs(y) == Infinity)
				continue
			if (j)
				cntxt.lineTo(x, y)
			else
				cntxt.moveTo(x, y)
		}
		cntxt.stroke()
	}
	
	return canvas
}
