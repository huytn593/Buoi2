var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let { ConvertTitleToSlug } = require('../utils/titleHandler')

// ==================== GET ALL (với filter, pagination) ====================
router.get('/', async function (req, res, next) {
  let queries = req.query;

  // --- Lấy và validate các tham số query ---
  let titleQ = queries.title ? queries.title : '';

  // Validate minPrice: phải là số nguyên dương hoặc 0
  let minPrice = 0;
  if (queries.minPrice !== undefined) {
    let parsed = Number(queries.minPrice);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return res.status(400).send({ message: "minPrice phải là số nguyên không âm" });
    }
    minPrice = parsed;
  }

  // Validate maxPrice: phải là số nguyên dương hoặc 0
  let maxPrice = 1e9;
  if (queries.maxPrice !== undefined) {
    let parsed = Number(queries.maxPrice);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return res.status(400).send({ message: "maxPrice phải là số nguyên không âm" });
    }
    maxPrice = parsed;
  }

  // Kiểm tra maxPrice < minPrice
  if (maxPrice < minPrice) {
    return res.status(400).send({ message: "maxPrice không được nhỏ hơn minPrice" });
  }

  // Validate page: phải là số nguyên dương
  let page = 1;
  if (queries.page !== undefined) {
    let parsed = Number(queries.page);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return res.status(400).send({ message: "page phải là số nguyên dương (>= 1)" });
    }
    page = parsed;
  }

  // Validate limit: phải là số nguyên dương
  let limit = 10;
  if (queries.limit !== undefined) {
    let parsed = Number(queries.limit);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return res.status(400).send({ message: "limit phải là số nguyên dương (>= 1)" });
    }
    limit = parsed;
  }

  // --- Truy vấn DB ---
  let filter = {
    isDeleted: false,
    title: { $regex: titleQ, $options: 'i' },
    price: { $gte: minPrice, $lte: maxPrice }
  };

  let total = await productModel.countDocuments(filter);
  let products = await productModel
    .find(filter)
    .skip(limit * (page - 1))
    .limit(limit);

  res.send({
    total,
    page,
    limit,
    data: products
  });
});

// ==================== GET BY SLUG ====================
router.get('/slug/:slug', async function (req, res, next) {
  try {
    let result = await productModel.findOne({ slug: req.params.slug, isDeleted: false });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Không tìm thấy sản phẩm với slug này" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi server", error: error.message });
  }
});

// ==================== GET BY ID ====================
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productModel.findOne({ _id: req.params.id, isDeleted: false });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Không tìm thấy sản phẩm với ID này" });
    }
  } catch (error) {
    res.status(404).send({ message: "ID không hợp lệ hoặc không tồn tại" });
  }
});

// ==================== POST (với validation) ====================
router.post('/', async function (req, res, next) {
  let { title, price, description, category, images } = req.body;

  // Validate các trường bắt buộc không được trống
  let errors = [];

  if (!title || String(title).trim() === '') {
    errors.push("title không được để trống");
  }
  if (price === undefined || price === null || String(price).trim() === '') {
    errors.push("price không được để trống");
  } else if (isNaN(Number(price)) || Number(price) < 0) {
    errors.push("price phải là số không âm");
  }
  if (!description || String(description).trim() === '') {
    errors.push("description không được để trống");
  }

  if (errors.length > 0) {
    return res.status(400).send({ message: "Dữ liệu không hợp lệ", errors });
  }

  try {
    let newItem = new productModel({
      title: title.trim(),
      slug: ConvertTitleToSlug(title.trim()),
      price: Number(price),
      description: description.trim(),
      category: category ? category.trim() : '',
      images: images || undefined
    });
    await newItem.save();
    res.status(201).send(newItem);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi tạo sản phẩm", error: error.message });
  }
});

// ==================== PUT ====================
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let body = req.body;

    // Nếu có cập nhật title thì tự cập nhật slug
    if (body.title) {
      body.slug = ConvertTitleToSlug(body.title.trim());
    }

    // Validate price nếu được truyền vào
    if (body.price !== undefined) {
      if (isNaN(Number(body.price)) || Number(body.price) < 0) {
        return res.status(400).send({ message: "price phải là số không âm" });
      }
      body.price = Number(body.price);
    }

    let updatedItem = await productModel.findByIdAndUpdate(id, body, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: "Không tìm thấy sản phẩm" });
    }
    res.send(updatedItem);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi cập nhật", error: error.message });
  }
});

// ==================== DELETE (soft delete) ====================
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let deletedItem = await productModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedItem) {
      return res.status(404).send({ message: "Không tìm thấy sản phẩm" });
    }
    res.send({ message: "Xoá thành công", data: deletedItem });
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi xoá", error: error.message });
  }
});

module.exports = router;
