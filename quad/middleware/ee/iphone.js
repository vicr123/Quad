const addiPhone = options => {
	if (typeof options === "string") {
		options += "\n\nSent from my iPhone";
	} else if (options && typeof options.content === "string") {
		options.content += "\n\nSent from my iPhone";
	} else if (options.options && typeof options.options.content === "string") {
		options.options.content += "\n\nSent from my iPhone";
	} else {
		options.content = "Sent from my iPhone";
	}
	return options;
}

module.exports = async (interaction, actualOpts, opts, args) => {
	// Return for 99% of interactions
	if (Math.random() >= 0.01) return true;

	// Override all reply methods for this interaction to preserve iPhone across edits
	const orReply = interaction.reply;
	interaction.reply = async (options = {}) => {
		await orReply.call(interaction, addiPhone(options));
	}

	const orEdit = interaction.editReply;
	interaction.editReply = async (options = {}) => {
		await orEdit.call(interaction, addiPhone(options));
	}

	const orFollowUp = interaction.followUp;
	interaction.followUp = async (options = {}) => {
		await orFollowUp.call(interaction, addiPhone(options));
	}
    return true;
}
