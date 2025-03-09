# BridgeIT

BridgeIT is a platform designed to connect job seekers from the West Bank with global employers, tackling mass unemployment by providing a job marketplace. This app helps job seekers showcase their profiles and connect with potential employers while offering an easy-to-use platform for employers to find top talent.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Database Integration](#database-integration)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## About

BridgeIT aims to provide global job opportunities for young Palestinians. The platform empowers individuals by giving them the tools, mentorship, and training needed to succeed. Employers can search through jobseeker profiles, review their skills, and contact them directly.

## Features

- **User Profiles**: Users can create detailed profiles showcasing their skills, experience, and professional background.
- **Employer and Jobseeker Roles**: Two user types (Employers and Jobseekers) are supported, with tailored functionality for each.
- **Search and Filters**: Employers can filter jobseekers by various criteria to find the perfect candidate.
- **Chat Functionality**: Employers can directly chat with jobseekers.
- **Responsive UI**: The app is designed to be visually appealing and responsive, ensuring a smooth user experience across devices.
- **Database Integration**: User profiles, jobseeker data, and employer information are stored securely using Appwrite.

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Appwrite (for database and API services)
- **Database**: Appwrite's database for storing jobseeker and employer information
- **Routing**: Expo Router
- **UI Components**: Custom reusable components created with React Native

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (LTS version)
- npm or yarn
- Expo CLI

### Steps

1. Clone the repository:

```bash
git clone https://github.com/nabihba/bridgeit.git
cd bridgeit


1. Install dependencies

   ```bash
   npm install
   ```
   ```bash
   npm install -g expo-cli
   ```
   ```bash
   npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-linking expo-constants expo-status-bar
   ```
   ```bash
   npm install react-native react-native-scripts
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project structure:
 ###Project structure:
  .
├── assets/                     # Images and static files
├── components/                 # Reusable UI components
│   ├── JobSeekerCard.jsx       # Job seeker profile card
│   ├── EmployerCard.jsx        # Employer profile card
│   ├── FilterBar.jsx           # Filter component for job seekers
│   └── ProfileCard.jsx         # Profile display card
├── pages/                      # Page components
│   ├── index.jsx               # Home page
│   ├── login.jsx               # Login page
│   ├── signup.jsx              # Signup page
│   ├── employerhomepage.jsx    # Employer homepage
│   ├── jobseekerdetailspage.jsx # Job seeker details page
|   ├── jobseekersignup.jsx     # Job seeker sign up page
|   ├── jobseekerhome.jsx       # homepage for job seeker
│   └── jobseekerhome.jsx       # Job seeker homepage
├── services/                   # API and database services
│   └── appwrite.js             # Appwrite service for backend
├── app.json                    # Expo configuration
├── package.json                # Project dependencies and scripts
└── README.md                   # This file

## DataBase structure 
### jobseeker collection

  "name": "string",
  "profession": "string",
  "experienceYears": "double",
  "funFact": "string",
  "skills": ["string"],
  "location": "string"

### employer/company collection

  "companyName": "string",
  "industry": "string",
  "size": "integer",
  "website": "string",
  "description": "string",
  "contactPerson": "string",
  "location": "string",
  "socialLinks": "string",
  "userId": "string"

  #### If you encounter any errors trying to set up the project either contact me or search in stackflow 