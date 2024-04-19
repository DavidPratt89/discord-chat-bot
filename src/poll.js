require('dotenv').config();

const { Client, IntentsBitField, CommandInteraction } = require('discord.js');
const fs = require('fs');
const path = require('path');

const pollHistoryFile = path.join(__dirname, '..', 'poll-history.json');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});


// Initializes Variables
let pollActive = false; // Flag to track if poll is still active
let thumbsUpCount = 0;
let thumbsDownCount = 0;
let pollHistory = [];
let activePoll = null;

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} is online.`);
});

try {
    pollHistory = JSON.parse(fs.readFileSync(pollHistoryFile));
    // console.log('Poll history loaded successfully:', pollHistory); // Debug Statement
} catch (err) {
    if (err.code === 'ENOENT') {
        fs.writeFileSync(pollHistoryFile, JSON.stringify(pollHistory));
        console.log('Poll history file not found. Created a new one.'); // Debug Statement
    } else {
        console.error('Error loading poll history', err); // Debug Statement
    }
}

client.on('messageReactionAdd', async (reaction) => {
    if (pollActive && reaction.message.content.startsWith('Poll Question:')) {
        if (reaction.emoji.name === '👍') {
            thumbsUpCount++;
        } else if (reaction.emoji.name === '👎') {
            thumbsDownCount++;
        }
    }
});

// Function to check if a poll is active
function isPollActive(label, id) {
    return activePoll && activePoll.label === label && activePoll.id === id;
}


/**
 * Method to handle the '/poll' and '/cancelpoll' command
 * These commands handle how we start and stop the poll
 *
 * @param {CommandInteraction} interaction
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    // console.log(interaction.commandName); // Debug Statement

    // Checks to see if the command mates poll and continues
    if (interaction.commandName === 'poll' && !pollActive) {
        const { options } = interaction;
        const question = options.getString('question');
        const label = options.getString('label');
        const pollId = options.getString('id') || 'No ID';

        // console.log(activePoll); // Debug Statement
        // console.log(label); // Debug Statement

        await interaction.reply({
            content: `Please vote in the poll by reacting with 👍 or 👎
            This poll was created by ${interaction.user.username}
            Poll Label: ${interaction.options.getString('label')}`
        });

        const pollQuestion = `Poll Question: ${question}`;
        const pollMessage = await interaction.channel.send(pollQuestion);
        await pollMessage.react('👍');
        await pollMessage.react('👎');

        // Update poll status
        pollActive = true;

        // Store poll information
        activePoll = {
            label: label,
            id: pollId,
            question: question,
            thumbsUpCount: 0,
            thumbsDownCount: 0,
            winner: null
        };
    }

    // Verifies the command name and sees if it matches the description provided
    if (interaction.commandName === 'cancelpoll' && pollActive) {

        // Fetch poll message
        try {
            const pollMessage = await interaction.channel.messages.fetch({ limit: 1 }).then(messages => messages.first());
            const fetchedReactions = await pollMessage.reactions.cache;

            thumbsUpCount = fetchedReactions.get('👍') ? fetchedReactions.get('👍').count - 1 : 0;
            thumbsDownCount = fetchedReactions.get('👎') ? fetchedReactions.get('👎').count - 1 : 0;

            // console.log(`Thumbs Up Count: ${thumbsUpCount}`); // Debug Statement
            // console.log(`Thumbs Down Count: ${thumbsDownCount}`); // Debug Statement

            // Send winner announcement or tie message
            let winner;
            if (thumbsUpCount === thumbsDownCount && thumbsUpCount === 0) {
                winner = 'Tie (No votes cast)';
            } else if (thumbsUpCount === thumbsDownCount) {
                winner = 'Tie';
            } else {
                winner = thumbsUpCount > thumbsDownCount ? '👍' : '👎';
            }

            // Update poll history
            const pollResults = {
                label: activePoll.label,
                id: activePoll.id,
                question: activePoll.question,
                thumbsUpCount: thumbsUpCount,
                thumbsDownCount: thumbsDownCount,
                winner: winner
            };

            // Read poll history from file if it exists
            let pollHistory = [];
            if (fs.existsSync(pollHistoryFile)) {
                pollHistory = JSON.parse(fs.readFileSync(pollHistoryFile));
            }

            // Insert pollHistory into an array
            if (!Array.isArray(pollHistory)) {
                pollHistory = [];
            }

            pollHistory.push(pollResults);
            fs.writeFileSync(pollHistoryFile, JSON.stringify(pollHistory, null, 2));

            // Send winner announcement or tie message
            let winnerAnnouncement;
            if (winner === 'Tie') {
                winnerAnnouncement = 'The poll resulted in a tie.';
            } else if (winner === 'Tie (No votes cast)') {
                winnerAnnouncement = 'The poll was ended and no votes were cast.';
            } else {
                winnerAnnouncement = `The winner is ${winner} with ${winner === '👍' ? thumbsUpCount : thumbsDownCount} votes!`;
            }
            interaction.channel.send(winnerAnnouncement);

            interaction.reply('Poll cancelled.');
        } catch (error) {
            console.error('Error fetching poll message:', error);
        }

        // Reset counts for future polls
        thumbsUpCount = 0;
        thumbsDownCount = 0;
        pollActive = false; // Reset the poll active flag
    }

    if (interaction.commandName === 'pollhistory') {
        try {
            let response = 'Poll History:\n';
            if (fs.existsSync(pollHistoryFile)) {
                const history = JSON.parse(fs.readFileSync(pollHistoryFile, 'utf-8'));
                if (Array.isArray(history) && history.length > 0) {
                    history.forEach((poll, index) => {
                        response += `\tPoll: ${poll.label}\n`;
                        response += `\tPoll ID: ${index + 1}\n`;
                        response += `\tQuestion: ${poll.question}\n`;
                        response += `\tThumbs Up Count: ${poll.thumbsUpCount}\n`;
                        response += `\tThumbs Down Count: ${poll.thumbsDownCount}\n`;
                        response += `\tWinner: ${poll.winner}\n\n`;
                    });
                } else {
                    response = 'No poll history.';
                }
            } else {
                response = 'No poll history.';
            }
            interaction.reply(response);
        } catch (error) {
            console.error('Error fetching poll history:', error);
            interaction.reply('Error fetching poll history. Please try again later.');
        }
    }

    if (interaction.commandName === 'pollstatus') {
        const { options } = interaction;
        const pollLabel = options.getString('label');

        if (pollActive) {
            if (isPollActive(pollLabel, activePoll.id)) {
                interaction.reply(`Poll ${pollLabel} with Label: ${activePoll.label}\nPoll Status: Currently Active.`);
            } else if (!isPollActive(pollLabel, activePoll.id)) {
                interaction.reply(`Poll ${pollLabel} with Label: ${activePoll.label}\nPoll Status: Cancelled.`);
            }
        } else if (!pollActive) {
            interaction.reply('There is no active poll.');
        }
    }
});

client.login(process.env.TOKEN);
