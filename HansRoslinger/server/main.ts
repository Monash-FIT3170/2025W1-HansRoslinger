import './gcp';
import { Meteor } from "meteor/meteor";
import { UserCollection } from "/imports/api/database/users/users";
import { PresentationCollection } from "/imports/api/database/presentations/presentations";
import { DatasetCollection } from "/imports/api/database/dataset/dataset";
import { AssetCollection } from "/imports/api/database/assets/assets";
import { ImageCollection } from "/imports/api/database/images/images";

Meteor.startup(async () => {
  Meteor.publish("users", function () {
    return UserCollection.find();
  });
  Meteor.publish("presentations", function () {
    return PresentationCollection.find();
  });
  Meteor.publish("datasets", function () {
    return DatasetCollection.find();
  });
  Meteor.publish('images', function () {
    return ImageCollection.find();
  });
  Meteor.publish('assets', function () {
    return AssetCollection.find();
  });
  
});
