
// Placeholder types for webpack asset imports
// https://webpack.js.org/guides/typescript

declare module '*.scss' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.svg?sprite' {
  const content: any;
  export default content;
}
