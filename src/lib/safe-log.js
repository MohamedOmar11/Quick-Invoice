function logServerError(code, error) {
  const name = error && typeof error === "object" && "name" in error ? String(error.name) : "Error";
  const message = error && typeof error === "object" && "message" in error ? String(error.message) : "";
  console.error(code, name, message);
}

module.exports = { logServerError };

