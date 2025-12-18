const logToCloudWatch = require('./cloudwatch-logger');

exports.handler = async (event) => {
  try {
    // Log the incoming event
    await logToCloudWatch('info', 'lambda-invocation', { event });

    // Example response
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Lambda function executed successfully!',
        input: event,
      }),
    };

    // Log the response
    await logToCloudWatch('info', 'lambda-response', { response });

    return response;
  } catch (error) {
    // Log any errors
    await logToCloudWatch('error', 'lambda-error', { message: error.message, stack: error.stack });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
};
