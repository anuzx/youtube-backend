//promises method:

const asyncHandler = (reqHandler) => {
  return (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
  };
};

//it is made to handel re res and next with promises , its a wrapper so that we dont need to keep everything in try catch 

export { asyncHandler };

//try catch method :

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//       await fn(req,res,next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       meassage: error.message,
//     });
//   }
// };
