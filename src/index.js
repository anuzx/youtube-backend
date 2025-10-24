import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB() //it is an async method , and whenever async method is completed a promise is returned
  .then(() => {
    app.listen(process.env.PORT || 8000, () =>
      console.log(`server is running at: ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.log("MONGODB connection dailed !!! ", err);
  });
