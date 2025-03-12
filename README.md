![image](https://github.com/user-attachments/assets/673cf8b2-84e4-4e95-a036-f6d52f5fc8c6)


# Authentication
* **Authentication using express.js, Node.js, MongoDB, RestAPI, React.js**


## Database Matching Authentication (Register and Login User) Using Express and MongoDB Atlas

In this tutorial, we'll build a simple **user authentication system** using **Express.js** and **MongoDB Atlas**. The system will allow users to:
1. **Register** with a name, email, and password.
2. **Login** using their email and password.

We'll use **MongoDB Atlas** as the cloud database and **Joi** for input validation. Here's a step-by-step guide with explanations.

---

### Prerequisites
1. **Node.js** and **npm** installed.
2. A **MongoDB Atlas** account and cluster set up.
3. Basic knowledge of **Express.js** and **MongoDB**.

---

### Step 1: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. Create a new cluster and database.
3. Add a user with read/write access to the database.
4. Whitelist your IP address (or use `0.0.0.0/0` to allow all IPs for testing).
5. Get the connection string. It will look like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

---

### Step 2: Initialize the Project
1. Create a new project folder:
   ```bash
   mkdir auth-system
   cd auth-system
   ```
2. Initialize a Node.js project:
   ```bash
   npm init -y
   ```
3. Install required packages:
   ```bash
   npm install express mongoose joi dotenv bcryptjs jsonwebtoken cors
   ```
   - `express`: Web framework for Node.js.
   - `mongoose`: MongoDB ODM (Object Data Modeling) for Node.js.
   - `joi`: Input validation library.
   - `dotenv`: Load environment variables from a `.env` file.
   - `bcryptjs`: Hash passwords securely.
   - `jsonwebtoken`: Generate and verify JSON Web Tokens (JWT) for authentication.
   - `cors`: Enable Cross-Origin Resource Sharing.

---

### Step 3: Project Structure
```
auth-system/
├── config/
│   ├── app.config.js
│   ├── db.config.js
├── controller/
│   ├── auth.controller.js
├── middleware/
│   ├── auth.middleware.js
├── model/
│   ├── user.model.js
├── router/
│   ├── auth.routes.js
├── validation/
│   ├── schema.js
│   ├── validate.js
├── view/
│   ├── index.html
├── .env
├── app.js
├── index.js
```

---

### Step 4: Set Up Environment Variables
Create a `.env` file:
```
PORT=3000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```

---

### Step 5: Configure the Application

#### `config/app.config.js`
```javascript
require("dotenv").config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.MONGODB_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
```

#### `config/db.config.js`
```javascript
const mongoose = require("mongoose");
const config = require("./app.config");

const dbUrl = config.db.url;

mongoose
  .connect(dbUrl)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });
```

---

### Step 6: Define the User Model

#### `model/user.model.js`
```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
```

---

### Step 7: Set Up Input Validation

#### `validation/schema.js`
```javascript
const Joi = require("joi");

module.exports = {
  registerSchema: Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};
```

#### `validation/validate.js`
```javascript
const { registerSchema, loginSchema } = require("./schema");

exports.validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
```

---

### Step 8: Create Authentication Controller

#### `controller/auth.controller.js`
```javascript
const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/app.config");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

### Step 9: Set Up Routes

#### `router/auth.routes.js`
```javascript
const express = require("express");
const router = express.Router();
const { validateRegister, validateLogin } = require("../validation/validate");
const { register, login } = require("../controller/auth.controller");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
```

---

### Step 10: Set Up the Express App

#### `app.js`
```javascript
const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./router/auth.routes");
require("./config/db.config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

module.exports = app;
```

---

### Step 11: Start the Server

#### `index.js`
```javascript
require("dotenv").config();
const app = require("./app");
const config = require("./config/app.config");

const port = config.app.port;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

---

### Step 12: Test the Application
1. Start the server:
   ```bash
   node index.js
   ```
2. Use Postman or curl to test the endpoints:
   - **Register**: `POST http://localhost:3000/api/auth/register`
     ```json
     {
       "name": "John Doe",
       "email": "john.doe@example.com",
       "password": "password123"
     }
     ```
   - **Login**: `POST http://localhost:3000/api/auth/login`
     ```json
     {
       "email": "john.doe@example.com",
       "password": "password123"
     }
     ```

---

### Explanation
1. **Registration**:
   - The user provides a name, email, and password.
   - The password is hashed using `bcryptjs` before saving to the database.
   - If the email already exists, the server returns an error.

2. **Login**:
   - The user provides an email and password.
   - The server checks if the email exists and compares the hashed password.
   - If the credentials are valid, a JWT token is generated and returned.

3. **Validation**:
   - Joi is used to validate the input data before processing.

4. **Security**:
   - Passwords are hashed before storing in the database.
   - JWT tokens are used for secure authentication.


To encrypt sensitive data (e.g., passwords, emails) in a MongoDB database using Mongoose, you can use the **`mongoose-encryption`** plugin. This plugin automatically encrypts and decrypts fields in your Mongoose models.


***To test Encryption and Decrepection: [https://cryptii.com/](https://cryptii.com/)***

## **mongoose-encryption** to encrypt and decrypt data in your MongoDB database.

**To test Encryption and Decrepection: [https://cryptii.com/](https://cryptii.com/)**

#### Documentation mongoose-encryption: [https://www.npmjs.com/package/mongoose-encryption](https://www.npmjs.com/package/mongoose-encryption)

### Step 1: Install Required Packages
Install the `mongoose-encryption` package:
```bash
npm install mongoose-encryption
```

---

### Step 2: Set Up Mongoose Encryption

#### 1. Define Your Mongoose Schema
Create a Mongoose schema as usual. For example, let's create a `User` schema with sensitive fields like `email` and `password`.

#### `model/user.model.js`
```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
```

---

#### 2. Add Encryption to the Schema
Use the `mongoose-encryption` plugin to encrypt and decrypt the `email` and `password` fields.

#### `model/user.model.js` (Updated)
```javascript
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add encryption plugin
const encryptionKey = process.env.ENCRYPTION_KEY; // 32-character string
const signingKey = process.env.SIGNING_KEY; // 64-character string

userSchema.plugin(encrypt, {
  encryptionKey: encryptionKey,
  signingKey: signingKey,
  encryptedFields: ["email", "password"], // Fields to encrypt
});

module.exports = mongoose.model("User", userSchema);
```

---

#### 3. Set Up Environment Variables
Store the encryption and signing keys in a `.env` file. These keys should be long, random strings:
- `ENCRYPTION_KEY`: A 32-character string (for AES-256 encryption).
- `SIGNING_KEY`: A 64-character string (for HMAC-SHA512 signing).

#### `.env`
```
ENCRYPTION_KEY=32characterlongencryptionkey1234567890
SIGNING_KEY=64characterlongsigningkey12345678901234567890123456789012345678901234
```

---

#### 4. Load Environment Variables
Use the `dotenv` package to load environment variables from the `.env` file.

#### `config/app.config.js`
```javascript
require("dotenv").config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.MONGODB_URL,
  },
  encryption: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    signingKey: process.env.SIGNING_KEY,
  },
};
```

---

### Step 3: Use the Encrypted Model
Now, when you save a document using the `User` model, the `email` and `password` fields will be automatically encrypted. When you retrieve the document, the fields will be automatically decrypted.

#### Example: Register a User
```javascript
const User = require("./model/user.model");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Create a new user
    const newUser = new User({ name, email, password });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

### Step 4: Verify Encryption
1. Start your server and register a user using the `/register` endpoint.
2. Check the MongoDB Atlas database. The `email` and `password` fields should be encrypted (unreadable).
3. Retrieve the user using the `User` model. The `email` and `password` fields should be automatically decrypted.

---

### Step 5: Decrypt Data Manually (Optional)
If you need to decrypt data manually (e.g., for debugging), you can use the `mongoose-encryption` plugin's `decrypt` method.

#### Example: Decrypt a User Document
```javascript
const User = require("./model/user.model");

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // Manually decrypt the document
    user.decrypt();

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

### Step 6: Rotate Encryption Keys (Optional)
If you need to change the encryption or signing keys, you can use the `rotateKey` method provided by `mongoose-encryption`.

#### Example: Rotate Keys
```javascript
const User = require("./model/user.model");

const rotateKeys = async () => {
  const newEncryptionKey = "new32characterlongencryptionkey1234567890";
  const newSigningKey = "new64characterlongsigningkey12345678901234567890123456789012345678901234";

  await User.rotateKey(newEncryptionKey, newSigningKey);
  console.log("Encryption keys rotated successfully");
};

rotateKeys();
```

---

### Notes
1. **Security**:
   - Keep your encryption and signing keys secure. Never hardcode them in your code.
   - Use environment variables or a secrets management tool.

2. **Performance**:
   - Encryption and decryption add overhead to database operations. Use it only for sensitive fields.

3. **Backup**:
   - Always back up your encryption keys. If you lose them, you won't be able to decrypt your data.

4. **Alternatives**:
   - For more advanced use cases, consider using **MongoDB Client-Side Field Level Encryption** or a dedicated encryption library like `crypto`.

---


Hashing passwords is a critical step in securing user data. While **MD5** is a hashing algorithm, it is **not recommended** for password hashing because it is **cryptographically broken** and vulnerable to attacks like rainbow table attacks. Instead, you should use a modern, secure hashing algorithm like **bcrypt**, **Argon2**, or **PBKDF2**.

However, if you still want to learn how to hash passwords using MD5 (for educational purposes only), I'll provide a tutorial. After that, I'll show you how to use **bcrypt**, which is the recommended approach.

---

### Hashing Passwords Using MD5

#### Documentation: [https://www.npmjs.com/package/md5](https://www.npmjs.com/package/md5)

#### Step 1: Install the `md5` Package
Install the `md5` package from npm:
```bash
npm install md5
```

---

#### Step 2: Hash a Password Using MD5
Here’s how you can hash a password using MD5:

```javascript
const md5 = require("md5");

const password = "password123";
const hashedPassword = md5(password);

console.log("Hashed Password:", hashedPassword);
```

**Output**:
```
Hashed Password: 482c811da5d5b4bc6d497ffa98491e38
```

---

#### Step 3: Store the Hashed Password in the Database
When a user registers, hash their password and store the hashed value in the database.

```javascript
const md5 = require("md5");
const mongoose = require("mongoose");

// Define a User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // Store the hashed password
});

const User = mongoose.model("User", userSchema);

// Register a new user
const registerUser = async (name, email, password) => {
  const hashedPassword = md5(password); // Hash the password

  const newUser = new User({
    name,
    email,
    password: hashedPassword, // Store the hashed password
  });

  await newUser.save();
  console.log("User registered successfully");
};

// Example usage
registerUser("John Doe", "john.doe@example.com", "password123");
```

---

#### Step 4: Verify the Password During Login
When a user logs in, hash the provided password and compare it with the stored hashed password.

```javascript
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    console.log("User not found");
    return;
  }

  const hashedPassword = md5(password); // Hash the provided password

  if (hashedPassword === user.password) {
    console.log("Login successful");
  } else {
    console.log("Invalid password");
  }
};

// Example usage
loginUser("john.doe@example.com", "password123");
```

---
### Why MD5 is Not Recommended for Password Hashing
1. **Vulnerable to Attacks**:
   - MD5 is susceptible to **rainbow table attacks** and **collision attacks**.
   - Attackers can easily reverse-engineer MD5 hashes using precomputed tables.

2. **No Salting**:
   - MD5 does not support **salting**, which makes it easier for attackers to crack passwords.

3. **Outdated**:
   - MD5 is considered cryptographically broken and is no longer secure for password hashing.

---



### Final Notes
- **Never use MD5** for password hashing in production applications.
- Always use **bcrypt**, **Argon2**, or **PBKDF2** for secure password hashing.
- Store only the hashed password in the database. Never store plain-text passwords.


**Salting and hashing** are essential techniques for securely storing passwords. They protect user passwords from being easily cracked, even if the database is compromised. Here's a detailed explanation of salting and hashing, along with a tutorial on how to implement them using **bcrypt**.

---

### What is Hashing?
- **Hashing** is a one-way process that converts a plain-text password into a fixed-length string of characters (a hash).
- The same input will always produce the same hash, but it is computationally infeasible to reverse the process (i.e., you cannot retrieve the original password from the hash).

---

### What is Salting?
- **Salting** adds a random string (called a "salt") to the password before hashing it.
- The salt ensures that even if two users have the same password, their hashes will be different.
- Salting protects against **rainbow table attacks**, where attackers use precomputed tables of hashes to crack passwords.

---

### Why Use Salting and Hashing?
1. **Prevent Rainbow Table Attacks**:
   - Salting ensures that each password hash is unique, even if the passwords are the same.

2. **Slow Down Brute-Force Attacks**:
   - Hashing algorithms like bcrypt are computationally expensive, making brute-force attacks slower.

3. **Protect User Data**:
   - Even if the database is compromised, attackers cannot easily retrieve the original passwords.

---

### Salting and Hashing Passwords Using bcrypt

#### Documentation: [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)

#### Step 1: Install bcrypt
Install the `bcrypt` package from npm:
```bash
npm install bcrypt
```

---

#### Step 2: Hash a Password with a Salt
Here’s how you can hash a password with a salt using bcrypt:

```javascript
const bcrypt = require("bcrypt");

const password = "password123";
const saltRounds = 10; // Number of salt rounds (higher is more secure but slower)

// Generate a salt and hash the password
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Hashed Password:", hash);
});
```

**Output**:
```
Hashed Password: $2b$10$3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3O
```

- The `hash` includes both the salt and the hashed password.
- The `saltRounds` parameter determines the computational cost of hashing (higher values are more secure but slower).

---

#### Step 3: Store the Hashed Password in the Database
When a user registers, hash their password and store the hashed value in the database.

```javascript
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Define a User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // Store the hashed password
});

const User = mongoose.model("User", userSchema);

// Register a new user
const registerUser = async (name, email, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password

  const newUser = new User({
    name,
    email,
    password: hashedPassword, // Store the hashed password
  });

  await newUser.save();
  console.log("User registered successfully");
};

// Example usage
registerUser("John Doe", "john.doe@example.com", "password123");
```

---

#### Step 4: Verify the Password During Login
When a user logs in, compare the provided password with the stored hashed password using `bcrypt.compare`.

```javascript
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    console.log("User not found");
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password); // Compare passwords

  if (isMatch) {
    console.log("Login successful");
  } else {
    console.log("Invalid password");
  }
};

// Example usage
loginUser("john.doe@example.com", "password123");
```

---

### How bcrypt Works
1. **Hashing**:
   - bcrypt hashes the password using a salt and a cost factor.
   - The salt is automatically generated and included in the hash.

2. **Verification**:
   - When verifying a password, bcrypt extracts the salt from the stored hash and uses it to hash the provided password.
   - It then compares the two hashes.

---

### Example: Full Implementation

#### `model/user.model.js`
```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // Store the hashed password
});

module.exports = mongoose.model("User", userSchema);
```

#### `controller/auth.controller.js`
```javascript
const bcrypt = require("bcrypt");
const User = require("../model/user.model");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### `router/auth.routes.js`
```javascript
const express = require("express");
const router = express.Router();
const { register, login } = require("../controller/auth.controller");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
```

#### `app.js`
```javascript
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./router/auth.routes");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

### Testing the Application
1. Start the server:
   ```bash
   node app.js
   ```
2. Use Postman or curl to test the endpoints:
   - **Register**: `POST http://localhost:3000/api/auth/register`
     ```json
     {
       "name": "John Doe",
       "email": "john.doe@example.com",
       "password": "password123"
     }
     ```
   - **Login**: `POST http://localhost:3000/api/auth/login`
     ```json
     {
       "email": "john.doe@example.com",
       "password": "password123"
     }
     ```

---

### Conclusion
- **Salting and hashing** are essential for securely storing passwords.
- **bcrypt** is a recommended library for salting and hashing passwords in Node.js.
- Always use secure algorithms like bcrypt, Argon2, or PBKDF2 for password hashing.


Authentication is a critical part of modern web applications, and there are two primary approaches to managing user authentication: **session-based authentication** and **token-based authentication**. Each has its own advantages, disadvantages, and use cases. Below is a detailed comparison of the two, along with explanations and examples.

---

## **Session-Based Authentication**

### How It Works
1. **Login**:
   - The user submits their credentials (e.g., username and password) to the server.
   - The server verifies the credentials and creates a **session** for the user.
   - The session ID is stored in the server's memory (or a database like Redis) and sent to the client as a **cookie**.

2. **Subsequent Requests**:
   - The client sends the session ID (cookie) with every request.
   - The server validates the session ID and retrieves the user's data from the session store.

3. **Logout**:
   - The server destroys the session, and the client's cookie becomes invalid.

---

### Example: Session-Based Authentication in Express.js

#### Install Required Packages
```bash
npm install express express-session
```

#### Code Example
```javascript
const express = require("express");
const session = require("express-session");

const app = express();

// Configure session middleware
app.use(
  session({
    secret: "your_secret_key", // Secret key to sign the session ID
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate credentials (dummy check for demonstration)
  if (username === "admin" && password === "password123") {
    req.session.user = { username }; // Store user data in the session
    res.send("Login successful");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Protected route
app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.send(`Welcome, ${req.session.user.username}`);
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.send("Logout successful");
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

---

### Advantages of Session-Based Authentication
1. **Simplicity**:
   - Easy to implement and understand.
2. **Automatic Cookie Handling**:
   - Browsers automatically handle cookies, so no extra client-side logic is needed.
3. **Server-Side Control**:
   - Sessions can be easily invalidated on the server.

---

### Disadvantages of Session-Based Authentication
1. **Scalability Issues**:
   - Sessions are stored in server memory (or a database), which can become a bottleneck for large-scale applications.
2. **Cross-Origin Issues**:
   - Cookies are tied to a specific domain, making it difficult to use in distributed systems or microservices.
3. **Stateful**:
   - The server must maintain session state, which complicates horizontal scaling.

---

## **Token-Based Authentication**

### How It Works
1. **Login**:
   - The user submits their credentials to the server.
   - The server verifies the credentials and generates a **JSON Web Token (JWT)**.
   - The JWT is sent to the client and stored (e.g., in localStorage or a cookie).

2. **Subsequent Requests**:
   - The client sends the JWT in the `Authorization` header (e.g., `Bearer <token>`).
   - The server validates the JWT and retrieves the user's data from the token payload.

3. **Logout**:
   - The client deletes the token. Since JWTs are stateless, the server does not need to do anything.

---

### Example: Token-Based Authentication in Express.js

#### Install Required Packages
```bash
npm install express jsonwebtoken
```

#### Code Example
```javascript
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET_KEY = "your_secret_key"; // Secret key for signing JWTs

app.use(express.json());

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate credentials (dummy check for demonstration)
  if (username === "admin" && password === "password123") {
    // Create a JWT
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from header

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid token");
    }
    req.user = user; // Attach user data to the request
    next();
  });
};

// Protected route
app.get("/profile", authenticateToken, (req, res) => {
  res.send(`Welcome, ${req.user.username}`);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

---

### Advantages of Token-Based Authentication
1. **Stateless**:
   - JWTs are self-contained, so the server does not need to store session data.
2. **Scalability**:
   - Ideal for distributed systems and microservices.
3. **Cross-Origin Support**:
   - Tokens can be used across different domains and platforms.
4. **Flexibility**:
   - Tokens can store additional data (e.g., roles, permissions) in the payload.

---

### Disadvantages of Token-Based Authentication
1. **Token Size**:
   - JWTs can be larger than session IDs, increasing bandwidth usage.
2. **Security Risks**:
   - If a token is stolen, it can be used until it expires. Proper measures (e.g., HTTPS, short expiration times) are required.
3. **Complexity**:
   - Requires additional client-side logic to store and send tokens.

---

## **Session vs Token-Based Authentication: Key Differences**

| Feature                  | Session-Based Authentication          | Token-Based Authentication          |
|--------------------------|--------------------------------------|-------------------------------------|
| **State**                | Stateful (server stores session data) | Stateless (token contains all data) |
| **Storage**              | Server-side (memory or database)     | Client-side (localStorage, cookies) |
| **Scalability**          | Harder to scale                      | Easier to scale                     |
| **Cross-Origin Support** | Limited (cookies are domain-specific)| Works across domains                |
| **Security**             | Easier to invalidate sessions        | Tokens are valid until expiration   |
| **Use Case**             | Traditional web applications         | SPAs, mobile apps, microservices    |

---

## **When to Use Which?**

### Use **Session-Based Authentication** if:
- You are building a traditional web application with server-side rendering.
- You need to easily invalidate sessions (e.g., on logout).
- You are not concerned about scalability issues.

### Use **Token-Based Authentication** if:
- You are building a Single Page Application (SPA), mobile app, or microservices architecture.
- You need cross-origin support or stateless authentication.
- You want to scale horizontally.

---

## **Conclusion**
- **Session-based authentication** is simple and works well for traditional web applications.
- **Token-based authentication** is more flexible and scalable, making it ideal for modern applications.

Both approaches have their place, and the choice depends on your application's requirements. Let me know if you need further clarification or examples!


## Passport.js with Express.js

Using Passport.js with Express.js for user authentication.

**I. Introduction to Passport.js**

*   Passport.js is middleware for Node.js that simplifies authentication.
*   It supports various authentication strategies (Local, Google, Facebook, etc.).
*   It's designed to be modular and easy to integrate into Express.js applications.

**II. Key Concepts**

*   **Strategies:** Authentication methods (e.g., LocalStrategy for username/password).
*   **Serialization:** Storing user information in the session (usually just the user ID).
*   **Deserialization:** Retrieving the full user object from the session (using the ID).
*   **Middleware:** Functions that run before your route handlers to check authentication.

**III. Setting up Passport.js**

1.  **Install Dependencies:**
    ```bash
    npm install passport passport-local express express-session bcrypt joi  // Add other strategies as needed
    ```

2.  **Require Modules:**
    ```javascript
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const bcrypt = require('bcrypt'); // For password hashing
    const session = require('express-session');
    const Joi = require('joi'); // For validation
    ```

3.  **Express.js Setup:**
    ```javascript
    const express = require('express');
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Session Configuration (Important!)
    app.use(session({
      secret: 'your_secret_key', // Replace with a strong secret
      resave: false,
      saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    ```

**IV. Defining a Strategy (Local Strategy Example)**

```javascript
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username }); // Find user in DB
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password); // Compare hashed passwords
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user); // Success! Pass the user object
    } catch (err) {
      return done(err);
    }
  }
));
```

**V. Serialization and Deserialization**

```javascript
passport.serializeUser((user, done) => {
  done(null, user.id); // Store the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Retrieve user from DB based on ID
    done(null, user);
  } catch (err) {
    done(err);
  }
});
```

**VI. Routes and Middleware**

1.  **Login Route (POST):**
    ```javascript
    app.post('/login',
      passport.authenticate('local', {
        failureRedirect: '/login', // Redirect on failure
        failureFlash: true // Use flash messages for errors (optional)
      }),
      (req, res) => {
        res.redirect('/dashboard'); // Redirect on success
      }
    );
    ```

2.  **Protected Routes:**
    ```javascript
    function isAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next(); // User is logged in, proceed
      }
      res.redirect('/login'); // Redirect to login if not authenticated
    }

    app.get('/dashboard', isAuthenticated, (req, res) => {
      res.render('dashboard', { user: req.user }); // Access user via req.user
    });
    ```

3.  **Logout Route:**
    ```javascript
    app.get('/logout', (req, res) => {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
    });
    ```

**VII. User Registration**

*   Use bcrypt to hash passwords *before* storing them in the database.
*   Validate user input (e.g., using Joi) to prevent invalid data.

```javascript
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

app.post('/register', async (req, res) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { username, password } = value;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ username, password: hashedPassword }); // Store the hash

    try {
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user');
    }
});
```

**VIII. Important Considerations**

*   **Security:** Never store passwords in plain text. Always hash them using bcrypt.
*   **Session Management:** Use `express-session` to manage user sessions securely.  Set a strong, random secret.
*   **Error Handling:** Implement proper error handling to prevent crashes and provide informative messages.
*   **Database:** Choose a database (MongoDB, PostgreSQL, etc.) and set up your user model.
*   **Validation:** Always validate user input to prevent vulnerabilities.

**IX. Example Folder Structure**

```
- server.js      // Main application file
- routes/        // Route handlers
- models/        // Database models
- views/         // EJS templates
- public/        // Static files (CSS, JS)
```


### Algorithm Passport.js with code

```javascript
// server.js (Main Express app)
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Joi = require('joi'); // For validation
const mongoose = require('mongoose'); // If using MongoDB

const app = express();
const port = 3000;

// Database Connection (Example with MongoDB)
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


// Define User Schema (Mongoose example)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);


// Validation Schema (Joi)
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});


// Middleware
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.json());
app.use(express.static('public')); // Serve static files (CSS, JS)
app.set('view engine', 'ejs'); // Set EJS as the view engine

// Session Configuration (Important for Passport.js)
app.use(session({
  secret: 'your_secret_key', // Change this to a random, strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport.js Configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user }); // Pass user data to the view
});

app.get('/register', (req, res) => {
  res.render('register', { errors: {} }); // Initialize empty errors object
});

app.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.render('register', { errors: error.details });
    }

    const { username, email, password } = value;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { errors: [{ message: 'An error occurred during registration.' }] });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') }); // Display flash message
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true // Enable flash messages for errors
}), (req, res) => {
  res.redirect('/dashboard'); // Redirect on successful login
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

```

**EJS Templates (Examples):**

*   **register.ejs:**

```html
<h1>Register</h1>
<% if (errors && errors.length > 0) { %>
  <ul class="errors">
    <% errors.forEach(error => { %>
      <li><%= error.message %></li>
    <% }); %>
  </ul>
<% } %>
<form action="/register" method="post">
  <input type="text" name="username" placeholder="Username" required><br>
  <input type="email" name="email" placeholder="Email" required><br>
  <input type="password" name="password" placeholder="Password" required><br>
  <button type="submit">Register</button>
</form>
```

*   **login.ejs:**

```html
<h1>Login</h1>
<% if (message) { %>
  <p class="error"><%= message %></p>
<% } %>
<form action="/login" method="post">
  <input type="text" name="username" placeholder="Username" required><br>
  <input type="password" name="password" placeholder="Password" required><br>
  <button type="submit">Login</button>
</form>
```

*   **dashboard.ejs:**

```html
<h1>Dashboard</h1>
<% if (user) { %>
  <p>Welcome, <%= user.username %>!</p>
  <a href="/logout">Logout</a>
<% } else { %>
  <p>You are not logged in.</p>
  <a href="/login">Login</a>
<% } %>
```

**Key Points and Explanations:**

1.  **Dependencies:** Make sure you install the required packages: `npm install express express-session passport passport-local bcrypt joi mongoose ejs`

2.  **Database Connection:** The code includes an example of connecting to MongoDB using Mongoose. Adapt this to your database (e.g., PostgreSQL, MySQL).

3.  **User Model:** The `User` model defines the structure of your user data in the database.

4.  **Validation:** Joi is used to validate user input during registration. This helps prevent bad data from entering your database.

5.  **Password Hashing:** bcrypt is *essential* for securely storing passwords.  Never store passwords in plain text.

6.  **Passport.js Strategy:** The `LocalStrategy` handles username/password authentication.

7.  **Serialization/Deserialization:** These functions are crucial for managing user sessions.  We store the user ID in the session and retrieve the full user object from the database when needed.

8.  **Routes:** The code defines routes for registration, login, dashboard, and logout.

9.  **Middleware:** The `isAuthenticated` middleware protects routes that require authentication.

10. **EJS Templates:** The EJS templates provide basic HTML structure for the pages.  You'll need to create these files.

11. **Error Handling:** The example includes some basic error handling, but you'll want to add more robust error handling in a production application.

12. **Flash Messages:** The code uses `connect-flash` (install it: `npm install connect-flash`) to display error messages on the login page.  You'll need to configure flash messages in your Express app.  I've added `failureFlash: true` to the `passport.authenticate` call.


---

### **Algorithm for Passport Local Authentication Project**

#### **1. Setup the Project**
1. **Initialize the Project**:
   - Create a new directory for your project.
   - Run `npm init -y` to initialize a `package.json` file.

2. **Install Dependencies**:
   - Install the required packages:
     ```bash
     npm install express passport passport-local mongoose bcrypt ejs connect-flash express-session connect-mongo
     ```
   - Install `nodemon` as a dev dependency:
     ```bash
     npm install --save-dev nodemon
     ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add environment variables:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/userAuthDB
     SESSION_SECRET=your-secret-key
     ```

4. **Configure `nodemon`**:
   - Add a `start` script to `package.json`:
     ```json
     "scripts": {
       "start": "nodemon index.js"
     }
     ```

---

#### **2. Project Structure**
The project structure is as follows:
```
project-root/
│
├── config/
│   ├── database.js
│   └── passport.js
│
├── views/
│   ├── layout/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── profile.ejs
│
├── app.js
├── index.js
├── .env
└── .gitignore
```

---

#### **3. Configure MongoDB Connection**
1. **Set Up MongoDB Connection**:
   - In `config/database.js`, connect to MongoDB using Mongoose:
     ```javascript
     const mongoose = require("mongoose");

     mongoose
       .connect("mongodb://localhost:27017/userAuthDB")
       .then(() => {
         console.log(`MongoDB connected successfully`);
       })
       .catch((err) => {
         console.log(`MongoDB connection error: ${err}`);
       });

     const userSchema = mongoose.Schema({
       name: String,
       email: String,
       password: String,
     });

     const Users = mongoose.model("user", userSchema);

     module.exports = Users;
     ```

---

#### **4. Configure Passport Local Strategy**
1. **Set Up Passport**:
   - In `config/passport.js`, configure the local strategy:
     ```javascript
     const passport = require("passport");
     const LocalStrategy = require("passport-local").Strategy;
     const userModel = require("./database");
     const bcrypt = require("bcrypt");

     passport.use(
       new LocalStrategy(
         {
           usernameField: "email",
           passwordField: "password",
           passReqToCallback: true,
         },
         async (req, email, password, done) => {
           try {
             const user = await userModel.findOne({ email: email });
             if (!user) {
               return done(null, false, req.flash("error", "Invalid email"));
             }
             const isMatched = await bcrypt.compare(password, user.password);
             if (!isMatched) {
               return done(null, false, req.flash("error", "Invalid password"));
             }
             return done(null, user);
           } catch (err) {
             return done(err);
           }
         }
       )
     );

     passport.serializeUser(function (user, done) {
       done(null, user.id);
     });

     passport.deserializeUser(async function (id, done) {
       try {
         const user = await userModel.findById(id);
         done(null, user);
       } catch (err) {
         done(err);
       }
     });
     ```

---

#### **5. Configure Express App**
1. **Set Up Express**:
   - In `app.js`, configure Express, session, and Passport:
     ```javascript
     const express = require("express");
     const userModel = require("./config/database");
     const passport = require("passport");
     const bcrypt = require("bcrypt");
     const saltRounds = 10;
     const app = express();
     require("./config/passport");

     const flash = require("connect-flash");
     const session = require("express-session");
     const MongoStore = require("connect-mongo");

     app.set("view engine", "ejs");
     app.use(express.urlencoded({ extended: true }));

     app.set("trust proxy", 1); // trust first proxy
     app.use(
       session({
         secret: "keyboard cat",
         resave: false,
         saveUninitialized: true,
         store: MongoStore.create({
           mongoUrl: "mongodb://localhost:27017/userAuthDB",
           collectionName: "sessions",
         }),
         cookie: { maxAge: 1000 * 60 * 60 * 24 },
       })
     );

     app.use(flash());
     app.use(passport.initialize());
     app.use(passport.session());

     // Make flash messages available in views
     app.use((req, res, next) => {
       res.locals.error = req.flash("error"); // Pass error messages to views
       next();
     });

     // Routes
     app.get("/", (req, res) => {
       res.render("home");
     });

     app.get("/register", (req, res) => {
       res.render("register");
     });

     app.get("/login", (req, res) => {
       res.render("login", { error: req.flash("error") });
     });

     app.post(
       "/login",
       passport.authenticate("local", {
         successRedirect: "profile",
         failureRedirect: "login",
         failureFlash: true,
       })
     );

     app.get("/profile", ensureAuthenticated, (req, res) => {
       res.render("profile", { user: req.user });
     });

     app.get("/logout", (req, res) => {
       req.logout((err) => {
         if (err) {
           return res.status(500).json({ message: "Logout failed", error: err });
         }
         req.session.destroy((err) => {
           if (err) {
             return res
               .status(500)
               .json({ message: "Session destruction failed", error: err });
           }
           res.redirect("/");
         });
       });
     });

     app.post("/register", (req, res) => {
       const { name, email, password } = req.body;
       bcrypt.hash(password, saltRounds, async function (err, hash) {
         const newUser = new userModel({
           name: name,
           email: email,
           password: hash,
         });
         const saveUser = await newUser.save();
         res.render("login");
       });
     });

     const ensureAuthenticated = (req, res, next) => {
       if (req.isAuthenticated()) {
         return next();
       }
       res.redirect("/login");
     };

     module.exports = app;
     ```

---

#### **6. Create Views**
1. **Set Up EJS Templates**:
   - Create `views/layout/header.ejs`, `views/layout/footer.ejs`, `views/home.ejs`, `views/login.ejs`, `views/register.ejs`, and `views/profile.ejs` as per your provided code.

---

#### **7. Start the Server**
1. **Run the Application**:
   - In `index.js`, start the server:
     ```javascript
     const app = require("./app");
     const port = 3000;

     app.listen(port, () => {
       console.log(`Server is running at http://localhost:${port}`);
     });
     ```

2. **Start the Server**:
   - Run the following command:
     ```bash
     npm start
     ```

---

### **Flow of the Application**
1. **User Registration**:
   - User visits `/register` and submits the registration form.
   - Password is hashed using `bcrypt` and stored in MongoDB.
   - User is redirected to the login page.

2. **User Login**:
   - User visits `/login` and submits the login form.
   - Passport authenticates the user using the local strategy.
   - If successful, the user is redirected to the profile page.
   - If failed, an error message is displayed.

3. **User Profile**:
   - Authenticated users can access `/profile`.
   - Unauthenticated users are redirected to the login page.

4. **User Logout**:
   - User clicks the logout link.
   - Session is destroyed, and the user is redirected to the home page.

---

This algorithm provides a clear flow of the application and how the components interact.


## Project for **Google OAuth2.0 authentication** 

---

### **Project Setup**

#### **1. Install Dependencies**
Run the following command to install the required packages:

```bash
npm install express express-session passport passport-google-oauth20 mongoose connect-mongo ejs dotenv
```

Install `nodemon` as a dev dependency:

```bash
npm install --save-dev nodemon
```

---

#### **2. Project Structure**
```
project-root/
│
├── config/
│   ├── passport.js
│   └── database.js
│
├── models/
│   └── User.js
│
├── views/
│   ├── home.ejs
│   ├── profile.ejs
│   └── layout/
│       ├── header.ejs
│       └── footer.ejs
│
├── .env
├── app.js
├── index.js
└── .gitignore
```

---

#### **3. Environment Variables**
Create a `.env` file and add the following:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/googleAuthDB
SESSION_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

#### **4. Configure MongoDB Connection**
In `config/database.js`:

```javascript
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = mongoose;
```

---

#### **5. Create User Model**
In `models/User.js`:

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
});

module.exports = mongoose.model("User", userSchema);
```

---

#### **6. Configure Passport Google Strategy**
In `config/passport.js`:

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
```

---

#### **7. Configure Express App**
In `app.js`:

```javascript
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const mongoose = require("./config/database");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Set up EJS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.render("profile", { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

module.exports = app;
```

---

#### **8. Create Views**
1. **`views/layout/header.ejs`**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Google OAuth</title>
   </head>
   <body>
     <header>
       <a href="/">Home</a>
       <% if (user) { %>
         <a href="/profile">Profile</a>
         <a href="/logout">Logout</a>
       <% } else { %>
         <a href="/auth/google">Login with Google</a>
       <% } %>
     </header>
   ```

2. **`views/layout/footer.ejs`**:
   ```html
   <footer>
     <p>&copy; 2023 Google OAuth Project</p>
   </footer>
   </body>
   </html>
   ```

3. **`views/home.ejs`**:
   ```html
   <%- include("layout/header") %>
   <main>
     <h1>Welcome to Google OAuth</h1>
     <% if (user) { %>
       <p>Hello, <%= user.displayName %>!</p>
     <% } else { %>
       <p>Please log in to continue.</p>
     <% } %>
   </main>
   <%- include("layout/footer") %>
   ```

4. **`views/profile.ejs`**:
   ```html
   <%- include("layout/header") %>
   <main>
     <h1>Profile Page</h1>
     <p>Name: <%= user.displayName %></p>
     <p>Email: <%= user.email %></p>
   </main>
   <%- include("layout/footer") %>
   ```

---

#### **9. Start the Server**
In `index.js`:

```javascript
const app = require("./app");
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

---

### **Project Algorithm**

#### **1. User Visits Home Page**
- User accesses `/`.
- If authenticated, display user details.
- If not authenticated, show a login link.

#### **2. User Clicks "Login with Google"**
- User is redirected to Google's OAuth consent screen.
- After granting access, Google redirects to `/auth/google/callback`.

#### **3. Passport Authenticates User**
- Passport verifies the user using the Google OAuth2.0 strategy.
- If the user exists in the database, log them in.
- If the user doesn't exist, create a new user in the database.

#### **4. User Redirected to Profile Page**
- After successful authentication, the user is redirected to `/profile`.
- The profile page displays the user's details (name, email).

#### **5. User Logs Out**
- User clicks the "Logout" link.
- Session is destroyed, and the user is redirected to the home page.

---

### **Run the Project**
1. Start MongoDB:
   ```bash
   mongod
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Visit `http://localhost:3000` in your browser.

---

This project provides a simple implementation of Google OAuth2.0 authentication.

## MERN Project using `passport-JWT`
### Creating a MERN (MongoDB, Express, React, Node.js) project using **Passport-JWT** for authentication involves setting up a backend with JWT-based authentication and a frontend (React) to interact with it. Below is a step-by-step guide with code for implementing a MERN project using **Passport-JWT**.

---

### **1. Project Structure**
Here’s the structure of the project:

```
mern-passport-jwt/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   ├── models/
│   │   ├── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   ├── .env
│   ├── app.js
│   ├── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   ├── index.js
│   ├── package.json
├── package.json
```

---

### **2. Backend Setup**

### **Step 1: Install Dependencies**
Navigate to the `backend` folder and install the required packages:

```bash
cd backend
npm install express mongoose bcryptjs jsonwebtoken passport passport-jwt dotenv cors
```

---

### **Step 2: Configure Environment Variables**
Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_passport_jwt
JWT_SECRET=your_jwt_secret_key
```

---

### **Step 3: Set Up MongoDB Connection**
Create `config/database.js`:

```javascript
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

### **Step 4: Configure Passport-JWT**
Create `config/passport.js`:

```javascript
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
```

---

### **Step 5: Create User Model**
Create `models/User.js`:

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
```

---

### **Step 6: Create Auth Controller**
Create `controllers/authController.js`:

```javascript
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register User
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({ username, password });
    await user.save();

    // Generate JWT
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Protected Route
exports.profile = (req, res) => {
  res.json({ user: req.user });
};
```

---

### **Step 7: Set Up Routes**
Create `routes/authRoutes.js`:

```javascript
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected Route
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  authController.profile
);

module.exports = router;
```

---

### **Step 8: Set Up Express App**
Create `app.js`:

```javascript
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);

module.exports = app;
```

---

### **Step 9: Start the Server**
Create `server.js`:

```javascript
const app = require("./app");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### **3. Run the Project**
Start the backend server:
   ```bash
   cd backend
   npm start
   ```




### **Frontend Algorithm**
1. **User Registration**:
   - Collect username and password from the user.
   - Send a POST request to `/api/auth/register` to create a new user.
   - Store the JWT token returned from the backend in local storage or cookies.

2. **User Login**:
   - Collect username and password from the user.
   - Send a POST request to `/api/auth/login` to authenticate the user.
   - Store the JWT token returned from the backend in local storage or cookies.

3. **Access Protected Routes**:
   - Retrieve the JWT token from local storage or cookies.
   - Include the token in the `Authorization` header for requests to protected routes (e.g., `/api/auth/profile`).

4. **Logout**:
   - Remove the JWT token from local storage or cookies.

---

## **Frontend Code**

### **Step 1: Project Structure**
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Register.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   ├── Navbar.js
│   ├── App.js
│   ├── index.js
│   ├── App.css
│   ├── index.css
│   ├── utils/
│   │   ├── api.js
├── package.json
```

---

### **Step 2: Install Dependencies**
Navigate to the `frontend` folder and install the required packages:

```bash
cd frontend
npm install axios react-router-dom
```

---

### **Step 3: Create Utility for API Calls**
Create `src/utils/api.js` to handle API requests:

```javascript
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Register user
export const register = async (username, password) => {
  const response = await axios.post(`${API_URL}/register`, { username, password });
  return response.data;
};

// Login user
export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data;
};

