"use strict";

// Controla a interface de console
var Console = {}

// Aviso exibido após carregar tudo
var introInfo =
"+-----------------------------------+\n"+
"| Calculadora prática e inteligente |\n"+
"|    Digite @help@ para saber mais    |\n"+
"|       http://sitegui.com.br       |\n"+
"+-----------------------------------+"

// Executa um comando clicado
function ir(a) {
	ConsoleInput.input.textContent = a.textContent
	ConsoleInput.executar()
}

// Armazena o histórico de comandos
Console.historico = []
Console.pos = 0
Console.atual = null

addEventListener("load", function () {
	var mX, mY
	
	Console.focar()
	window.addEventListener("mousedown", function (evento) {
		mX = evento.clientX
		mY = evento.clientY
	})
	window.addEventListener("mouseup", function (evento) {
		if (evento.clientX == mX && evento.clientY == mY)
			Console.focar()
	})
	
	Console.echoInfo("Console ok")
	Console.carregarCore()
})

// Carrega os arquivos do core
Console.carregarCore = function () {
	var includes, iniciados, terminados, carregar
	
	includes = [
		"Config", "ConsoleInput", "ConsoleDicas", // Interface
		"Fracao", "Number", "BigNum", "Complexo", "ValorComUnidade", "nums", // Objetos numéricos
		"Variavel", "Operador", "Parenteses", "Lista", "Vetor", "Funcao", "Matriz", "Unidade", // Objetos core
		"Simplificar", "Solver", // Tratamento simbólico
		"math" // Interpretador
	]
	iniciados = terminados = 0
	carregar = function () {
		var script, include, div
		script = document.createElement("script")
		include = includes[iniciados++]
		script.src = include+".js?hora="+Math.floor(Date.now()/(1e3*60*60))
		script.onload = function () {
			div.textContent += " ok"
			terminados++
			if (terminados == includes.length)
				Console.carregarFuncoes()
			else if (iniciados < includes.length)
				carregar()
		}
		script.onerror = function () {
			Console.echoErro("Erro ao carregar "+include)
			Console.echoErro("### Abortado ###")
		}
		document.head.appendChild(script)
		div = Console.echoInfo(include)
	}
	carregar()
	carregar()
}

// Carrega os arquivos de função
Console.carregarFuncoes = function () {
	var includes, pos, carregar
	
	includes = ["lista", "matriz", "misc", "num", "operadores", "plot", "solver", "vetor", "fitData"]
	pos = 0
	carregar = function () {
		var script, include, div
		if (pos == includes.length) {
			setTimeout(function () {
				Console.limpar()
				Console.echo(Console.escaparHTML(introInfo), true)
			}, 1e3)
			return
		}
		script = document.createElement("script")
		include = includes[pos++]
		script.src = "funcoes/"+include+".js?hora="+Math.floor(Date.now()/(1e3*60*60))
		script.onload = function () {
			var i, n = 0
			for (i in Funcao.funcoes)
				if (Funcao.funcoes[i].modulo == include)
					n++
			div.textContent += " ok ("+n+" funções)"
			carregar()
		}
		script.onerror = function () {
			Console.echoErro("Erro ao carregar módulo "+include)
			carregar()
		}
		Funcao.moduloAtual = include
		document.head.appendChild(script)
		div = Console.echoInfo(include)
	}
	Console.echo("### Carregando módulos ###")
	carregar()
}

// Executado quando o usuário entra algum dado
Console.oninput = null

// Limpa todas as mensagens da tela
Console.limpar = function () {
	document.getElementById("historico").innerHTML = ""
}

// Adiciona uma mensagem de texto na tela
Console.echo = function (str, html) {
	var div = document.createElement("div")
	if (html)
		div.innerHTML = str
	else
		div.textContent = str
	Console.echoDiv(div)
	return div
}
Console.echoDiv = function (div) {
	document.getElementById("historico").appendChild(div)
	Console.focar()
}
Console.echoErro = function (str, html) {
	var div = document.createElement("div")
	div.className = "console-erro"
	if (html)
		div.innerHTML = str
	else
		div.textContent = str
	Console.echoDiv(div)
	return div
}
Console.echoEntrada = function (str, html) {
	var div = document.createElement("div")
	div.className = "console-entrada"
	if (html)
		div.innerHTML = str
	else
		div.textContent = str
	Console.echoDiv(div)
	return div
}
Console.echoInfo = function (str, html) {
	var div = document.createElement("div")
	div.className = "console-info"
	if (html)
		div.innerHTML = str
	else
		div.textContent = str
	Console.echoDiv(div)
	return div
}
Console.escaparHTML = function (str) {
	str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
	return str.replace(/@([^@]+)@/g, "<a class='input' onclick='ir(this)'>$1</a>")
}

// Foca no campo de entrada do console
Console.focar = function () {
	document.getElementById("dicas2").scrollIntoView()
	document.getElementById("input").focus()
}
