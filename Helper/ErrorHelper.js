'use strict'

// Simple helper method to create new errors with a specific status value
// attached to them, to match up with the codes and methods below.
const createError = ({
  status = 500,
  message = 'Something went wrong'
}) => {
  const error = new Error(message)
  error.status = status

  return error
}

const BAD_REQUEST_MESSAGE = 'Bad Request';
const UNAUTHORIZED_MESSAGE = 'Unauthorized';
const FORBIDDEN_MESSAGE = 'Forbidden';
const CONFLICT_MESSAGE = 'Conflict';
const NOT_FOUND_MESSAGE = 'The requested resource could not be found';
const UNPROCESSABLE_MESSAGE = 'Unprocessable entity';
const GENERIC_ERROR_MESSAGE = 'Internal server error';

module.exports = {
  createError,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  GENERIC_ERROR: 500,
  BAD_REQUEST_MESSAGE,
  UNAUTHORIZED_MESSAGE,
  FORBIDDEN_MESSAGE,
  CONFLICT_MESSAGE,
  NOT_FOUND_MESSAGE,
  UNPROCESSABLE_MESSAGE,
  GENERIC_ERROR_MESSAGE
}
