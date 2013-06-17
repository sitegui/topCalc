"use strict";

// Funções para lidar com vetores

Funcao.registrar("dot", "dot(a,b)\nRetorna o produto escalar/interno de dois vetores", function (a, b) {
	var i, r, termo
	if (a instanceof Vetor && b instanceof Vetor) {
		if (a.expressoes.length != b.expressoes.length)
			throw 0
		if (a.expressoes.length == 0)
			return new Fracao(0, 1)
		for (i=0; i<a.expressoes.length; i++) {
			termo = Funcao.executar("*", [a.expressoes[i], b.expressoes[i]])
			if (i)
				r = Funcao.executar("+", [r, termo])
			else
				r = termo
		}
		return r
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)

Funcao.registrar("cross", "cross(a,b)\nRetorna o produto vetorial de dois vetores de 2 ou 3 dimensôes", function (a, b) {
	return Funcao.executar("\u2A2F", [a, b])
}, true)

Funcao.registrar("proj", "proj(a,b)\nRetorna a projeção de a em b", function (a, b) {
	var fator
	if (a instanceof Vetor && b instanceof Vetor) {
		if (a.expressoes.length != b.expressoes.length)
			throw 0
		fator = Funcao.executar("/", [Funcao.executar("dot", [a, b]), b.absSqr()])
		return Funcao.executar("*", [b, fator])
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)

Funcao.registrar("versor", "versor(v)\nRetorna o versor do vetor = v/abs(v)", function (v) {
	if (v instanceof Vetor) {
		return Funcao.executar("/", [v, Funcao.executar("abs", [v])])
	} else if (eDeterminado(v))
		throw 0
}, true)

Funcao.registrar("ang", "ang(a,b)\nRetorna o ângulo entre os vetores a e b", function (a, b) {
	var cosT
	if (a instanceof Vetor && b instanceof Vetor) {
		cosT = Funcao.executar("/", [Funcao.executar("dot", [a, b]), Funcao.executar("*", [a.abs(), b.abs()])])
		return Funcao.executar("acos", [cosT])
	} else if (eDeterminado(a) && eDeterminado(b))
		throw 0
}, true)
