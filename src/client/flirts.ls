window.Users = Meteor.users
window.Flirts = new Meteor.Collection \flirts

Meteor.subscribe \allUserData
Meteor.subscribe \flirts

Session.set \sort-by, null
Session.set \reverse, true

Session.set \show-login-dialog, false
Session.set \login-dialog-error, false
Session.set \has-account, true
Session.set \show-accounts-dialog, false
Session.set \change-password-error, false

Session.set(\show-other-flirter, false)
Session.set(\show-other-target, false)

reset-new-flirter = ->
  Session.set \adding-flirt, false

reset-new-flirter!

Accounts.ui.config {
  passwordSignupFields: 'USERNAME_ONLY'
}

Session.set \flash, null

__flash = (content, type) ->
  Session.set \show-flash, true
  Session.set \flash, {content: content, type: type}
  hide = ->
    $ '#flash-box' .fade-out 'slow', ->
      Session.set \show-flash, false
      Session.set \flash, null
  window.set-timeout hide, 5000

Template.flash.content = ->
  Session.get \flash .content

Template.flash.type = ->
  Session.get \flash .type

Template.flash.showFlash = ->
  Session.get \flash

# utilities
get-flirter-names = ->
  flirts = Flirts.find({}).fetch!
  flirters = _ .map flirts, (.flirter-name)
  targets = _ .map flirts, (.target-name)
  _.uniq flirters.concat(targets)


flirt-count = (user) ->
  Flirts.find {flirter-name: user} .count!

flirted-with-count = (user) ->
  Flirts.find {target-name: user} .count!

current-user = ->
  Meteor.user!

window.flash-success = (content) ->
  __flash(content, "alert-success")

window.flash-info = (content) ->
  __flash(content, "")

window.flash-error = (content) ->
  __flash(content, "alert-error")

Template.account-buttons.link-text = ->
  if Meteor.user-loaded!
    "Logged in as #{current-user! .profile .full-name}"
  else
    "Click here to log in"

Template.account-buttons.events {
  'click #account-link': ->
    if Meteor.user-loaded!
      Session.set(\show-accounts-dialog, true)
    else
      Session.set(\show-login-dialog, true)
    false
}

# People Template
Template.people.sort-icon = (col) ->
  if Session.equals \sort-by, col
    " <i class='pull-right icon-chevron-#{if Session.get \reverse then \down else \up}'></i>"
  else
    ""

set-sort = (state) ->
  if Session.equals \sort-by, state
    Session.set \reverse, !Session.get \reverse
  else
    Session.set \reverse, true
    Session.set \sort-by, state

Template.people.events {
  'click th.name': (e) -> set-sort(\name)
  'click th.flirts': (e) -> set-sort(\flirts)
  'click th.flirted-with': (e) -> set-sort(\flirted-with)
}

Template.people.people = ->
  u = get-flirter-names!

  sorted = switch Session.get(\sort-by)
  | \flirts       => _.sort-by u, flirt-count
  | \flirted-with => _.sort-by u, flirted-with-count
  | \name         => u.sort!
  | otherwise     => u

  if Session.get \reverse
    sorted.reverse!
  else
    sorted

# person template
Template.person.full-name = ->
  @

Template.person.flirt-count = ->
  flirt-count(@)

Template.person.flirted-with-count = ->
  flirted-with-count(@)

Template.person.events {
  'click .add-flirt': (e) ->
    Session.set(\new-flirter-name, @)
}

# add flirt button

Template.add-flirt-button.events {
  "click \#add-flirt": ->
    Session.set(\adding-flirt, true);
}

# add-flirt template
Template.add-flirt.adding-flirt = ->
  Session.get(\adding-flirt)

Template.add-flirt.flirters = ->
  get-flirter-names!

Template.add-flirt.others = ->
  get-flirter-names!

Template.add-flirt.flirter = ->
  Session.get(\new-flirter-name)

Template.add-flirt.events {
  'click .cancel-add-flirt': ->
    reset-new-flirter!

  'click .execute-add-flirt': (evnt, tmpl) ->
    new-flirter = tmpl.find('#flirter-input').value || tmpl.find('#flirter-select > option:selected').id
    target = tmpl.find('#target-input').value || tmpl.find('#target-select > option:selected').id
    if new-flirter == "none" || target == "none"
      flash-error "<strong>Error saving flirt:</strong> You must select both people to add a flirt"
    else if new-flirter == target
      flash-error "<strong>Error saving flirt:</strong> You can't flirt with yourself!"
    else
      Flirts.insert {flirter-name: new-flirter, target-name: target}, (err) ->
        if err?
          flash-error "<strong>Error saving flirt:</strong> You must be logged in as a verified user to add flirts."
        else
          flash-success "<strong>Success:</strong> #{new-flirter} just flirted with #{target}"
    reset-new-flirter!

  'change select#target-select': (evt, tmpl) ->
    id = tmpl.find('#target-select > option:selected').id
    if id is 'other'
      $('#target-input').show!
    else
      $('#target-input').hide!

  'change select#flirter-select': (evt, tmpl) ->
    id = tmpl.find('#flirter-select > option:selected').id
    if id is 'other'
      $('#flirter-input').show!
    else
      $('#flirter-input').hide!
}

