//we will use pg library for connection to postgresql 
import pkg from "pg";
import dotenv from "dotenv"

const {pool} = pkg



//db connection

const connectdb = async ()=>{
    try {
        const Pool = new pool({
            connectionString:process.env.DATABASE_URL
        })
        const client = await Pool.connect()
        console.log("db connected successfuly")

        return Pool
    } catch (error) {
        console.log("error db not connected");
        process.exit(1)

        
    }
}

export default connectdb


