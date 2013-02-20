/*

Trabalha com os valores numéricos

Os valores reais são armazenados como instâncias de Fracao, Number* ou BigNum
Valores complexos como instâncias de Complexo
Valores com unidades como instâncias de Unidade

Os valores reais seguem essa sequência:
Fracao --> Number --> BigNum
Onde quanto mais à direita, maior o intervalo representado, porém menor a precisão
Caso uma operação cause overflow num tipo, o resultado será retornado num mais abrangente
O caminho inverso não pode ser feito normalmente

*: não são aceitos objetos de Number na verdade (não use new Number(2.7) e sim 2.7)

Valores indefinidos: 0^0, 0/0, 1^inf, inf-inf, inf/inf, 0*inf, inf^0

*/

/*

= Conversões =

*/

// Converte um valor numérico sem unidade para complexo
function toComplexo(x) {
	if (x instanceof Complexo)
		return x
	else if (x instanceof Fracao)
		return new Complexo(x, new Fracao(0, 1))
	else if (typeof x == "number")
		return new Complexo(x, 0)
	else if (x instanceof BigNum)
		return new Complexo(x, BigNum.zero())
	else
		throw "Erro em toComplexo()"
}

// Converte um valor real para BigNum
function toBigNum(x) {
	if (x instanceof BigNum)
		return x
	else if (x instanceof Fracao)
		return BigNum.fromNumber(x.getNum())
	else if (typeof x == "number")
		return BigNum.fromNumber(x)
	else
		throw "Erro em toBigNum()"
}

// Converte um valor real para Number
function toNumber(x) {
	if (typeof x == "number" && Math.abs(x) != Infinity && !isNaN(x))
		return x
	else if (x instanceof Fracao)
		return x.getNum()
	else
		throw "Erro em toNumber()"
}

// Pega o valor numérico real (pode dar overflow)
function getNum(x) {
	if (typeof x == "number")
		return x
	if (x instanceof Fracao || x instanceof BigNum)
		return x.getNum()
	throw "Erro em getNum()"
}

/*

= Comparações =

*/

// Retorna se o valor é infinito
// 0 = não é infinito, 1 = Infinity, -1 = -Infinity
function eInfinito(x) {
	if (typeof x == "number")
		if (x == Infinity)
			return 1
		else if (x == -Infinity)
			return -1
	return 0
}

// Retorna se o valor dado é zero
function eZero(x) {
	if (x instanceof Fracao)
		return x.n==0
	if (x instanceof BigNum)
		return x.zero
	if (x instanceof Complexo)
		return eZero(x.a) && eZero(x.b)
	return x == 0
}

// Retorna se o valor dado é um (em termos absolutos)
function eUm(x) {
	return x.abs() == 1
}

// Verifica se um valor é numérico
function eNumerico(valor) {
	return typeof valor == "number" || valor instanceof Fracao || valor instanceof BigNum || valor instanceof Complexo
}

// Verifica se dois valores são idênticos (mesmo valor e tipo)
function eIdentico(a, b) {
	if (a instanceof Fracao && b instanceof Fracao)
		return a.n==b.n && a.d==b.d
	if (typeof a == "number" && typeof b == "number")
		return a==b
	if (a instanceof BigNum && b instanceof BigNum)
		return a.zero==b.zero || (a.negativo==b.negativo && a.pequeno==b.pequeno && a.nivel==b.nivel && a.expoente==b.expoente)
	if (a instanceof Complexo && b instanceof Complexo)
		return eIdentico(a.a, b.a) && eIdentico(a.b, b.b)
	return false
}

// Verifica se dois valores são iguais (mesmo valor)
function eIgual(a, b) {
	var ca, cb
	if (eIdentico(a, b))
		return true
	if (a instanceof Complexo || b instanceof Complexo) {
		ca = toComplexo(a)
		cb = toComplexo(b)
		return getNum(ca.a)==getNum(cb.a) && getNum(ca.b)==getNum(cb.b)
	}
	return getNum(a)==getNum(b)
}

