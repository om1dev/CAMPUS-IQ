const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`R&D backend running on http://localhost:${env.port}`);
});
