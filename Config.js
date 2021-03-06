"use strict";

// Controla as configurações do programa
var Config = {}

// Armazena as configurações (chave => obj)
// Cada objeto tem as propriedades "valor", "descricao", "iniValor", "setter"
Config.configs = {}

// Registra uma nova configuração
// nome é a string com nome da configuração a ser criada
// descricao é um texto de ajuda para o usuário
// iniValor é o valor inicial da configuração
// setter é uma função que irá receber o novo valor e retornar se o novo valor a ser salvo
// Se setter retornar undefined, o valor não será salvo
// Lança uma exceção se a configuração já existe
Config.registrar = function (nome, descricao, iniValor, setter) {
	if (nome in Config.configs)
		throw "Configuração "+nome+" já existe"
	Config.configs[nome] = {valor: iniValor, descricao: descricao, iniValor: iniValor, setter: setter}
}

// Retorna o valor atual da configuração
// Retorna undefined caso a configuração não exista
Config.get = function (nome) {
	if (nome in Config.configs)
		return Config.configs[nome].valor
	return undefined
}

// Define o valor da configuração
// Se forcar for true, não passa o valor pelo setter (padrão: false)
// Se a configuração não existir, lança uma exceção
Config.set = function (nome, valor, forcar) {
	var valor
	if (!(nome in Config.configs))
		throw "Configuração "+nome+" não existe"
	if (forcar)
		Config.configs[nome].valor = valor
	else {
		valor = Config.configs[nome].setter(valor)
		if (valor !== undefined)
			Config.configs[nome].valor = valor
	}
}

// Volta a configuração a seu valor inicial
Config.reset = function (nome) {
	if (!(nome in Config.configs))
		throw "Configuração "+nome+" não existe"
	Config.configs[nome].valor = Config.configs[nome].iniValor
}

// Setters padrão
Config.setters = {}

// true/false
Config.setters.bool = function (x) {
	if (eNumerico(x)) {
		return !eZero(x)
	} else if (eDeterminado(x))
		throw 0
}

// inteiro
Config.setters.int = function (x) {
	if (eNumerico(x)) {
		x = getNum(x)
		if (eIntSeguro(x))
			return x
		else
			throw 0
	} else if (eDeterminado(x))
		throw 0
}

// double
Config.setters.double = function (x) {
	if (eNumerico(x))
		return getNum(x)
	else if (eDeterminado(x))
		throw 0
}