/*

= Operações binárias =
Opera sobre dois valores numéricos quaisquer
Retorna um resultado numérico, Infinity, -Infinity
Caso o valor seja indefinido (como 0/0), lança uma exceção

*/
function somar(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa == -infb)
			throw "inf-inf é indefinido"
		if (infa == 1 || infb == 1)
			return Infinity
		return -Infinity
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).somar(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.somar(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).somar(toNumber(b))
	return toBigNum(a).somar(toBigNum(b))
}
function subtrair(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa == infb)
			throw "inf-inf é indefinido"
		if (infa == 1 || infb == -1)
			return Infinity
		return -Infinity
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).subtrair(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.subtrair(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).subtrair(toNumber(b))
	return toBigNum(a).subtrair(toBigNum(b))
}
function multiplicar(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if ((eZero(a) && infb) || (infa && eZero(b)))
			throw "0*inf é indefinido"
		if (infa+infb == 0 || infa+infb == -1)
			return -Infinity
		return Infinity
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).multiplicar(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.multiplicar(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).multiplicar(toNumber(b))
	return toBigNum(a).multiplicar(toBigNum(b))
}
function dividir(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	if (eZero(a) && eZero(b))
		throw "0/0 é indefinido"
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa && infb)
			throw "inf/inf é indefinido"
		if (infb)
			return 0
		if (infa == 1)
			return Infinity
		return -Infinity
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).dividir(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.dividir(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).dividir(toNumber(b))
	return toBigNum(a).dividir(toBigNum(b))
}
function modulo(a, b) {
	return subtrair(a, multiplicar(b, floor(dividir(a, b))))
}
function atan2(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	if (eZero(a) && eZero(b))
		throw "atan2(0, 0) é indefinido"
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa && infb)
			throw "atan2(inf, inf) é indefinido"
		if (infa)
			return infa*Math.PI/2
		if (infb == 1)
			return 0
		return Math.PI
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).atan2(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.atan2(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).atan2(toNumber(b))
	return toBigNum(a).atan2(toBigNum(b))
}
function pow(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	if (eZero(a) && eZero(b))
		throw "0^0 é indefinido"
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (eUm(a) && infb)
		throw "1^inf é indefinido"
	if (infa && eZero(b))
		throw "inf^0 é indefinido"
	if (infb == -1)
		return 0
	if (infa || infb)
		return Infinity
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).pow(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.pow(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).pow(toNumber(b))
	return toBigNum(a).pow(toBigNum(b))
}
function log(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa && infb)
			throw "log(inf, inf) é indefinido"
		if (infa)
			if (eZero(b))
				throw "log(inf, 0) é indefinido"
			else
				return Infinity
		if (eZero(a))
				throw "log(0, inf) é indefinido"
		return 0
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).log(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.log(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).log(toNumber(b))
	return toBigNum(a).log(toBigNum(b))
}
function max(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa == 1 || infb == 1)
			return Infinity
		if (infa == -1)
			return b.clonar()
		return a.clonar()
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).max(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.max(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).max(toNumber(b))
	return toBigNum(a).max(toBigNum(b))
}
function min(a, b) {
	var infa, infb
	
	// Trata valores infinitos
	infa = eInfinito(a)
	infb = eInfinito(b)
	if (infa || infb) {
		if (infa == -1 || infb == -1)
			return -Infinity
		if (infa == 1)
			return b.clonar()
		return a.clonar()
	}
	
	if (a instanceof Complexo || b instanceof Complexo)
		return toComplexo(a).min(toComplexo(b))
	if (a instanceof Fracao && b instanceof Fracao)
		return a.min(b)
	if (!(a instanceof BigNum) && !(b instanceof BigNum))
		return toNumber(a).min(toNumber(b))
	return toBigNum(a).min(toBigNum(b))
}

/*

= Operações unárias =

*/
function acos(x) {
	if (eInfinito(x))
		throw "acos(inf) é indefinido"
	return x.acos()
}
function asin(x) {
	if (eInfinito(x))
		throw "asin(inf) é indefinido"
	return x.asin()
}
function atan(x) {
	var inf = eInfinito(x)
	if (inf)
		return inf*Math.PI/2
	return x.atan()
}
function cos(x) {
	if (eInfinito(x))
		throw "cos(inf) é indefinido"
	return x.cos()
}
function sin(x) {
	if (eInfinito(x))
		throw "sin(inf) é indefinido"
	return x.sin()
}
function tan(x) {
	if (eInfinito(x))
		throw "tan(inf) é indefinido"
	return x.tan()
}
function exp(x) {
	var inf = eInfinito(x)
	if (inf == 1)
		return Infinity
	if (inf == -1)
		return 0
	return x.exp()
}
function ln(x) {
	if (eInfinito(x))
		return Infinity
	return x.ln()
}
function abs(x) {
	if (eInfinito(x))
		return Infinity
	return x.abs()
}
function floor(x) {
	var inf = eInfinito(x)
	if (inf)
		return inf*Infinity
	return x.floor()
}
function ceil(x) {
	var inf = eInfinito(x)
	if (inf)
		return inf*Infinity
	return x.ceil()
}
function round(x) {
	var inf = eInfinito(x)
	if (inf)
		return inf*Infinity
	return x.round()
}
