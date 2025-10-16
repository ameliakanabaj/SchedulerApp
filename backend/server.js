const express = require('express');
const app = express();
const PORT = 8080;

console.log('a')

app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));