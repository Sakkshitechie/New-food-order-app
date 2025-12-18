const { CloudWatchLogsClient, FilterLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');
const fs = require('fs');
const path = require('path'); 
const crypto = require('crypto'); 

const cloudwatchlogs = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function fetchCloudWatchLogs(
  logGroupName,
  startTime,
  endTime,
  outputFilePath = 'logs/cloudwatch-logs.json',
  interval = null
) {
  const fetchLogs = async () => {
    console.log('Fetching logs from CloudWatch...'); // Debug log
    const params = {
      logGroupName,
      startTime: startTime ? parseInt(startTime, 10) : undefined,
      endTime: endTime ? parseInt(endTime, 10) : undefined,
      limit: 100
    };

    const logEvents = [];
    let nextToken;

    do {
      const command = new FilterLogEventsCommand({ ...params, nextToken });
      const response = await cloudwatchlogs.send(command);
      logEvents.push(...response.events);
      nextToken = response.nextToken;
    } while (nextToken);

    const formattedLogs = logEvents.map(event => ({
      logStreamName: event.logStreamName,
      timestamp: new Date(event.timestamp).toISOString(),
      ingestionTime: new Date(event.ingestionTime).toISOString(),
      message: JSON.parse(event.message),
      eventId: crypto.createHash('md5').update(event.eventId).digest('hex').slice(0, 8)
    }));

    console.log(`Fetched ${formattedLogs.length} log events.`); // Debug log

    // Ensure the directory for the log file exists
    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save formatted logs to a file
    try {
      fs.writeFileSync(outputFilePath, JSON.stringify(formattedLogs, null, 2));
      console.log(`Logs saved to ${outputFilePath}`); // Debug log
    } catch (error) {
      console.error('Error writing logs to file:', error.message);
    }
  };

  // Fetch logs once or periodically based on the interval
  if (interval) {
    console.log(`Starting real-time log fetching with interval: ${interval}ms`); // Debug log
    setInterval(async () => {
      await fetchLogs();
    }, interval);
  } else {
    await fetchLogs();
  }
}

module.exports = fetchCloudWatchLogs;
