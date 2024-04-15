import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim:true,
    },
    userName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    isAdmin:{
        type:Boolean,
        default: false,
    },
    password:{
        type:String,
        required:true,
    },
    profilePic: { type: String, default: "/images/profilePic.jpeg" },

    resetPasswordToken:String,
    resetPasswordExpires:Date,
});

export default mongoose.model("User",userSchema)