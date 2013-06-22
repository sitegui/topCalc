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
// dicas é uma array de elementos na forma [nomeReal, nomeMinusculo, tipo]
// tipo é um dos valores: 0 (variável), 1 (função), 2 (configuração)
// dicas também deve ter as propriedades:
// * pos: índice da opção inicialmente selecionada
// * inputPos: índice de inserção do dado no campo de input
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
		div.classList.add(dica[2]==0 ? "dica-variavel" : (dica[2]==1 ? "dica-funcao" : "dica-configuracao"))
		if (i == dicas.pos)
			div.classList.add("dica-destaque")
		ConsoleDicas.div.appendChild(div)
	}
	ConsoleDicas.pos = 0
	ConsoleDicas.selecionar(dicas.pos)
}

// Mostra a assinatura da função
// funcao é o nome da função digitada
// inputPos é a posição atual do cursor na string de entrada
// arg é a string entre o "(" e o cursor
ConsoleDicas.mostrarFuncao = function (funcao, inputPos, arg) {
	var objFuncao = Funcao.funcoes[funcao], pos, dicas
	if (objFuncao) {
		pos = objFuncao.definicao.indexOf("\n")
		ConsoleDicas.preDiv.innerHTML = "&bull; "+(pos==-1 ? objFuncao.definicao : objFuncao.definicao.substr(0, pos))
		if (funcao == "setConfig" || funcao == "getConfig" || funcao == "resetConfig")
			ConsoleDicas.exibirConfigs(inputPos, arg)
	} else
		ConsoleDicas.preDiv.innerHTML = ""
}

// Exibe dicas de nomes de configurações
// inputPos é a posição atual do cursor no campo de entrada
// str é a parte do nome de configuração já digitada
ConsoleDicas.exibirConfigs = function (inputPos, str) {
	var dicas, i, configs, str2, pos
	
	// Separa as melhores sugestões
	configs = [[], []]
	str2 = str.toLowerCase()
	for (i in Config.configs) {
		pos = i.toLowerCase().indexOf(str2)
		if (pos == 0)
			configs[0].push(i)
		else if (pos != -1)
			configs[1].push(i)
	}
	
	// Seleciona um número bom de dicas
	if (configs[0].length+configs[1].length <= 7)
		configs = configs[0].concat(configs[1])
	else if (configs[0].length <= 7)
		configs = configs[0]
	else {
		ConsoleDicas.esconder()
		return
	}
	
	// Monta o vetor de dicas
	dicas = []
	configs.sort()
	dicas.pos = null
	for (i=0; i<configs.length; i++) {
		dicas.push([configs[i], configs[i].toLowerCase(), 2])
		if (dicas.pos===null && configs[i].toLowerCase().indexOf(str2) == 0)
			dicas.pos = i
	}
	if (dicas.pos === null)
		dicas.pos = 0
	dicas.inputPos = inputPos
	ConsoleDicas.mostrar(dicas)
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
		parte = str.substr(0, ConsoleDicas.inputPos).match(/[a-zº\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5][a-z0-9º\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5]*$/i)
		parte = parte ? parte[0] : ""
		
		antes = str.substr(0, ConsoleDicas.inputPos-parte.length)
		depois = str.substr(ConsoleDicas.inputPos)
		par = dica[2]==1 && str.substr(ConsoleDicas.inputPos, 1) != "("
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
	if (dica[2] == 0)
		ConsoleDicas.div2.innerHTML = Variavel.valores[dica[0]]
	else if (dica[2] == 1)
		ConsoleDicas.div2.innerHTML = Funcao.funcoes[dica[0]].definicao
	else
		ConsoleDicas.div2.innerHTML = Config.get(dica[0])
	Console.focar()
}
