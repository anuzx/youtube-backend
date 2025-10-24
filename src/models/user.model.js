import mongoose, { Schema } from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";

//we dont write id in schema becuz mongodb generates a unique id of user itself (in BSON data)

//direct encryption is not possible therefore we need a pre hook of mongoose

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //makes it searchable in optimised way
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    password: {
      type: String,
      required: [true, "password is required"], //custom msg
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//middleware

//arrow fxn is not used becuz .this deos not work with arrow fxns
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  //if modified then do bcrypt
  this.password = bcrypt.hash(this.password, 10);
  next();
});

//method

userSchema.methods.isPasswordCorrect = async function (password) {
  //bcrypt also has method to check the password

  //this returns true or false
  return await bcrypt.compare(password, this.password);
};

//this is fast so no need of async
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    //takes from database
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
     {
       //it refresh regularly so it contains less data
       _id: this._id,
     
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
     }
   );
};

export const User = mongoose.model("User", userSchema);
