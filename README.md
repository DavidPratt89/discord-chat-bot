# discord-chat-bot
@Author: David Wise

A chat bot that allows you to make polls with slash commands in a discord server.

## Setup
To set up the project, clone the repository and run the setup script:

```bash
git clone <repository-url>
cd <repository-directory>
bash setup.sh
```

This script will initialize npm, install the necessary packages, and create the necessary `.env` and `.gitignore` files.

After running the setup script, you will need to manually fill out the `.env` file with your token, guild ID, and client ID:

```ini
TOKEN = your-token-here
GUILD_ID = your-guild-id-here
CLIENT_ID = your-client-id-here
```

Please replace `your-token-here`, `your-guild-id-here`, and `your-client-id-here` with your actual token, guild ID, and client ID.

## Usage
After setting up, you can start the bot with the following command:

```bash
nodemon
```