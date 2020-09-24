/**
 * + code 1
 * --------------------------------------------------------------------------
 */
function task_a() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      let a = "hello";
      resolve(a);
    }, 10);
  });
}

function task_b() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      let b = "lagou";
      resolve(b);
    }, 10);
  });
}

function task_c() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      let c = "I ❤️ U";
      resolve(c);
    }, 10);
  });
}

task_a()
  .then((a) => {
    return task_b().then((b) => {
      return a + b;
    });
  })
  .then((ab) => {
    task_c().then((c) => {
      console.log(ab + c);
    });
  });
