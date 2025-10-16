const express = require('express');
const app = express();
const PORT = 8083;

app.get('/', (req, res) => {
  console.log('hello', req.method);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
