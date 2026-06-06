//dotenv read your .env files and adds all the variables to process.env 
require('dotenv').config();

//we export a single config object instead of calling 
//ONE PLACE TO ADD DEFAULT VALUES AND VALIDATION
//Autocomplete works on an object ,not on process.env strings

const config={
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL,

    jwt:{
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS,10)||12,


    //Rate Limiting
    rateLimit:{
        windowMs:parseInt(process.env.RATE_LIMIT_WINDOW_MS,10)||900000,
         max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    },

    frontendUrl:process.env.FRONTEND_URL || 'http://localhost:5173'
};

//to prevent from fail silently in production

const requiredVars=['DATABASE_URL','JWT_SECRET'];

requiredVars.forEach((varName)=>{
    if(!process.env[varName]){
        console.error(`❌ Fatal: Missing required environment variable: ${varName}`);
    process.exit(1);
    }
});

module.exports=config;