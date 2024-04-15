import express from 'express';
import User from '../models/user.js'
import {generateToken,verifyToken} from '../utils/token.js';
import path from 'path'
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname} from 'path';
import multer from 'multer'; 
const router = express.Router();



const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2000000 } // Limit file size to 2MB 
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = path.join(__dirname, '..', 'public');



router.use(bodyParser.urlencoded({ extended: false }));



router.use(express.static(publicPath));

router.get('/', async (req,res)=>{
    const profilePath = path.join(publicPath, 'profile.html');
    res.sendFile(profilePath);
})

// router.use('/', express.static(path.join(__dirname, '../public')));



router.post('/save-image', upload.single('image'),[verifyToken], async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }
  
      const imageUrl = `/uploads/${req.file.filename}`;
      
      await User.findByIdAndUpdate(req.user.id, { profilePic: imageUrl });
  
      res.json({ success: true, imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ success: false, message: 'Error uploading image' });
    }
  });
  


export default router