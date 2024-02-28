export const config = {
  runtime: 'edge',
}

const handler = (req: unknown) => new Response('Hello world!')
export default handler;
