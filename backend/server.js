const app = require("./src/app");

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
  console.log(`Backend HTTP running on ${PORT}`);
});
