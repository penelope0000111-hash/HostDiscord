module.exports = async function log(client, msg) {
    const channel = await client.channels.fetch(process.env.LOG_CHANNEL);
    if (!channel) return;

    channel.send({ content: msg });
};