import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { default as IndexRoute } from './_index';

// Loader function that extracts the chat ID from params
export async function loader(args: LoaderFunctionArgs) {
  return json({ id: args.params.id });
}

// This route reuses the IndexRoute component
export default IndexRoute;
