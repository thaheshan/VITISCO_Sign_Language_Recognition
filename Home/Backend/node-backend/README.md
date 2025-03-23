# Node.js Backend Project

This is a Node.js backend project designed to support the frontend application for VITISCO Sign Language Recognition. It provides a RESTful API for user management and other functionalities.

## Project Structure

```
node-backend
├── src
│   ├── controllers        # Contains controllers for handling requests
│   ├── models             # Contains models for database schemas
│   ├── routes             # Contains route definitions
│   ├── services           # Contains business logic
│   ├── app.js             # Entry point of the application
│   └── config             # Contains configuration files
├── package.json           # NPM configuration file
├── .env                   # Environment variables
└── README.md              # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd node-backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables. Example:
   ```
   DATABASE_URL=mongodb://localhost:27017/vitisco
   PORT=5000
   SECRET_KEY=your_secret_key
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The server will run on the specified port (default is 5000). You can access the API at `http://localhost:5000`.

## API Endpoints

- **User Management**
  - `POST /api/users` - Create a new user
  - `GET /api/users/:id` - Get user by ID
  - `PUT /api/users/:id` - Update user by ID
  - `DELETE /api/users/:id` - Delete user by ID

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the LICENSE file for details.