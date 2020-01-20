"use strict"
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Guest {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, response, auth }, next) {
    let isAuthenticated = true

    try {
      await auth.check()
    } catch (error) {
      isAuthenticated = false
    }

    if (isAuthenticated) {
      return response.route("admin")
    }

    await next()
  }
}

module.exports = Guest
