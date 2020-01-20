"use strict"

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use("App/Models/User")

const { validateAll } = use("Validator")

class AuthController {
  async login({ request, response, session, auth }) {
    let validation = await validateAll(request.all(), {
      email: "email|required",
      password: "required"
    })

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll()
      return response.redirect("back")
    }

    let { email, password } = request.all()

    await auth.attempt(email, password)

    return response.route("admin")
  }

  async register({ request, response, session }) {
    let validation = await validateAll(request.all(), {
      name: "required",
      email: "email|required",
      password: "min:6|required"
    })

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll()
      return response.redirect("back")
    }

    delete request.all()._csrf
    let user = await User.create(request.all())

    return response.route("home")
  }

  async logout({ auth, response }) {
    await auth.logout()
    response.route("auth.login")
  }
}

module.exports = AuthController
