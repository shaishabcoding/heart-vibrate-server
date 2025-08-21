# 💓 Heart Vibrate Server

[![Version](https://img.shields.io/github/v/release/shaishab316/heart-vibrate-server)](https://github.com/shaishab316/heart-vibrate-server/releases)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/shaishab316/heart-vibrate-server?style=social)](https://github.com/shaishab316/heart-vibrate-server/stargazers)

Heart Vibrate Server is a production-ready Node.js server for chat applications built with Express.js, Socket.IO, MongoDB, and Prisma. It provides a scalable and efficient way to handle real-time communication and user authentication. With a simple and intuitive API, developers can easily integrate the server into their applications and start building their own chat features.

---

## 📌 Features

- Realtime messaging with **Socket.IO**
- User authentication (JWT)
- Persistent chat history with **MongoDB + Prisma**
- REST API for auth & chat endpoints
- Production-ready backend for chat apps

---

## ⚡ Tech Stack

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-black?logo=express&logoColor=white)](https://expressjs.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-realtime-blue?logo=socket.io&logoColor=white)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma&logoColor=white)](https://www.prisma.io)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/shaishab316/heart-vibrate-server.git
cd heart-vibrate-server
npm install
```

### 2. Run

```bash
npm run dev   # start in development
npm run build && npm start # start in production
# .env auto generate
```

---

## 🗂 Project Structure

```bash
heart-vibrate-server/
├── .github/workflows/ # CI/CD pipelines
├── public/ # Static assets (favicon, images, logos)
├── src/
│ ├── app/ # Middlewares & feature modules
│ ├── config/ # App & environment configuration
│ ├── errors/ # Error classes & handlers
│ ├── routes/ # API route definitions
│ ├── types/ # TypeScript types
│ ├── util/ # Utilities (db, logger, crypto, mail, etc.)
│ ├── app.ts # Express app setup
│ └── server.ts # Server entry point
├── prisma.config.ts # Prisma configuration
├── tsconfig.json # TypeScript configuration
├── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add feature"`)
4. Push and open a PR

---

## 📜 License

Released under the [MIT License](LICENSE).

---

## ⭐ Support

If you find this project useful, please consider leaving a **star** ⭐ on GitHub.
