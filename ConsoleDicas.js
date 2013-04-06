"use strict";

// Gerencia o mostrador de dicas
var ConsoleDicas = {}

// Usado para mostrar a assinatura da função atualmente editada
ConsoleDicas.preDiv = document.getElementById("preDicas")

// A primeira div mostra as opções como dicas e a segunda mostra detalhes da opção selecionada
ConsoleDicas.div = document.getElementById("dicas")
ConsoleDicas.div2 = document.getElementById("dicas2")

ConsoleDicas.dicas = null
ConsoleDicas.pos = 0
ConsoleDicas.inputPos = 0
ConsoleDicas.selecionado = false

// Esconde as dicas
ConsoleDicas.esconder = function () {
	ConsoleDicas.preDiv.textContent = ""
	ConsoleDicas.div.textContent = ""
	ConsoleDicas.div2.textContent = ""
	ConsoleDicas.dicas = null
}

// Mostra as dicas na tela e inicia o controle sobre elas
ConsoleDicas.mostrar = function (dicas) {
	var i, div, dica
	if (dicas.length == 0)
		return
	ConsoleDicas.dicas = dicas
	ConsoleDicas.inputPos = dicas.inputPos
	ConsoleDicas.selecionado = false
	
	ConsoleDicas.div.innerHTML = ""
	for (i=0; i<dicas.length; i++) {
		dica = dicas[i]
		div = document.createElement("span")
		div.className = "dica"
		div.textContent = dica[0]
		div.classList.add(dica[2] ? "dica-funcao" : "dica-variavel")
		if (i == dicas.pos)
			div.classList.add("dica-destaque")
		ConsoleDicas.div.appendChild(div)
	}
	ConsoleDicas.pos = 0
	ConsoleDicas.selecionar(dicas.pos)
}

// Mostra a assinatura da função
ConsoleDicas.mostrarFuncao = function (funcao) {
	var funcao = Funcao.funcoes[funcao], pos
	if (funcao) {
		pos = funcao.definicao.indexOf("\n")
		ConsoleDicas.preDiv.innerHTML = "&bull; "+(pos==-1 ? funcao.definicao : funcao.definicao.substr(0, pos))
	} else
		ConsoleDicas.preDiv.innerHTML = ""
}

// Ouvintes para controlar as dicas
ConsoleDicas.controlarDicas = function (evento) {
	var pos, str, parte, antes, depois, range, dica, par
	if (ConsoleDicas.dicas === null)
		return false
	if (evento.keyCode == 38 || evento.keyCode == 40) {
		pos = ConsoleDicas.pos+ConsoleDicas.dicas.length+(evento.keyCode==40 ? 1 : -1)
		pos %= ConsoleDicas.dicas.length
		ConsoleDicas.selecionado = true
		ConsoleDicas.selecionar(pos)
		return true
	} else if (evento.keyCode == 9 || (evento.keyCode == 13 && ConsoleDicas.selecionado)) {
		dica = ConsoleDicas.dicas[ConsoleDicas.pos]
		str = ConsoleInput.input.textContent
		parte = str.substr(0, ConsoleDicas.inputPos).match(/[a-z][a-z0-9]*$/i)[0]
		
		antes = str.substr(0, ConsoleDicas.inputPos-parte.length)
		depois = str.substr(ConsoleDicas.inputPos)
		par = dica[2] && str.substr(ConsoleDicas.inputPos, 1) != "("
		str = antes+dica[0]+(par ? "()" : "")+depois
		
		ConsoleInput.input.textContent = str
		
		range = document.createRange()
		range.setStart(ConsoleInput.input.childNodes[0], str.length-depois.length-(par ? 1 : 0))
		range.setEnd(ConsoleInput.input.childNodes[0], str.length-depois.length-(par ? 1 : 0))
		window.getSelection().removeAllRanges()
		window.getSelection().addRange(range)
		
		ConsoleInput.pintar()
		return true
	} else if (evento.keyCode == 27) {
		ConsoleDicas.esconder()
		return true
	}
	return false
}

// Seleciona a dica na posição dada
ConsoleDicas.selecionar = function (pos) {
	var dica
	dica = ConsoleDicas.dicas[pos]
	ConsoleDicas.div.childNodes[ConsoleDicas.pos].classList.remove("dica-destaque")
	ConsoleDicas.div.childNodes[pos].classList.add("dica-destaque")
	ConsoleDicas.pos = pos
	ConsoleDicas.div2.innerHTML = dica[2] ? Funcao.funcoes[dica[0]].definicao : Variavel.valores[dica[0]]
	Console.focar()
}
