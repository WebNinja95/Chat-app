import jwt from 'jsonwebtoken'

export const generateToken = ({id,userName,fullName,profilePic,isAdmin}) =>{
    return jwt.sign({id,userName,fullName,profilePic,isAdmin},process.env.JWT_SECRET,{expiresIn:'30d'})
}

export const verifyToken = (req, res, next) => {
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim().split('=')); // Parse the cookie header
        const tokenPair = cookies.find(([key]) => key === 'access_token'); // Find the token pair
        if (!tokenPair) return res.status(401).send('no access_token found');
        const token = tokenPair[1]; // Extract the token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            return res.status(401).send('Token is invalid or expired');
        }
    }
    res.redirect('/api/auth/login');
};

export const isAdmin = (req,res,next)=>{
    if(req.user.isAdmin) return next();
    else{
        req.user.isAdmin = null;
        return next();
    }
}