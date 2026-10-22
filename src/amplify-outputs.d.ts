declare module '*amplify_outputs.json' {
  const outputs: Parameters<typeof import('aws-amplify').Amplify.configure>[0];
  export default outputs;
}
