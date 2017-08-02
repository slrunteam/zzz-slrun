module.exports = function middleware (req, res) {
  const { greeting = 'Hello', name = 'World' } = req.query
  res.send(`${greeting}, ${name}! (from ${req.path})`)
}
