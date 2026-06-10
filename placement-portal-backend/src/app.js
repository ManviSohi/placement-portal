
const express=require('express');
const helmet=require('helmet');//security middleware
const cors=require('cors');//let the frontend and backend communictae in different ports
const rateLimit=require('express-rate-limit');//prevent brute-force attacks
const { httpLogger } = require('./utils/logger');
const {errorHandler}=require('./middleware/error.middleware');
const config = require('./config/env');



const app=express();

//SECURITY MIDDLEWARE
app.use(helmet());
app.use(cors({origin:config.frontendUrl,
    methods:['GET','POST','PUT','DELETE','PATCH'],
    //Allow the authoriztion header
    allowedHeaders:['Content-Type','Authorization'],
    //Allow cookies to be sent
    credentials:true,
}));

//Rate limiter: allow max 100 requests per 15 minutes from the same IP
const limiter=rateLimit({
    windowMs:config.rateLimit.windowMs,
    max:config.rateLimit.max,
    StandardHeaders:true, //Return rate limit info in the `RateLimit-*` headers
    legacyHeaders:false, //Disable the `X-RateLimit-*` headers
    message:{
        success:false,
        message:'Too many requests from this IP, please try again later.',
    },
});

app.use('/api/',limiter);

//PARSING MIDDLEWARE
//express.json() parses incoming JSON requests and puts the data in req.body
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(httpLogger);


//Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});


// ─── API ROUTES ───────────────────────────────────────────────────────────────
// Routes will be added here in the next phase.
// Keeping them commented shows the intended structure.
app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/students', require('./routes/student.routes'));
// app.use('/api/jobs', require('./routes/job.routes'));
// app.use('/api/applications', require('./routes/application.routes'));
// app.use('/api/admin', require('./routes/admin.routes'));

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
// If no route matched above, send a clean 404.
// This must come AFTER all routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
// This MUST be the very last middleware.
// Express identifies error handlers by their 4-parameter signature.
app.use(errorHandler);

module.exports = app;