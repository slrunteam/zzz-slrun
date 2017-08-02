module.exports = function delay (time = 1) {
  const startTime = new Date()
  if (time > 10) {
    throw new Error('Could not delay for more than 10 seconds')
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const endTime = new Date()
      resolve({
        startTime,
        endTime
      })
    }, time * 1000)
  })
}
