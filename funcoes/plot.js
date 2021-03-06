"use strict";

// Módulo para desenhar gráficos no console

Config.registrar("numPontosPlot", "Define o número de pontos a serem calculados para montar um gráfico", 300, Config.setters.int)

Funcao.registrar("plot", "plot(variavel, inicio, fim, expressao)\nDesenha uma função (ou várias) na tela", function (variavel, inicio, fim, expressao) {
	var funcs, xMin, xMax, canvas, that, div
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel))
		throw 0
	this.args[1] = inicio = this.executarNoEscopo(inicio)
	this.args[2] = fim = this.executarNoEscopo(fim)
	variavel = variavel.nome
	this.args[3] = expressao = this.preExecutarNoEscopo(expressao, [variavel])
	
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
	var funcs, xMin, xMax, canvas, that, div, quadros, antes, i, datas, img, pos, trocar, t0, iniciarTrocas, funcs2, tempo
	
	// Trata os argumentos
	if (!(variavel instanceof Variavel) || !(variavelX instanceof Variavel))
		throw 0
	this.args[1] = inicio = this.executarNoEscopo(inicio)
	this.args[2] = fim = this.executarNoEscopo(fim)
	this.args[4] = inicioX = this.executarNoEscopo(inicioX)
	this.args[5] = fimX = this.executarNoEscopo(fimX)
	variavel = variavel.nome
	variavelX = variavelX.nome
	this.args[6] = expressao = this.preExecutarNoEscopo(expressao, [variavel, variavelX])
	
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
		
		try {
			antes = Variavel.backup(variavel)
			datas = []
			for (i=inicio; i<=fim; i+=(fim-inicio)/quadros) {
				// Plota
				Variavel.valores[variavel] = i
				funcs2 = funcs.map(function (x) {
					return that.preExecutarNoEscopo(x, [variavelX])
				})
				canvas = plot2canvas(that, variavelX, xMin, xMax, funcs2)
				canvas.getContext("2d").fillStyle = "white"
				canvas.getContext("2d").font = "15px sans-serif"
				canvas.getContext("2d").textAlign = "start"
				canvas.getContext("2d").fillText(variavel+" = "+i.toPrecision(3), 7, 15)
				datas.push(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height))
			}
		} finally {
			Variavel.restaurar(antes)
		}
		
		// Mostra na tela
		div = document.createElement("div")
		div.appendChild(canvas)
		Console.echoDiv(div)
		
		// Troca a cada quadro
		pos = 0
		tempo = 0
		iniciarTrocas = function (evento) {
			t0 = Date.now()
			tempo += 7e3
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
			if (Date.now()-t0 > tempo) {
				canvas.title = "Clique para continuar"
				canvas.style.cursor = "pointer"
				canvas.onclick = iniciarTrocas
				return
			}
			if (pos%3 == 0)
				canvas.getContext("2d").putImageData(datas[p<len ? p : len-p%len-1], 0, 0)
			pos = (pos+1)%(6*len)
			if ("mozRequestAnimationFrame" in window)
				window.mozRequestAnimationFrame(trocar)
			else if ("webkitRequestAnimationFrame" in window)
				window.webkitRequestAnimationFrame(trocar)
			else
				window.requestAnimationFrame(trocar)
		}
		iniciarTrocas()
		
		return expressao
	} else if (determinado && eDeterminado(xMin) && eDeterminado(xMax))
		throw 0
}, false, true)

