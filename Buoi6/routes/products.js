var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let { ConvertTitleToSlug } = require('../utils/titleHandler')
let { checkLogin, checkRole } = require('../utils/authHandler')

// GET all products - public (không cần đăng nhập)
router.get('/', async function (req, res, next) {
  let products = await productModel.find({ isDeleted: false });
  res.send(products)
});

// GET product by ID - public (không cần đăng nhập)
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productModel.findOne({ _id: req.params.id, isDeleted: false });
    if (result) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "id not found"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "id not found"
    })
  }
});

// POST create product - mod và admin
router.post('/', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let newItem = new productModel({
      title: req.body.title,
      slug: ConvertTitleToSlug(req.body.title),
      price: req.body.price,
      description: req.body.description,
      images: req.body.images
    })
    await newItem.save()
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
})

// PUT update product - mod và admin
router.put('/:id', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(
      id, req.body, {
      new: true
    }
    )
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem)
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
})

// DELETE product (soft delete) - chỉ admin
router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(
      id, {
      isDeleted: true
    }, {
      new: true
    }
    )
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem)
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
})

module.exports = router;
