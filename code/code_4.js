const { reject, result } = require("lodash");

// promise 状态
const PENDING = `pending`;
const FULFILLED = `fulfilled`;
const REJECTED = `rejected`;

// utils
function resolvePromise(newPromise, result_of_callback, resolve, reject) {
  // callback 返回了 then 返回的同一 promise, 禁止循环返回 promise
  if (newPromise === result_of_callback) {
    reject(new TypeError(`Chaining cycle detected for promise #<Promise>`));
    return;
  }

  // callback 返回了 promise 对象
  if (result_of_callback instanceof CustomizedPromise) {
    // 对该 promise 添加 then
    // 成功则 resolve 当前 then 返回的 promise, 失败则 reject
    result_of_callback.then(resolve, reject);
  } else {
    // 非 promise 类型, 当前 then 返回的 promise 直接 resolve
    resolve(result_of_callback);
  }
}

function call_callback(callback, callback_arg, newPromise, resolve, reject) {
  try {
    const result_of_callback = callback(callback_arg);

    resolvePromise(newPromise, result_of_callback, resolve, reject);
  } catch (e) {
    reject(e);
  }
}

class CustomizedPromise {
  constructor(executorFn) {
    try {
      // 立即执行
      executorFn(this.resolve, this.reject);
    } catch (e) {
      // 执行出错, reject 此 promise
      this.reject(e);
    }
  }

  // promise properties
  status_of_promise = PENDING;
  fulfilled_value = undefined;
  failed_error = undefined;
  success_callback_arr = [];
  failed_callback_arr = [];

  // promise methods
  resolve = (value) => {
    // 此 promise 状态已定, 不可 resolve
    if (this.status_of_promise !== PENDING) return;

    // 改变 promise 状态
    this.status_of_promise = FULFILLED;
    this.fulfilled_value = value;

    // 执行所有 success callbakcs, callback 传入 fulfilled value
    while (this.success_callback_arr.length) {
      this.success_callback_arr.shift()(this.fulfilled_value);
    }
  };
  reject = (error) => {
    // 状态已定, 不可再 resolve, reject
    if (this.status_of_promise !== PENDING) return;

    // 改变 promise 状态
    this.status_of_promise = REJECTED;
    this.failed_error = error;

    // 执行所有 failed callback, callback 传入 failed error
    while (this.failed_callback_arr.length) {
      this.failed_callback_arr.shift()(this.failed_error);
    }
  };
  then = (success_callback, failed_callback) => {
    // 如果没有传入 success callback, callback 传递 fulfilled value
    success_callback = success_callback ? success_callback : (value) => value;
    // 如果没有传入 fail callback, callback 抛出 error, 使 then 返回的 promise reject
    failed_callback = failed_callback
      ? failed_callback
      : (error) => {
          throw error;
        };

    // promise returned by then
    const newPromise = new CustomizedPromise((resolve, reject) => {
      if (this.status_of_promise === FULFILLED) {
        // promise 已经 fulfilled, 直接调用
        setTimeout(() => {
          call_callback(
            success_callback,
            this.fulfilled_value,
            newPromise,
            resolve,
            reject
          );
        }, 0);
      } else if (this.status_of_promise === REJECTED) {
        // setTimeout 用来获得 newPromise 的引用
        setTimeout(() => {
          call_callback(
            failed_callback,
            this.failed_error,
            newPromise,
            resolve,
            reject
          );
        });
      } else {
        // pendding promise, 存储传入的 callback, resolve 或 reject 时再调用
        this.success_callback_arr.push(() => {
          call_callback(
            success_callback,
            this.fulfilled_value,
            newPromise,
            resolve,
            reject
          );
        });

        this.failed_callback_arr.push(() => {
          call_callback(
            failed_callback,
            this.failed_error,
            newPromise,
            resolve,
            reject
          );
        });
      }
    });

    return newPromise;
  };

