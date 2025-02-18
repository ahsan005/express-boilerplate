require("dotenv").config();
//this will allow us to pull params from .env file
const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json());
//This middleware will allow us to pull req.body.<params>

const port = process.env.TOKEN_SERVER_PORT || 3000;
//get the port number from .env file

app.listen(port,()=>{
    console.log('Authorization server is running on port: ', port);
})



const bcrypt = require ('bcrypt')
const users = []
// REGISTER A USER
app.post ("/createUser", async (req,res) => {
const user = req.body.name;
const email = req.body.email;
const hashedPassword = await bcrypt.hash(req.body.password, 10)
    try{
   let result = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [user,email, hashedPassword]);
        console.log(result)
    return res.status(201).send(`User added with ID: ${result.rows[0].id}`)
        }
    
    catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }

// users.push ({user: user, password: hashedPassword})
// console.log(users)
})
// REGISTER A USER


// LOGIN Section

const jwt = require("jsonwebtoken")
//AUTHENTICATE LOGIN AND RETURN JWT TOKEN
app.post("/login", async (req,res) => {
    console.log(req.body)
const user = await db.query("SELECT * FROM users WHERE name = $1", [req.body.name])
//check to see if the user exists in the list of registered users
console.log(user,"USER")
if (user == null) res.status(404).send ("User does not exist!")
//if user does not exist, send a 400 response
if (await bcrypt.compare(req.body.password, user.rows[0].password)) {
const accessToken = generateAccessToken ({user: req.body.name})
const refreshToken = generateRefreshToken ({user: req.body.name})
res.json ({accessToken: accessToken, refreshToken: refreshToken})
} 
else {
res.status(401).send("Password Incorrect!")
}
})
app.get("/users", async (req,res) => {
    console.log(req.body)
const user = await db.query("SELECT * FROM users")
return res.json(user.rows);
})


// accessTokens
    function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) 
    }

    // refreshTokens
    let refreshTokens = []
    function generateRefreshToken(user) {
    const refreshToken = 
    jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
    refreshTokens.push(refreshToken)
    return refreshToken
    }

//     Create secrets in .env files using the following 
//     $ node
// > require("crypto").randomBytes(64).toString("hex")


// LOGIN Section


    //REFRESH TOKEN API
    app.post("/refreshToken", (req,res) => {
    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken ({user: req.body.name})
    const refreshToken = generateRefreshToken ({user: req.body.name})
    //generate new accessToken and refreshTokens
    res.json ({accessToken: accessToken, refreshToken: refreshToken})
    })
    //REFRESH TOKEN API

    //LOGOUT API
    app.delete("/logout", (req,res)=>{
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    res.status(204).send("Logged out!")
    })
    //LOGOUT API


