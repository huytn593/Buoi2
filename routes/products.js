const express = require('express');
const router = express.Router();
const ProductModel = require('../schemas/products');
const { convertToSlug } = require('../utils/titleHandler');

// ===== LAY TAT CA SAN PHAM (ho tro loc, phan trang) =====
router.get('/', async (req, res, next) => {
  const { title, minPrice, maxPrice, page, limit } = req.query;

  // xu ly tieu de tim kiem
  const searchTitle = title || '';

  // validate gia toi thieu
  let giaMin = 0;
  if (minPrice !== undefined) {
    const val = Number(minPrice);
    if (!Number.isInteger(val) || val < 0) {
      return res.status(400).json({ message: "minPrice phai la so nguyen khong am" });
    }
    giaMin = val;
  }

  // validate gia toi da
  let giaMax = 1e9;
  if (maxPrice !== undefined) {
    const val = Number(maxPrice);
    if (!Number.isInteger(val) || val < 0) {
      return res.status(400).json({ message: "maxPrice phai la so nguyen khong am" });
    }
    giaMax = val;
  }

  if (giaMax < giaMin) {
    return res.status(400).json({ message: "maxPrice khong duoc nho hon minPrice" });
  }

  // validate so trang
  let currentPage = 1;
  if (page !== undefined) {
    const val = Number(page);
    if (!Number.isInteger(val) || val < 1) {
      return res.status(400).json({ message: "page phai la so nguyen duong (>= 1)" });
    }
    currentPage = val;
  }

  // validate so luong moi trang
  let pageSize = 10;
  if (limit !== undefined) {
    const val = Number(limit);
    if (!Number.isInteger(val) || val < 1) {
      return res.status(400).json({ message: "limit phai la so nguyen duong (>= 1)" });
    }
    pageSize = val;
  }

  // tao dieu kien loc
  const condition = {
    isDeleted: false,
    title: { $regex: searchTitle, $options: 'i' },
    price: { $gte: giaMin, $lte: giaMax }
  };

  const tongSo = await ProductModel.countDocuments(condition);
  const danhSach = await ProductModel
    .find(condition)
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);

  res.json({
    total: tongSo,
    page: currentPage,
    limit: pageSize,
    data: danhSach
  });
});

// ===== TIM THEO SLUG =====
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const sanPham = await ProductModel.findOne({
      slug: req.params.slug,
      isDeleted: false
    });
    if (!sanPham) {
      return res.status(404).json({ message: "Khong tim thay san pham voi slug nay" });
    }
    res.json(sanPham);
  } catch (err) {
    res.status(500).json({ message: "Loi server", error: err.message });
  }
});

// ===== TIM THEO ID =====
router.get('/:id', async (req, res, next) => {
  try {
    const sanPham = await ProductModel.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    if (!sanPham) {
      return res.status(404).json({ message: "Khong tim thay san pham voi ID nay" });
    }
    res.json(sanPham);
  } catch (err) {
    res.status(404).json({ message: "ID khong hop le hoac khong ton tai" });
  }
});

// ===== THEM SAN PHAM MOI =====
router.post('/', async (req, res, next) => {
  const { title, price, description, category, images } = req.body;

  // kiem tra du lieu dau vao
  const dsLoi = [];

  if (!title || String(title).trim() === '') {
    dsLoi.push("title khong duoc de trong");
  }

  if (price === undefined || price === null || String(price).trim() === '') {
    dsLoi.push("price khong duoc de trong");
  } else if (isNaN(Number(price)) || Number(price) < 0) {
    dsLoi.push("price phai la so khong am");
  }

  if (!description || String(description).trim() === '') {
    dsLoi.push("description khong duoc de trong");
  }

  if (dsLoi.length > 0) {
    return res.status(400).json({ message: "Du lieu khong hop le", errors: dsLoi });
  }

  try {
    const spMoi = new ProductModel({
      title: title.trim(),
      slug: convertToSlug(title.trim()),
      price: Number(price),
      description: description.trim(),
      category: category ? category.trim() : '',
      images: images || undefined
    });
    await spMoi.save();
    res.status(201).json(spMoi);
  } catch (err) {
    res.status(500).json({ message: "Loi khi tao san pham", error: err.message });
  }
});

// ===== CAP NHAT SAN PHAM =====
router.put('/:id', async (req, res, next) => {
  try {
    const spId = req.params.id;
    const duLieu = req.body;

    // tu dong cap nhat slug neu co title moi
    if (duLieu.title) {
      duLieu.slug = convertToSlug(duLieu.title.trim());
    }

    // validate price neu co truyen vao
    if (duLieu.price !== undefined) {
      if (isNaN(Number(duLieu.price)) || Number(duLieu.price) < 0) {
        return res.status(400).json({ message: "price phai la so khong am" });
      }
      duLieu.price = Number(duLieu.price);
    }

    const spCapNhat = await ProductModel.findByIdAndUpdate(spId, duLieu, { new: true });
    if (!spCapNhat) {
      return res.status(404).json({ message: "Khong tim thay san pham" });
    }
    res.json(spCapNhat);
  } catch (err) {
    res.status(500).json({ message: "Loi khi cap nhat", error: err.message });
  }
});

// ===== XOA SAN PHAM (soft delete) =====
router.delete('/:id', async (req, res, next) => {
  try {
    const spId = req.params.id;
    const spXoa = await ProductModel.findByIdAndUpdate(
      spId,
      { isDeleted: true },
      { new: true }
    );
    if (!spXoa) {
      return res.status(404).json({ message: "Khong tim thay san pham" });
    }
    res.json({ message: "Xoa thanh cong", data: spXoa });
  } catch (err) {
    res.status(500).json({ message: "Loi khi xoa", error: err.message });
  }
});

module.exports = router;