  finally = (callback) => {
    // 返回添加 then 方法后返回的新 promise
    return this.then(
      (value) => {
        // fufilled: 返回一个新 promise
        // 调用 finally 传入的 callback
        // callback 返回值 resolve 之后, finally 返回的新 promise 需 resolve finally 之前的 value
        return CustomizedPromise.resolve(callback()).then(() => value);
      },
      (error) => {
        // reject: 返回一个新 promise
        // 调用 finally 传入的 callback
        // callback 返回值 resolve 之后, finally 返回的新 promise 需 reject finally 之前的 error
        return CustomizedPromise.resolve(callback()).then(() => {
          throw error;
        });
      }
    );
  };

  catch = (callback) => {
    // 为当前 promise 添加 then, 并返回 then 返回的 promise
    // fulfilled 则传递 fulfilled value
    // rejected 则调用该 callback
    return this.then(undefined, callback);
  };

  static resolve(value) {
    if (value instanceof CustomizedPromise) {
      // 如果 resolve 一个 promise, 则直接返回该 promise
      return value;
    } else {
      // 非 promise, 返回新 promise, 并且直接 resolve 这个 value
      return new CustomizedPromise((resolve, reject) => {
        resolve(value);
      });
    }
  }

  static all(array) {
    // 返回一个新 promise
    return new CustomizedPromise((resolve, reject) => {
      const result_array = [];
      let count_of_added = 0;
      const length_of_array = array.length;

      function addToResultArray(index, value) {
        result_array[index] = value;

        count_of_added++;

        if (count_of_added === length_of_array) {
          // 所有的结果都获得了, 将 all 返回的 promise resolve
          resolve(result_array);
        }
      }

      // 遍历 传入 all 的 array
      for (let i = 0; i < length_of_array; i++) {
        let current_content = array[i];

        if (current_content instanceof CustomizedPromise) {
          // 如果是 promise, 添加 callback
          current_content.then(
            (value) => {
              // 成功时, 添加到 result_array
              addToResultArray(i, value);
            },
            (error) => {
              // 失败时, 直接 reject all 返回的 promise
              reject(error);
            }
          );
        } else {
          // 非 promise, 直接添加到 result_array
          addToResultArray(i, current_content);
        }
      }
    });
  }
}

// code 4 usage ------------------------------------------------------------------------
const p0 = new CustomizedPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(`hello`);
    resolve(`not be resolved`); // 重复resolve
  }, 500);
});
p0.then((str) => {
  console.log(str);
});

const p1 = new CustomizedPromise((resolve, reject) => {
  // throw `aaa`;
  reject(`aaa`);
});
p1.then(
  (value) => {
    console.log(`fufilled\n`, value);
  },
  (error) => {
    console.log(`error example\n`, error);
  }
);

const p2 = CustomizedPromise.resolve(`p2`);
p2.then((value) => {
  console.log(`p2: first then`);
});
p2.then((value) => {
  console.log(`p2: second then`);
});

const p3 = CustomizedPromise.resolve(`p3: empty then, resolve`);
p3.then()
  .then()
  .then((value) => {
    console.log(value);
  });

const p4 = new CustomizedPromise((resolve, reject) => {
  reject(`p4: empty then, reject`);
});
p4.then().then(undefined, (error) => {
  console.log(error);
});

const p5 = new CustomizedPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
p5.then((value) => {
  console.log(`waited: ${value} second`);

  return new CustomizedPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
})
  .finally(() => {
    console.log(`finally`);
  })
  .then((value) => {
    console.log(`waited: ${value} second`);
    console.log(`p5: call back returned promise`);
  });

const p6 = new CustomizedPromise((resolve, reject) => {
  setTimeout(() => {
    reject(`p6: catch`);
  }, 2000);
});

p6.catch((error) => {
  console.log(`error: ${error}`);
  return `after catch`;
}).then((value) => {
  console.log(value);
});

const p7 = new CustomizedPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(`p7: in promise all resolved`);
  }, 3000);
});
const all = [1, p7, `two`];
const p8 = CustomizedPromise.all(all);
p8.then((result_array) => {
  console.log(`p8: `, result_array);
});

const p9 = new CustomizedPromise((resolve, reject) => {
  resolve(`p9`);
});
let p10 = p9.then((value) => {
  console.log(`from ${value}`);
  return p10;
});

p10.then(
  (value) => {
    console.log(value);
  },
  (error) => {
    console.log(error);
  }
);
