export const fetcher = async (slug: string, options?: RequestInit) => {
  return await fetch(`${process.env.API_HOST}${slug}`, options);
};
