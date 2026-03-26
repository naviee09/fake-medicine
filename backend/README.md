# Natural Medicine Authenticity Verifier - Backend API

Backend API for the AI-powered medicine authenticity verification platform, focusing on natural products and counterfeit detection.

## Features

- **User Authentication**: JWT-based authentication system
- **Medicine Database**: SQLite database with authentic medicine records
- **Image Verification**: AI-powered image analysis for packaging verification
- **Identifier Checking**: Barcode and batch number verification
- **Verification History**: Track user verification attempts
- **Statistics**: User verification statistics and analytics

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Medicine Management
- `GET /api/medicine` - Get all medicines (authenticated)
- `GET /api/medicine/:id` - Get medicine by ID
- `GET /api/medicine/search/:query` - Search medicines
- `POST /api/medicine/verify-identifier` - Verify by barcode/batch
- `POST /api/medicine` - Add new medicine (authenticated)

### Verification
- `POST /api/verification/upload` - Upload and analyze image
- `GET /api/verification/history` - Get verification history
- `GET /api/verification/stats` - Get verification statistics

### Health Check
- `GET /api/health` - API health status

## Database Schema

### Users
- User authentication and profile information

### Medicines
- Authentic medicine database with manufacturer details
- Batch numbers, barcodes, expiry dates
- Natural product categorization

### Verification Logs
- Track all verification attempts
- Store analysis results and confidence scores

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
backend/
├── src/
│   ├── database/
│   │   └── init.ts          # Database initialization
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   ├── medicine.ts      # Medicine management routes
│   │   └── verification.ts  # Image verification routes
│   └── server.ts            # Main server file
├── uploads/                 # Uploaded images directory
├── data/                    # SQLite database files
├── dist/                    # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration
- File upload validation
- Input sanitization

## Future Enhancements

- Integration with real AI/ML services
- Blockchain-based verification
- Multi-language support
- Advanced analytics dashboard
- Mobile API optimization
- Real-time notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.