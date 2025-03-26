import { Mongo } from 'meteor/mongo';

// Define the ShoppingList MongoDB collection
export const ShoppingListCollection = new Mongo.Collection('shoppingList');

// Function to add the current item and quantity to MongoDB
export const AddToList = (item, quantity) => {
  const doc = { item, quantity: parseInt(quantity) };
  ShoppingListCollection.insert(doc); // Insert the new item into the collection
};