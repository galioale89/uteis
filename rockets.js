const { format } = require("mysql2");

const rockets = [
    { country: 'Russia', launches: 32 },
    { country: 'US', launches: 23 },
    { country: 'China', launches: 16 },
    { country: 'Europe(ESA)', launches: 7 },
    { country: 'India', launches: 4 },
    { country: 'Japan', launches: 3 }
];
rockets.map((itm) => {
    itm.launches += 10
    return itm
})
console.log(rockets)

console.log('---------------------------------------------------')

const launchOptimistic_v2 = rockets.map(elem => (
    {
        country: elem.country,
        launches: elem.launches += 10
    }
));

console.log(launchOptimistic_v2);
console.log('---------------------------------------------------')
const launchOptimistic = rockets.map(function (elem) {
    return {
        country: elem.country,
        launches: elem.launches + 10,
    }
});

console.log(`launchOptimistic ${JSON.stringify(launchOptimistic)}`);
