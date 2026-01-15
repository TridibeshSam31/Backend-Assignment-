import jwt from "jsonwebtoken"

export const authMiddleware = (req,res,next) => {
    try {

        //read authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success:false,
                error:"Authorization header missing"
            })
        }

        //check for bearer token 
        const parts = authHeader.split('')[0]
        if ( parts !== "Bearer") {
            return res.status(401).json({
                success:false,
                error:"bearer token not found"
            })
            
        }

        const token = parts[1]

        //validate token 

        const validationToken = jwt.verify(token,process.env.JWT_SECRET)

        //attach user info to request

        req.user = {
            userId:validationToken.userId,
            username:validationToken.username
        }

        next()


    } catch (error) {
        return res.status(401).json({
      success: false,
      error: 'Token invalid'
    });
    }
}