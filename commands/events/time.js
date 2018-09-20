const Command = require('../../structures/Command');
const moment = require('moment-timezone');
const { firstUpperCase } = require('../../util/Util');

module.exports = class TimeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'time',
			aliases: ['time-zone'],
			group: 'events',
			memberName: 'time',
			description: 'Responds with the current time in a particular location.',
			details: '**Zones:** <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>',
			args: [
				{
					key: 'timeZone',
					label: 'time zone',
					prompt: 'Which time zone do you want to get the time of?',
					type: 'string',
					parse: timeZone => timeZone.replace(/ /g, '_').toLowerCase()
				}
			]
		});
	}

	run(msg, { timeZone }) {
		let neopia = false;
		if (timeZone === 'neopia/standard' || timeZone === 'neopia') {
			timeZone = 'america/vancouver';
			neopia = true;
		}
		try {
			const time = moment().tz(timeZone).format('hh:mm:ss A');
			const location = neopia ? ['neopia'] : timeZone.split('/');
			const main = firstUpperCase(location[0], /[_ ]/);
			const sub = location[1] ? firstUpperCase(location[1], /[_ ]/) : null;
			const subMain = location[2] ? firstUpperCase(location[2], /[_ ]/) : null;
			const parens = sub ? ` (${subMain ? `${sub}, ` : ''}${main})` : '';
			return msg.say(`The current time in ${subMain || sub || main}${parens} is ${time}.`);
		} catch (err) {
			return msg.reply('Invalid time zone. Refer to <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>.');
		}
	}
};
