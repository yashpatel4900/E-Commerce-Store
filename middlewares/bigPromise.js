// try catch and async - await || use promise || use bigPromise

module.exports = (func) => (req, next, res) => {
  Promise.resolve(func(req, next, res)).catch(next);
};
