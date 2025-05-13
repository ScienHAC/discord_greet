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

  try {
    // Fetch all members of the guild
    const guilds = client.guilds.cache.values();
    for (const guild of guilds) {
      console.log(`Connected to guild: ${guild.name}`);
      try {
        await guild.members.fetch();
        console.log(`Successfully cached members for ${guild.name}`);
      } catch (err) {
        console.error(`Error fetching members for guild ${guild.name}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in ready event:', err);
  }
});

// Listen for presence updates
client.on('presenceUpdate', async (oldPresence, newPresence) => {
  try {
    // Check if newPresence exists and the new status is online
    if (!newPresence) return;
    if (newPresence.status !== 'online') return;

    const member = newPresence.member;
    if (!member) {
      console.log('Member not found in presence update');
      return;
    }

    // Try to get the channel
    let channel;
    try {
      channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) {
        console.error(`Channel with ID ${CHANNEL_ID} not found`);
        return;
      }
    } catch (channelError) {
      console.error('Error fetching channel:', channelError);
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const userId = member.id; // Get the user ID

    // Check if the user has already received a greeting today
    if (lastGreetingMap[userId] !== currentDate) {
      try {
        // Send a greeting to the user using their display name
        await channel.send(`Hello ${member.displayName}! 👋 Welcome back!`);
        console.log(`Greeted ${member.displayName} successfully`);

        // Update the last greeting date for this user
        lastGreetingMap[userId] = currentDate; // Store current date
      } catch (messageError) {
        console.error(`Error sending greeting message to ${member.displayName}:`, messageError);
      }
    }
  } catch (err) {
    console.error('Error in presence update handler:', err);
  }
});

// Handle errors to prevent the bot from crashing
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Attempt to login and handle errors
try {
  // Log in to Discord with your bot token
  client.login(TOKEN).catch(err => {
    console.error('Failed to login to Discord:', err);
  });
} catch (err) {
  console.error('Error during bot startup:', err);
}