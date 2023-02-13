const http = require('http');  // Import the built-in HTTP module
const fs = require('fs');      // Import the built-in file system module
const qs = require('querystring'); // Import the querystring module for parsing data in POST requests
const port = 3000;             // Set the port to listen on

// Create a HTTP server using the built-in http.createServer method
const server = http.createServer((req, res) => {

  // Check the request method
  if (req.method === 'GET') {

    // If it's a GET request, read the contents of message.txt
    fs.readFile('message.txt', (err, data) => {
      if (err) {
        // If the file doesn't exist, return a form for entering a message
        if (err.code === 'ENOENT') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <form method="post">
                  <textarea name="message"></textarea>
                  <button type="submit">Submit</button>
                </form>
              </body>
            </html>
          `);
        } else {
          // If there was a different error, return a 500 Internal Server Error response
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(err.message);
        }
        return;
      }

      // If the file exists, return its contents along with a form for entering a new message
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <p> ${data.toString()}</p>
            <form method="post">
              <textarea name="message"></textarea>
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);
    });
  } else if (req.method === 'POST') {
    // If it's a POST request, collect the form data from the request body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      // Once all the data has been received, parse the form data and write it to message.txt
      const formData = qs.parse(body);
      fs.writeFile('message.txt', formData.message, (err) => {
        if (err) {
          // If there was an error writing the file, return a 500 Internal Server Error response
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(err.message);
          return;
        }

        // If writing the file was successful, redirect the client back to the home page
        res.writeHead(302, { 'Location': '/' });
        res.end();
      });
    });
  }
});

// Start listening for incoming
server.listen(port);