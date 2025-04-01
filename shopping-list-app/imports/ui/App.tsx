// App.tsx
import React, { useState } from 'react';
import { Hello } from './Hello';
import { Info } from './Info';
import { InputField, Button } from './Input';
import { TextBox } from './Output'; // Importing TextBox component to display output

export const App: React.FC = () => {
  const [item, setItem] = useState<string>('Apple'); //useState is a very common react function that defines a variable 'item' and a function 'setitem' that is used to modify that item
  const [quantity, setQuantity] = useState<string>('5'); //Here we set the default value of the quantity to "5"

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => setItem(e.target.value); //here we have defined a function which will update the value of the item variable when we enter anything into it's InputField
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value);

  const [shoppingList, setShoppingList] = useState<string[]>([]); // We've defined a list that can hold strings
  const addToList = () => { // This function updates the shopping list above by appending a new value to it
    setShoppingList((prevList) => [...prevList, `Item: ${item}, Quantity: ${quantity}`]);
  };
  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <Hello />
      <Info />

      {/* Input for item */}
      <InputField
        label="Item"
        value={item} //The value of the item is displayed to the text box
        onChange={handleItemChange} //When you type into the text box, the value is updated
      />

      {/* Input for quantity */}
      <InputField
        label="Quantity"
        value={quantity}
        onChange={handleQuantityChange}
      />

      <br></br>
      <br></br>

      <Button
        label="Add to List"
        onClick={addToList}
      />

      {/* Display the current item and quantity using TextBox */}
      <TextBox value={shoppingList.join("\n")} /> 
    </div>
  );
};