// Get user profile
export const getProfile = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
```

---

### **Step 4: Create React Components**

#### **1. Register Component**
Create `src/components/Register.js`:

```javascript
import React, { useState } from "react";
import { register } from "../utils/api";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(username, password);
      setMessage("Registration successful!");
      console.log("Token:", data.token);
    } catch (err) {
      setMessage("Registration failed.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
```

---

#### **2. Login Component**
Create `src/components/Login.js`:

```javascript
import React, { useState } from "react";
import { login } from "../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token); // Store token in local storage
      setMessage("Login successful!");
      console.log("Token:", data.token);
    } catch (err) {
      setMessage("Login failed.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
```

---

#### **3. Profile Component**
Create `src/components/Profile.js`:

```javascript
import React, { useEffect, useState } from "react";
import { getProfile } from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        const data = await getProfile(token);
        setUser(data.user);
      } catch (err) {
        setError("Failed to fetch profile.");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {error && <p>{error}</p>}
      {user && (
        <div>
          <p>Username: {user.username}</p>
          <p>User ID: {user.id}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
```

---

#### **4. Navbar Component**
Create `src/components/Navbar.js`:

```javascript
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
};

export default Navbar;
```

---

### **Step 5: Set Up Routing**
Update `src/App.js` to include routing:

```javascript
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
```

---

### **Step 6: Run the Frontend**
Start the React app:

```bash
npm start
```

---

## **How It Works**
1. **Register**: Users can register by providing a username and password. The token is returned and logged to the console.
2. **Login**: Users can log in with their credentials. The token is stored in local storage.
3. **Profile**: Users can access their profile by sending the token in the `Authorization` header.

---

