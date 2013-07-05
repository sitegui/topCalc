"use strict";

// Executa o comando do usuário
Console.oninput = function (input) {
	var cmd, retornos
	try {
		cmd = inflar(input)
		cmd.expressoes.map(interpretar)
		cmd.expressoes.forEach(function (x) {
			var r, inicio, fim
			inicio = Date.now()
			try {
				executar.logId = ""
				r = executar(x)
				Variavel.valores["ans"] = r
				Console.echo(math2str(r), true)
			} catch (e) {
				Console.echoErro(e)
			}
			fim = Date.now()
			if (Config.get("debug"))
				Console.echoInfo("Executado em "+(fim-inicio)+" ms")
		})
	} catch (e) {
		Console.echoErro(e)
	}
}

// Clona um objeto matemático (clone leve)
function clonar(obj) {
	return obj.clonar()
}
Object.defineProperty(Array.prototype, "clonar", {value: function () {
	return this.slice(0)
}})

// Define a configuração de ativação do debug
Config.registrar("debug", "Define se a execução está no modo debug", false, Config.setters.bool)

// Adiciona a configuração de imprimir com MathML ou não
Config.registrar("usarMathML", "Indica se as expressões devem ser impressas no formato MathML ou como strings simples", false, Config.setters.bool)

// Verifica se o navegador suporta MathML
;(function () {
	var div, math, mfrac, n, d
	var ns = "http://www.w3.org/1998/Math/MathML"
	div = document.createElement("div")
	div.style.position = "absolute"
	math = document.createElementNS(ns, "math")
	mfrac = document.createElementNS(ns, "mfrac")
	n = document.createElementNS(ns, "mi")
	n.appendChild(document.createTextNode("xx"))
	d = document.createElementNS(ns, "mi")
	d.appendChild(document.createTextNode("yy"))
	mfrac.appendChild(n)
	mfrac.appendChild(d)
	math.appendChild(mfrac)
	div.appendChild(math)
	document.body.appendChild(div)
	Config.set("usarMathML", div.clientHeight>div.clientWidth, true)
	document.body.removeChild(div)
})()

// Transforma o objeto matemático em string
// Olha para a configuração usarMathML para retornar no melhor formato
function math2str(obj) {
	var mathML = Config.get("usarMathML"), str = obj.toMathString(mathML)
	if (str)
		return mathML ? "<math><mrow>"+str+"</mrow></math>" : str
	return ""
}

