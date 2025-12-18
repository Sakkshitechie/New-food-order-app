const { handler } = require('./index');

(async () => {
  const mockEvent = {
    key1: 'value1',
    key2: 'value2',
  };

  try {
    const result = await handler(mockEvent);
    console.log('Lambda function executed successfully:', result);
  } catch (error) {
    console.error('Error executing Lambda function:', error);
  }
})();
