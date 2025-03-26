import React, { useState } from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import { InputField, Button } from './Input';
import { TextBox } from './Output'; // Importing TextBox component to display output
import { ShoppingListCollection, AddToList } from '../api/shoppinglist.js';
import { useTracker } from 'meteor/react-meteor-data';

export const App = () => {
  const [item, setItem] = useState('Apple'); // useState is a very common react function that defines a variable 'item' and a function 'setItem' that is used to modify that item
  const [quantity, setQuantity] = useState('5');
  const [shoppingList, setShoppingList] = useState([]);

  const handleItemChange = (e) => setItem(e.target.value); // Here we have defined a function which will update the value of the item variable when we enter anything into its InputField
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  // Subscribe to the shopping list
  useTracker(() => {
    Meteor.subscribe('shoppingList'); // Subscribe to the shopping list data
    const items = ShoppingListCollection.find().fetch(); // Fetch the shopping list items
    setShoppingList(items); // Update the shopping list state
  }, []);

  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <Hello />
      <Info />

      {/* Input for item */}
      <InputField
        label="Item"
        type="text"
        value={item} // The value of the item is displayed to the text box
        onChange={handleItemChange} // When you type into the text box, the value is updated
      />

      {/* Input for quantity */}
      <InputField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
      />

      <br></br>

      <Button
        label="Add to List"
        onClick={() => AddToList(item, quantity)}
      />
      <br></br>
      <br></br>

      {/* Display the current items and quantity in the shopping list */}
      <TextBox value={shoppingList.map(entry => `Item: ${entry.item}, Quantity: ${entry.quantity}`).join('\n')} />
    </div>
  );
};
