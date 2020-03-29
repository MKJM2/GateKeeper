require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client({disableEveryone: true})
const prefix = "!"
const cron = require("node-cron");
var role;
var guildActive = true;
var currentDate = new Date();
var storedMessage; //a variable for storing the Message object used for all of the functions
var task;


function unmuteUsers(message, role) {

  message.guild.members.forEach((user) => {
    user.removeRole(role.id).catch(console.error)
  });

}
//'692388332130533447' -- role id for debugging

function muteUsers(message, role) {

  message.guild.members.forEach((user) => {
    if(user.voiceChannel){      //if user currently in a VC, kick him from it
      user.setVoiceChannel(null);
    }
    user.addRole(role.id).catch(console.error)
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
  console.log(currentDate.toLocaleString() + " Channels have been unmuted.");
  return;
}

function stopGuild(message){
  if(!roleExists()){
    message.channel.send("Please run !setup first before executing any commands.");
    return;
  }
  muteUsers(message, role);
  //muteVC(message);
  console.log(currentDate.toLocaleString() + " Channels have been muted.");
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
    console.log(currentDate.toLocaleString() + " Deactivating the guild!");
    guildActive = false;
    stopGuild(message);
  } else {
    console.log(currentDate.toLocaleString() + " Activating the guild!")
    guildActive = true;
    startGuild(message);
  }
};
//let job1 = new cron.CronJob('*/5 * * * * *', test); // odpala co 5 sekund funkcję test

// Aby odpalić funkcję test
//job1.start();
// Aby wyłączyć funkcję test
//job1.stop();

client.on('message', message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);

  if(!command.startsWith(prefix)) return;
  if(!message.member.hasPermission("ADMINISTRATOR")) return;
  storedMessage = message;

  if(command === prefix + 'setup'){
    console.log(currentDate.toLocaleString() + " Setting up the required role");
    role = message.guild.roles.find(r => r.name === "Muted");
    if(!role){
      try {
        role = message.guild.createRole({
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
    console.log(currentDate.toLocaleString() + " Setting up the CronJob");
    if(args.length < 4){
      console.log(currentDate.toLocaleString() + " Too little arguments given!");
      message.channel.send("Too little arguments given!");
      return;
    }
    if(args.length > 4){
      console.log(currentDate.toLocaleString() + " Too many arguments given!");
      message.channel.send("Too many arguments given!");
      return;
    }
    let hourStart = args[0];
    let minutesStart = args[1];
    let hourStop = args[2];
    let minutesStop = args[3];

    //var manageGuild = new cron.CronJob(`* ${minutesStart}/${minutesStop} ${hourStart}/${hourStop} * * *`, changeGuildStatus(storedMessage));
    //var manageGuild = new cron.CronJob('*/2 * * * * *', changeGuildStatus(storedMessage));
    //manageGuild.start();
    console.log(currentDate.toLocaleString() + " -----CronJob starting!-----")
    task = cron.schedule(`${minutesStart},${minutesStop} ${hourStart},${hourStop} * * *`, () => changeGuildStatus(storedMessage));
  }
  if(command === `${prefix}cancel`){
    if(!roleExists()){
      message.channel.send("Please run !setup first before executing any commands.");
      console.log(currentDate.toLocaleString() + " !cancel requested before !setup");
      return;
    }
    task.stop();
    console.log(currentDate.toLocaleString() + " -----CronJob stopped!-----");
    return;
  }
  if(command === `${prefix}stop`){

    stopGuild(message, role);
    return;
    /*let role = message.guild.roles.find(r => r.name === "Muted");
    if(!role){
      try {
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
