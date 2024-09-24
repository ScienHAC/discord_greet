const { Client, GatewayIntentBits } = require('discord.js');
const moment = require('moment');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const greetings = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
};

const userLastGreeted = {}; // To track when a user was last greeted

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  const userId = newPresence.userId;
  const member = newPresence.member;

  console.log(`Presence updated for user: ${userId}, Status: ${newPresence.status}`);

  // Check if the user comes online
  if (newPresence.status === 'online' && (!oldPresence || oldPresence.status === 'offline')) {
    const currentDate = moment().format('YYYY-MM-DD');

    console.log(`User is online. Checking if they have been greeted today...`);

    // Check if the user has already been greeted today
    if (!userLastGreeted[userId] || userLastGreeted[userId] !== currentDate) {
      const channel = member.guild.channels.cache.find(ch => ch.type === 'GUILD_TEXT' && ch.permissionsFor(member).has('SEND_MESSAGES'));
      
      if (channel) {
        const hour = moment().hour();
        let greeting;

        // Determine the appropriate greeting based on the time of day
        if (hour < 12) {
          greeting = greetings.morning;
        } else if (hour < 18) {
          greeting = greetings.afternoon;
        } else if (hour < 21) {
          greeting = greetings.evening;
        } else {
          greeting = greetings.night;
        }

        // Send the greeting message
        channel.send(`${greeting}, ${member.user.username}!`);
        
        userLastGreeted[userId] = currentDate; // Update last greeted date
        console.log(`Greeting sent to ${member.user.username} in channel ${channel.name}`);
      } else {
        console.log(`No suitable channel found to send the greeting.`);
      }
    } else {
      console.log(`User ${member.user.username} has already been greeted today.`);
    }
  }
});

// Login to Discord with your bot token
client.login(process.env.BOT_TOKEN); // Use the environment variable for your token
