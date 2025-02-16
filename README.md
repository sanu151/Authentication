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



## **mongoose-encryption** to encrypt and decrypt data in your MongoDB database.

**To test Encryption and Decrepection: [https://cryptii.com/](https://cryptii.com/)**

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

