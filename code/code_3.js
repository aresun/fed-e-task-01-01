const { result } = require("lodash");
// code 3 common ------------------------------------------------------------------------
const fp = require(`lodash/fp`);
const { Container, Maybe } = require(`./support`);

// code 3-1 ------------------------------------------------------------------------
let maybe = Maybe.of([5, 6, 1]);
let ex1 = () => {
  const m = maybe.map((array) => {
    const add_one_fn = fp.add(1);
    return fp.map(add_one_fn, array);
  });

  console.log(m);
};

ex1();

// code 3-2 ------------------------------------------------------------------------
let xs = Container.of(["do", "ray", "me", "fa", "so", "la", "ti", "do"]);
let ex2 = () => {
  const c = xs.map((array) => {
    return fp.first(array);
  });

  console.log(c);
};

ex2();

// code 3-3 ------------------------------------------------------------------------
let saveProp = fp.curry(function (x, o) {
  return Maybe.of(o[x]);
});
let user = { id: 2, name: "Albert" };
let ex3 = () => {
  const get_name = saveProp(`name`);
  const name_maybe = get_name(user);
  const first_letter_maybe = name_maybe.map((value) => {
    return fp.first(value);
  });

  console.log(`first letter of user: ${first_letter_maybe._value}`);
};
ex3();

// code 3-4 ------------------------------------------------------------------------
/* 
let ex4 = function(n){
  if(n){
    return parseInt(n)
  }
}
*/

let ex4 = function (n) {
  return Maybe.of(n).map((value) => {
    return parseInt(value);
  })._value;
};
const reuslt_of_test4 = ex4(`666`);
console.log(`result of 4: ${reuslt_of_test4}, type: ${typeof reuslt_of_test4}`);
