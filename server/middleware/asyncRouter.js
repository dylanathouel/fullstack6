const express = require('express');

// Returns an Express router whose route handlers are automatically wrapped so
// that a rejected promise (e.g. a failed DB query) is forwarded to the error
// middleware via next(err) instead of becoming an unhandled rejection — which
// would crash the Node process under Node 15+.
//
// Usage: const router = require('../middleware/asyncRouter')();
function createRouter() {
  const router = express.Router();
  const methods = ['get', 'post', 'put', 'delete', 'patch'];

  for (const method of methods) {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => {
      const wrapped = handlers.map((h) =>
        // Leave error-handling middleware (arity 4) untouched.
        typeof h === 'function' && h.length !== 4
          ? (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)
          : h
      );
      return original(path, ...wrapped);
    };
  }

  return router;
}

module.exports = createRouter;
