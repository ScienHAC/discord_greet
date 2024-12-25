// Import required modules
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // Set port to 3000 or from environment variable

// Initialize Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // For accessing members (needs Server Members Intent enabled)
    GatewayIntentBits.GuildPresences, // For checking presence (needs Presence Intent enabled)
    GatewayIntentBits.MessageContent // For reading message content (needs Message Content Intent enabled)
  ],
});

// Your bot token and channel ID from .env or environment variables
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Object to keep track of the last greeting date for each user
const lastGreetingMap = {};

// Express route for root URL ("/")
app.get('/', (req, res) => {
  res.send('Hello, the bot is running and ready to greet users when they come online!');
});

// Start Express server
app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});

// Discord bot logic

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Fetch all members of the guild
  const guild = client.guilds.cache.first(); // You can use a specific guild ID if needed
  await guild.members.fetch(); // Ensure all members are cached
});

// Listen for presence updates
client.on('presenceUpdate', async (oldPresence, newPresence) => {
  // Check if the new status is online
  if (newPresence?.status === 'online') {
    const member = newPresence.member; // Get the member who came online
    const channel = await client.channels.fetch(CHANNEL_ID); // Fetch the channel

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const userId = member.id; // Get the user ID

    // Check if the user has already received a greeting today
    if (lastGreetingMap[userId] !== currentDate) {
      // Send a greeting to the user using their display name
      await channel.send(`Hello ${member.displayName}! 👋 Welcome back!`);

      // Update the last greeting date for this user
      lastGreetingMap[userId] = currentDate; // Store current date
    }
  }
});

// Log in to Discord with your bot token
client.login(TOKEN);
