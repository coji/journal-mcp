import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('entries/:date', 'routes/entries.$date.tsx'),
  route('search', 'routes/search.tsx'),
  route('tags', 'routes/tags.tsx'),
] satisfies RouteConfig;
