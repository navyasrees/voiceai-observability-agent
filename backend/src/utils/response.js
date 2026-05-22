/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 */
export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=400]
 */
export function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message, code: statusCode });
}
