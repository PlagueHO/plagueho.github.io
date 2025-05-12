/** All blog posts as a collection. */
export const getAllPosts = collection => {
  return collection.getFilteredByGlob('./src/posts/**/*.md').reverse();
};

/** All projects as a collection */
export const getAllProjects = collection => {
  return collection.getFilteredByGlob('./src/projects/**/*.md').reverse();
};

/** All relevant pages as a collection for sitemap.xml */
export const showInSitemap = collection => {
  return collection.getFilteredByGlob('./src/**/*.{md,njk}');
};

/** All tags from all posts as a collection - excluding custom collections */
export const tagList = collection => {
  const tagsSet = new Set();
  collection.getAll().forEach(item => {
    // Exclude items that don't have tags or are archived
    if (!item.data.tags || item.data.isArchived) return;
    item.data.tags
      .filter(tag => !['posts', 'docs', 'all']
      .includes(tag))
      .forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};
