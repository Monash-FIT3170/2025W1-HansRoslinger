import { Meteor } from "meteor/meteor";
import { UserCollection } from "/imports/api/database/users/users";

Meteor.startup(async () => {
  Meteor.publish("users", function () {
    return UserCollection.find();
  });
});
