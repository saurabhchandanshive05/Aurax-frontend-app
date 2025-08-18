export function validateComponent(component, name) {
  // Lazy components are objects with a $$typeof property
  if (
    typeof component === "object" &&
    component.$$typeof === Symbol.for("react.lazy")
  ) {
    return component;
  }

  if (typeof component !== "function") {
    console.error(`Invalid component: ${name}`, component);
    throw new Error(`Component ${name} is not a valid React component`);
  }
  return component;
}
