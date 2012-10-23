var resetNewFlirter, __flash, getFlirterNames, flirtCount, flirtedWithCount, currentUser, setSort, loggedIn, hasAccount, login, signup, cancelLoginDialog, submitLoginDialog, cancelAccountsDialog, submitAccountsDialog;
window.Users = Meteor.users;
window.Flirts = new Meteor.Collection('flirts');
Meteor.subscribe('allUserData');
Meteor.subscribe('flirts');
Session.set('sort-by', null);
Session.set('reverse', true);
Session.set('show-login-dialog', false);
Session.set('login-dialog-error', false);
Session.set('has-account', true);
Session.set('show-accounts-dialog', false);
Session.set('change-password-error', false);
Session.set('show-other-flirter', false);
Session.set('show-other-target', false);
resetNewFlirter = function(){
  return Session.set('adding-flirt', false);
};
resetNewFlirter();
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});
Session.set('flash', null);
__flash = function(content, type){
  var hide;
  Session.set('show-flash', true);
  Session.set('flash', {
    content: content,
    type: type
  });
  hide = function(){
    return $('#flash-box').fadeOut('slow', function(){
      Session.set('show-flash', false);
      return Session.set('flash', null);
    });
  };
  return window.setTimeout(hide, 5000);
};
Template.flash.content = function(){
  return Session.get('flash').content;
};
Template.flash.type = function(){
  return Session.get('flash').type;
};
Template.flash.showFlash = function(){
  return Session.get('flash');
};
getFlirterNames = function(){
  var flirts, flirters, targets;
  flirts = Flirts.find({}).fetch();
  flirters = _.map(flirts, function(it){
    return it.flirterName;
  });
  targets = _.map(flirts, function(it){
    return it.targetName;
  });
  return _.uniq(flirters.concat(targets));
};
flirtCount = function(user){
  return Flirts.find({
    flirterName: user
  }).count();
};
flirtedWithCount = function(user){
  return Flirts.find({
    targetName: user
  }).count();
};
currentUser = function(){
  return Meteor.user();
};
window.flashSuccess = function(content){
  return __flash(content, "alert-success");
};
window.flashInfo = function(content){
  return __flash(content, "");
};
window.flashError = function(content){
  return __flash(content, "alert-error");
};
Template.accountButtons.linkText = function(){
  if (Meteor.userLoaded()) {
    return "Logged in as " + currentUser().profile.fullName;
  } else {
    return "Click here to log in";
  }
};
Template.accountButtons.events({
  'click #account-link': function(){
    if (Meteor.userLoaded()) {
      Session.set('show-accounts-dialog', true);
    } else {
      Session.set('show-login-dialog', true);
    }
    return false;
  }
});
Template.people.sortIcon = function(col){
  if (Session.equals('sort-by', col)) {
    return " <i class='pull-right icon-chevron-" + (Session.get('reverse') ? 'down' : 'up') + "'></i>";
  } else {
    return "";
  }
};
setSort = function(state){
  if (Session.equals('sort-by', state)) {
    return Session.set('reverse', !Session.get('reverse'));
  } else {
    Session.set('reverse', true);
    return Session.set('sort-by', state);
  }
};
Template.people.events({
  'click th.name': function(e){
    return setSort('name');
  },
  'click th.flirts': function(e){
    return setSort('flirts');
  },
  'click th.flirted-with': function(e){
    return setSort('flirted-with');
  }
});
Template.people.people = function(){
  var u, sorted;
  u = getFlirterNames();
  sorted = (function(){
    switch (Session.get('sort-by')) {
    case 'flirts':
      return _.sortBy(u, flirtCount);
    case 'flirted-with':
      return _.sortBy(u, flirtedWithCount);
    case 'name':
      return u.sort();
    default:
      return u;
    }
  }());
  if (Session.get('reverse')) {
    return sorted.reverse();
  } else {
    return sorted;
  }
};
Template.person.fullName = function(){
  return this;
};
Template.person.flirtCount = function(){
  return flirtCount(this);
};
Template.person.flirtedWithCount = function(){
  return flirtedWithCount(this);
};
Template.person.events({
  'click .add-flirt': function(e){
    return Session.set('new-flirter-name', this);
  }
});
Template.addFlirtButton.events({
  "click #add-flirt": function(){
    return Session.set('adding-flirt', true);
  }
});
Template.addFlirt.addingFlirt = function(){
  return Session.get('adding-flirt');
};
Template.addFlirt.flirters = function(){
  return getFlirterNames();
};
Template.addFlirt.others = function(){
  return getFlirterNames();
};
Template.addFlirt.flirter = function(){
  return Session.get('new-flirter-name');
};
Template.addFlirt.events({
  'click .cancel-add-flirt': function(){
    return resetNewFlirter();
  },
  'click .execute-add-flirt': function(evnt, tmpl){
    var newFlirter, target;
    newFlirter = tmpl.find('#flirter-input').value || tmpl.find('#flirter-select > option:selected').id;
    target = tmpl.find('#target-input').value || tmpl.find('#target-select > option:selected').id;
    if (newFlirter === "none" || target === "none") {
      flashError("<strong>Error saving flirt:</strong> You must select both people to add a flirt");
    } else if (newFlirter === target) {
      flashError("<strong>Error saving flirt:</strong> You can't flirt with yourself!");
    } else {
      Flirts.insert({
        flirterName: newFlirter,
        targetName: target
      }, function(err){
        if (err != null) {
          return flashError("<strong>Error saving flirt:</strong> You must be logged in as a verified user to add flirts.");
        } else {
          return flashSuccess("<strong>Success:</strong> " + newFlirter + " just flirted with " + target);
        }
      });
    }
    return resetNewFlirter();
  },
  'change select#target-select': function(evt, tmpl){
    var id;
    id = tmpl.find('#target-select > option:selected').id;
    if (id === 'other') {
      return $('#target-input').show();
    } else {
      return $('#target-input').hide();
    }
  },
  'change select#flirter-select': function(evt, tmpl){
    var id;
    id = tmpl.find('#flirter-select > option:selected').id;
    if (id === 'other') {
      return $('#flirter-input').show();
    } else {
      return $('#flirter-input').hide();
    }
  }
});
Template.addFlirt.rendered = function(){
  $('#flirter-input').hide();
  return $('#target-input').hide();
};
Template.chart.rendered = function(){
  return Meteor.autorun(function(){
    var allFlirts, chartData, i$, len$, flirt, flirter, target, ref$;
    allFlirts = Flirts.find({}).fetch();
    chartData = {};
    for (i$ = 0, len$ = allFlirts.length; i$ < len$; ++i$) {
      flirt = allFlirts[i$];
      flirter = flirt.flirterName;
      target = flirt.targetName;
      chartData[flirter] || (chartData[flirter] = {});
      (ref$ = chartData[flirter])[target] || (ref$[target] = 0);
      chartData[flirter][target] += 1;
    }
    return createChart(chartData);
  });
};
Template.loginDialog.loggedIn = loggedIn = function(){
  return Meteor.userLoaded();
};
Template.loginDialog.hasAccount = hasAccount = function(){
  return Session.get('has-account');
};
Template.loginDialog.events({
  'click .signup-link': function(){
    Session.set('has-account', false);
    Session.set('login-dialog-error', false);
    return false;
  },
  'click .login-link': function(){
    Session.set('has-account', true);
    Session.set('login-dialog-error', false);
    return false;
  }
});
Template.loginDialog.executeText = function(){
  if (hasAccount()) {
    return "Login";
  } else {
    return "Sign up";
  }
};
Template.loginDialog.loginError = function(){
  return Session.get('login-dialog-error');
};
Template.loginDialog.showDialog = function(){
  return Session.get('show-login-dialog');
};
login = function(e, t){
  var u, p;
  u = t.find('#login-username').value;
  p = t.find('#login-password').value;
  return Meteor.loginWithPassword(u, p, function(err){
    if (err != null) {
      return Session.set('login-dialog-error', "Invalid username or password");
    } else {
      Session.set('show-login-dialog', false);
      Session.set('login-dialog-error', false);
      return flashSuccess("Welcome to ManageFlirts");
    }
  });
};
signup = function(e, t){
  var username, name, password, confirm;
  username = t.find('#login-username').value;
  name = t.find('#login-full-name').value;
  password = t.find('#login-password').value;
  confirm = t.find('#login-confirm-password').value;
  if (!(username != null && name != null && password != null && confirm != null)) {
    return Session.set('login-dialog-error', "All fields are mandatory");
  } else if (password !== confirm) {
    return Session.set('login-dialog-error', "Passwords do not match");
  } else {
    Session.set('login-dialog-error', false);
    return Accounts.createUser({
      username: username,
      email: username + "@plus.net",
      password: password,
      profile: {
        fullName: name
      }
    }, function(err){
      if (err != null) {
        flashError("We're sorry but there was an error creating your account. Please try again later.");
      } else {
        flashSuccess("Welcome to ManageFlirt. Please verify your pn email account before recording flirts.");
      }
      return Session.set('show-login-dialog', false);
    });
  }
};
cancelLoginDialog = function(){
  Session.set('show-login-dialog', false);
  return Session.set('login-dialog-error', false);
};
submitLoginDialog = function(e, t){
  if (hasAccount()) {
    return login(e, t);
  } else {
    return signup(e, t);
  }
};
Template.loginDialog.events({
  "click .cancel-login-dialog": function(){
    return cancelLoginDialog();
  },
  "click .execute-login-dialog": function(e, t){
    return submitLoginDialog(e, t);
  },
  "keyup #login-dialog": function(e, t){
    if (e.which === 27) {
      return cancelLoginDialog();
    } else if (e.which === 13) {
      return submitLoginDialog(e, t);
    }
  }
});
Template.accountsDialog.showDialog = function(){
  return Session.get('show-accounts-dialog');
};
Template.accountsDialog.changePasswordError = function(){
  return Session.get('change-password-error');
};
cancelAccountsDialog = function(){
  return Session.set('show-accounts-dialog', false);
};
submitAccountsDialog = function(e, t){
  var oldP, newP, conP;
  oldP = t.find('#old-password').value;
  newP = t.find('#new-password').value;
  conP = t.find('#confirm-password').value;
  if (newP === conP) {
    return Accounts.changePassword(oldP, newP, function(err){
      if (err != null) {
        return Session.set('change-password-error', err.reason);
      } else {
        Session.set('change-password-error', false);
        return Session.set('show-accounts-dialog', false);
      }
    });
  } else {
    return Session.set('change-password-error', "Passwords do not match");
  }
};
Template.accountsDialog.events({
  "click .cancel-accounts-dialog": function(){
    return cancelAccountsDialog();
  },
  "click .sign-out": function(){
    Session.set('show-accounts-dialog', false);
    Session.set('has-account', true);
    return Meteor.logout();
  },
  "click .change-password": function(e, t){
    return submitAccountsDialog(e, t);
  },
  "keyup #accounts-dialog": function(e, t){
    if (e.which === 27) {
      return cancelAccountsDialog();
    } else if (e.which === 13) {
      return submitAccountsDialog(e, t);
    }
  }
});