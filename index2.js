require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")
const prefix = "!"

var cron = require("cron");

var list;

function unmuteUsers() {
  memberList = list.members
  console.log(memberList);
  memberList.forEach((user) => {
    user.removeRole('692388332130533447').catch(console.error)
  });

}


function muteUsers() {
  memberList = list.members
  console.log(memberList);
  /*for(let member in memberList){
    console.log(member);
    memberList[n].addRole('Muted').catch(console.error);
    member.send("Hello!")
  }*/
  //memberList.first().send("Hello!")
  memberList.forEach((user) => {
    /*console.log(user.roles)
    user.roles.addRole('692388332130533447')
    console.log("Pushing...")
    console.log(user.roles)*/
    user.addRole('692388332130533447').catch(console.error)

  });

}


function test() {
  console.log("Działa!");
}

let job1 = new cron.CronJob('*/5 * * * * *', test); // odpala co 5 sekund funkcję test


// Aby odpalić funkcję test
//job1.start();
// Aby wyłączyć funkcję test
//job1.stop();



client.on('message', async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);

  if(!command.startsWith(prefix)) return;

  if(command === '${prefix}mute'){
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.sendMessage("You do not have the required permission to do so!");

    let role = message.guild.roles.find(r => r.name === "Muted");
    if(!role){
      try {
        role = await nessage.guild.createRole({
          name: "Muted",
          color: "#FF0000",
          permissions: []
        });

        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(role, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      } catch(error) {
          console.log(error.stack);
      }
    }

    await muteUsers();
    message.channel.sendMessage("Text channels have been muted.");
    return;
  }
});



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



client.login(process.env.BOT_TOKEN)
