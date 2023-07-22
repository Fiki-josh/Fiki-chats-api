import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import auths from './routes/auths.mjs';
import user_routes from './routes/user-routes.mjs';
dotenv.config({path: './config.env'});
const app = express();

const connectionString = process.env.ATLAS_URL || '';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to db")
}).catch((e) => console.log(e));

app.use(cors());
app.use(express.json());
app.use('/auth',auths);
app.use('/api',user_routes);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
})