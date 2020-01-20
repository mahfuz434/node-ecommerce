"use strict"

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route")

Route.get("/", "ProductController.productList").as("home")

/**
 * Authentication
 */
Route.on("/auth/login")
  .render("auth.login")
  .as("auth.login")
  .middleware(["Guest"])
Route.on("/auth/register")
  .render("auth.register")
  .as("auth.register")
  .middleware(["Guest"])

Route.post("/auth/login", "AuthController.login").as("auth.login")
Route.post("/auth/register", "AuthController.register").as("auth.register")
Route.post("/auth/logout", "AuthController.logout").as("auth.logout")

/**
 * Admin
 */
Route.group(() => {
  Route.get("/", ({ view }) => {
    return view.render("admin.index")
  }).as("admin")
  Route.resource("products", "ProductController")
})
  .prefix("admin")
  .middleware(["Authenticated"])
