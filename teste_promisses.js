function dividePelaMetade(numero){
    if(numero % 2 !== 0)
        return Promise.reject(new Error("Não posso dividir um número ímpar!"));
    else
        return Promise.resolve(numero / 2);
}

const numeros = [2,4,6,8,10];
const promises = [];
numeros.forEach(entry => promises.push(dividePelaMetade(entry)));
Promise.all(promises)
    .then(results => results.forEach(entry => console.log(entry)))
    .catch(error => console.log(error));
 
console.log("teste");