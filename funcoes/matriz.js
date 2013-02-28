// Funções para lidar com matrizes

Funcao.registrar("det", "det(m)\nRetorna o determinante de uma matriz quadrada", function (m) {
	var info, det, i
	if (m instanceof Matriz) {
		if (m.linhas != m.colunas)
			throw 0
		info = {}
		m.eliminar(false, info)
		if (!info.sucesso)
			return new Fracao(0, 1)
		for (i=0; i<info.fatores.length; i++) {
			if (i < info.fatores.length-1)
				Console.echoInfo("Assumindo "+info.fatores[i]+" não nulo")
			if (i)
				det = Funcao.executar("*", [det, info.fatores[i]])
			else
				det = info.fatores[i]
		}
		if (info.trocas%2)
			det = Funcao.executar("-", [det])
		return det
	} else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("trace", "trace(m)\nRetorna o traço de uma matriz quadrada", function (m) {
	var retorno, i
	if (m instanceof Matriz) {
		if (m.linhas != m.colunas)
			throw 0
		retorno = m.get(1, 1)
		for (i=2; i<=m.linhas; i++)
			retorno = Funcao.executar("+", [retorno, m.get(i, i)])
		return retorno
	} else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("justapor", "justapor(mA, mB)\nJustapõe duas matrizes com o mesmo número de linhas", function (mA, mB) {
	if (mA instanceof Matriz && mB instanceof Matriz)
		return Matriz.justapor(mA, mB)
	else if (eDeterminado(mA) && eDeterminado(mB))
		throw 0
}, true)

Funcao.registrar("separar", "separar(m, n)\nRetorna as primeiras n colunas da matriz m (n últimas para n<0)", function (m, n) {
	if (m instanceof Matriz && eNumerico(n)) {
		n = getNum(n)
		return m.separar(n)
	} else if (eDeterminado(m) && eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("eliminar", "eliminar(m)\nAplica o método de eliminação de Gauss na matriz", function (m) {
	var info, retorno, i
	if (m instanceof Matriz) {
		info = {}
		retorno = m.eliminar(true, info)
		if (!info.sucesso)
			Console.echoInfo("Algoritmo abortado por falta de pivô não-nulo")
		for (i=0; i<info.fatores.length; i++)
			if (!eNumerico(info.fatores[i]))
				Console.echoInfo("Assumindo "+info.fatores[i]+" não é nulo")
		return retorno
	} else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("fatorarLU", "fatorarLU(m)\nAplica a fatoração LU na matriz m e retorna uma lista {L, U, P} com L*U==P*m", function (m) {
	var info, retorno, i
	if (m instanceof Matriz)
		return new Lista(m.fatorarLU())
	else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("identidade", "identidade(n)\nRetorna uma matriz identidade de ordem n", function (n) {
	if (eNumerico(n)) {
		n = getNum(n)
		if (!eIntSeguro(n) || n < 1)
			throw 0
		return Matriz.identidade(n)
	} else if (eDeterminado(n))
		throw 0
}, true)

Funcao.registrar("inverter", "inverter(m)\nRetorna a matriz quadrada m invertida", function (m) {
	var info, i
	if (m instanceof Matriz) {
		if (m.linhas != m.colunas)
			throw 0
		info = {}
		m = Matriz.justapor(m, Matriz.identidade(m.linhas))
		m = m.eliminar(true, info)
		if (!info.sucesso)
			throw 0
		for (i=0; i<info.fatores.length; i++)
			if (!eNumerico(info.fatores[i]))
				Console.echoInfo("Assumindo "+info.fatores[i]+" não nulo")
		return m.separar(-m.linhas)
	} else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("transpor", "transpor(m)\nRetorna a matriz transposta de m", function (m) {
	var retorno, i, j
	if (m instanceof Matriz) {
		retorno = m.clonar()
		retorno.linhas = m.colunas
		retorno.colunas = m.linhas
		for (i=1; i<=retorno.linhas; i++)
			for (j=1; j<=retorno.colunas; j++)
				retorno.set(i, j, m.get(j, i))
		return retorno
	} else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("getLinha", "getLinha(m, i)\nRetorna uma lista com os elementos da linha da matriz", function (m, i) {
	var retorno, j
	if (m instanceof Matriz && eNumerico(i)) {
		i = getNum(i)
		if (i < 0)
			i += m.linhas+1
		if (!eIntSeguro(i) || i < 1 || i > m.linhas)
			throw 0
		retorno = new Lista
		for (j=1; j<=m.colunas; j++)
			retorno.expressoes.push(m.get(i, j))
		return retorno
	} else if (eDeterminado(m) && eDeterminado(i))
		throw 0
}, true)

Funcao.registrar("getColuna", "getColuna(m, j)\nRetorna uma lista com os elementos da coluna da matriz", function (m, j) {
	var retorno, i
	if (m instanceof Matriz && eNumerico(j)) {
		j = getNum(j)
		if (j < 0)
			j += m.colunas+1
		if (!eIntSeguro(j) || j < 1 || j > m.colunas)
			throw 0
		retorno = new Lista
		for (i=1; i<=m.linhas; i++)
			retorno.expressoes.push(m.get(i, j))
		return retorno
	} else if (eDeterminado(m) && eDeterminado(j))
		throw 0
}, true)

Funcao.registrar("linhas", "linhas(m)\nRetorna o número de linhas da matriz", function (m) {
	if (m instanceof Matriz)
		return new Fracao(m.linhas, 1)
	else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("colunas", "colunas(m)\nRetorna o número de colunas da matriz", function (m) {
	if (m instanceof Matriz)
		return new Fracao(m.colunas, 1)
	else if (eDeterminado(m))
		throw 0
}, true)

Funcao.registrar("matriz", "matriz(nLinhas, nColunas, varI, varJ, exp)\nMonta uma matriz com nLinhas por nColunas, com exp sendo uma expressão com as variáveis varI e varJ", function (nLinhas, nColunas, varI, varJ, exp) {
	var retorno, i, j, varIAntes, varJAntes
	
	// Trata os argumentos
	this.args[0] = nLinhas = this.executarNoEscopo(nLinhas)
	this.args[1] = nColunas = this.executarNoEscopo(nColunas)
	this.args[2] = varI = unbox(varI)
	this.args[3] = varJ = unbox(varJ)
	if (!(varI instanceof Variavel) || !(varJ instanceof Variavel))
		throw 0
	if (!ePuro(exp))
		this.args[4] = exp = this.executarNoEscopo(exp, [varI.nome, varJ.nome])
	
	if (eNumerico(nLinhas) && eNumerico(nColunas)) {
		nLinhas = getNum(nLinhas)
		nColunas = getNum(nColunas)
		if (!eIntSeguro(nLinhas) || !eIntSeguro(nColunas) || nLinhas <= 0 || nColunas <= 0)
			throw 0
		retorno = new Matriz
		varIAntes = Variavel.valores[varI.nome]
		varJAntes = Variavel.valores[varJ.nome]
		for (i=1; i<=nLinhas; i++)
			for (j=1; j<=nColunas; j++) {
				Variavel.valores[varI.nome] = new Fracao(i, 1)
				Variavel.valores[varJ.nome] = new Fracao(j, 1)
				retorno.expressoes.push(this.executarNoEscopo(exp))
			}
		if (varIAntes === undefined)
			delete Variavel.valores[varI.nome]
		else
			Variavel.valores[varI.nome] = varIAntes
		if (varJAntes === undefined)
			delete Variavel.valores[varJ.nome]
		else
			Variavel.valores[varJ.nome] = varJAntes
		retorno.colunas = nColunas
		retorno.linhas = nLinhas
		return retorno
	} else if (eDeterminado(nLinhas) && eDeterminado(nColunas))
		throw 0
}, true, true)
