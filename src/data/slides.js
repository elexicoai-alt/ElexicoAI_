export const slidesData = [
  {
    id: 1,
    title: "Introduction to Backend",
    summary: "The backend is the server-side component of web applications that handles business logic, data processing, and security. It manages databases, processes user requests, enforces business rules, and ensures secure communication between the user interface and data storage. Think of it as the engine room of the web where all the computational work happens behind the scenes.",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Introduction to Backend</h2>
      <p class="mb-4">The backend is the invisible powerhouse of web applications. While users interact with beautiful interfaces, the backend handles all the heavy lifting behind the scenes.</p>
      
      <h3 class="text-xl font-semibold mb-2">Key Responsibilities:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>Business Logic:</strong> Processing data, making calculations, and enforcing rules</li>
        <li><strong>Data Management:</strong> Storing, retrieving, and updating information in databases</li>
        <li><strong>Security:</strong> Protecting sensitive data and controlling access</li>
        <li><strong>Integration:</strong> Connecting with third-party services and APIs</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Why It Matters:</h3>
      <p class="mb-4">Without a robust backend, applications would be limited to static displays. The backend enables dynamic content, user personalization, real-time updates, and seamless experiences across devices.</p>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>Think of it like a restaurant:</strong> The frontend is the dining area where customers sit, while the backend is the kitchen where chefs prepare meals, manage ingredients, and ensure quality.</p>
      </div>
    `
  },
  {
    id: 2,
    title: "Server",
    summary: "Servers are high-powered computers that run 24/7 to host applications and respond to client requests. They can be physical machines in data centers or virtual instances in cloud platforms like AWS, Google Cloud, or Azure. Servers provide the computational power, storage, and network capabilities needed to deliver web services reliably at scale.",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Servers</h2>
      <p class="mb-4">Servers are specialized computers designed to handle requests from clients (browsers, mobile apps) and deliver responses. They run 24/7, serving millions of users simultaneously.</p>
      
      <h3 class="text-xl font-semibold mb-2">Types of Servers:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>Web Servers:</strong> Serve HTML, CSS, JavaScript files (e.g., Nginx, Apache)</li>
        <li><strong>Application Servers:</strong> Run business logic and process requests (e.g., Node.js, Django)</li>
        <li><strong>Database Servers:</strong> Store and manage data (e.g., MySQL, MongoDB)</li>
        <li><strong>File Servers:</strong> Store and serve files like images and videos</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Cloud vs. Physical:</h3>
      <p class="mb-4">Modern applications often use cloud servers (AWS, Google Cloud, Azure) which offer scalability, reliability, and pay-as-you-go pricing. Physical servers are still used for specific needs requiring maximum control.</p>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>Performance Metrics:</strong> Server performance is measured by CPU power, RAM, storage speed, network bandwidth, and response time.</p>
      </div>
    `
  },
  {
    id: 3,
    title: "APIs",
    summary: "Application Programming Interfaces (APIs) are communication protocols that allow different software systems to interact and exchange data. REST APIs use HTTP methods like GET, POST, PUT, and DELETE to perform operations and return structured data in JSON format. They act as bridges enabling applications to access features and information from other services seamlessly.",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: APIs (Application Programming Interfaces)</h2>
      <p class="mb-4">APIs are contracts that define how different software components communicate. They're the universal language that allows apps to talk to each other.</p>
      
      <h3 class="text-xl font-semibold mb-2">REST APIs:</h3>
      <p class="mb-4">The most common type, using HTTP methods:</p>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>GET:</strong> Retrieve data (e.g., fetch user profile)</li>
        <li><strong>POST:</strong> Create new data (e.g., submit a form)</li>
        <li><strong>PUT:</strong> Update existing data (e.g., edit profile)</li>
        <li><strong>DELETE:</strong> Remove data (e.g., delete account)</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Real-World Example:</h3>
      <p class="mb-4">When you check the weather on your phone, the app sends a request to a weather API, which responds with current conditions, forecasts, and alerts—all formatted in JSON.</p>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>API Design:</strong> Good APIs are consistent, well-documented, versioned, and return meaningful error messages. They make integration seamless for developers.</p>
      </div>
    `
  },
  {
    id: 4,
    title: "Database",
    summary: "Databases are organized systems for storing, managing, and retrieving data efficiently. SQL databases like PostgreSQL use structured tables with defined relationships, ideal for transactions and structured data. NoSQL databases like MongoDB offer flexible schemas and horizontal scalability, perfect for unstructured data and high-volume applications.",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Databases</h2>
      <p class="mb-4">Databases are organized collections of data that can be easily accessed, managed, and updated. They're the long-term memory of applications.</p>
      
      <h3 class="text-xl font-semibold mb-2">SQL Databases (Relational):</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>Structure:</strong> Data stored in tables with rows and columns</li>
        <li><strong>Relationships:</strong> Tables linked through foreign keys</li>
        <li><strong>Examples:</strong> PostgreSQL, MySQL, SQLite</li>
        <li><strong>Best For:</strong> Financial data, user accounts, structured information</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">NoSQL Databases (Non-Relational):</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>Structure:</strong> Flexible schemas (documents, key-value, graphs)</li>
        <li><strong>Scalability:</strong> Easier to scale horizontally</li>
        <li><strong>Examples:</strong> MongoDB, Redis, Cassandra</li>
        <li><strong>Best For:</strong> Social media posts, analytics, real-time data</li>
      </ul>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>ACID Properties:</strong> Good databases ensure Atomicity, Consistency, Isolation, and Durability—guaranteeing reliable transactions even during failures.</p>
      </div>
    `
  },
  {
    id: 5,
    title: "Authentication",
    summary: "Authentication verifies user identity (who you are) while authorization determines access permissions (what you can do). Modern systems use methods like password-based login, multi-factor authentication (MFA), OAuth 2.0 for social logins, and JWT tokens for session management. These security layers work together to protect applications and user data from unauthorized access.",
    thumbnail: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Authentication & Authorization</h2>
      <p class="mb-4">Authentication verifies "who you are," while authorization determines "what you can do." Together, they protect applications and user data.</p>
      
      <h3 class="text-xl font-semibold mb-2">Authentication Methods:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>Password-Based:</strong> Traditional username/password combination</li>
        <li><strong>Multi-Factor (MFA):</strong> Adding SMS codes, authenticator apps, or biometrics</li>
        <li><strong>OAuth 2.0:</strong> "Sign in with Google/Facebook" - delegated authentication</li>
        <li><strong>JWT Tokens:</strong> Encrypted tokens that prove identity without constant database lookups</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Security Best Practices:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Never store passwords in plain text (use bcrypt, Argon2)</li>
        <li>Implement rate limiting to prevent brute force attacks</li>
        <li>Use HTTPS to encrypt data in transit</li>
        <li>Set session timeouts and token expiration</li>
      </ul>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>Zero Trust Model:</strong> Modern security assumes no user or system is trustworthy by default—every access request must be verified.</p>
      </div>
    `
  },
  {
    id: 6,
    title: "Node.js & Express",
    summary: "Node.js enables JavaScript to run on servers, allowing developers to use one language for both frontend and backend. Express is a minimalist web framework that simplifies building web servers with routing, middleware, and HTTP utilities. Together, they provide non-blocking I/O architecture for handling thousands of concurrent connections, making them ideal for real-time applications.",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Node.js & Express</h2>
      <p class="mb-4">Node.js allows JavaScript to run on servers, not just browsers. Express is a minimalist framework that makes building web servers simple and fast.</p>
      
      <h3 class="text-xl font-semibold mb-2">Why Node.js?</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>JavaScript Everywhere:</strong> Use one language for frontend and backend</li>
        <li><strong>Non-Blocking I/O:</strong> Handle thousands of connections simultaneously</li>
        <li><strong>NPM Ecosystem:</strong> Access to millions of packages</li>
        <li><strong>Real-Time:</strong> Perfect for chat apps, live updates, streaming</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Express Framework:</h3>
      <p class="mb-4">Express provides routing, middleware support, and HTTP utilities. A simple server:</p>
      <pre class="bg-gray-100 p-4 rounded mb-4 text-sm overflow-x-auto">
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000);
      </pre>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>Middleware:</strong> Functions that process requests before they reach route handlers—used for logging, authentication, parsing data, and error handling.</p>
      </div>
    `
  },
  {
    id: 7,
    title: "Request-Response Cycle",
    summary: "The request-response cycle is the fundamental communication pattern where clients send HTTP requests to servers, which process them and return responses. This includes DNS lookup, routing, executing business logic, querying databases, and sending back data with HTTP status codes. Status codes like 200 indicate success, 404 means not found, and 500 signals server errors.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Request-Response Cycle</h2>
      <p class="mb-4">Every web interaction follows a predictable pattern: a client makes a request, the server processes it, and sends back a response.</p>
      
      <h3 class="text-xl font-semibold mb-2">The Cycle Steps:</h3>
      <ol class="list-decimal pl-6 mb-4 space-y-2">
        <li><strong>Client Request:</strong> Browser sends HTTP request (URL, method, headers, body)</li>
        <li><strong>DNS Lookup:</strong> Domain name converted to IP address</li>
        <li><strong>Server Receives:</strong> Request lands on server, routed to correct handler</li>
        <li><strong>Processing:</strong> Server runs business logic, queries database</li>
        <li><strong>Response:</strong> Server sends back status code, headers, and data</li>
        <li><strong>Rendering:</strong> Browser displays the response to user</li>
      </ol>
      
      <h3 class="text-xl font-semibold mb-2">HTTP Status Codes:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>200:</strong> Success</li>
        <li><strong>201:</strong> Created (resource successfully added)</li>
        <li><strong>400:</strong> Bad Request (invalid data sent)</li>
        <li><strong>401:</strong> Unauthorized (need to log in)</li>
        <li><strong>404:</strong> Not Found</li>
        <li><strong>500:</strong> Internal Server Error</li>
      </ul>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>Performance Tip:</strong> Minimize round trips by bundling requests, caching responses, and using CDNs for static assets.</p>
      </div>
    `
  },
  {
    id: 8,
    title: "Real-Time Systems",
    summary: "Real-time systems enable instant, bidirectional communication through persistent connections, unlike traditional request-response patterns. Technologies like WebSockets, Server-Sent Events (SSE), and Socket.io maintain open connections for live data streaming. These are essential for chat applications, collaborative editing, live scores, online gaming, and any application requiring immediate updates without constant polling.",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop",
    detailedContent: `
      <h2 class="text-2xl font-bold mb-4">Deep Dive: Real-Time Systems</h2>
      <p class="mb-4">Traditional HTTP is request-response: the client asks, the server answers. Real-time systems maintain persistent connections, enabling instant bidirectional communication.</p>
      
      <h3 class="text-xl font-semibold mb-2">Technologies:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>WebSockets:</strong> Full-duplex communication over a single TCP connection</li>
        <li><strong>Server-Sent Events (SSE):</strong> Uni-directional stream from server to client</li>
        <li><strong>Socket.io:</strong> Library that adds reliability and fallbacks to WebSockets</li>
        <li><strong>Polling/Long Polling:</strong> Older techniques that simulate real-time</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Use Cases:</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Chat applications (Slack, WhatsApp)</li>
        <li>Live sports scores and stock tickers</li>
        <li>Collaborative editing (Google Docs)</li>
        <li>Online gaming and multiplayer experiences</li>
        <li>Real-time notifications and alerts</li>
      </ul>
      
      <h3 class="text-xl font-semibold mb-2">Challenges:</h3>
      <p class="mb-4">Real-time systems must handle connection drops, message ordering, scaling across multiple servers, and managing thousands of simultaneous connections.</p>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-sm"><strong>Architecture:</strong> Production real-time systems often use message brokers (Redis, RabbitMQ) to coordinate updates across server clusters.</p>
      </div>
    `
  }
];