// Infla uma string, retorna um objeto Parenteses
function inflar(str) {
	var i, len, c, retorno, niveis, nivelAtual, novo, cache, salvarCache, matriz, posColuna, classe
	retorno = new Parenteses
	retorno.expressoes.push(new Expressao)
	len = str.length
	niveis = [retorno]
	nivelAtual = retorno.expressoes[0]
	cache = ""
	matriz = false // Indica se está dentro de uma matriz
	posColuna = 0 // Indica o número de expressões já validadas da coluna
	
	var salvarCache = function () {
		if (cache.length > 0) {
			nivelAtual.elementos.push(cache)
			cache = ""
		}
	}
	
	// Valida o número de colunas na matriz
	var validarColunas = function () {
		var m = niveis[niveis.length-1]
		var i, len = m.expressoes.length
		if (m.colunas == 0)
			m.colunas = posColuna = len
		else if (posColuna+m.colunas != len)
			throw "Número incorreto de expressões na matriz"
		else
			posColuna = len
		for (i=len-m.colunas; i<len; i++)
			if (m.expressoes[i].elementos.length == 0)
				throw "Elemento vazio inesperado"
	}
	
	for (i=0; i<len; i++) {
		c = str[i]
		if (c == "(" || c == "{" || c == "[") {
			salvarCache()
			novo = c=="(" ? new Parenteses : (c=="{" ? new Lista : new Vetor)
			novo.expressoes.push(new Expressao)
			nivelAtual.elementos.push(novo)
			niveis.push(nivelAtual)
			niveis.push(novo)
			nivelAtual = novo.expressoes[0]
		} else if (c == ")" || c == "}" || c == "]") {
			salvarCache()
			classe = c==")" ? Parenteses : (c=="}" ? Lista : Vetor)
			if (niveis.length > 1 && niveis[niveis.length-1] instanceof classe) {
				niveis.pop()
				nivelAtual = niveis.pop()
			} else
				throw "Aninhamento inválido, '"+c+"' inesperado"
		} else if (c == "|") {
			if (str[i+1] == "|") {
				// Operador ||
				cache += "||"
				i++
				continue
			}
			salvarCache()
			if (!matriz) {
				novo = new Matriz
				novo.expressoes.push(new Expressao)
				nivelAtual.elementos.push(novo)
				niveis.push(nivelAtual)
				niveis.push(novo)
				nivelAtual = novo.expressoes[0]
			} else if (niveis.length <= 1 || !(niveis[niveis.length-1] instanceof Matriz))
				throw "Aninhamento de matriz inválido"
			else {
				validarColunas()
				novo = niveis.pop()
				novo.linhas = novo.expressoes.length/novo.colunas
				nivelAtual = niveis.pop()
			}
			matriz = !matriz
		} else if (c == "," || c == ";") {
			salvarCache()
			if (c == ";") {
				if (!matriz)
					throw "Uso incorreto de ;"
				validarColunas()
			}
			novo = new Expressao
			niveis[niveis.length-1].expressoes.push(novo)
			nivelAtual = novo
		} else if (c == " " || c == "\n")
			salvarCache()
		else if (c == "'" && nivelAtual.elementos.length == 0 && cache == "")
			nivelAtual.puro = true
		else
			cache += c
	}
	salvarCache()
	
	if (niveis.length > 1)
		throw "Aninhamento inválido"
	
	// Remove expressões vazias
	var limpar = function (obj) {
		var i
		if (obj instanceof Parenteses || obj instanceof Lista || obj instanceof Vetor) {
			for (i=0; i<obj.expressoes.length; i++) {
				if (obj.expressoes[i].elementos.length == 0)
					obj.expressoes.splice(i--, 1)
				else
					obj.expressoes[i].elementos.forEach(limpar)
			}
		}
	}
	limpar(retorno)
	
	return retorno
}

// Separa uma string em Operadores, Variáveis e Números
function separar(str) {
	var operadores = ["+", "-", "*", "/", "%", "^", "!", "=", "<", "<=", ">", ">=", "==", "!=", "&&", "||", "_", "+=", "-=", "*=", "/=", "%=", "^=", "&&=", "||=", "_=", "²", "³", "\u221A", "\u2264", "\u2265", "\u2260", "\u2A2F", ":"]
	var getOperador = function (str) {
		if (operadores.indexOf(str) != -1)
			return new Operador(str)
		else
			return null
	}
	var getVariavel = function (str) {
		if (str.match(/^[a-zº\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5][a-z0-9º\u0391-\u03A9\u03B1-\u03C9\u221E\u00C5]*$/i))
			return new Variavel(str)
		else
			return null
	}
	var getNumero = function (str) {
		var partes, retorno, exato = true, base = 10
		if (partes = str.match(/^\d*(\.\d*)?(e[+-]?\d+)?$/i)) {
			exato = str.indexOf(".") == -1
			retorno = Number(str)
		} else if (partes = str.match(/^0x([0-9a-f]+)$/i)) {
			retorno = parseInt(partes[1], 16)
			base = 16
		} else if (partes = str.match(/^0b([01]+)$/i)) {
			retorno = parseInt(partes[1], 2)
			base = 2
		} else if ((partes = str.match(/^([0-9a-z]+)_(\d+)$/i)) && partes[2] != "1") {
			retorno = parseInt(partes[1], partes[2])
			base = partes[2]
		} else
			return null
		if (isNaN(retorno))
			throw "Número inválido"
		else if (exato)
			return Fracao.toFracao(retorno, base)
		return retorno
	}
	
	var i, sub, valor, partes = [], ini = str
	for (i=str.length; i>0; i--) {
		sub = str.substr(0, i)
		if ((valor = getOperador(sub)) !== null) {
			partes.push(valor)
			str = str.substr(i)
			i = str.length+1
		} else if ((valor = getVariavel(sub)) !== null) {
			partes.push(valor)
			str = str.substr(i)
			i = str.length+1
		} else if ((valor = getNumero(sub)) !== null) {
			partes.push(valor)
			str = str.substr(i)
			i = str.length+1
		}
	}
	
	if (str != "")
		throw "Sequência inválida: "+ini
	
	return partes
}

