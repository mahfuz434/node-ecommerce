"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const fs = require("fs")
const path = require("path")

const { validateAll } = use("Validator")

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Product = use("App/Models/Product")

const Helpers = use("Helpers")

/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    let products = await Product.query().fetch()

    return view.render("Product.adminIndex", { products })
  }

  async productList({ request, response, view }) {
    return view.render("Product.index")
  }

  /**
   * Render a form to be used for creating a new product.
   * GET products/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {
    return view.render("Product.create")
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, session }) {
    let validation = await validateAll(request.all(), {
      name: "required",
      description: "required",
      price: "required"
    })

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll()
      return response.redirect("back")
    }

    delete request.all()._csrf

    const productImage = request.file("image", {
      types: ["image"]
    })

    await productImage.move(Helpers.publicPath("/uploads/products"), {
      name: "product-image-id-" + Date.now() + "." + productImage.extname
    })

    await Product.create({
      ...request.all(),
      image: "/uploads/products/" + productImage.fileName
    })

    response.route("products.index")
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing product.
   * GET products/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {
    let product = await Product.find(params.id)
    return view.render("Product.edit", { product: product.toJSON() })
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, session }) {
    let validation = await validateAll(request.all(), {
      name: "required",
      description: "required",
      price: "required"
    })

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll()
      return response.redirect("back")
    }

    const productImage = request.file("image", {
      types: ["image"]
    })

    if (productImage) {
      await productImage.move(Helpers.publicPath("/uploads/products"), {
        name: "product-image-id-" + Date.now() + "." + productImage.extname
      })
      request.all().image = "/uploads/products/" + productImage.fileName
    }

    delete request.all()._csrf
    delete request.all()._method

    let product = await Product.find(params.id)

    product.merge(request.all())

    await product.save()

    response.route("products.index")
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    let product = await Product.find(params.id)
    await product.delete()
    fs.unlinkSync(
      path.join(__dirname, "..", "..", "..", "public", product.image)
    )
    response.route("products.index")
  }
}

module.exports = ProductController
