import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getPosts() {
  // @ts-ignore
  const res = await axios.get(endpoints.post.list);

  return res.data;
}

// ----------------------------------------------------------------------

export async function getPost(title: string) {
  // @ts-ignore
  const URL = title ? `${endpoints.post.details}?title=${title}` : '';

  const res = await axios.get(URL);

  return res.data;
}

// ----------------------------------------------------------------------

export async function getLatestPosts(title: string) {
  // @ts-ignore
  const URL = title ? `${endpoints.post.latest}?title=${title}` : '';

  const res = await axios.get(URL);

  return res.data;
}
