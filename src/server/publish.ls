Meteor.publish \allUserData, ->
  Meteor.users.find {}, {
    fields:
      profile: 1
      _id: 1
  }

global.Flirts = new Meteor.Collection \flirts

Flirts.allow {
  insert: (user-id, flirt) ->
    user = Meteor.users.find-one {_id: user-id}
    if user?
      verified = false
      for email in user.emails
        console.log email
        verified = verified || email.verified
      verified
}

Flirts.allow {
  insert: (user-id, flirt) ->
    flirt?.target-name?.length > 0 && flirt?.flirter-name?.length > 0

Meteor.publish \flirts, ->
  Flirts.find({})
