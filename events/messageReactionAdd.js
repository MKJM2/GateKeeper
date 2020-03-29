module.exports = (client, reaction, user) =>{
  if(!user) return;
  if(user.bot)return;
  if(!reaction.message.channel.guild) return;
  for(let n in emojiname){
  if(reaction.emoji.name == emojiname[n]){
    let role = reaction.message.guild.roles.find(r => r.name == rolename[n]);
    reaction.message.guild.member(user).addRole(role).catch(console.error);
    }
  }
}
