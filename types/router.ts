export const getLastRoute = state => {
  if (!state) return {};

  const { name, params } = state.routes[state.routes.length - 1];

  return { name, params };
};
