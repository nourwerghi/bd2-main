// ... existing code ...

const productSchema = new Schema({
  // ... other fields ...
  category: {
    main: {
      type: String,
      required: true
    },
    sub: {
      type: String,
      required: true
    }
  },
  // ... other fields ...
});

// ... existing code ...