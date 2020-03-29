require("dotenv").config()
const Discord = require("discord.js")
const fs = require('fs');
const cron = require("node-cron");

const client = new Discord.Client({disableEveryone: true})
const prefix = "!"
var role;
var guildActive = true;
var currentDate = new Date();
var storedMessage; //a variable for storing the Message object used for all of the functions
var task; //variables for the Cron Job
var timeStart;
var timeStop;
var hourStart;
var minutesStart;
var hourStop;
var minutesStop;

var guildID; //test variable

const helpMessage = new Discord.RichEmbed()
  .setTitle("GateKeeper - Pomoc")
  /*
   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
   */
  .setColor(0xAB003C)
  .setDescription("Jestem botem stworzonym do 'wyłączania' i 'włączania' szkolnego serwera.")
  .addField("Komenda:",
    "```!setup HH:MM HH:MM``` tworzy rolę *Muted*, która o sprecyzowanej godzinie \
     zostaje nadana/usunięta wszystkim użytkownikom serwera")
  .addField("Przykład:", "```!setup 7:00 23:00``` Serwer zostaje 'włączony' o godzinie 7:00 \
  oraz 'wyłączony' o godzinie 23:00")
  .addField("\n Ręczne 'uruchomienie' serwera:", "```!start```")
  .addField("\n Ręczne 'wyłączenie' serwera:", "```!stop```")
  .addField("\n Anulowanie requestu !setup:", "```!cancel```")
  .addField("\n Wyświetlenie statusu BOTa:","```!status```")
  .addField("\n Wyświetlenie tej wiadomości:", "```!help```")
    /*
   * Inline fields may not display as inline if the thumbnail and/or image is too big.
   */
  .addField("Autor", "Michał Kurek", true)
  /*
   * Blank field, useful to create some space.
   */
  .addBlankField(true)
  .addField("Dla:", "V LO Zamoyski", true);

var statusMessage = new Discord.RichEmbed()
  .setTitle("GateKeeper - Status")
  //.setAuthor("Autor: Michał Kurek")
  /*
   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
   */
  .setColor(0xAB003C)
  //.setFooter("Stópka")
  //.setImage()
  //.setThumbnail()
  /*
   * Takes a Date object, defaults to current date.
   */
  //.setTimestamp()
  //.setURL()
  .addField("Status:","OK")
  /*
   * Inline fields may not display as inline if the thumbnail and/or image is too big.
   */
   .addField("Godzina otwarcia:", `Nie ustawiono`, true)
   .addBlankField(true)
   .addField("Godzina zamknięcia:", `Nie ustawiono`, true);


function unmuteUsers(message, role) {

  message.guild.members.forEach((user) => {
    if(user.hasPermission("ADMINISTRATOR")){
      return;
    }
    user.removeRole(role.id).catch(console.error)
  });

}
//'692388332130533447' -- role id for debugging

function muteUsers(message, role) {

  message.guild.members.forEach((user) => {
    if(user.hasPermission("ADMINISTRATOR")){
      return;            //if user is an admin, skip him
    }
    if(user.voiceChannel){
      user.setVoiceChannel(null);  //if user in a VC, kick him from it
      user.setMute(1).catch(console.error);
      user.setDeaf(1).catch(console.error);
    }

    user.addRole(role.id).catch(console.error)  // mute each user in the guild and catch errors
  });
}
/*
function muteVC(message){

  message.guild.members.forEach((user) => {
    user.setMute(1).catch(console.error);
  });
}*/

function startGuild(message){
  if(!roleExists()){
    message.channel.send("Please run !setup first before executing any commands.");
    return;
  }
  unmuteUsers(message, role);
  console.log(" Channels have been unmuted.");
  return;
}

function stopGuild(message){
  if(!roleExists()){
    message.channel.send("Please run !setup first before executing any commands.");
    return;
  }
  muteUsers(message, role);
  //muteVC(message);
  console.log(" Channels have been muted.");
  return;
}

function roleExists(){
  if(role = storedMessage.guild.roles.find(r => r.name === "Muted")){
    return true;
  }
  return false;
}

function changeGuildStatus(message){
  if(guildActive){
    console.log(" Deactivating the guild!");
    guildActive = false;
    stopGuild(message);
  } else {
    console.log(" Activating the guild!")
    guildActive = true;
    startGuild(message);
  }
};

