# Recipe Recommendation System

This project is a full-stack web application that recommends recipes based on available ingredients. It consists of a client-side built with React and a server-side built with Node.js and TypeScript. Additionally, a machine learning model is included to enhance the recommendation capabilities.

## Project Structure

```
recipe-recommendation-system
├── client               # Frontend application
│   ├── public
│   │   └── index.html   # Main HTML file
│   ├── src
│   │   ├── components    # React components
│   │   ├── services      # API service for client
│   │   ├── types         # TypeScript types
│   │   ├── App.tsx       # Main application component
│   │   └── index.tsx     # Entry point for React app
│   ├── package.json      # Client dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration for client
├── server               # Backend application
│   ├── src
│   │   ├── controllers    # Controllers for handling requests
│   │   ├── models         # Data models
│   │   ├── routes         # API routes
│   │   ├── services       # Business logic services
│   │   ├── types          # TypeScript types
│   │   └── app.ts        # Entry point for server app
│   ├── package.json       # Server dependencies and scripts
│   └── tsconfig.json      # TypeScript configuration for server
├── ml-model              # Machine learning model
│   ├── data
│   │   └── recipes.json   # Dataset for training
│   ├── src
│   │   ├── train.py       # Training script
│   │   ├── predict.py     # Prediction script
│   │   └── preprocess.py   # Preprocessing script
│   └── requirements.txt    # Python dependencies for ML model
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Python (v3.6 or higher)
- pip

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd recipe-recommendation-system
   ```

2. Install the client dependencies:

   ```
   cd client
   npm install
   ```

3. Install the server dependencies:

   ```
   cd server
   npm install
   ```

4. Install the Python dependencies for the machine learning model:

   ```
   cd ml-model
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the server:

   ```
   cd server
   npm start
   ```

2. Start the client:

   ```
   cd client
   npm start
   ```

3. Access the application in your browser at `http://localhost:3000`.

### Usage

- Input your available ingredients in the Ingredient Input component.
- The application will recommend recipes based on the provided ingredients.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

### License

This project is licensed under the MIT License.