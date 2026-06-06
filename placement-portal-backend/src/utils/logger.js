//Morgan is an HTTP logger
//It prints a line in your terminal for every incomin request.


const morgan=require('morgan');
const config=require('../config/env');

//'dev format : colorized,concise output for development use
//''combined format : standard Apache combined log output

const httpLogger=morgan(config.nodeEnv ==='production' ? 'combined' :'dev');

//A simple console logger for application events 

const logger={
    info:(message,data='')=>{
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`,data);

    },
    error: (message, data = '') => {
    console.error(`[ERROR] ${new Date().toISOString()} — ${message}`, data);
  },
  warn: (message, data = '') => {
    console.warn(`[WARN]  ${new Date().toISOString()} — ${message}`, data);
  },
};

module.exports = { httpLogger, logger };