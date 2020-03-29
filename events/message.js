module.exports = (client, message) => {
  if(message.content.startsWith(prefix+"reaction")){
    if(!message.channel.guild) return;
    for(let n in emojiname){
    var emoji =[message.guild.emojis.find(r => r.name == emojiname[n])];
    for(let i in emoji){
     message.react(emoji[i]);
    }
   }
  }
}
