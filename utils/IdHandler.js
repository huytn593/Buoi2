/**
 * Tim ID lon nhat trong mang du lieu
 */
function findMaxId(arr) {
    const allIds = arr.map(item => item.id);
    return Math.max(...allIds);
}

module.exports = { findMaxId };