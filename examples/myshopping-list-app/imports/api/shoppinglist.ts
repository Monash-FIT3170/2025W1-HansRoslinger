import { Mongo } from 'meteor/mongo';

// Define the ShoppingList MongoDB collection
export const ShoppingListCollection = new Mongo.Collection<{ item: string; quantity: string }>('shoppingList');

// Function to add the current item and quantity to MongoDB
export const AddToList = (item: string, quantity: string): void => {
    const doc = { item, quantity: quantity };
    ShoppingListCollection.insert(doc); // Insert the new item into the collection
};