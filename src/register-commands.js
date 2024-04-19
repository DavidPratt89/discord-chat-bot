require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
    {
        name: 'poll',
        description: 'Create a poll',
        options: [
            {
                name: 'question',
                description: 'The question for the poll',
                type: 3, // ApplicationCommandOptionType.String
                required: true,
            },
            {
                name: 'label',
                description: 'The unique label for the poll',
                type: 3, // ApplicationCommandOptionType.String
                required: true,
            },
            {
                name: 'timer',
                description: 'Choose if the poll should have a timer or not',
                type: 3, // ApplicationCommandOptionType.String
                required: true,
                choices: [
                    { name: 'Timer', value: 'Yes' },
                    { name: 'No Timer', value: 'No' },
                ],
            },
        ],
    },
    {
        name: 'cancelpoll',
        description: 'Cancel a poll',
    },
    {
        name: 'pollhistory',
        description: 'View the poll history',
    },
    {
        name: 'pollstatus',
        description: 'View the status of the poll',
        options: [
            {
                name: 'label',
                description: 'The label of the poll',
                type: 3, // ApplicationCommandOptionType.String
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        // Fetch existing commands
        const existingCommands = await rest.get(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
        );

        console.log('Existing commands:', existingCommands);

        // Unregister existing commands
        if (Array.isArray(existingCommands)) {
            for (const command of existingCommands) {
                await rest.delete(
                    Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
                );
            }
        }

        // Register new commands
        const registeredCommands = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Registered commands:', registeredCommands);

        console.log('Slash commands were registered successfully.');
    } catch (error) {
        console.error(`There was an error: ${error}`);
    }
})();
