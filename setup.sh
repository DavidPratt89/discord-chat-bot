#!/bin/bash

# Initialize npm package
echo "Initializing npm package..."
npm init -y

# Install discord.js
echo "Installing discord.js..."
npm i discord.js

# Install nodemon globally
echo "Installing nodemon globally..."
npm i -g nodemon

# Install dotenv
echo "Installing dotenv..."
npm i dotenv

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env..."
    touch .env
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    echo -e ".env\npackage-lock.json\npackage.json\nnode_modules\npoll-history.json\nsettings.json\n.idea/" > .gitignore
fi

# Registering slash commands
node src/register-commands.js
