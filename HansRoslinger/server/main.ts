import { Meteor } from "meteor/meteor";
import { UserCollection } from "/imports/api/database/users/users";
import { PresentationCollection } from "/imports/api/database/presentations/presentations";
import { DatasetCollection } from "/imports/api/database/dataset/dataset";

Meteor.startup(async () => {
  Meteor.publish("users", function () {
    return UserCollection.find();
  });
  Meteor.publish("presentations", function () {
    return PresentationCollection.find();
  })
  Meteor.publish("datasets", function () {
    return DatasetCollection.find();
  })
});
