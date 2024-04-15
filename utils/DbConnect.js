import mongoose from 'mongoose';

const DB = 'put ur mongodb url' 
console.log(DB);
const connectToDatabase = () => { 
    mongoose.connect(DB)
    .then(()=>console.log('connected to mongodb..'))
    .catch(err => console.error('could not connected error mongodb!'))

}

export default connectToDatabase;