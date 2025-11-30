# Biz Insight AI 🚀

AI-powered business analytics platform that transforms sales data into actionable insights.

![Biz Insight AI](./docs/og-image.png)

## ✨ Features

- 📊 **Real-time Dashboard** - Track revenue, visitors, and customer metrics with week-over-week comparisons
- 📤 **CSV Data Import** - Simple drag-and-drop interface with flexible column mapping
- 🤖 **AI-Powered Reports** - GPT-4 generated insights tailored to your industry
- 📄 **PDF Export** - Professional reports ready to share with stakeholders
- 🌙 **Dark Mode** - Beautiful, modern UI that's easy on the eyes
- 🏪 **Multi-Store Support** - Manage multiple business locations from one dashboard

## 🎯 Perfect For

- 🍽️ Restaurants
- 🏥 Clinics & Medical Practices
- 💇 Salons & Spas
- 🏠 Real Estate Agencies

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (Sequelize ORM)
- **AI**: OpenAI GPT-4
- **PDF Generation**: PDFKit
- **Frontend**: Vanilla JavaScript
- **Deployment**: Docker

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/biz-insight-ai.git
cd biz-insight-ai
```

2. Create `.env` file:
```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_secure_jwt_secret_here
```

3. Start with Docker:
```bash
docker compose up -d
```

4. Access the application:
```
http://localhost:3000
```

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Social Media Kit](./SOCIAL_MEDIA.md) - Ready-to-use posts and OGP tags

## 🎨 Screenshots

### Dashboard
![Dashboard](./docs/dashboard-preview.png)

### AI Reports
![Reports](./docs/reports-preview.png)

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## 📊 Sample Data

A sample CSV file is included in `sample_sales_data.csv` for testing.

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Railway
- Render
- DigitalOcean
- VPS deployment

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js security headers
- CORS configuration

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- All open-source contributors

---

Made with ❤️ by [Your Name]
