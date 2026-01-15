const { CloudWatchLogsClient, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

const cloudwatchLogs = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const logGroupName = process.env.CW_LOG_GROUP || '/aws/lambda/Food-App-test';
const logStreamName = process.env.CW_LOG_STREAM || 'BackendStream';
let sequenceToken = null;

async function logToCloudWatch(level, event, details) {
  const timestamp = new Date().toISOString();
  const message = JSON.stringify({ level, event, details, timestamp });

  const params = {
    logGroupName,
    logStreamName,
    logEvents: [{ message, timestamp: Date.now() }],
  };

  if (sequenceToken) {
    params.sequenceToken = sequenceToken;
  }

  try {
    const command = new PutLogEventsCommand(params);
    const response = await cloudwatchLogs.send(command);
    sequenceToken = response.nextSequenceToken;
  } catch (error) {
    // Removed console.error or console.log statements if present
  }
}

module.exports = logToCloudWatch;
