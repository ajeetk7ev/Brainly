import express,{Request,Response} from 'express';
import bcrypt from 'bcrypt';
import { Content, dbConnect } from './db';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
import { User } from './db';
import { authMiddleware } from './middlewares';
const app = express();

app.use(express.json());
dbConnect();

const PORT = 8000

app.post('/api/v1/signup',async (req,res)=>{
    try {
        const {userName,password} = req.body;

       

        if(!userName || !password){
            res.status(411).json({
                success:false,
                message:"userName and password are required"
            })
        }

        const user = await User.findOne({userName});

        if(user){
            res.status(403).json({
                success:false,
                message:"User already exists with this username"
            })
        }
      
        const hashPassword = bcrypt.hash(password,10);
        await User.create({userName,password:hashPassword});

        res.status(200).json({
            success:true,
            message:"User created Successfully"
        })
        
    } catch (error) {
        console.log("Error in signup ",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
})

app.post('/api/v1/signin',async (req,res)=>{
      try {
        const {userName,password} = req.body;

        if(!userName  || !password){
            res.status(403).json({
                success:false,
                message:"invalid crendentials"
            })
        }

        const user = await User.findOne({userName});
        if(!user){
            res.status(404).json({
                success:false,
                message:"user not found"
            })
        }

        const hashPassword:string | undefined = user?.password;

       // @ts-ignore
        const isPasswordMatch = bcrypt.compare(password,hashPassword);

        if(!isPasswordMatch){
            res.status(400).json({
                success:false,
                message:"invalid credentials"
            })
        }

        const payload = {
           id:user?._id,
        }
       
        //@ts-ignore
        const token = jwt.sign(payload,process.env.JWT_SECRET ,{expiresIn:"2d"})

        res.status(200).json({
            success:true,
            message:"signin successfully",
            token
        })
       

        
      } catch (error) {
        console.log("Error in sigin",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
      }
})

app.post('/api/v1/content',authMiddleware,async (req,res)=>{
    try {
        const {title,type,link,content,tags} = req.body;
        //@ts-ignore
        const id = req.userId;

        if (!id) {
             res.status(401).json({
                success: false,
                message: 'User is not authenticated'
            });
        }

        console.log('USER ID ',id);

        await Content.create({title,type,link,content,tags,userId:id});

        res.status(200).json({
            success:true,
            message:"Content created Successfully"
        })
        
    } catch (error) {
        console.log("Error in createContent",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
})

app.get('/api/v1/content',authMiddleware,async(req,res)=>{
    try {
        //@ts-ignore
        const id = req.id;

        const contents = await Content.find({userId:id});

        res.status(200).json({
            success:true,
            message:"contents fetched successfully",
            content:contents
        })

    } catch (error) {
        console.log("Error in fetchContents",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
})

app.delete('/api/v1/content/:id',authMiddleware,async(req,res)=>{
      try {
        const {id} = req.params;

        const content = await Content.findById({_id:id});

        if(!content){
            res.status(404).json({
                success:false,
                message:"Content not found"
            })
        }

        await Content.findByIdAndDelete({_id:id});

        res.status(200).json({
            success:true,
            message:'Content deleted Successfully'
        })
        
      } catch (error) {
        console.log("Error in deleteContents",error);
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
      }
})

//default route
app.get('/',(req,res)=>{
    res.send('Running fine')
})

app.listen(PORT,()=>{
    console.log(`App is running at port ${PORT}`)
   
})

