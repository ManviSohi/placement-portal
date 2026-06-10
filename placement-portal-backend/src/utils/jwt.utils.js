

const jwt=require('jsonwebtoken');
const config=require('../config/env');
//generate token called once at to login to create a signed token
//playload contains the user's id and role -nothing sensitive
//the token is base64-encoded ,not encrypted and can be decoded easily

const generateToken=(payload)=>{
    return jwt.sign(
        payload,
        config.jwt.secret,
        {expiresIn:config.jwt.expiresIn}
    );
};

const verifyToken=(token)=>{
    return jwt.verify(token,config.jwt.secret);
};
module.exports = { generateToken, verifyToken };