function setupCronJob(message){
  //var manageGuild = new cron.CronJob(`* ${minutesStart}/${minutesStop} ${hourStart}/${hourStop} * * *`, changeGuildStatus(storedMessage));
  //var manageGuild = new cron.CronJob('*2 * * * * *', changeGuildStatus(storedMessage));
  //manageGuild.start();
  console.log(" Setting up the CronJob");
  task = cron.schedule(`${minutesStart},${minutesStop} ${hourStart},${hourStop} * * *`, () => changeGuildStatus(storedMessage));
  console.log(" -----CronJob starting!-----")

  //displaying the status message to the chat
  statusMessage.fields[1].value = `${hourStart}:${minutesStart}`
  //statusMessage.fields[1] = ("Godzina zamknięcia:", `${hourStop}:${minutesStop}`, true);

  // the second field is a BLIND field
  statusMessage.fields[3].value = `${hourStop}:${minutesStop}`
  return;
}''


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guild(s).`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). Member count: ${guild.memberCount}`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`Bot removed from: ${guild.name} (id: ${guild.id})`);

});

client.on('error', function (err) {
  console.log('Global error handler called');
  console.log('err');
});

client.on('message', async message => {


  if(message.author.bot) return;

  if(message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);

  if(!command.startsWith(prefix)) return;
  if(!message.member.hasPermission("ADMINISTRATOR")) return;
  storedMessage = message;

  if(command === `${prefix}help`){
    message.channel.send(helpMessage);
  }

  if(command === prefix + 'setup'){

    role = message.guild.roles.find(r => r.name === "Muted");
    if(!role){
      console.log(" Setting up the required role");
      try {
        role = await message.guild.createRole({
          name: "Muted",
          color: "#FF0000",
          permissions: []
        });

        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(role, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            CONNECT: false,
            SPEAK: false,
            VIEW_CHANNEL: true
          });
        });
        /*
        message.guild.channels.voiceChannel.forEach(async (vc, id) => {
          await vc.overwritePermissions(role, {
            CONNECT: false,
            SPEAK: false
          });
        });*/

        await role.setPosition(0);
        console.log(" Role position set!");
      } catch(error) {
          console.log(error.stack);
      }
    }
    if(args.length < 2){
      console.log(" Too little arguments given!");
      message.channel.send("Too little arguments given!");
      return;
    }
    if(args.length > 2){
      console.log(" Too many arguments given!");
      message.channel.send("Too many arguments given!");
      return;
    }

    //Regex for the HH:MM time format
    var regexTime = /^(\d{1,2}(?!\d):?){2,3}$/;

    //Get the command arguments
    timeStart = args[0];
    timeStop = args[1];

    //Get the start time ( check regex )
    if (regexTime.test(timeStart)){
      console.log(" Start time regex matched!");
      hourStart = timeStart.substr(0, timeStart.indexOf(":"));
      if(hourStart >= 24 || hourStart < 0){
        console.log(" Start hour incorrect!");
        message.channel.send("Wpisz poprawną godzinę otwarcia serwera z zakresu 0-23")
        return;
      }
      minutesStart = timeStart.substr(timeStart.indexOf(":") + 1);
      if(minutesStart >= 60 || minutesStart < 0){
        console.log(" Start minute incorrect!");
        message.channel.send("Wpisz poprawną minutę otwarcia serwera z zakresu 0-59");
        return;
      }
      console.log(`Specified start time was ${hourStart}:${minutesStart}`);
    } else {
      console.log(" Start time regex not matched!")
      console.log(`User input was ${timeStart}`)
      message.channel.send("Wpisz godzinę otwarcia serwera w poprawnym formacie (HH:MM)");
      return;
    }

    //Get the stop time ( regex )
    if (regexTime.test(timeStop)){
      console.log(" Stop time regex matched!");
      hourStop = timeStop.substr(0, timeStop.indexOf(":"));
      if(hourStart >= 24 || hourStart < 0){
        console.log("Closure hour incorrect!");
        message.channel.send("Wpisz poprawną godzinę zamknięcia serwera z zakresu 0-23")
        return;
      }
      minutesStop = timeStop.substr(timeStop.indexOf(":") + 1);
      console.log(`Specified closure time was ${hourStop}:${minutesStop}`);
    } else {
      console.log(" Stop time regex not matched!")
      console.log(`User input was ${timeStop}`)
      message.channel.send("Wpisz godzinę zamknięcia serwera w poprawnym formacie (HH:MM)");
      return;
    }
    console.log(" Logging requested setup to ./requested.txt");
    fs.writeFile('requested.txt', `${hourStart} ${minutesStart} ${hourStop} ${minutesStop}`, function (err) {
      if (err) return console.log(err);
      console.log(`${hourStart} ${minutesStart} ${hourStop} ${minutesStop} > requested.txt`);
    });


    setupCronJob(message);
    message.channel.send(statusMessage);
    return;
    /*
    //var manageGuild = new cron.CronJob(`* ${minutesStart}/${minutesStop} ${hourStart}/${hourStop} * * *`, changeGuildStatus(storedMessage));
    //var manageGuild = new cron.CronJob('*2 * * * * *', changeGuildStatus(storedMessage));
    //manageGuild.start();
    console.log(" Setting up the CronJob");
    task = cron.schedule(`${minutesStart},${minutesStop} ${hourStart},${hourStop} * * *`, () => changeGuildStatus(storedMessage));
    console.log(" -----CronJob starting!-----")

    //displaying the status message to the chat
    statusMessage.fields[1].value = `${hourStart}:${minutesStart}`
    //statusMessage.fields[1] = ("Godzina zamknięcia:", `${hourStop}:${minutesStop}`, true);

    // the second field is a BLIND field
    statusMessage.fields[3].value = `${hourStop}:${minutesStop}`
    message.channel.send(statusMessage);
    */
  }
  if(command === `${prefix}cancel`){
    if(!roleExists()){
      message.channel.send("Please run !setup first before executing any commands.");
      console.log(" !cancel requested before !setup");
      return;
    }
    if(task){
      task.destroy();
      /*
      var hourStart = null;
      var timeStart = null;
      var minutesStart = null;
      var hourStop = null;
      var minutesStop = null;
      */
      console.log(" -----CronJob destroyed!-----");
    } else {
      console.log(" No job to destroy.");
    }
    fs.writeFile('requested.txt', ``, function (err) {
      if (err) return console.log(err);
      console.log(` > requested.txt`);
    });
    console.log(" Cleared the ./requested.txt");
    return;
  }

  if(command === `${prefix}status`){
    message.channel.send("GateKeeper obecny!");
    if(task){
      statusMessage.fields[1].value = `${hourStart}:${minutesStart}`
      //statusMessage.fields[1] = ("Godzina zamknięcia:", `${hourStop}:${minutesStop}`, true);
      // the second field is a BLIND field
      statusMessage.fields[3].value = `${hourStop}:${minutesStop}`
    }

    //update requested jobs
    let contents = fs.readFileSync('requested.txt');
    if(contents.length > 0){
      console.log(`Found requested job for ${contents}`);
      contents = contents + ''; //convert object into string
      args = contents.split(" ");
      hourStart = args[0];
      minutesStart = args[1];
      hourStop = args[2];
      minutesStop = args[3];
      var myGuild = client.guilds.get("the guild id");
      setupCronJob(message);
    } else {
      console.log("Found ./requested.txt but it was empty!");
    }


    message.channel.send(statusMessage);
    return;
  }

  if(command === `${prefix}stop`){

    stopGuild(message, role);
    guildActive = false;
    return;
    /*let role = message.guild.roles.find(r => r.name === "Muted");
    if(!role){      try {
        role = nessage.guild.createRole({
          name: "Muted",
          color: "#FF0000",
          permissions: []
        });

        message.guild.channels.forEach((channel, id) => {
          channel.overwritePermissions(role, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      } catch(error) {
          console.log(error.stack);
      }
    }
    muteUsers(message, role);
    muteVC(message);
    message.channel.sendMessage("Text channels have been muted.");
    return;*/
  }
  if(command === `${prefix}start`){

    startGuild(message,role);
    guildActive = true;
    return;
    /*if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.sendMessage("You do not have the required permission to do so!");
    let role = message.guild.roles.find(r => r.name === "Muted");
    if(!role){
      message.channel.sendMessage("Role for the Muted users hasn't been created yet. Please run !mute first");
    }
    unmuteUsers(message, role);
    message.channel.sendMessage("Text channels have been unmuted.");
    return;*/
  }
  if(command === `${prefix}purge`) {

    let deleteCount = args[0];
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});



/*
client.on("messageReactionAdd",(reaction,user)=>{
  if(!user) return;
  if(user.bot)return;
  if(!reaction.message.channel.guild) return;
  for(let n in emojiname){
  if(reaction.emoji.name == emojiname[n]){
    let role = reaction.message.guild.roles.find(r => r.name == rolename[n]);
    reaction.message.guild.member(user).addRole(role).catch(console.error);
  }
}
});


client.on("messageReactionRemove",(reaction,user)=>{
  if(!user) return;
  if(user.bot)return;
  if(!reaction.message.channel.guild) return;
  for(let n in emojiname){
  if(reaction.emoji.name == emojiname[n]){
    let role = reaction.message.guild.roles.find(r => r.name == rolename[n]);
    reaction.message.guild.member(user).removeRole(role).catch(console.error);
  }
  }
});
*/
client.login(process.env.BOT_TOKEN)
