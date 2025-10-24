import express from "express";
const app = express();

import cookieParser from "cookie-parser"; //use to access the client cookie and set it , do CRUD operation

import cors from "cors";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true,
  })
);

//data can come from varies sources like files,json etc

app.use(express.json({ limit: "16kb" })); //data that we will take from form

//data from url:
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//data from static files
app.use(express.static("public"));

app.use(cookieParser());

//ROUTES:

import userRouter from "./routes/user.routes.js" //this import statement has own name this works only when export is default 

//ROUTES DECLARATION:

//app.get will not be used here becuz we have made router seperatly 

app.use("/api/v1/users" , userRouter) //control is passed to userRouter 
//url will look something like : https://localhost:8000/api/v1/users/route



export { app };
