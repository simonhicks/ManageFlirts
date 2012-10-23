Meteor.publish('allUserData', function(){
  return Meteor.users.find({}, {
    fields: {
      profile: 1,
      _id: 1
    }
  });
});
global.Flirts = new Meteor.Collection('flirts');
Flirts.allow({
  insert: function(userId, flirt){
    var user, verified, i$, ref$, len$, email;
    user = Meteor.users.findOne({
      _id: userId
    });
    verified = false;
    for (i$ = 0, len$ = (ref$ = user.emails).length; i$ < len$; ++i$) {
      email = ref$[i$];
      console.log(email);
      verified = verified || email.verified;
    }
    return verified;
  }
});
Meteor.publish('flirts', function(){
  return Flirts.find({});
});