const TelegramBot = require('node-telegram-bot-api');
const ffmpeg = require('fluent-ffmpeg')

const token = "409933787:AAGf14vaLeE5BvyCKUqUk5jJK-MjKNdpnns";

(function () {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;

    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();

console.log("Yara lives")
const bot = new TelegramBot(token, {
    polling: true
});
var fs = require('fs');
var youtubedl = require('youtube-dl');
var __dirname = "/mp3";

var user_pool = [];

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, resp);

});
bot.onText(/\/list/, (msg, match) => {
    const chatId = msg.chat.id;
    user_pool.forEach(function (user) {
        if (user.id == msg.from.id) {
            user.list.forEach(function (item) {
                bot.sendMessage(chatId, item);
            })
        }
    });
});
bot.onText(/\/clear/, (msg, match) => {
    const chatId = msg.chat.id;
    user_pool.forEach(function (user) {
        if (user.id == msg.from.id) {
            user.list = [];
        }
    });
    bot.sendMessage(chatId, "Emptied your playlist");


});
bot.onText(/\/download/, (msg, match) => {
    const chatId = msg.chat.id;

    user_pool.forEach(function (user) {
        if (user.id == msg.from.id) {
            user.list.forEach(function (e) {
                download(chatId, e);
            })
        }
    });


});

function download(id, link) {
    var filename = "default";
    console.log(link)
    var video = youtubedl(link, ['--extract-audio']);
    video.on("error", function (e) {
        console.log(e)
    })
    video.on("info", function (result) {
        console.log(result.filename);
        filename = result.filename;
        var file = "mp4/" + filename;
        var output_file = file.replace("mp4","mp3")
        video.pipe(fs.createWriteStream(file))
        video.on('end', function () {
            var proc = new ffmpeg({
                source: file,
                nolog: false
            });
            proc.addOptions([
                '-f mp3' ,
                '-ab 192000',
                '-ar 16000',
                '-vn'
            ]);
            proc.on('error', function (err, stdout, stderr) {
                reject(err)
                console.log("11111111111111 -------------video: " + err);
            });
            proc.save(output_file).on('end', function () {
                bot.sendAudio(id,output_file);
            })

        });
    })

}
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)
    var user_bool = false;
    user_pool.forEach(function (user) {
        if (user.id == msg.from.id) {
            user_bool = true;
            if (msg.text.includes("youtube")) {
                user.list.push(msg.text);
            }
        }
    })
    if (!user_bool) {
        user_pool.push({
            id: msg.from.id,
            list: []
        })
        console.log(user_pool)
        bot.sendMessage(chatId, "Hey, you're new. Hi " + msg.chat.first_name);

    }


})