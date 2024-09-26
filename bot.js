const { Client, GatewayIntentBits } = require('discord.js');

// Initialize the bot with the required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // For accessing members
    GatewayIntentBits.GuildPresences, // For checking presence (status)
  ],
});

// Your bot token
const TOKEN = process.env.TOKEN;

const CHANNEL_ID = process.env.CHANNEL_ID;
// Object to keep track of the last greeting date for each user
const lastGreetingMap = {};

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
