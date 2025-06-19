# Covid Memories

Covid Memories is a full-stack web application that curates and plays back personal audio reflections recorded during the early days of the COVID-19 pandemic. The project features an interactive, branching playlist system, a custom audio player, and MongoDB-powered data storage with user-authenticated editing capabilities.

The app is deployed publicly at:  
**https://covidmemories.azurewebsites.net/**

---

## Features

- Custom audio playback system with play, pause, skip, and rewind functionality
- Branching playlists that allow users to explore themed narrative paths
- User login and registration with secure session-based authentication
- Add, delete, and edit playlist rows via GUI (for logged-in users)
- MongoDB Atlas integration for persistent storage of audio metadata
- Responsive interface with Bootstrap styling and animated elements

---

## Tech Stack

| Frontend              | Backend               | Database        | Authentication         | Tooling & UI       |
|----------------------|-----------------------|-----------------|-------------------------|---------------------|
| HTML, CSS, JavaScript| Node.js, Express.js   | MongoDB Atlas   | express-session, argon2 | Bootstrap, SweetAlert2 |

---

## Local Development

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB Atlas (or a local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/CovidMemories/CovidMemories.git
cd CovidMemories
```

### 2. Install dependencies

```bash
npm install
```

This will install all required modules including:
- mongodb
- express
- express-session
- argon2

If needed, you can also initialize with:
```bash
npm init -y
```

### 3. Configure MongoDB

In `server.js`, update the `const uri = ...` line with your own MongoDB Atlas URI or local connection string.

### 4. Start the app

```bash
npm start
```

Then open your browser and go to:
```
http://localhost:8080/
```

> Note: This app was tested using Linux/WSL2 with VSCode. It should run on Mac and Windows, but WSL is recommended for compatibility.

---

## Azure Deployment

This project is configured for deployment to **Azure App Service** via GitHub Actions.  
To deploy:

1. Create an Azure Web App (Node.js 18 LTS)
2. Download its Publish Profile
3. Add it to your GitHub repo secrets as `AZUREAPPSERVICE_PUBLISHPROFILE`
4. Push to `main` to trigger deployment

The GitHub Actions workflow file is at [`main_covidmemories.yml`](./main_covidmemories.yml)

---

## Contributors

- Joey Capps  
- Caroline Kays  
- Tom McCoughlin  
- Jasdeep Singh  
- Jack Sovelove

---

## License

This project is intended for educational and archival use. You are welcome to adapt or build on it with credit to the original contributors.
