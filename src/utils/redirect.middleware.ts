export const redirectMiddleware =
  (from: string, to: string) => (req, res, next) => {
    if (req.path === from) {
      return res.redirect(to);
    }
    next();
  };
