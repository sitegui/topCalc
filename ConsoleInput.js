"use strict";

// Objeto para controlar o input amigável
var ConsoleInput = {}
ConsoleInput.input = document.getElementById("input")

// Executa o comando escrito atualmente no input
ConsoleInput.executar = function () {
	var content = ConsoleInput.input.textContent
	content = ConsoleInput.trocarSimbolos(content)
	Console.echoEntrada("> "+content)
	Console.historico.push(content)
	Console.pos = Console.historico.length
	if (Console.oninput)
		Console.oninput(content)
	ConsoleInput.input.innerHTML = "<span></span>"
	ConsoleDicas.esconder()
}

// Converte os símbolos da entrada
// Exemplo: "\\alpha+\\beta" => "\u03B1+\u03B2"
ConsoleInput.trocarSimbolos = function (str) {
	var i
	if (str.indexOf("\\") == -1)
		return str
	for (i=0; i<ConsoleInput.tabelaChars.length; i++)
		str = str.replace(ConsoleInput.tabelaChars[i][0], ConsoleInput.tabelaChars[i][1])
	return str
}

ConsoleInput.input.addEventListener("keydown", function (evento) {
	var content, intervalo
	content = ConsoleInput.input.textContent
	clearInterval(intervalo)
	if (ConsoleDicas.controlarDicas(evento)) {
		evento.preventDefault()
		return
	}
	var focarUltimo = function () {
		var range, el
		el = ConsoleInput.input
		while (el && el.nodeType != Node.TEXT_NODE)
			el = el.lastChild
		if (!el)
			return
		range = document.createRange()
		range.setStart(el, el.nodeValue.length)
		range.setEnd(el, el.nodeValue.length)
		window.getSelection().removeAllRanges()
		window.getSelection().addRange(range)
	}
	if (evento.keyCode == 13) {
		// Enter
		if (evento.shiftKey)
			// Shift+Enter => Insere um "\n"
			document.execCommand("insertHTML", false, "\n")
		else if (content.length)
			// Enter => Executa a ação
			ConsoleInput.executar()
		evento.preventDefault()
	} else if (evento.keyCode == 38) {
		if (Console.pos > 0) {
			Console.pos--
			ConsoleInput.input.textContent = Console.historico[Console.pos]
			Console.focar()
			focarUltimo()
		}
		evento.preventDefault()
		return
	} else if (evento.keyCode == 40) {
		if (Console.pos < Console.historico.length) {
			Console.pos++
			ConsoleInput.input.textContent = Console.pos==Console.historico.length ? "" : Console.historico[Console.pos]
			Console.focar()
			focarUltimo()
		}
		evento.preventDefault()
		return
	} else if (evento.keyCode == 9) {
		evento.preventDefault()
		return
	}
	intervalo = setTimeout(ConsoleInput.pintar, 100)
})

// Pinta parênteses, vetores e listas na entrada
ConsoleInput.pintar = function () {
	var dados, str, chars, pos, mapas, i, extremos, elementos, cache, j, selecNode, selecOff, range, simbolo
	var destacar = function (pos) {
		var span = document.createElement("span")
		span.className = "destaque"
		span.textContent = chars[pos-1]
		chars[pos-1] = span
	}
	
	// Pega os dados da entrada
	dados = ConsoleInput.get()
	if (dados === null)
		return
	str = dados[0]
	chars = dados[1]
	pos = dados[2]
	
	// Verifica se está digitando um símbolo
	simbolo = str.substr(0, pos).match(/[a-zº\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5][a-z0-9º\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5]*$/i)
	if (simbolo && !str.substr(pos).match(/^[a-z0-9º\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5]+/i)) {
		simbolo = simbolo[0]
		ConsoleInput.montarDicas(simbolo, pos)
	} else
		ConsoleDicas.esconder()
	
	// Destaca parênteses, chaves e colchetes
	mapas = ConsoleInput.mapear(chars)
	ConsoleDicas.preDiv.innerHTML = ""
	for (i=0; i<3; i++) {
		extremos = ConsoleInput.getExtremos(mapas[i], pos)
		if (extremos[0]) {
			destacar(extremos[0])
			if (i == 0 && (simbolo = str.substr(0, extremos[0]-1).match(/([a-zº\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5][a-z0-9º\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5]*)\s*$/i)))
				ConsoleDicas.mostrarFuncao(simbolo[1], pos, str.substr(extremos[0], pos-extremos[0]))
		}
		if (extremos[1])
			destacar(extremos[1])
	}
	
	// Une o texto de volta
	selecNode = selecOff = null
	var salvarCache = function () {
		var span, cache2
		if (cache) {
			span = document.createElement("span")
			cache2 = ConsoleInput.trocarSimbolos(cache)
			span.textContent = cache2
			j += cache.length
			if (j>=pos && !selecNode) {
				selecNode = span.childNodes[0]
				selecOff = pos-j+cache2.length
			}
			elementos.push(span)
			cache = ""
		}
	}
	elementos = []
	cache = ""
	j = 0
	for (i=0; i<chars.length; i++) {
		if (typeof chars[i] == "string")
			cache += chars[i]
		else {
			salvarCache()
			elementos.push(chars[i])
			j++
			if (j>=pos && !selecNode) {
				selecNode = chars[i].childNodes[0]
				selecOff = 1
			}
		}
	}
	salvarCache()
	if (!selecNode) {
		if (typeof chars[chars.length-1] == "string") {
			selecNode = elementos[elementos.length-1].childNodes[0]
			selecOff = selecNode.nodeValue.length
		} else {
			selecNode = document.createElement("span")
			elementos.push(selecNode)
			selecOff = 0
		}
	}
	ConsoleInput.input.innerHTML = ""
	for (i=0; i<elementos.length; i++)
		ConsoleInput.input.appendChild(elementos[i])
	
	range = document.createRange()
	range.setStart(selecNode, selecOff)
	range.setEnd(selecNode, selecOff)
	window.getSelection().removeAllRanges()
	window.getSelection().addRange(range)
}

