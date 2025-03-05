import { combineReducers } from 'redux';
import * as types from './actionTypes';

// Cart Reducer
const initialCartState = {
  items: [],
  total: 0
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

const cartReducer = (state = initialCartState, action) => {
  switch (action.type) {
    case types.ADD_TO_CART:
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      }
      const newItems = [...state.items, { product: action.payload, quantity: 1 }];
      return {
        items: newItems,
        total: calculateTotal(newItems)
      };

    case types.REMOVE_FROM_CART:
      const filteredItems = state.items.filter(item => item.product.id !== action.payload);
      return {
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };

    case types.UPDATE_CART_QUANTITY:
      const { productId, quantity } = action.payload;
      if (quantity === 0) {
        return cartReducer(state, { type: types.REMOVE_FROM_CART, payload: productId });
      }
      const updatedItems = state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };

    case types.CLEAR_CART:
      return initialCartState;

    default:
      return state;
  }
};

// Products Reducer
const initialProductsState = {
  items: [],
  loading: false,
  error: null
};

const productsReducer = (state = initialProductsState, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true
      };

    case types.FETCH_PRODUCTS_SUCCESS:
      return {
        items: action.payload,
        loading: false,
        error: null
      };

    case types.FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.ADD_PRODUCT:
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case types.DELETE_PRODUCT:
      return {
        ...state,
        items: state.items.filter(product => product.id !== action.payload)
      };

    default:
      return state;
  }
};

// Combine Reducers
const rootReducer = combineReducers({
  cart: cartReducer,
  products: productsReducer
});

export default rootReducer;
