export default {
  findCart: async function findCart(req, cartId) {
    let isMy = req.url.indexOf('/my/') > 0;
    return await isMy ? req.user.findCart(cartId) : Cart.findOne(cartId);
  }
}