// Monta e exibe uma lista de sugestões com base na parte de um símbolo digitado
ConsoleInput.montarDicas = function (str, inputPos) {
	var i, vars, funcs, pos, dicas, max, str2
	
	// Reúne as dicas num único objeto
	var montarDicas = function (vars, funcs) {
		var dicas, i, j
		
		// Coloca em ordem alfabética
		dicas = []
		for (i=0; i<vars.length; i++)
			for (j=0; j<vars[i].length; j++)
				dicas.push([vars[i][j], vars[i][j].toLowerCase(), 0])
		for (i=0; i<funcs.length; i++)
			for (j=0; j<funcs[i].length; j++)
				dicas.push([funcs[i][j], funcs[i][j].toLowerCase(), 1])
		dicas.sort(function (a, b) {
			return a[1]>b[1] ? 1 : (a[1]==b[1] ? 0 : -1)
		})
		
		// Monta o objeto de retorno
		dicas.pos = null
		dicas.inputPos = inputPos
		for (i=0; i<dicas.length; i++)
			if (dicas.pos === null && dicas[i][1].indexOf(str2) == 0) {
				dicas.pos = i
				break
			}
		if (dicas.pos === null)
			dicas.pos = 0
		return dicas
	}
	
	// Separa as dicas válidas
	vars = [[], []]
	funcs = [[], [], []]
	str2 = str.toLowerCase()
	for (i in Variavel.valores) {
		if (i.match(/[^a-z0-9]/i))
			continue
		pos = i.toLowerCase().indexOf(str2)
		if (pos == 0)
			vars[0].push(i)
		else if (pos != -1)
			vars[1].push(i)
	}
	for (i in Funcao.funcoes) {
		if (i.match(/[^a-z0-9]/i))
			continue
		pos = i.toLowerCase().indexOf(str2)
		if (pos == 0)
			funcs[0].push(i)
		else if (pos != -1)
			funcs[1].push(i)
		else if (Funcao.funcoes[i].definicao.toLowerCase().indexOf(str2) != -1)
			funcs[2].push(i)
	}
	
	// Pega uma quantia razoável das dicas (priorizando as melhores)
	max = 7
	if (vars[0].length+vars[1].length+funcs[0].length+funcs[1].length+funcs[2].length <= max)
		dicas = montarDicas(vars, funcs)
	else if (vars[0].length+vars[1].length+funcs[0].length+funcs[1].length <= max)
		dicas = montarDicas(vars, [funcs[0], funcs[1]])
	else if (vars[0].length+funcs[0].length <= max)
		dicas = montarDicas([vars[0]], [funcs[0]])
	else {
		ConsoleDicas.esconder()
		return
	}
	
	// Mostra na tela
	if (dicas.length == 0) {
		ConsoleDicas.esconder()
		return
	} else
		ConsoleDicas.mostrar(dicas)
}

// Retorna uma mapa de aninhamento da string com os extremos (, [, {
// Exemplo de mapa: ["1","+","(","2","*","(","3","+","4",")",")"] => [0,0,0,1,1,1,2,2,2,2,1,0]
// [mapaParenteses, mapaColchetes, mapaChaves]
ConsoleInput.mapear = function (chars) {
	var mapa1, mapa2, mapa3, i, nivel1, nivel2, nivel3, c
	mapa1 = [0]
	mapa2 = [0]
	mapa3 = [0]
	nivel1 = nivel2 = nivel3 = 0
	for (i=0; i<chars.length; i++) {
		c = chars[i]
		if (c == "(")
			nivel1++
		else if (c == ")")
			nivel1--
		else if (c == "[")
			nivel2++
		else if (c == "]")
			nivel2--
		else if (c == "{")
			nivel3++
		else if (c == "}")
			nivel3--
		mapa1.push(nivel1)
		mapa2.push(nivel2)
		mapa3.push(nivel3)
	}
	return [mapa1, mapa2, mapa3]
}

