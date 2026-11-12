
export const cld = (url, transform = "f_auto,q_auto") => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/"))
    return url;
  return url.replace("/upload/", `/upload/${transform}/`);
};
