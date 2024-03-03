import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import notesRoute from './routes/notes'
import userRoutes from './routes/users'
import morgan from 'morgan'
import createHttpError, { isHttpError} from "http-errors";
import cors from 'cors'
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore from 'connect-mongo';
import { requiresAuth } from "./middleware/auth";

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));

app.use(morgan("dev"));
app.use(express.json());

app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_URL
    })
}))

app.use("/api/users", userRoutes)
app.use("/api/notes", requiresAuth, notesRoute);

app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint not found")) 
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error)
    let errorMessage = "Internal Server Error"
    let statusCode = 500;

    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    
    res.status(statusCode).json({message: errorMessage})
})

export default app;