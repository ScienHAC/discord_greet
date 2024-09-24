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
const CHANNEL_ID = '1286916622270861426'; // Your specific channel ID

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is ready to greet users!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  const userId = newPresence.userId;
  const member = newPresence.member;

  if (newPresence.status === 'online' && (!oldPresence || oldPresence.status === 'offline')) {
    const currentDate = moment().format('YYYY-MM-DD');

    if (!userLastGreeted[userId] || userLastGreeted[userId] !== currentDate) {
      // Find the channel by ID
      const channel = member.guild.channels.cache.get(CHANNEL_ID);

      // Check if the channel exists and the bot has permission to send messages
      if (channel && channel.type === 'GUILD_TEXT' && channel.permissionsFor(member.guild.me).has('SEND_MESSAGES')) {
        const hour = moment().hour();
        let greeting;

        if (hour < 12) {
          greeting = greetings.morning;
        } else if (hour < 18) {
          greeting = greetings.afternoon;
        } else if (hour < 21) {
          greeting = greetings.evening;
        } else {
          greeting = greetings.night;
        }

        channel.send(`${greeting}, ${member.user.username}!`);
        
        userLastGreeted[userId] = currentDate;
      } else {
        console.log("No suitable channel found to send the greeting.");
      }
    }
  }
});

client.login(process.env.BOT_TOKEN); // Use the environment variable for your token
