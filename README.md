# Top!Calc - func2var
A ideia é transformar funções em variáveis e permitir operações mais dinâmicas com elas

## Exemplos
`f(x)=x, g(x)=x^2, (f+g)(f*g)(2)` retorna 72  
`f(x)=x+1, a(x)=x^2, g(n)=for(i,1,n,f+i), h(n)=g(n)(a), h(3)(14)` retorna {198, 199, 200}

## Status
Ainda não há nada implementado  
A sintaxe e o funcionamento estão no inicialmente pensados

## Funcionamento
As seguintes alterações na implementação atual devem ser feitas:

### Operador
Deve ser criado um novo operador invisível (#, por exemplo), que representa casos como:  
`(f+g)(f*g)` -> `#(+(f, g), *(f, g))`  
Esse operador se comporta tanto como o executor de uma função como operador de multiplicação normal

Se o primeiro argumento for determinado (número, vetor, matriz, etc) ele se transforma numa multiplicação  
Se não, ele executa o primeiro argumento, adicionando o segundo argumento na *cadeia de chamadas*

### Cadeia de chamadas
É uma informação a mais a ser carregada pelos escopos  
Atualmente o escopo é determinado somente pelas variáveis que devem ser ignoradas, ou seja, não transformadas para seu valor real  
A cadeia de chamadas seria a forma de propagar os argumentos da expressão mais exterior para as mais interiores  
Qualquer variável presente será chamada com essa cadeia

Exemplo de cadeia de 1 elemento: `f(x)=(a+b)(a-b)(x)` -> `f(x)=a(a(x)-b(x))+b(a(x)-b(x))`  
Exemplo de cadeia de 2 elementos: `a(x)=x, b(x)=x*a, c(x)=x*b, d(x)=x*c, d(1)(2)(3)` retorna 1*2*3*a

### Valor de uma variável
Ao pegar o valor de uma variável:
* Se a variável estiver na lista de ignoradas, ela será retornada intacta. Fim.
* Se for um valor determinado, retorna ele
* Se for uma função definida, executa a função com os dados no fim da cadeia de chamadas e os remove da cadeia
* Se for uma expressão, executa a expressão com as mesmas informações de escopo anteriores
