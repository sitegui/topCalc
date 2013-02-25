// Controla a interface de console
var Console = {}

// Aviso exibido após carregar tudo
var introInfo =
"+-----------------------------------+\n"+
"| Calculadora prática e inteligente |\n"+
"|    Digite help para saber mais    |\n"+
"|      Versão 1.0 - 20/02/2013      |\n"+
"|       http://sitegui.com.br       |\n"+
"+-----------------------------------+"

// Armazena o histórico de comandos
Console.historico = []
Console.pos = 0

// Arquivos a serem carregados
Console.includes = [
	"Fracao.js", "Number.js", "BigNum.js", "Complexo.js", "nums.js", // Objetos numéricos
	"Variavel.js", "Expressao.js", "Operador.js", "Parenteses.js", "Lista.js", "Vetor.js", "Funcao.js", "Matriz.js", // Objetos core
	"math.js", // Interpretador
	"funcoes/lista.js", "funcoes/matriz.js", "funcoes/misc.js", "funcoes/num.js", "funcoes/operadores.js", "funcoes/vetor.js" // Funções
]
Console.includes.pos = 0

addEventListener("load", function () {
	var mX, mY, input
	input = document.getElementById("input")
	input.onkeypress = function (evento) {
		if (evento.keyCode == 13 && input.value.length) {
			Console.echoEntrada("> "+input.value)
			Console.historico.push(input.value)
			Console.pos = Console.historico.length
			if (Console.oninput)
				Console.oninput(input.value)
			input.value = ""
		} else if (evento.keyCode == 38) {
			if (Console.pos > 0) {
				Console.pos--
				input.value = Console.historico[Console.pos]
				Console.focar()
			}
		} else if (evento.keyCode == 40) {
			if (Console.pos < Console.historico.length) {
				Console.pos++
				input.value = Console.pos==Console.historico.length ? "" : Console.historico[Console.pos]
				Console.focar()
			}
		}
	}
	input.value = ""
	Console.focar()
	onmousedown = function (evento) {
		mX = evento.clientX
		mY = evento.clientY
	}
	onmouseup = function (evento) {
		if (evento.clientX == mX && evento.clientY == mY)
			Console.focar()
	}
	
	// Carrega os arquivos
	var carregar = function () {
		var script, src
		src = Console.includes[Console.includes.pos++]
		script = document.createElement("script")
		script.src = src+"?rand="+Math.random()
		script.onload = function () {
			Console.echo(src.substr(0, src.length-3)+" ok")
			if (Console.includes.pos < Console.includes.length)
				carregar()
			else {
				Console.echo("### Iniciado ###")
				setTimeout(function () {
					Console.limpar()
					Console.echo(introInfo)
				}, 500)
			}
		}
		script.onerror = function () {
			Console.echoErro(src.substr(0, src.length-3)+" erro")
			Console.echoErro("### Abortado ###")
		}
		document.head.appendChild(script)
	}
	Console.echo("Console ok")
	carregar()
})

// Executado quando o usuário entra algum dado
Console.oninput = null

// Limpa todas as mensagens da tela
Console.limpar = function () {
	document.getElementById("historico").innerHTML = ""
}

// Adiciona uma mensagem de texto na tela
Console.echo = function (str) {
	var div = document.createElement("div")
	div.textContent = str
	document.getElementById("historico").appendChild(div)
	Console.focar()
	return div
}
Console.echoHTML = function (str) {
	var div = document.createElement("div")
	div.innerHTML = str
	document.getElementById("historico").appendChild(div)
	Console.focar()
	return div
}
Console.echoErro = function (str) {
	var div = document.createElement("div")
	div.className = "console-erro"
	div.textContent = str
	document.getElementById("historico").appendChild(div)
	Console.focar()
	return div
}
Console.echoEntrada = function (str) {
	var div = document.createElement("div")
	div.className = "console-entrada"
	div.textContent = str
	document.getElementById("historico").appendChild(div)
	Console.focar()
	return div
}
Console.echoInfo = function (str) {
	var div = document.createElement("div")
	div.className = "console-info"
	div.textContent = str
	document.getElementById("historico").appendChild(div)
	Console.focar()
	return div
}

// Foca no campo de entrada do console
Console.focar = function () {
	document.getElementById("input").scrollIntoView()
	document.getElementById("input").focus()
}
