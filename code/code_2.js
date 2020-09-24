// code 2 common ------------------------------------------------------------------------
const fp = require("lodash/fp");
// data
const cars = [
  {
    name: "Ferrari FF",
    horsepower: 660,
    dollar_value: 700000,
    in_stock: true,
  },
  {
    name: "Spyker C12 Zgato",
    horsepower: 650,
    dollar_value: 648000,
    in_stock: false,
  },
  {
    name: "Jaguar XKR-S",
    horsepower: 550,
    dollar_value: 132000,
    in_stock: false,
  },
  {
    name: "Audi R8",
    horsepower: 525,
    dollar_value: 114200,
    in_stock: false,
  },
  {
    name: "Aston Martin One-77",
    horsepower: 750,
    dollar_value: 1850000,
    in_stock: true,
  },
  {
    name: "Aston Martin One-77",
    horsepower: 700,
    dollar_value: 1300000,
    in_stock: false,
  },
];

// code 2-1 ------------------------------------------------------------------------
const isLastInStock = fp.flowRight(fp.prop("in_stock"), fp.last);
console.log(`is last in stock: ${isLastInStock(cars)}`);

// code 2-2 ------------------------------------------------------------------------
const getNameOfFirstCar = fp.flowRight(fp.prop(`name`), fp.first);
console.log(`name of first car: ${getNameOfFirstCar(cars)}`);

// code 2-3 ------------------------------------------------------------------------
let _average = function (xs) {
  return fp.reduce(fp.add, 0, xs) / xs.length;
};

function mappingPrice(car) {
  const { dollar_value } = car;
  return dollar_value;
}
const getAverageDollarValue = fp.flowRight(_average, fp.map(mappingPrice));
console.log(`average dollar value: ${getAverageDollarValue(cars)}`);

// code 2-4 ------------------------------------------------------------------------
let _underscore = fp.replace(/\W+/g, "_");
const sanitizeNames = fp.map(fp.flowRight(_underscore, fp.toLower));
const name_array = sanitizeNames([`Hello world`, `Good To See You!`]);
console.log(name_array);
