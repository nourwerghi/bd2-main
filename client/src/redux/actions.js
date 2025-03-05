import * as types from './actionTypes';
import { api } from '../lib/api';

// Cart Actions
export const addToCart = (product) => ({
  type: types.ADD_TO_CART,
  payload: product
});

export const removeFromCart = (productId) => ({
  type: types.REMOVE_FROM_CART,
  payload: productId
});

export const updateCartQuantity = (productId, quantity) => ({
  type: types.UPDATE_CART_QUANTITY,
  payload: { productId, quantity }
});

export const clearCart = () => ({
  type: types.CLEAR_CART
});

// Product Actions
export const fetchProductsRequest = () => ({
  type: types.FETCH_PRODUCTS_REQUEST
});

export const fetchProductsSuccess = (products) => ({
  type: types.FETCH_PRODUCTS_SUCCESS,
  payload: products
});

export const fetchProductsFailure = (error) => ({
  type: types.FETCH_PRODUCTS_FAILURE,
  payload: error
});

export const fetchProducts = () => {
  return async (dispatch) => {
    dispatch(fetchProductsRequest());
    try {
      const products = await api.products.getAll();
      dispatch(fetchProductsSuccess(products));
    } catch (error) {
      dispatch(fetchProductsFailure(error.message));
    }
  };
};

export const addProduct = (product) => {
  return async (dispatch) => {
    try {
      const newProduct = await api.products.create(product);
      dispatch({
        type: types.ADD_PRODUCT,
        payload: newProduct
      });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
};

export const deleteProduct = (productId) => {
  return async (dispatch) => {
    try {
      await api.products.delete(productId);
      dispatch({
        type: types.DELETE_PRODUCT,
        payload: productId
      });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
};
