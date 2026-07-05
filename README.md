# MusicHub - Static Website

A beautiful, responsive static website for a music industry platform with login and sign-up functionality.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Login Page**: User authentication form with validation
- **Sign-Up Page**: User registration with comprehensive form validation
- **Home Page**: Landing page with features showcase
- **Form Validation**: Client-side validation for all forms
- **Music Industry Theme**: Professional design tailored for music professionals

## File Structure

```
small website/
├── index.html          # Home/Landing page
├── login.html          # Login page
├── signup.html         # Sign-up page
├── style.css           # Main stylesheet
├── script.js           # Form validation and interactivity
├── web.config          # Azure App Service configuration
└── README.md           # This file
```

## User Roles

The sign-up form includes the following roles:
- Artist
- Producer
- Manager
- Sound Engineer
- Music Enthusiast
- Other

## Features

### Home Page
- Navigation bar with branding
- Hero section with call-to-action buttons
- Features showcase with 4 key features
- About section
- Footer with links

### Login Page
- Email and password fields
- Remember me checkbox
- Forgot password link
- Form validation
- Success message display

### Sign-Up Page
- First and last name
- Email address
- User role selection
- Strong password requirements
- Password confirmation
- Terms and conditions agreement
- Form validation with error messages

## Password Requirements

For security, passwords must contain:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## How to Use Locally

1. Extract all files to a folder
2. Open `index.html` in your web browser
3. Navigate through the pages using the menu
4. Test the login and sign-up forms with validation

## Deploying to Azure App Service

### Prerequisites
- Azure subscription
- Azure CLI or Azure Portal access

### Steps to Deploy

#### Option 1: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" and search for "App Service"
3. Click "Create"
4. Fill in the details:
   - **Resource Group**: Create new or select existing
   - **Name**: Choose a unique name (e.g., `musichupdemo`)
   - **Publish**: Select "Code"
   - **Runtime stack**: Select ".NET" (for static sites, any runtime works)
   - **Operating System**: Windows or Linux
   - **Region**: Choose your region
5. Click "Review + create" then "Create"
6. Once deployed, go to the App Service
7. Click "Deployment Center" in the left sidebar
8. Connect your GitHub repository or upload files directly
9. Upload all files from this folder

#### Option 2: Using Azure CLI

```bash
# Login to Azure
az login

# Create a resource group
az group create --name myResourceGroup --location "East US"

# Create an App Service plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku FREE

# Create a web app
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name musichupdemo

# Deploy files (from the website folder)
# Option A: Using ZIP deployment
zip -r website.zip .
az webapp deployment source config-zip --resource-group myResourceGroup --name musichupdemo --src website.zip

# Option B: Using Git
cd "your-website-folder"
git init
git add .
git commit -m "Initial commit"
git remote add azure <your-git-url-from-azure>
git push azure master
```

#### Option 3: Using Visual Studio Code

1. Install the "Azure App Service" extension in VS Code
2. Sign in to your Azure account
3. Right-click on the App Service you want to deploy to
4. Select "Deploy to Web App"
5. Select your website folder
6. Confirm the deployment

### Important Notes

- This is a **static website** - it doesn't require any backend server
- All form submissions are handled client-side for demonstration
- In production, you'll need to connect to a backend API for actual authentication
- The `web.config` file is included for proper Azure App Service hosting

## Security Considerations

For production use:
- All form data should be sent to a secure backend API
- Implement server-side validation
- Use HTTPS for all communications
- Implement proper user authentication (JWT tokens, sessions, etc.)
- Never store passwords in plaintext
- Use industry-standard password hashing (bcrypt, argon2, etc.)

## Customization

You can customize:
- Colors: Edit the gradient colors in `style.css` (currently using purple/blue)
- Logo/Branding: Edit the "🎵 MusicHub" text in HTML files
- Content: Update text, features, and information in HTML files
- Styling: Modify the CSS as needed

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This website is provided as-is for testing and educational purposes.

## Support

For issues or questions about deploying to Azure, refer to:
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Learning Path](https://learn.microsoft.com/training/paths/deploy-app-to-azure-app-service/)
# Music-Hub-Project---Azure-App-Services