Funcao.registrar("slider", "slider(var1, min1, max1, ..., varX, inicioX, fimX, expX)\nPermite plotar um gráfico com um dado número de parâmetros visualmente ajustáveis. Variáveis não definidas serão adicionadas como parâmetros automaticamente", function () {
	var varX, inicioX, fimX, expX, len
	var vars, mins, maxs, varI, minI, maxI, i, numerico, div, valores, that, funcs
	
	// Carrega os argumentos
	len = arguments.length
	if (len < 4 || (len-4)%3 != 0)
		throw 0
	varX = this.args[len-4]
	if (!(varX instanceof Variavel))
		throw 0
	varX = varX.nome
	this.args[len-3] = inicioX = this.executarNoEscopo(this.args[len-3])
	if (!eNumerico(inicioX) && eDeterminado(inicioX))
		throw 0
	this.args[len-2] = fimX = this.executarNoEscopo(this.args[len-2])
	if (!eNumerico(fimX) && eDeterminado(fimX))
		throw 0
	vars = []
	mins = []
	maxs = []
	valores = []
	that = this
	for (i=0; i<arguments.length-4; i+=3) {
		varI = arguments[i]
		if (!(varI instanceof Variavel))
			throw 0
		this.args[i+1] = minI = this.executarNoEscopo(arguments[i+1])
		if (!eNumerico(minI) && eDeterminado(minI))
			throw 0
		this.args[i+2] = maxI = this.executarNoEscopo(arguments[i+2])
		if (!eNumerico(maxI) && eDeterminado(maxI))
			throw 0
		vars.push(varI.nome)
		mins.push(minI)
		maxs.push(maxI)
	}
	expX = this.preExecutarNoEscopo(this.args[len-1], vars.concat(varX))
	funcs = expX instanceof Lista ? expX.expressoes : [expX]
	
	var gerarOnChange = function (i) {
		return function (valor) {
			valores[i] = valor
			desenhar()
		}
	}
	
	var desenhar = function () {
		var backup, i, funcs2
		
		try {
			backup = Variavel.backup(vars)
			for (i=0; i<vars.length; i++)
				Variavel.valores[vars[i]] = valores[i]
			
			funcs2 = funcs.map(function (x) {
				return that.preExecutarNoEscopo(x, [varX])
			})
			div.replaceChild(plot2canvas(that, varX, inicioX, fimX, funcs2), div.lastChild)
		} finally {
			Variavel.restaurar(backup)
		}
	}
	
	// Percorre a expressão recursivamente, buscando por variáveis
	var acharVars = function (exp) {
		if (exp instanceof Parenteses || exp instanceof Lista || exp instanceof Vetor || exp instanceof Matriz)
			exp.expressoes.forEach(acharVars)
		else if (exp instanceof Funcao)
			exp.args.forEach(acharVars)
		else if (exp instanceof Variavel)
			if (vars.indexOf(exp.nome) == -1 && exp.nome != varX) {
				vars.push(exp.nome)
				mins.push(-1)
				maxs.push(1)
			}
	}
	
	numerico = mins.concat(maxs).every(eNumerico)
	if (eNumerico(inicioX) && eNumerico(fimX) && numerico) {
		inicioX = getNum(inicioX)
		fimX = getNum(fimX)
		
		// Pega os parâmetros da própria expressão
		funcs.forEach(acharVars)
		
		div = document.createElement("div")
		Console.echoDiv(div)
		for (i=0; i<vars.length; i++) {
			mins[i] = getNum(mins[i])
			maxs[i] = getNum(maxs[i])
			valores.push(mins[i])
			gerarSlider(div, vars[i], mins[i], maxs[i], valores[i], gerarOnChange(i))
		}
		div.appendChild(document.createElement("canvas"))
		desenhar()
		return expX
	}
}, false, true, true)

