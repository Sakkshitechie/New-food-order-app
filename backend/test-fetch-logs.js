require('dotenv').config();

const fetchCloudWatchLogs = require('./utils/fetch-cloudwatch-logs');

(async () => {
  try {
    const logGroupName = '/aws/lambda/Food-App-test'; 
    const startTime = Date.now() - 24 * 60 * 60 * 1000; 
    const endTime = Date.now(); 
    const outputFilePath = 'logs/cloudwatch-logs.json'; // Path to save the logs

    console.log('Fetching logs...');
    await fetchCloudWatchLogs(logGroupName, startTime, endTime, outputFilePath);
    console.log('Logs fetched successfully.');
  } catch (error) {
    console.error('Error fetching logs:', error.message);
  }
})();
