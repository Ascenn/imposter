const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const { token, guildId, recentsRoleId } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES] });

//////////////////////////////////////////////////////////////////////////////////////////////////////// KING MAKER
client.kingvotes = new Collection();
client.kingMemberId = null;
//////////////////////////////////////////////////////////////////////////////////////////////////////// KING MAKER

//////////////////////////////////////////////////////////////////////////////////////////////////////// COMMAND HANDLER
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.log('ff');
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
//////////////////////////////////////////////////////////////////////////////////////////////////////// COMMAND HANDLER

//////////////////////////////////////////////////////////////////////////////////////////////////////// RECENTS TRACKER
client.recents = new Collection();

client.on('voiceStateUpdate', (oldState, newState) => {
	if(!newState.member.user.bot)
	{
		let userId = newState.member.user.id;

		if(oldState.channelId === null && newState.channelId !== null) 
		{
			client.recents.set(userId, Date.now());
		}

		try {
			client.guilds.fetch(guildId).then(guild => {
				guild.roles.fetch(recentsRoleId).then(role => {
					const last7Days = new Date().addDays(-4);
					for(const [id, timestamp] of client.recents) {
						if(timestamp > last7Days) {
							guild.members.fetch(id).then(member => member.roles.add(role));
						} else {
							guild.members.fetch(id).then(member => member.roles.remove(role));
						}
					}
				})
			})
		} catch (err) {
			console.log(err);
		}

	}
})

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////// RECENTS TRACKER

//////////////////////////////////////////////////////////////////////////////////////////////////////// READY CHECK
client.once('ready', ()=>{
	console.log('AscennBOT is Online!');
})
//////////////////////////////////////////////////////////////////////////////////////////////////////// READY CHECK

client.login(token);