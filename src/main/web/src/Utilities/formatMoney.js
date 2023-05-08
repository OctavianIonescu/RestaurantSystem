/**
 * formats the price into pounds and pence
 *
 * @param {*} price
 */
const toPounds = (price) => "£" + (price / 100).toFixed(2);
export default toPounds;