// Pega os extremos de alinhamento no mapa e na posição indicada
// Retorna [inicio, fim] (o extremo será 0 caso não o encontre)
ConsoleInput.getExtremos = function (mapa, pos) {
	var nivel, i, inicio, fim
	nivel = mapa[pos]
	for (i=pos; i>0; i--)
		if (mapa[i] == nivel && mapa[i-1] == nivel-1)
			break
	inicio = i
	for (i=pos+1; i<mapa.length; i++)
		if (mapa[i] == nivel-1 && mapa[i-1] == nivel)
			break
	fim = i==mapa.length ? 0 : i
	return [inicio, fim]
}

// Retorna a string do campo (separada numa array) e a posição do cursor: [string, chars, pos]
// Retorna null caso o cursor não esteja numa posição só (texto selecionado, por exemplo)
ConsoleInput.get = function () {
	var str, range, els, i, pos, chars
	
	range = window.getSelection().getRangeAt(0)
	if (range.startContainer !== range.endContainer || range.startOffset != range.endOffset)
		return null
	str = ConsoleInput.input.textContent
	chars = []
	for (i=0; i<str.length; i++)
		chars.push(str[i])
	
	els = input.childNodes
	pos = range.startOffset
	for (i=0; i<els.length; i++)
		if (els[i].contains(range.startContainer))
			break
		else
			pos += els[i].textContent.length
	return [str, chars, pos]
}

// Tabela de conversão de caracteres
ConsoleInput.tabelaChars = [
[/\\=\//g, "\u2260"],
[/\\<=/g, "\u2264"],
[/\\>=/g, "\u2265"],
[/\\v\//g, "\u221A"],
[/\\oo/g, "\u221E"],
[/\\x/g, "\u2A2F"],
[/\\times/g, "\u2A2F"],
[/\\Ao/g, "\u00C5"],
[/\\sum/g, "\u03A3"],
[/\\prod/g, "\u03A0"],
[/\\ohm/g, "\u03A9"],
[/\\u/g, "\u03BC"],
[/\\Alpha/g, "\u0391"],
[/\\Beta/g, "\u0392"],
[/\\Gamma/g, "\u0393"],
[/\\Delta/g, "\u0394"],
[/\\Epsilon/g, "\u0395"],
[/\\Zeta/g, "\u0396"],
[/\\Eta/g, "\u0397"],
[/\\Theta/g, "\u0398"],
[/\\Iota/g, "\u0399"],
[/\\Kappa/g, "\u039A"],
[/\\Lamda/g, "\u039B"],
[/\\Mu/g, "\u039C"],
[/\\Nu/g, "\u039D"],
[/\\Xi/g, "\u039E"],
[/\\Omicron/g, "\u039F"],
[/\\Pi/g, "\u03A0"],
[/\\Rho/g, "\u03A1"],
[/\\Sigma/g, "\u03A3"],
[/\\Tau/g, "\u03A4"],
[/\\Upsilon/g, "\u03A5"],
[/\\Phi/g, "\u03A6"],
[/\\Chi/g, "\u03A7"],
[/\\Psi/g, "\u03A8"],
[/\\Omega/g, "\u03A9"],
[/\\alpha/g, "\u03B1"],
[/\\beta/g, "\u03B2"],
[/\\gamma/g, "\u03B3"],
[/\\delta/g, "\u03B4"],
[/\\epsilon/g, "\u03B5"],
[/\\zeta/g, "\u03B6"],
[/\\eta/g, "\u03B7"],
[/\\theta/g, "\u03B8"],
[/\\iota/g, "\u03B9"],
[/\\kappa/g, "\u03BA"],
[/\\lamda/g, "\u03BB"],
[/\\mu/g, "\u03BC"],
[/\\nu/g, "\u03BD"],
[/\\xi/g, "\u03BE"],
[/\\omicron/g, "\u03BF"],
[/\\pi/g, "\u03C0"],
[/\\rho/g, "\u03C1"],
[/\\sigma/g, "\u03C3"],
[/\\tau/g, "\u03C4"],
[/\\upsilon/g, "\u03C5"],
[/\\phi/g, "\u03C6"],
[/\\chi/g, "\u03C7"],
[/\\psi/g, "\u03C8"],
[/\\omega/g, "\u03C9"],
[/\u220F/g, "\u03A0"],
[/\u2211/g, "\u03A3"],
[/\u2A09/g, "\u2A2F"],
[/\u00D7/g, "\u2A2F"],
[/\u0251/g, "\u03B1"],
[/\u00DF/g, "\u03B2"],
[/\u2126/g, "\u03A9"]
]