// Interpreta uma expressão (in-place)
function interpretar(expressao) {
	var i, el, len, j, args, elAntes, elDepois, comando
	
	// Faz uma expansão básica
	for (i=0; i<expressao.elementos.length; i++) {
		el = expressao.elementos[i]
		if (typeof el == "string") {
			args = [i, 1].concat(separar(el))
			;[].splice.apply(expressao.elementos, args)
			i += args.length-3
		} else if (el instanceof Parenteses || el instanceof Lista || el instanceof Vetor || el instanceof Matriz) {
			len = el.expressoes.length
			for (j=0; j<len; j++)
				interpretar(el.expressoes[j])
		}
	}
	
	// Transforma variável seguido de parênteses em função
	for (i=0; i<expressao.elementos.length-1; i++) {
		el = expressao.elementos[i]
		elDepois = expressao.elementos[i+1]
		if (el instanceof Variavel && elDepois instanceof Parenteses)
			expressao.elementos.splice(i, 2, new Funcao(el.nome, elDepois.expressoes))
	}
	
	// Coloca multiplicações implícitas e acesso de lista/vetor
	for (i=0; i<expressao.elementos.length-1; i++) {
		el = expressao.elementos[i]
		elDepois = expressao.elementos[i+1]
		if ((!(el instanceof Operador) || el.valor == "²" || el.valor == "³") && (!(elDepois instanceof Operador) || elDepois.valor == "\u221A")) {
			if (elDepois instanceof Vetor && (elDepois.expressoes.length == 1 || elDepois.expressoes.length == 2)) {
				expressao.elementos.splice(i, 2, new Funcao("getAt", [el].concat(elDepois.expressoes)))
				i--
			} else {
				expressao.elementos.splice(i+1, 0, new Operador("*"))
				i++
			}
		}
	}
	
	// Aplica os operadores unários !, %, ², ³ (ltr)
	for (i=0; i<expressao.elementos.length; i++) {
		el = expressao.elementos[i]
		elAntes = i==0 ? null : expressao.elementos[i-1]
		elDepois = i==expressao.elementos.length-1 ? null : expressao.elementos[i+1]
		if (el instanceof Operador && ["!", "%", "²", "³"].indexOf(el.valor) != -1) {
			if (elAntes && !(elAntes instanceof Operador) && (elDepois == null || elDepois instanceof Operador)) {
				expressao.elementos.splice(i-1, 2, new Funcao(el.valor == "!" ? "factorial" : el.valor, [elAntes]))
				i--
			}
		}
	}
	
	// Aplica os operadores unários !, +, -, \u221A (rtl) e o binário ^ (rtl)
	for (i=expressao.elementos.length-1; i>=0; i--) {
		el = expressao.elementos[i]
		elAntes = i==0 ? null : expressao.elementos[i-1]
		elDepois = i==expressao.elementos.length-1 ? null : expressao.elementos[i+1]
		if (el instanceof Operador && ["!", "+", "-", "\u221A"].indexOf(el.valor) != -1) {
			if (elDepois && !(elDepois instanceof Operador) && (elAntes == null || elAntes instanceof Operador)) {
				expressao.elementos.splice(i, 2, new Funcao(el.valor, [elDepois]))
				i++
			}
		} else if (el instanceof Operador && el.valor == "^") {
			if (elAntes && !(elAntes instanceof Operador) && elDepois && !(elDepois instanceof Operador)) {
				expressao.elementos.splice(i-1, 3, new Funcao(el.valor, [elAntes, elDepois]))
				i++
			} else
				throw "Uso incorreto do operador ^"
		}
	}
	
	var aplicarBinarios = function (ops, sentido) {
		for (i=0; i<expressao.elementos.length; i++) {
			j = sentido==1 ? i : expressao.elementos.length-i-1
			el = expressao.elementos[j]
			elAntes = j==0 ? null : expressao.elementos[j-1]
			elDepois = j==expressao.elementos.length-1 ? null : expressao.elementos[j+1]
			if (el instanceof Operador && ops.indexOf(el.valor) != -1) {
				if (elAntes && !(elAntes instanceof Operador) && elDepois && !(elDepois instanceof Operador)) {
					expressao.elementos.splice(j-1, 3, new Funcao(el.valor, [elAntes, elDepois]))
					i--
				} else
					throw "Uso incorreto do operador "+el.valor
			}
		}
	}
	
	// Aplica os operadores ordem de precedência
	aplicarBinarios(["_"], 1)
	aplicarBinarios([":"], 1)
	aplicarBinarios(["*", "/", "%", "\u2A2F"], 1)
	aplicarBinarios(["+", "-"], 1)
	aplicarBinarios(["<", "<=", ">", ">=", "\u2264", "\u2265"], 1)
	aplicarBinarios(["==", "!=", "\u2260"], 1)
	aplicarBinarios(["&&"], 1)
	aplicarBinarios(["||"], 1)
	aplicarBinarios(["=", "+=", "-=", "*=", "/=", "%=", "_=", "&&=", "||=", "^="], -1)
	
	if (expressao.elementos.length > 1)
		throw "Expressão inválida"
}

