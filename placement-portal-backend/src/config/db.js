const {Pool}= require('pg');
const config=require('./env');

const pool=new Pool({
    connectionString:config.databaseUrl,

    ssl: config.nodeEnv ==='production' ? {rejectUnauthorized:false} : false,

    //Maximum simultaneous DB connections
    max:10,

    //How long to wait for a connection 
    connectionTimeoutMillis:30000,

     //how long a connection can sit idle before ebing closed
    idleTimeoutMillis:30000,

});

//test the connection when the server starts

pool.connect((err,client,release)=>{
    if(err){
        console.error('❌ Database connection failed:',err.message);
        return;
    }
    release();
    console.log('✅ Database connected successfully');
});

module.exports=pool;