Template.add-flirt.rendered = ->
  $('#flirter-input').hide()
  $('#target-input').hide()

Template.chart.rendered = ->
  Meteor.autorun ->
    all-flirts = Flirts.find {} .fetch!
    chart-data = {}
    for flirt in all-flirts
      flirter = flirt.flirter-name
      target = flirt.target-name
      chart-data[flirter]||={}
      chart-data[flirter][target] ||= 0
      chart-data[flirter][target] += 1
    create-chart chart-data

######################### LOGIN STUFF #########################

Template.login-dialog.logged-in = logged-in = ->
  Meteor.userLoaded!

Template.login-dialog.has-account = has-account = ->
  Session.get(\has-account)

Template.login-dialog.events {
  'click .signup-link': ->
    Session.set \has-account, false
    Session.set \login-dialog-error, false
    false
  'click .login-link' : ->
    Session.set \has-account, true
    Session.set \login-dialog-error, false
    false
}

Template.login-dialog.execute-text = ->
  if has-account!
    "Login"
  else
    "Sign up"

Template.login-dialog.login-error = ->
  Session.get(\login-dialog-error)

Template.login-dialog.show-dialog = ->
  Session.get(\show-login-dialog)

login = (e, t) ->
  u = t.find '#login-username' .value
  p = t.find '#login-password' .value
  Meteor.login-with-password u, p, (err) ->
    if err?
      Session.set \login-dialog-error, "Invalid username or password"
    else
      Session.set \show-login-dialog, false
      Session.set \login-dialog-error, false
      flash-success "Welcome to ManageFlirts"

signup = (e, t) ->
  username = t.find '#login-username' .value
  name = t.find '#login-full-name' .value
  password = t.find '#login-password' .value
  confirm = t.find '#login-confirm-password' .value
  if !(username? && name? && password? && confirm?)
    Session.set \login-dialog-error, "All fields are mandatory"
  else if password != confirm
    Session.set \login-dialog-error, "Passwords do not match"
  else
    Session.set \login-dialog-error, false
    Accounts.createUser({
      username: username
      email: "#{username}@plus.net"
      password: password
      profile:
        fullName: name
    }, (err) ->
      if err?
        flash-error "We're sorry but there was an error creating your account. Please try again later."
      else
        flash-success "Welcome to ManageFlirt. Please verify your pn email account before recording flirts."
      Session.set \show-login-dialog, false
    )

cancel-login-dialog = ->
  Session.set \show-login-dialog, false
  Session.set \login-dialog-error, false

submit-login-dialog = (e, t) ->
  if has-account!
    login e, t
  else
    signup e, t

Template.login-dialog.events {
  "click .cancel-login-dialog": ->
    cancel-login-dialog!
  "click .execute-login-dialog": (e, t) ->
    submit-login-dialog e, t
  "keyup \#login-dialog": (e, t) ->
    if e.which == 27
      cancel-login-dialog!
    else if e.which == 13
      submit-login-dialog e, t
}

Template.accounts-dialog.show-dialog = ->
  Session.get \show-accounts-dialog

Template.accounts-dialog.change-password-error = ->
  Session.get \change-password-error

cancel-accounts-dialog = ->
  Session.set \show-accounts-dialog, false

submit-accounts-dialog = (e, t) ->
  old-p = t .find '#old-password' .value
  new-p = t .find '#new-password' .value
  con-p = t .find '#confirm-password' .value
  if new-p == con-p
    Accounts.change-password old-p, new-p, (err) ->
      if err?
        Session.set \change-password-error, err.reason
      else
        Session.set \change-password-error, false
        Session.set \show-accounts-dialog, false
  else
    Session.set \change-password-error, "Passwords do not match"

Template.accounts-dialog.events {
  "click .cancel-accounts-dialog": ->
    cancel-accounts-dialog!
  "click .sign-out": ->
    Session.set \show-accounts-dialog, false
    Session.set \has-account, true
    Meteor.logout!
  "click .change-password": (e, t) ->
    submit-accounts-dialog e, t
  "keyup \#accounts-dialog": (e, t) ->
    if e.which == 27
      cancel-accounts-dialog!
    else if e.which == 13
      submit-accounts-dialog e, t
}
