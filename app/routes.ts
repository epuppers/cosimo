import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/_app.tsx", [
    route("chat", "routes/_app.chat.tsx", [
      route(":threadId", "routes/_app.chat.$threadId.tsx"),
    ]),
    route("workflows", "routes/_app.workflows.tsx", [
      route(":id", "routes/_app.workflows.$id.tsx"),
    ]),
    route("rolodex", "routes/_app.rolodex.tsx"),
    layout("routes/_app.brain.tsx", [
      route("brain/memory", "routes/_app.brain.memory.tsx"),
      route("brain/lessons", "routes/_app.brain.lessons.tsx", [
        route(":id", "routes/_app.brain.lessons.$id.tsx"),
      ]),
      route("brain/graph", "routes/_app.brain.graph.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
