const Command = require('../../structures/Command');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { stripIndents } = require('common-tags');
const { shuffle, randomRange } = require('../../util/Util');
const { drawImageWithTint } = require('../../util/Canvas');
const horses = require('../../assets/json/horse-race');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Paladins-nl8P.otf'), { family: 'Paladins' });
const colors = ['gold', 'silver', '#cd7f32'];

module.exports = class HorseRaceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'horse-race',
			aliases: ['race-horse', 'kentucky-derby'],
			group: 'games-sp',
			memberName: 'horse-race',
			description: 'Bet on the fastest horse in a 6-horse race.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			credit: [
				{
					name: 'Ambition',
					url: 'https://ambition.com/',
					reason: 'Image',
					// eslint-disable-next-line max-len
					reasonURL: 'https://help.ambition.com/hc/en-us/articles/360005048011-How-do-I-set-up-a-Leaderboard-Slide-'
				},
				{
					name: 'Free SVG',
					url: 'https://freesvg.org/',
					reason: 'Image',
					reasonURL: 'https://freesvg.org/race-horse'
				},
				{
					name: 'Iconian Fonts',
					url: 'https://www.fontspace.com/iconian-fonts',
					reason: 'Paladins Font',
					reasonURL: 'https://www.fontspace.com/paladins-font-f32777'
				},
				{
					name: 'Stadium Talk',
					url: 'https://www.stadiumtalk.com/',
					reason: 'Horse Name Data',
					reasonURL: 'https://www.stadiumtalk.com/s/best-racehorse-names-be7b8ad6b49a42df'
				}
			]
		});
	}

	async run(msg) {
		const chosenHorses = shuffle(horses).slice(0, 6);
		await msg.reply(stripIndents`
			**Choose a horse to bet on:** _(Type the number)_
			${chosenHorses.map((horse, i) => `**${i + 1}.** ${horse.name}`).join('\n')}
		`);
		const filter = res => {
			if (res.author.id !== msg.author.id) return false;
			const num = Number.parseInt(res.content, 10);
			if (!num) return false;
			return num > 0 && num <= chosenHorses.length;
		};
		const msgs = await msg.channel.awaitMessages(filter, {
			max: 1,
			time: 30000
		});
		if (!msgs.size) return msg.reply('Sorry, can\'t have a race with no bets!');
		const pick = chosenHorses[Number.parseInt(msgs.first().content, 10) - 1];
		const results = [];
		for (const horse of chosenHorses) {
			results.push({
				name: horse.name,
				time: randomRange(horse.minTime, horse.minTime + 15) + Math.random()
			});
		}
		results = results.sort((a, b) => b.time - a.time);
		const leaderboard = await this.generateLeaderboard(chosenHorses, results);
		const win = results[0].name === pick.name;
		return msg.reply(win ? `Nice job! Your horse won!` : 'Better luck next time!', { files: [leaderboard] });
	}

	async generateLeaderboard(horses, results) {
		const lb = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'horse-race', 'leaderboard.png'));
		const horseImg = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'horse-race', 'horse.png'));
		const canvas = createCanvas(lb.width, lb.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.font = '34px Paladins';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (let i = 0; i < horses.length; i++) {
			const horse = horses[i];
			const result = results.find(result => horse.name === result.name).time;
			if (colors[i]) drawImageWithTint(ctx, horseImg, colors[i], 37 * i, 114, 49, 49);
			ctx.fillText(this.formatTime(result), 138 * i, 755);
			ctx.fillText(horse.name, 138 * 1, 251);
		}
		return { attachment: canvas.toBuffer(), name: 'leaderboard.png' };
	}

	formatTime(time) {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time - (min * 60));
        const ms = time - sec - (min * 60);
		return `${min}:${sec}.${ms.toFixed(4).slice(2)}`;
	}
};