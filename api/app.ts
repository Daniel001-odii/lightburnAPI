
import express from 'express';
import imageRoutes from './routes/imageRoutes';
import cors from "cors"



const app = express();
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('CardMaker API is running!');
});

app.use('/api/images', imageRoutes);


export default app;