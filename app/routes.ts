import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("forum", "routes/forum.tsx"),
    route("about-us", "routes/about-us.tsx"),
    route("publicaciones/:id", "routes/publication-detail.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("profile", "routes/profile.tsx"),
    route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;
