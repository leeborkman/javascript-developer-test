const { httpGet } = require('./mock-http-interface');

/*
IMPLEMENTATION NOTES:

1)  Promise.all() is the usual way to make the initial async requests,
      but will fail if there is any failed request.
      Let's use new Promise.allSettled() instead.

2)  I have implemented two additional result objects for the cases where:
    a) The async request itself fails; and
    b) The response from the server is not valid JSON, or is not in the expected format.
  These two cases are not covered by the existing test cases.
  We would need to extend mock-http-interface.js to test these cases.
*/

const SUCCESS_KEY = 'Arnie Quote';
const FAILURE_KEY = 'FAILURE';
const FAILED_RESPONSE_VAL = 'FAILED RESPONSE';
const MALFORMED_DATA_VAL = 'MALFORMED DATA';

const getArnieQuotes = async (urls) => {
  const promiseResults = await Promise.allSettled(
    urls.map((url) => httpGet(url))
  );

  // Transform array of promises, statuses, and responses into required result array
  const quotes = promiseResults.map(({ status: promiseStatus, value }) => {
    try {
      // Handle case where this promise is rejected.
      if (promiseStatus !== 'fulfilled') {
        return { [FAILURE_KEY]: FAILED_RESPONSE_VAL };
      }

      // Promise is fullfilled
      const { status, body } = value;
      const { message } = JSON.parse(body);

      // Error status code. Return early.
      if (status !== 200) {
        return { [FAILURE_KEY]: message };
      }

      // No error, Return result.
      return { [SUCCESS_KEY]: message };
    } catch (err) {
      return { [FAILURE_KEY]: MALFORMED_DATA_VAL };
    }
  });

  return quotes;
};

module.exports = {
  getArnieQuotes
};