Funcao.registrar("listPlot", "listPlot(A1, A2, ...)\nPlota os valores de uma ou mais listas de valores", function () {
	var canvas, w, h, yMin, yMax, cntxt, yss, i, ys, ysC, lista, j, valor, nX, complexo, valor2, x, y, div
	
	// Extrai os valores para o vetor yss
	yss = []
	nX = 0
	yMin = yMax = 0
	for (i=0; i<arguments.length; i++) {
		lista = arguments[i]
		if (lista instanceof Lista) {
			ys = []
			ys.real = true
			ys.i = i
			ysC = []
			ysC.real = false
			ysC.i = i
			complexo = false
			for (j=0; j<lista.expressoes.length; j++) {
				valor = lista.expressoes[j]
				if (eNumerico(valor)) {
					if (valor instanceof Complexo) {
						valor2 = getNum(valor.b)
						yMin = Math.min(yMin, valor2)
						yMax = Math.max(yMax, valor2)
						ysC.push(valor2)
						valor = valor.a
						complexo = true
					} else
						ysC.push(0)
					valor2 = getNum(valor)
					ys.push(valor2)
					yMin = Math.min(yMin, valor2)
					yMax = Math.max(yMax, valor2)
				} else if (!eDeterminado(valor))
					return
				else
					throw 0
			}
			yss.push(ys)
			if (complexo)
				yss.push(ysC)
			nX = Math.max(nX, ys.length)
		} else if (!eDeterminado(lista))
			return
		else
			throw 0
	}
	
	// Cria o canvas
	canvas = document.createElement("canvas")
	w = canvas.width = 4*Math.round(document.body.clientWidth/8)
	h = canvas.height = 9*w/16
	
	// Desenha o fundo
	cntxt = canvas.getContext("2d")
	cntxt.fillStyle = "black"
	cntxt.fillRect(0, 0, w, h)
	
	// Desenha os eixos
	cntxt.strokeStyle = "white"
	cntxt.lineWidth = 1
	cntxt.beginPath()
	y = .05*h+.9*h*yMax/(yMax-yMin)
	cntxt.moveTo(0, y)
	cntxt.lineTo(w, y)
	cntxt.moveTo(w-5, y-5)
	cntxt.lineTo(w, y)
	cntxt.moveTo(w-5, y+5)
	cntxt.lineTo(w, y)
	cntxt.stroke()
	cntxt.beginPath()
	x = .05*w
	cntxt.moveTo(x, h)
	cntxt.lineTo(x, 0)
	cntxt.moveTo(x-5, 5)
	cntxt.lineTo(x, 0)
	cntxt.moveTo(x+5, 5)
	cntxt.lineTo(x, 0)
	cntxt.stroke()
	
	// Desenha a curva
	cntxt.lineWidth = 3
	for (i=0; i<yss.length; i++) {
		if (yss[i].real)
			cntxt.strokeStyle = "rgba(255,255,255,"+(1-yss[i].i/arguments.length)+")"
		else
			cntxt.strokeStyle = "rgba(255,0,0,"+(1-yss[i].i/arguments.length)+")"
		cntxt.beginPath()
		for (j=0; j<yss[i].length; j++) {
			x = .05*w+.9*w*(j+1)/(nX+1)
			y = .05*h+.9*h*(yMax-yss[i][j])/(yMax-yMin)
			if (Math.abs(x) == Infinity || Math.abs(y) == Infinity)
				continue
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
	return new Fracao(1, 1)
}, false, false, true)

/*

= Funções auxiliares =

*/

// Gera uma div com um slider com o mínimo, máximo e valor inicial dados
// onchange(valor) é uma função que será chamada quando o valor for alterado
function gerarSlider(onde, nome, min, max, valor, onchange) {
	var spanNome, spanValor, divBarra, divBotao, div, spanMin, spanMax, barra, intervalo
	
	// Posiciona o botão no local correto
	var posicionarBotao = function () {
		var meio, valor2
		meio = divBotao.clientWidth/2
		valor2 = Math.min(max, Math.max(min, valor))
		if (valor2 != valor) {
			lancarOnChange()
			valor = valor2
		}
		divBotao.style.left = ((divBarra.clientWidth*(valor-min)/(max-min))-meio)+"px"
	}
	
	// Executa a função de onchange
	var lancarOnChange = function () {
		spanValor.textContent = valor.toPrecision(3)
		if (onchange) {
			clearInterval(intervalo)
			intervalo = setTimeout(function () {
				onchange(valor)
			}, 10)
		}
	}
	
	div = document.createElement("div")
	div.className = "slider"
	
	spanNome = document.createElement("span")
	spanNome.textContent = nome
	spanNome.className = "slider-nome"
	
	spanMin = document.createElement("span")
	spanMin.textContent = min
	spanMin.className = "slider-min"
	spanMin.onclick = function () {
		var novo, num
		novo = prompt("Definir valor mínimo", min)
		num = Number(novo)
		if (novo !== null && !isNaN(num)) {
			min = num
			spanMin.textContent = min
			posicionarBotao()
		}
	}
	
	spanMax = document.createElement("span")
	spanMax.textContent = max
	spanMax.className = "slider-max"
	spanMax.onclick = function () {
		var novo, num
		novo = prompt("Definir valor máximo", max)
		num = Number(novo)
		if (novo !== null && !isNaN(num)) {
			max = num
			spanMax.textContent = max
			posicionarBotao()
		}
	}
	
	divBarra = document.createElement("div")
	divBarra.className = "slider-barra"
	div.onmousedown = function (evento) {
		window.addEventListener("mousemove", onmousemove)
		window.addEventListener("mouseup", onmouseup)
		evento.preventDefault()
	}
	var onmousemove = function (evento) {
		var x, botao, barra, meio
		botao = divBotao.getBoundingClientRect()
		barra = divBarra.getBoundingClientRect()
		meio = (botao.right-botao.left)/2
		x = Math.min(Math.max(evento.clientX, barra.left), barra.right)-barra.left
		divBotao.style.left = (x-meio)+"px"
		valor = min+(max-min)*x/(barra.right-barra.left)
		lancarOnChange()
	}
	var onmouseup = function (evento) {
		window.removeEventListener("mousemove", onmousemove)
		window.removeEventListener("mouseup", onmouseup)
	}
	
	divBotao = document.createElement("div")
	divBotao.className = "slider-botao"
	
	spanValor = document.createElement("span")
	spanValor.textContent = valor
	spanValor.className = "slider-valor"
	
	onde.appendChild(div)
	div.appendChild(spanNome)
	div.appendChild(spanMin)
	div.appendChild(divBarra)
	divBarra.appendChild(divBotao)
	div.appendChild(spanMax)
	div.appendChild(spanValor)
	posicionarBotao()
}

// Plota uma array de expressões num canvas
// that é o this dentro de uma função executada
// variavel é uma string com o nome da variável iterada
// xMin e xMax são Number
// funcs é uma array de expressões matemáticas
// Retorna um canvas com o desenho
function plot2canvas(that, variavel, xMin, xMax, funcs) {
	var passos, xss, yss, yMax, yMin, i, j, canvas, cntxt, w, h, dX, dY, valores, x, y, ticks
	
	// Calcula os valores para uma função
	// Retorna [xs, ys, xsC, ysC, yMax, yMin]
	var calcularValores = function (exp) {
		var xs, ys, x, y, ys2, i, salto, yMax, yMin, antes, xsC, ysC, complexo, n
		xs = []
		ys = []
		xsC = []
		ysC = []
		antes = Variavel.backup(variavel)
		complexo = false
		
		// Executa a expressão para cada valor de x e salva os resultados
		for (x=xMin; x<=xMax; x+=(xMax-xMin)/passos) {
			Variavel.valores[variavel] = x
			try {
				y = that.executarNoEscopo(exp, null, [variavel])
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
			} catch (e) {
			}
		}
		if (!complexo) {
			xsC = []
			ysC = []
		}
		Variavel.restaurar(antes)
		
		// Escolhe a escala vertical
		ys2 = ys.concat(ysC)
		ys2.sort(function (a, b) {
			return a-b
		})
		n = Math.round(passos/100)
		yMin = ys2.length ? ys2[Math.min(n-1, ys2.length-1)] : 0
		yMax = ys2.length ? ys2[Math.max(ys2.length-n, 0)] : 0
		return [xs, ys, xsC, ysC, yMax, yMin]
	}
	
	passos = Config.get("numPontosPlot")
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
	
	// Desenha o eixo horizontal
	cntxt.strokeStyle = "white"
	cntxt.fillStyle = "white"
	cntxt.textAlign = "center"
	cntxt.font = "12px sans-serif"
	cntxt.lineWidth = 1
	ticks = dX/7
	ticks = Math.pow(10, Math.floor(Math.log(ticks)/Math.LN10))
	ticks = Math.round(dX/(7*ticks))*ticks
	if (yMin<0 && yMax>0) {
		cntxt.beginPath()
		y = h*yMax/(yMax-yMin)
		cntxt.moveTo(0, y)
		cntxt.lineTo(w, y)
		cntxt.moveTo(w-5, y-5)
		cntxt.lineTo(w, y)
		cntxt.moveTo(w-5, y+5)
		cntxt.lineTo(w, y)
	} else if (yMax < 0)
		y = 10
	else
		y = h-10
	for (x=Math.ceil(xMin/ticks)*ticks; x<=xMax; x+=ticks) {
		cntxt.moveTo((x-xMin)*w/(xMax-xMin), y-3)
		cntxt.lineTo((x-xMin)*w/(xMax-xMin), y+3)
		cntxt.strokeText(x.toPrecision(2), (x-xMin)*w/(xMax-xMin), h-y<20 ? y-15 : y+15)
		if (x+ticks == x)
			// Para ticks muito pequenos
			break
	}
	cntxt.stroke()
	
	// Desenha o eixo vertical
	ticks = dY/7
	ticks = Math.pow(10, Math.floor(Math.log(ticks)/Math.LN10))
	ticks = Math.round(dY/(7*ticks))*ticks
	if (xMin<0 && xMax>0) {
		cntxt.beginPath()
		x = -w*xMin/(xMax-xMin)
		cntxt.moveTo(x, h)
		cntxt.lineTo(x, 0)
		cntxt.moveTo(x-5, 5)
		cntxt.lineTo(x, 0)
		cntxt.moveTo(x+5, 5)
		cntxt.lineTo(x, 0)
	} else if (xMax < 0)
		x = w-10
	else
		x = 10
	for (y=Math.ceil(yMin/ticks)*ticks; y<=yMax; y+=ticks) {
		cntxt.moveTo(x-3, (y-yMax)*h/(yMin-yMax))
		cntxt.lineTo(x+3, (y-yMax)*h/(yMin-yMax))
		cntxt.strokeText(y.toPrecision(2), w-x<20 ? x-15 : x+15, (y-yMax)*h/(yMin-yMax))
		if (y+ticks == y)
			// Para ticks muito pequenos
			break
	}
	cntxt.stroke()
	
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

// Define os comportamentos de pre-execução
Funcao.funcoes.animate.preExecucao = Funcao.gerarPreExecucao([0, 3], 6)
Funcao.funcoes.plot.preExecucao = Funcao.gerarPreExecucao([0], 3)
Funcao.funcoes.slider.preExecucao = function () {
	var len, vars, i
	
	len = this.args.length
	if (len < 4 || (len-4)%3 != 0)
		throw 0
	if (!(this.args[len-4] instanceof Variavel))
		throw 0
	this.args[len-3] = this.executarNoEscopo(this.args[len-3])
	this.args[len-2] = this.executarNoEscopo(this.args[len-2])
	vars = [this.args[len-4].nome]
	for (i=0; i<this.args.length-4; i+=3) {
		if (!(this.args[i] instanceof Variavel))
			throw 0
		this.args[i+1] = this.executarNoEscopo(this.args[i+1])
		this.args[i+2] = this.executarNoEscopo(this.args[i+2])
		vars.push(this.args[i].nome)
	}
	this.args[len-1] = this.executarNoEscopo(this.args[len-1], vars)
}
