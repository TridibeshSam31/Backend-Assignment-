import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import connectdb from "../config/db"


//login and register/signup 
/*

## 1. POST `/auth/signup`

### Description

Create a new user

Request Body
{
"username":"rahul",
"password":"123"
}

Success Response — 201
{
success: true
data: {
"message":"User created successfully",
"userId":1
}


Edge Cases & Errors
Status	Error
400	invalid inputs
409	username already exists

## 2. POST `/auth/login`

### Description

Authenticate user and issue JWT

Request Body
{
"username":"rahul",
"password":"123"
}


Success Response — 200
{
success: true,
data: {
"message":"Login successful",
"token":"<jwt_token>"
}
}

### Edge Cases & Errors

Status	Error
400	invalid inputs
401	user does not exist
401	incorrect password



*/

export  const signUp = async (res,req) =>{
    try {
        const {username,password} = req.body
        if (!username||!password) {
            return res.status(400).json({success:false , error:"Invalid inputs"})
            
        }
    
        //2nd check for the same 
        if (username.trim().length===0||password.length<3) {
             return res.status(400).json({success:false , error:"Invalid inputs"})
            
            
        }
    
        //checking user with unique username
    
        const findUserwithUniquName = await Pool.query(
            'SELECT id FROM user WHERE username = $1' //to prevent sql injection
            [username]
        )
    
        if (findUserwithUniquName.rows.length > 0) {
            return res.status(409).json({success:false , error:"user already exists"})
            
        }
    
        //password hashing 
        const hashedPassword = await bcrypt.hash(password,10)
    
        //saving in db
        const saveTodb = await Pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id'
            [username,hashedPassword]
        )
    
        return res.status(201).json({
            success:true,
            data:{
                message:"user created successfully",
                userId:saveTodb.rows[0].id
            }
        })
    } catch (error) {
        return res.status( 500).json({
            success:false,
            error:"server Error"
        })
        
    }




}

export const signIn = async (res,req) => {
    try {
        const {username,password} = req.body

        if (!username||!password) {
            return res.status(400).json({success:false , error:"Invalid inputs"})
            
        }
    
        //2nd check for the same 
        if (username.trim().length===0||password.length<3) {
             return res.status(400).json({success:false , error:"Invalid inputs"})
            
            
        }
    
        //checking user with unique username
    
        const findUserwithUniquName = await Pool.query(
            'SELECT id FROM user WHERE username = $1' //to prevent sql injection
            [username]
        )
    
        if (findUserwithUniquName.rows.length > 0) {
            return res.status(409).json({success:false , error:"user already exists"})
            
        }

        //validate password

        const ValidatePassword = await bcrypt.compare(password,hashedPassword)

        if (!ValidatePassword) {
            return res.status(401).json({
                success:false,
                error:"Password is incorrect"
            })
            
        }

        //but if the password matches we will send the token to  the browser
        const token = jwt.sign(
            {
                userId:user.id,
                username:user.username
            },
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRES_IN||'24h'}
        )

        //token ko return krenge response mai 
        res.status(200).json({
            success:true,
            data:{
                message:"login successfull",
                token:token
            }
        })

    } catch (error) {
        console.log("login failed")
        res.status(500).json({
            success:false,
            error:"server error"
        })
    }
}