// Retira o único elemento de uma expressão, se possível
function unbox(expressao) {
	if (expressao instanceof Expressao && expressao.elementos.length == 1)
		return expressao.elementos[0]
	else
		return expressao
}

// Verifica se um valor está bem determinado (não pode mudar de tipo)
function eDeterminado(valor) {
	var i, len
	if (valor instanceof Expressao && valor.elementos.length == 0)
		return true
	if (valor instanceof Expressao && valor.elementos.length == 1)
		return eDeterminado(valor.elementos[0])
	if (valor instanceof Vetor || valor instanceof Lista || valor instanceof Matriz || eNumerico(valor))
		return true
	return false
}

// Retorna se um dado objeto é uma expressão pura
function ePuro(obj) {
	if (obj instanceof Expressao && obj.puro)
		return true
	if (obj instanceof Parenteses && obj.expressoes.length == 1 && obj.expressoes[0].puro)
		return true
	return false
}

// Retorna se um dado objeto é uma expressão vazia
function eExpressaoVazia(obj) {
	return obj instanceof Expressao && obj.elementos.length == 0
}

// Executa um objeto matemático (sem alterar o argumento)
// Retorna um outro objeto matemático (sem referências ao argumento)
function executar(expressao) {
	var div, vars, debug
	debug = Config.get("debug")
	if (debug) {
		div = Console.echoInfo(executar.logId+expressao.toMathString(false), true)
		executar.logId += "\t"
	}
	vars = Array.isArray(arguments[1]) ? arguments[1] : []
	var calc = function (obj) {
		if (obj instanceof Expressao) {
			if (obj.elementos.length == 0)
				return new Expressao
			return calc(obj.elementos[0])
		} else if (obj instanceof Funcao)
			return obj.executar(vars)
		else if (obj instanceof Variavel) {
			if (vars.indexOf(obj.nome) != -1)
				return obj.clonar()
			else
				return obj.get(vars)
		} else if (obj instanceof Fracao)
			return obj.clonar()
		else if (obj instanceof Parenteses) {
			if (obj.expressoes.length == 0)
				throw "Parênteses vazio inesperado"
			return obj.expressoes.map(calc).slice(-1)[0]
		} else if (obj instanceof Lista)
			return new Lista(obj.expressoes.map(calc))
		else if (obj instanceof Vetor)
			return new Vetor(obj.expressoes.map(calc))
		else if (obj instanceof Matriz)
			return new Matriz(obj.expressoes.map(calc), obj.colunas)
		else if (eNumerico(obj))
			return obj
		else
			throw "Valor inválido"
	}
	var r = calc(expressao)
	if (debug) {
		div.textContent += " ⇒ "+r.toMathString(false)
		executar.logId = executar.logId.substr(0, executar.logId.length-1)
	}
	return r
}
