const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);

  // Handle only POST requests to the '/validate' endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/validate') {
    let requestBody = '';

    // Read the request data
    req.on('data', chunk => {
      requestBody += chunk.toString();
    });

    // Process the request data once it's fully received
    req.on('end', () => {
      // Parse the request body as JSON
      const { cardNumber, expiryDate, cvv } = JSON.parse(requestBody);

      // Perform credit card validation
      const isValid = validateCreditCard(cardNumber, expiryDate, cvv);

      // Set the response headers
      res.setHeader('Content-Type', 'application/json');

      // Return the validation result as JSON
      if (isValid) {
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
      } else {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false }));
      }
    });
  } else {
    // Return a 404 error for any other routes
    res.statusCode = 404;
    res.end('Not Found');
  }
});

function validateCreditCard(cardNumber, expiryDate, cvv) {
  // Implement your credit card validation logic here based on the provided algorithm
  // Return true if the card is valid, false otherwise
  // Example validation code:

  // 1. Check expiry date
  const currentDate = new Date();
  const [expiryMonth, expiryYear] = expiryDate.split('/');
  const expiry = new Date(expiryYear, expiryMonth - 1);
  if (expiry < currentDate) {
    return false;
  }

  // 2. Check CVV length
  const isAmexCard = cardNumber.startsWith('34') || cardNumber.startsWith('37');
  if (isAmexCard && cvv.length !== 4) {
    return false;
  } else if (!isAmexCard && cvv.length !== 3) {
    return false;
  }

  // 3. Check card number length
  if (cardNumber.length < 16 || cardNumber.length > 19) {
    return false;
  }

  // 4. Check card number using Luhn's algorithm
  const sanitizedCardNumber = cardNumber.replace(/\D/g, ''); // Remove non-digit characters
  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitizedCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedCardNumber.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  if (sum % 10 !== 0) {
    return false;
  }

  // All validation checks passed
  return true;
}

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
