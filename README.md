# 简答题
## 一
> 由于js 是单线程的，当有的任务在同步执行时，页面会造成卡顿，直至这个任务完成，为了避免卡顿，将任务单独在另一个线程上进行处理，在后续处理完之后通过回调来告诉主线程这个异步任务完成，和进行完成后的处理。异步编程避免了阻塞主流程，用户可以继续交互等处理。EventLoop 是用来调度异步任务的机制，当调用栈执行完后，通过 EventLoop 来将异步任务放到调用栈，这样循环，直至所有异步任务处理完，消息队列是用来存储异步任务的队列，每次调用栈执行完，都会从消息队列中取出第一个任务，放到调用栈执行。宏任务和微任务都是 EventLoop 里的两种异步任务，所有微任务执行完后再执行宏任务，宏任务包括 setTimeout, setInterval, requestAnimationFrame 等 微任务包括MutationObserver, Promise.then catch finally 等