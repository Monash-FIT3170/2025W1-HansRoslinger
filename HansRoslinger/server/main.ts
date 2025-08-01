import { Meteor } from "meteor/meteor";
import { UserCollection } from "/imports/api/database/users/users";
import { PresentationCollection } from "/imports/api/database/presentations/presentations";

Meteor.startup(async () => {
  Meteor.publish("users", function () {
    return UserCollection.find();
  });
  Meteor.publish("presentations", function () {
    return PresentationCollection.find();
  })
});
