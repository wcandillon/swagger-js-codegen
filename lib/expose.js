function expose(definitions) {
  const list = Object.keys(definitions);
  list.forEach((definition) => {
    global[definition] = definitions[definition];
  });
}

module.exports = expose;
