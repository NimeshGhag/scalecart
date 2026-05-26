const getStockStatus = (quantity) => {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= 5) return "Low Stock";
  return "In Stock";
};
module.exports = {
  getStockStatus,
};
