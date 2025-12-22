1.)images are stored using 3rd party service , once the photo is uploaded it is kept temporarily on server and then we upload it on cloudinary
<br>
2.)always rap db calls in try catch and use await 
<br>
3.) when we use export const then we have to import it using {} and if we use export default then we can import via any name , if we export using {} then also we have to import it using {}
<br>
4.)its not only (req,res) ; its (err,req,res,next
<br>
5.)JWT is a bearer token ,means who so ever has this token is seen as valid user
<br>
6.)REFRESH_TOKEN is kept in DB and has more expiry time than ACCESS_TOKEN , concept : till the time we have access token we can access the endpoints which require authentication ,but assume the login session gets expire due to security reasons then we will have to again put username and password ,here is the point to use refresh token (we validate the user through access token only but we use refresh token so that the user need not require to put the passwrd everytime) ,we make the user hit an endpoint and if the refresh token that the user has and one saved in our DB are same we give new access token to the user
<br>
7.)we will upload files through multer ,and keep it temperory on our server and thenwe will pick file from local storage and put it on cloudinary server
<br>
8.).some() method is an iterative method that tests whether at least one element in an array passes a condition implemented by a provided callback function. It returns true if it finds a match and stops immediately (short-circuits), otherwise it returns false after checking all elements
<br>
9.) To know a channel's subscribers we will select the document with that specific channel
<br>
10.) an aggregation pipeline consists of one or more stages that process documents , each stage performs an operation on the input documents,documents that are output from a stage are passed to the next stage
<br>
11.)mongoDB _id is an object but mongoose internally converts into string 
<br>
12.)Aggregation pipeline is used when you need to process data inside MongoDB instead of just fetching it.
<br>
Processing can mean:

Joining data (relationships)
Calculating values
Transforming shape of data
Filtering + grouping
Adding derived fields