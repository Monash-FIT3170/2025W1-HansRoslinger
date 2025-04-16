import React, {useState} from 'react';
// @ts-ignore
import {Hello} from './Hello.tsx';
// @ts-ignore
import {Info} from './Info.tsx';
import {InputField, Button} from './Input';
import {TextBox} from './Output'; // Importing TextBox component to display output
import {ShoppingListCollection, AddToList} from '../api/shoppinglist';
// @ts-ignore
import {useTracker} from 'meteor/react-meteor-data';
import {Meteor} from 'meteor/meteor';

export const App = () => {
    const [item, setItem] = useState<string>('Apple'); // useState is a very common react function that defines a variable 'item' and a function 'setItem' that is used to modify that item
    const [quantity, setQuantity] = useState<string>('5');

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => setItem(e.target.value); // Here we have defined a function which will update the value of the item variable when we enter anything into its InputField
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value);

/*    const [shoppingList, setShoppingList] = useState([]); //we've defined a list that can we set the value of
    const addToList = () => { //this function updates the shopping list above by appending a new value to it
        // @ts-ignore
        setShoppingList((prevList) => [...prevList, `Item: ${item}, Quantity: ${quantity}`]);
    }*/

    const [shoppingList, setShoppingList] = useState<{ item: string; quantity: string }[]>([]);  // We've defined a list that can hold strings

    useTracker(() => {
        Meteor.subscribe('shoppingList'); // Subscribe to the shopping list data
        const items = ShoppingListCollection.find().fetch(); // Fetch the shopping list items
        setShoppingList(items); // Update the shopping list state
    }, []);

    return (
        <div>
            <h1>Welcome to Meteor!</h1>
            <Hello/>
            <Info/>

            {/* Input for item */}
            <InputField
                label="Item"
                value={item} // The value of the item is displayed to the text box
                onChange={handleItemChange} // When you type into the text box, the value is updated
            />

            {/* Input for quantity */}
            <InputField
                label="Quantity"
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
            <TextBox value={shoppingList.map(entry => `Item: ${entry.item}, Quantity: ${entry.quantity}`).join('\n')}/>
        </div> // TextBox will display the current values
    );
};
