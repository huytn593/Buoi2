module.exports = {
    ConvertTitleToSlug: function (title) {
        if (!title) return '';

        // Bảng chuyển đổi ký tự có dấu tiếng Việt sang không dấu
        let result = title
            .normalize('NFD')                        // tách ký tự tổ hợp
            .replace(/[\u0300-\u036f]/g, '')         // xoá dấu tổ hợp
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')  // xử lý chữ đ/Đ riêng
            .toLowerCase()                           // chuyển thường
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')            // xoá ký tự đặc biệt còn lại
            .replace(/\s+/g, '-')                    // thay khoảng trắng bằng dấu gạch ngang
            .replace(/-+/g, '-');                    // gộp nhiều dấu gạch ngang thành 1

        return result;
    }
}
