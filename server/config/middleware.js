module.exports = {
    isAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash("errorMessage", " you dont have permission to access this page");
      res.redirect("/login");
    },

    isLoggedout: function(req, res, next) {
      if (req.isAuthenticated()) {
        req.flash("errorMessage", " already logged in");
        res.redirect("/dashboard");
      }
      else{
        return next();
      }
    },

    isAdmin: function(req, res, next) {
      if (req.user.status === 'ADMIN') {
        return next();
      }
      req.flash("errorMessage", " you dont have permission to access this page");
      res.redirect("/login");
    },

    isManager: function(req, res, next) {
      if (req.user.status === 'MANAGER') {
        return next();
      }
    },

    isModerator: function(req, res, next) {
      if (req.user.status == 'MANAGER') {
        return next();
      }
      else {
        id = req.user.id;
        Member.findAll({ where: { UserId: id } });
        if (memeber) {
          meet = Meet.findOne({ where: { uuid:  req.params.uuid } });
          if (meet.id == memeber.MeetId) {
            return next();
          }
          else {
            req.flash("errorMessage", " you dont have permission to access this meet");
            res.redirect("/dashboard");
          }
        }
        else {
          req.flash("errorMessage", " you dont have permission to access this meet");
          res.redirect("/dashboard");
        }
      }
    }
  };

