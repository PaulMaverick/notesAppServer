import app from './app'
import env from "./util/validateEnv";
import mongoose from 'mongoose';

const port = env.PORT || 3001;

mongoose.connect(env.MONGO_URL)
    .then(() => {
        console.log('DB connected')
        app.listen(port, () => {
            console.log(`Server listening at port:${port}`)
        })
    })
    .catch((error) => console.log(error))

 