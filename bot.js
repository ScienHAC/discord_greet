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
  
  if (newPresence.status === 'online' && (!oldPresence || oldPresence.status === 'offline')) {
    const currentDate = moment().format('YYYY-MM-DD');
    
    if (!userLastGreeted[userId] || userLastGreeted[userId] !== currentDate) {
      const channel = member.guild.channels.cache.find(ch => ch.type === 'GUILD_TEXT' && ch.permissionsFor(member).has('SEND_MESSAGES'));
      
      if (channel) {
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
      }
    }
  }
});

client.login(process.env.BOT_TOKEN); // Use the environment variable for your token
