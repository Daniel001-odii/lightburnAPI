import dotenv from 'dotenv'
dotenv.config();

import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`LIGHTBURN API listening on port ${PORT}`);
});

module.exports = app;