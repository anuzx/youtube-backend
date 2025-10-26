import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//here we dont need asyncHandler becuz we are not handleing any web req it is our internal usecase method
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //refresh token is also kept in db

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "soemthign went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //steps to register a user:
  //1) get user details from frontend (using postman)
  //2) validation -> inputs are not empty
  //3) check if user already exists (email , username)
  //4) check for images and avatar(user -> multer -> cloudinary)
  //5) upload them to cloudinary
  //6) create user object - create entry in db
  //7) remove passwrd and refresh token field from response as db will give everything in response
  //8) check for user creation (if res is null or not)
  //9) return res

  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "fullname is required"); //status code , message
  }

  //find user in db which matches this username and email
  const existedUser = await User.findOne({
    //or parameter
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    //throw statement is used to raise or generate an error
    throw new ApiError(409, "User with email or username already exist");
  }

  //Handeling images

  const avatarLocalPath = req.files?.avatar[0]?.path; //multer gives req.files
  //const coverImageLocalPath = req.filer?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  //now upload them to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //databse entry
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //check if coverimg is their or not
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    //write what all you dont want
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //steps to login a user :
  //take data from req.body
  //access based on username or email
  //find the user
  //password check
  //if password crct -> generate access and refresh token and send it to user
  //send in cookies

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  //if user found then check password

  //here we are using user not User (it is a mongoose object,so only mongoose methods will work with it)

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "password is not correct");
  }
  //now if user passwrd is crct then make access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //now send it with cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    //cookie should be modified by server only and not frontend
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

//logout
//clear cookie,accesstoken,refreshtoken

const logoutUser = asyncHandler(async (res, req) => {
  //as user is present

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //for mobile users req.body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  //verify incoming token 
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new ApiError(401 , "invalid refresh token")
    }
    //match the incomingrefreshtoken and user?.refreshToken
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401 , "Refresh token is expired or used")
    }
  
    //now generate new token 
    const options = {
      httpOnly: true,
      secure: true,
    }
    const {accessToken , newRefreshToken }=await generateAccessAndRefreshTokens(user._id)
  
    return res
      .status(200)
      .cookie("accessToken", accessToken , options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200, 
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401 , error?.message || "invalid refresh token")
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
