import mongoose from 'mongoose';

export const dbConnect = ()=>{
    mongoose.connect('mongodb://localhost:27017/brainly')
    .then(()=>{console.log('DB connected Successfully')})
    .catch((error:Error)=>{
        console.log("Error in DB connection",error);
    })
}

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
    },

    password:{
        type:String,
        required:true,
    },

    contents:[{
        type:mongoose.Schema.Types.ObjectId,
       ref:"Content"
    }]
},{timestamps:true})

export const User = mongoose.model("User",userSchema);

const contentType = ['audio','video','docs']
const contentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    title:{
        type:String,
        required:true,
    },

    content:{
        type:String,
        required:true,
    },

    type:{
        type:String,
        enum:contentType,
        required:true,
    },

    tags:[{
       type:String,
    }],
    
    link:{
        type:String,
        required:true,
    }
},{timestamps:true})

export const Content = mongoose.model("Content",contentSchema);

const linkSchema = new mongoose.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  });

  export const Link = mongoose.model("Link",linkSchema);


  const tagSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true }
  })

  export const Tag = mongoose.model("Tag",tagSchema);